import { FormData, Email } from '@/types';
import { makeApiCall, apiKeyManager } from './api-rotation';

export async function generateEmailSequence(formData: FormData): Promise<Email[]> {
  const emails: Email[] = [];
  
  // Generate emails one by one with retry logic
  for (let i = 1; i <= formData.numberOfEmails; i++) {
    console.log(`Generating email ${i} of ${formData.numberOfEmails}`);
    
    let attempts = 0;
    let email: Email | null = null;
    
    while (attempts < 2 && !email) {
      try {
        email = await generateSingleEmail(formData, i, emails);
        console.log(`Successfully generated email ${i}`);
      } catch (error: unknown) {
        attempts++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Attempt ${attempts} failed for email ${i}:`, errorMessage);
        if (attempts >= 2) {
          throw new Error(`Failed to generate email ${i} after 2 attempts: ${errorMessage}`);
        }
        // Wait 500ms before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (email) {
      emails.push(email);
    }
  }
  
  console.log(`Generated ${emails.length} emails successfully`);
  return emails;
}

async function generateSingleEmail(formData: FormData, emailNumber: number, previousEmails: Email[]): Promise<Email> {
  const prompt = constructSingleEmailPrompt(formData, emailNumber, previousEmails);
  
  try {
    // Use the new API rotation system
    const content = await makeApiCall(prompt, 120, 0.3);
    return parseSingleEmail(content, emailNumber);
  } catch (error) {
    console.error(`Error generating email ${emailNumber}:`, error);
    throw error;
  }
}

function constructSingleEmailPrompt(formData: FormData, emailNumber: number, previousEmails: Email[]): string {
  const context = previousEmails.length > 0
    ? `Previous emails: ${previousEmails.map(e => `Email ${e.emailNumber}: ${e.subject}`).join(', ')}`
    : '';

  // Create a logical sequence based on email number and goal
  const sequenceContext = getSequenceContext(emailNumber, formData.primaryGoal);

  // Handle optional fields
  const targetAudience = formData.targetAudience || 'General audience interested in the product';
  const painPoints = formData.painPoints || 'Common challenges that the product addresses';

  return `Create email ${emailNumber} in a logical nurture sequence:

Product: ${formData.productDescription}
Target Audience: ${targetAudience}
Pain Points: ${painPoints}
Primary Goal: ${formData.primaryGoal}
Tone: ${formData.toneOfVoice}
${context}

${sequenceContext}

Format your response exactly like this (no markdown formatting, no ** symbols):

Subject: [Compelling subject line - MAX 60 characters, use action words, include emotional triggers]
Objective: [Clear purpose for this email in the sequence]
CTA: [Specific call to action]
Key Points: [2-3 relevant points about benefits, features, or value proposition]
Tone: [${formData.toneOfVoice} style note]

IMPORTANT:
- Do NOT use ** or any markdown formatting
- Write clean, plain text only
- Ensure all fields have meaningful content
- Subject line guidelines:
  - Keep under 60 characters
  - Use active voice and action words
  - Include emotional triggers (urgency, benefit, curiosity)
  - Make value proposition clear
  - Avoid spam trigger words
  - Mobile-friendly length

Make it contextual and logical in the sequence.`;
}

function getSequenceContext(emailNumber: number, primaryGoal: string): string {
  const goalContexts = {
    'purchase': {
      1: 'Welcome email - introduce the product and its main benefits',
      2: 'Educational content - explain how the product solves problems',
      3: 'Social proof - share testimonials or case studies',
      4: 'Urgency/offer - create urgency with limited-time offers',
      5: 'Final push - last chance to purchase with strong CTA'
    },
    'demo-booking': {
      1: 'Welcome email - introduce the product and demo value',
      2: 'Educational content - explain key features and benefits',
      3: 'Social proof - share success stories from demos',
      4: 'Urgency - limited demo slots available',
      5: 'Final reminder - last chance to book your demo'
    },
    'trial-conversion': {
      1: 'Welcome to trial - get started guide',
      2: 'Feature highlights - key features to try',
      3: 'Success tips - how to get the most from trial',
      4: 'Conversion push - benefits of upgrading',
      5: 'Final offer - last chance to convert'
    }
  };

  const contexts = goalContexts[primaryGoal as keyof typeof goalContexts] || goalContexts.purchase;
  const context = contexts[emailNumber as keyof typeof contexts] || contexts[1];
  
  return `This email should: ${context}`;
}

function parseSingleEmail(content: string, emailNumber: number): Email {
  const subjectMatch = content.match(/Subject:\s*(.+)/i);
  const objectiveMatch = content.match(/Objective:\s*(.+)/i);
  const ctaMatch = content.match(/CTA:\s*(.+)/i);
  const keyPointsMatch = content.match(/Key Points:\s*([\s\S]+?)(?=Tone:|$)/i);
  const toneMatch = content.match(/Tone:\s*(.+)/i);

  // Clean up markdown formatting and ensure content exists
  const cleanText = (text: string | undefined, fallback: string): string => {
    if (!text) return fallback;
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/^\s*\*\*\s*/, '') // Remove leading **
      .replace(/\s*\*\*\s*$/, '') // Remove trailing **
      .trim() || fallback;
  };

  const subject = cleanText(subjectMatch?.[1], `Email ${emailNumber} Subject`);
  const objective = cleanText(objectiveMatch?.[1], 'Brief purpose');
  const cta = cleanText(ctaMatch?.[1], 'Call to action');
  const keyPoints = cleanText(keyPointsMatch?.[1], 'Key points');
  const tone = cleanText(toneMatch?.[1], 'Style note');

  // Ensure key points has actual content, not just **
  const formattedKeyPoints = keyPoints === 'Key points' || keyPoints === '**'
    ? 'Highlight key benefits and features'
    : keyPoints;

  // Simplified body structure
  const body = `🎯 ${objective}

📝 ${formattedKeyPoints}

🚀 ${cta}

💬 ${tone}`;

  return {
    emailNumber,
    subject,
    body
  };
}

// Export API stats for monitoring
export function getApiStats() {
  return apiKeyManager.getStats();
}