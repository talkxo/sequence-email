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
      {/* Stripe-style Hero Section */}
      <div className="relative">
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-purple-600"></div>
        
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header with logo and branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.407-2.354 1.407-1.852 0-4.389-.921-6.09-1.631l-.89 5.494C5.748 23.726 8.303 24 11.835 24c2.498 0 4.576-.654 6.061-1.872 1.544-1.275 2.347-3.12 2.347-5.346 0-3.219-1.343-4.38-3.307-5.632z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-wide">LADDER FOR EMAIL MARKETERS</span>
          </div>

          {/* Main headline with colored highlights */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              The <span className="text-pink-500">ladder</span> that{' '}
              <span className="text-purple-600">climbs</span> your email marketing to new heights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Designed for email marketers who want to scale their campaigns, Ladder generates high-converting email sequences that turn prospects into customers.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <button
              onClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              Start climbing with Ladder
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="text-gray-900 font-semibold text-lg hover:text-gray-700 transition-colors flex items-center gap-2">
              Learn more
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div id="email-form" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error generating email sequence
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
