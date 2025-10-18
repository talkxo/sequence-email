import { NextRequest, NextResponse } from 'next/server';
import { AutofillRequest, AutofillResponse, PrimaryGoal, ToneOfVoice } from '@/types';
import { makeApiCall } from '@/lib/api-rotation';

export async function POST(request: NextRequest) {
  try {
    const body: AutofillRequest = await request.json();

    if (!body.productDescription || body.productDescription.trim().length < 12) {
      return NextResponse.json<AutofillResponse>({
        success: false,
        targetAudience: '',
        painPoints: '',
        primaryGoal: 'demo-booking',
        toneOfVoice: 'professional',
        error: 'Please provide a more descriptive product/service description.'
      }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json<AutofillResponse>({
        success: false,
        targetAudience: '',
        painPoints: '',
        primaryGoal: 'demo-booking',
        toneOfVoice: 'professional',
        error: 'OpenRouter API key not configured'
      }, { status: 500 });
    }

    const prompt = buildPrompt(body.productDescription);

    try {
      // Use the new API rotation system
      const content = await makeApiCall(prompt, 200, 0.3);
      const parsed = parseAutofill(content);

      return NextResponse.json<AutofillResponse>({
        success: true,
        targetAudience: parsed.targetAudience,
        painPoints: parsed.painPoints,
        primaryGoal: parsed.primaryGoal,
        toneOfVoice: parsed.toneOfVoice
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      const isTimeout = msg.includes('aborted') || msg.includes('timeout');
      
      return NextResponse.json<AutofillResponse>({
        success: false,
        targetAudience: '',
        painPoints: '',
        primaryGoal: 'demo-booking',
        toneOfVoice: 'professional',
        error: isTimeout ? 'Autofill request timed out. Please try again.' : msg
      }, { status: isTimeout ? 408 : 500 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json<AutofillResponse>({
      success: false,
      targetAudience: '',
      painPoints: '',
      primaryGoal: 'demo-booking',
      toneOfVoice: 'professional',
      error: msg
    }, { status: 500 });
  }
}

function buildPrompt(productDescription: string): string {
  return `You are a senior lifecycle marketer.
Given the PRODUCT/SERVICE DESCRIPTION below, infer the following fields succinctly:
- TARGET AUDIENCE: a one-paragraph profile
- PAIN POINTS: a concise comma-separated list (5-8 items)
- PRIMARY GOAL: choose one of [demo-booking, onboarding, purchase, trial-conversion, newsletter-signup, webinar-registration, consultation-booking]
- TONE OF VOICE: choose one of [professional, friendly, casual, persuasive, conversational, authoritative]

Return EXACTLY this format:
TARGET AUDIENCE: <paragraph>
PAIN POINTS: <comma-separated list>
PRIMARY GOAL: <one from list>
TONE OF VOICE: <one from list>

PRODUCT/SERVICE DESCRIPTION:
${productDescription}`;
}

function parseAutofill(content: string): { targetAudience: string; painPoints: string; primaryGoal: PrimaryGoal; toneOfVoice: ToneOfVoice } {
  const audienceMatch = content.match(/TARGET AUDIENCE:\s*([\s\S]*?)\nPAIN POINTS:/i);
  const painMatch = content.match(/PAIN POINTS:\s*([\s\S]*?)\nPRIMARY GOAL:/i);
  const goalMatch = content.match(/PRIMARY GOAL:\s*([\w-]+)/i);
  const toneMatch = content.match(/TONE OF VOICE:\s*([\w-]+)/i);

  const audience = audienceMatch?.[1]?.trim() ?? '';
  const pains = painMatch?.[1]?.trim() ?? '';
  const goal = (goalMatch?.[1]?.trim() ?? 'demo-booking') as PrimaryGoal;
  const tone = (toneMatch?.[1]?.trim() ?? 'professional') as ToneOfVoice;

  return {
    targetAudience: audience,
    painPoints: pains,
    primaryGoal: goal,
    toneOfVoice: tone,
  };
}