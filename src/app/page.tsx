'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData, GenerateResponse } from '@/types';
import InputForm from '@/components/InputForm';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: GenerateResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate email sequence');
      }

            // Store generated emails in sessionStorage and navigate to sequence
            console.log('Storing emails in sessionStorage:', data.emails);
            console.log('Storing form data in sessionStorage:', formData);
            sessionStorage.setItem('generatedEmails', JSON.stringify(data.emails));
            sessionStorage.setItem('formData', JSON.stringify(formData));
            console.log('Data stored, navigating to sequence');
            router.push('/sequence');
    } catch (err) {
      console.error('Error generating emails:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Hero Section for iframe */}
      <div className="relative">
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600"></div>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header with logo and branding */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16M9 8h6M9 12h6M9 16h6" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-900 tracking-wide">LADDER FOR EMAIL MARKETERS</span>
          </div>

          {/* Compact headline */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
              The <span className="text-pink-500">ladder</span> that{' '}
              <span className="text-purple-600">climbs</span> your email marketing
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Generate high-converting email sequences that turn prospects into customers.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex items-center justify-center mb-8">
            <button
              onClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Start climbing with Ladder
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div id="email-form" className="bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-4">
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-xs font-medium text-red-800">
                      Error generating email sequence
                    </h3>
                    <div className="mt-1 text-xs text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Footer with TalkXO CTA */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Need a more tailored email strategy?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              For custom email strategy and orchestration, our team at TalkXO can help you build a comprehensive email marketing system.
            </p>
            <a 
              href="https://hello.talkxo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Get Custom Strategy
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              © 2024 Ladder for Email Marketers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
