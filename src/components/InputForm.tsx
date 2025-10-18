'use client';

import { useState, useEffect, useCallback } from 'react';
import { FormData, PrimaryGoal, ToneOfVoice, AutofillResponse } from '@/types';

interface InputFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const PRIMARY_GOALS: { value: PrimaryGoal; label: string; description: string; icon: string }[] = [
  { value: 'demo-booking', label: 'Book a Demo', description: 'Get prospects to schedule a product demo', icon: '📅' },
  { value: 'purchase', label: 'Make a Purchase', description: 'Convert leads into paying customers', icon: '💰' },
  { value: 'trial-conversion', label: 'Convert Trial to Paid', description: 'Turn trial users into subscribers', icon: '🔄' },
  { value: 'onboarding', label: 'User Onboarding', description: 'Guide new users through setup', icon: '🚀' },
  { value: 'newsletter-signup', label: 'Newsletter Signup', description: 'Build your email list', icon: '📧' },
  { value: 'webinar-registration', label: 'Webinar Registration', description: 'Get people to attend your webinar', icon: '💻' },
  { value: 'consultation-booking', label: 'Book Consultation', description: 'Schedule one-on-one consultations', icon: '🤝' }
];

const TONE_OPTIONS: { value: ToneOfVoice; label: string; description: string; icon: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal, business-focused', icon: '👔' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, personal', icon: '😊' },
  { value: 'persuasive', label: 'Persuasive', description: 'Compelling, sales-focused', icon: '✍️' },
  { value: 'conversational', label: 'Conversational', description: 'Natural, chatty tone', icon: '💬' },
  { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident voice', icon: '👑' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, informal style', icon: '😎' }
];

const EMAIL_COUNT_PRESETS = [
  { value: 3, label: 'Quick (3 emails)', description: 'Fast, focused sequence' },
  { value: 5, label: 'Standard (5 emails)', description: 'Balanced approach' },
  { value: 7, label: 'Comprehensive (7 emails)', description: 'Thorough nurturing' }
];

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [formData, setFormData] = useState<FormData>({
    productDescription: '',
    targetAudience: '',
    painPoints: '',
    primaryGoal: 'purchase', // Smart default
    toneOfVoice: 'friendly', // Smart default
    numberOfEmails: 5 // Smart default
  });
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasUsedAutofill, setHasUsedAutofill] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAutofill = useCallback(async () => {
    if (!formData.productDescription.trim()) return;
    setIsAutofilling(true);
    setAutofillError(null);
    
    // Add timeout for autofill request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const resp = await fetch('/api/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productDescription: formData.productDescription }),
        signal: controller.signal
      });
      
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      
      const data: AutofillResponse = await resp.json();
      if (!data.success) {
        throw new Error(data.error || 'Autofill failed');
      }
      setFormData(prev => ({
        ...prev,
        targetAudience: data.targetAudience,
        painPoints: data.painPoints,
        primaryGoal: data.primaryGoal,
        toneOfVoice: data.toneOfVoice,
      }));
      setHasUsedAutofill(true);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
      setAutofillError(isTimeout ? 'Autofill timed out. Please try again.' : errorMessage);
    } finally {
      clearTimeout(timeoutId);
      setIsAutofilling(false);
    }
  }, [formData.productDescription]);

  // Auto-trigger autofill when product description is substantial
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.productDescription.length > 50 && !hasUsedAutofill && !formData.targetAudience) {
        handleAutofill();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData.productDescription, hasUsedAutofill, formData.targetAudience, handleAutofill]);

  // Form validation
  useEffect(() => {
    const isValid = formData.productDescription.trim().length > 10;
    setIsFormValid(isValid);
  }, [formData.productDescription]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Your Email Sequence</h2>
            <p className="text-sm text-gray-600">Build a high-converting email campaign in minutes</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Product Description */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tell us about your product</h3>
            <p className="text-sm text-gray-600 mb-4">The more details you provide, the better your email sequence will be</p>
          </div>
          <div className="space-y-3">
            <textarea
              id="productDescription"
              value={formData.productDescription}
              onChange={(e) => handleInputChange('productDescription', e.target.value)}
              placeholder="Example: 'We're a SaaS platform that helps small businesses automate their customer support with AI chatbots. Our customers save 10+ hours per week and see 40% faster response times. Perfect for e-commerce stores and service businesses with 50-500 employees.'"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500 transition-all"
              rows={4}
              required
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isAutofilling && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">AI is analyzing your product...</span>
                  </div>
                )}
                {hasUsedAutofill && !isAutofilling && (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Fields auto-filled with AI</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAutofill}
                disabled={isAutofilling || !formData.productDescription.trim()}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-fill with AI
              </button>
            </div>
            {autofillError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {autofillError}
              </div>
            )}
          </div>
        </div>

        {/* Campaign Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Settings</h3>
            <p className="text-sm text-gray-600 mb-4">Configure your email campaign goals and preferences</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Campaign Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Campaign Goal</label>
              <div className="relative">
                <select
                  value={formData.primaryGoal}
                  onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                >
                  {PRIMARY_GOALS.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.icon} {goal.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {PRIMARY_GOALS.find(g => g.value === formData.primaryGoal)?.description}
              </p>
            </div>

            {/* Email Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Email Tone</label>
              <div className="relative">
                <select
                  value={formData.toneOfVoice}
                  onChange={(e) => handleInputChange('toneOfVoice', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                >
                  {TONE_OPTIONS.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.icon} {tone.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {TONE_OPTIONS.find(t => t.value === formData.toneOfVoice)?.description}
              </p>
            </div>
          </div>

          {/* Sequence Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Sequence Length</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EMAIL_COUNT_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleInputChange('numberOfEmails', preset.value)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    formData.numberOfEmails === preset.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{preset.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Advanced Settings (Optional)
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <textarea
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="Who are your ideal customers? (job titles, demographics, company size, etc.)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
                rows={2}
              />
            </div>

            <div>
              <label htmlFor="painPoints" className="block text-sm font-medium text-gray-700 mb-2">
                Customer Pain Points
              </label>
              <textarea
                id="painPoints"
                value={formData.painPoints}
                onChange={(e) => handleInputChange('painPoints', e.target.value)}
                placeholder="What problems does your product solve? What challenges do customers face?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Your Sequence...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate Email Sequence
              </>
            )}
          </button>
          {!isFormValid && (
            <p className="text-center text-sm text-gray-500 mt-3">Please describe your product to continue</p>
          )}
        </div>
      </form>
    </div>
  );
}