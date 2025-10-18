import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '@/types';
import { makeApiCall } from '@/lib/api-rotation';

export async function POST(request: NextRequest) {
  try {
    const { originalSubject, formData, emailNumber }: { 
      originalSubject: string; 
      formData: FormData; 
      emailNumber: number 
    } = await request.json();

    if (!originalSubject || !formData || !emailNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields for A/B variant generation' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Handle optional fields for A/B generation (currently not used in prompt but kept for future use)
    // const targetAudience = formData.targetAudience || 'General audience interested in the product';
    
    const prompt = `Create an alternative subject line for A/B testing.

Original: "${originalSubject}"

Product: ${formData.productDescription}
Goal: ${formData.primaryGoal}
Tone: ${formData.toneOfVoice}

Requirements:
- Same meaning, different wording
- Under 60 characters
- Action words and emotional triggers
- Compelling and click-worthy

Respond with only the alternative subject line, no formatting or labels.`;

    try {
      // Use the new API rotation system
      const content = await makeApiCall(prompt, 60, 0.8);

      // Parse the B variant - AI should return just the subject line
      let variantB = content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
        .replace(/^\s*\*\*\s*/, '') // Remove leading **
        .replace(/\s*\*\*\s*$/, '') // Remove trailing **
        .replace(/^["']|["']$/g, '') // Remove quotes
        .trim();

      // If the response contains labels, try to extract just the subject
      const variantBMatch = variantB.match(/Variant B:\s*(.+)/i) || 
                            variantB.match(/B:\s*(.+)/i) || 
                            variantB.match(/Alternative:\s*(.+)/i) ||
                            variantB.match(/Subject:\s*(.+)/i);
      
      if (variantBMatch) {
        variantB = variantBMatch[1].trim();
      }

      if (!variantB || variantB.length === 0) {
        console.error('Generated variant B is empty, content was:', content);
        throw new Error('Generated variant B is empty');
      }

      const variants = {
        variantA: originalSubject, // Keep original as A
        variantB: variantB,
      };

      return NextResponse.json({
        success: true,
        variants
      });
    } catch (error: unknown) {
      console.error('Error generating A/B variants:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate A/B variants',
          message: errorMessage
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error generating A/B variants:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate A/B variants',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
