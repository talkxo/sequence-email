import { NextRequest, NextResponse } from 'next/server';
import { generateEmailSequence } from '@/lib/openrouter';
import { FormData, GenerateResponse, Email } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();

    // Validate required fields
    if (!formData.productDescription) {
      return NextResponse.json(
        { success: false, error: 'Product description is required' },
        { status: 400 }
      );
    }

    // Validate number of emails
    if (formData.numberOfEmails < 1 || formData.numberOfEmails > 10) {
      return NextResponse.json(
        { success: false, error: 'Number of emails must be between 1 and 10' },
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

    // Add timeout handling - increase timeout for multiple emails
    const timeoutMs = Math.max(60000, formData.numberOfEmails * 20000); // 60s minimum, 20s per email
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    });

    const emails = await Promise.race([
      generateEmailSequence(formData),
      timeoutPromise
    ]) as Email[];

    const response: GenerateResponse = {
      emails,
      success: true
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating email sequence:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate email sequence',
        message: errorMessage 
      },
      { status: 500 }
    );
  }
}
