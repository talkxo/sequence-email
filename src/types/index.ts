export interface FormData {
  productDescription: string;
  targetAudience: string;
  painPoints: string;
  primaryGoal: string;
  toneOfVoice: string;
  numberOfEmails: number;
}

export interface Email {
  emailNumber: number;
  subject: string;
  body: string;
  abVariants?: {
    variantA: string;
    variantB: string;
  };
}

export interface GenerateResponse {
  emails: Email[];
  success: boolean;
  error?: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export type PrimaryGoal = 
  | 'demo-booking'
  | 'onboarding'
  | 'purchase'
  | 'trial-conversion'
  | 'newsletter-signup'
  | 'webinar-registration'
  | 'consultation-booking';

export type ToneOfVoice = 
  | 'professional'
  | 'friendly'
  | 'casual'
  | 'persuasive'
  | 'conversational'
  | 'authoritative';

export interface AutofillRequest {
  productDescription: string;
}

export interface AutofillResponse {
  success: boolean;
  targetAudience: string;
  painPoints: string;
  primaryGoal: PrimaryGoal;
  toneOfVoice: ToneOfVoice;
  error?: string;
}
