import { NextRequest, NextResponse } from 'next/server';
import { FormData, Email } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'meta-llama/llama-3.2-3b-instruct:free';
const FALLBACK_MODEL = 'microsoft/phi-3-mini-128k-instruct:free';

export async function POST(request: NextRequest) {
  try {
    const { formData, previousEmails, emailNumber } = await request.json();

    if (!formData || !previousEmails || !emailNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const prompt = constructSingleEmailPrompt(formData, emailNumber, previousEmails);

    // Add timeout for individual requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Try primary model first, then fallback
      let response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Email Nurture Generator'
        },
        body: JSON.stringify({
          model: PRIMARY_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 120
        }),
        signal: controller.signal
      });

      // If primary model fails, try fallback
      if (!response.ok && response.status === 400) {
        response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Email Nurture Generator'
          },
          body: JSON.stringify({
            model: FALLBACK_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 120
          }),
          signal: controller.signal
        });
      }

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      const email = parseSingleEmail(content, emailNumber);

      return NextResponse.json({
        success: true,
        email
      });

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - email generation took too long');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error('Error generating single email:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate email',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

function constructSingleEmailPrompt(formData: FormData, emailNumber: number, previousEmails: Email[]): string {
  const context = previousEmails.length > 0
    ? `Previous: ${previousEmails.map(e => `Email ${e.emailNumber}: ${e.subject}`).join(', ')}`
    : '';

  return `Email ${emailNumber}:

Product: ${formData.productDescription}
Audience: ${formData.targetAudience}
Goal: ${formData.primaryGoal}
Tone: ${formData.toneOfVoice}
${context}

Format:
Subject: [Short subject line]
Objective: [Brief purpose]
CTA: [Simple call to action]
Key Points: [2 concise points]
Tone: [Style note]

Keep very brief and focused.`;
}

function parseSingleEmail(content: string, emailNumber: number): Email {
  const subjectMatch = content.match(/Subject:\s*(.+)/i);
  const objectiveMatch = content.match(/Objective:\s*(.+)/i);
  const ctaMatch = content.match(/CTA:\s*(.+)/i);
  const keyPointsMatch = content.match(/Key Points:\s*([\s\S]+?)(?=Tone:|$)/i);
  const toneMatch = content.match(/Tone:\s*(.+)/i);

  const subject = subjectMatch?.[1]?.trim() || `Email ${emailNumber} Subject`;
  const objective = objectiveMatch?.[1]?.trim() || 'Brief purpose';
  const cta = ctaMatch?.[1]?.trim() || 'Call to action';
  const keyPoints = keyPointsMatch?.[1]?.trim() || 'Key points';
  const tone = toneMatch?.[1]?.trim() || 'Style note';

  // Simplified body structure
  const body = `🎯 ${objective}

📝 ${keyPoints}

🚀 ${cta}

💬 ${tone}`;

  return {
    emailNumber,
    subject,
    body
  };
}
