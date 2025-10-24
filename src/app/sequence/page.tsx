'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Email, FormData } from '@/types';
import EmailSequence from '@/components/EmailSequence';

export default function SequencePage() {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const hasLoaded = useRef(false);

  // Load generated emails from sessionStorage on component mount
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    
    console.log('Sequence page useEffect running');
    const generatedEmails = sessionStorage.getItem('generatedEmails');
    const storedFormData = sessionStorage.getItem('formData');
    
    console.log('Generated emails from sessionStorage:', generatedEmails);
    console.log('Form data from sessionStorage:', storedFormData);
    
    if (generatedEmails && storedFormData) {
      try {
        const emails: Email[] = JSON.parse(generatedEmails);
        const formData: FormData = JSON.parse(storedFormData);
        
        console.log('Parsed emails:', emails);
        console.log('Parsed form data:', formData);
        
        setEmails(emails);
        setFormData(formData);
        
        // Clear sessionStorage after loading
        sessionStorage.removeItem('generatedEmails');
        sessionStorage.removeItem('formData');
      } catch (error) {
        console.error('Error loading generated emails:', error);
        // Redirect back to form if there's an error
        router.push('/');
      }
    } else {
      console.log('No data found in sessionStorage, redirecting to form');
      // Redirect back to form if no data
      router.push('/');
    }
  }, [router]);

  const handleAddEmail = async () => {
    if (!formData) return;
    
    setIsAddingEmail(true);
    
    try {
      // Generate a single additional email
      const response = await fetch('/api/generate-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          previousEmails: emails,
          emailNumber: emails.length + 1,
        }),
      });

      const data = await response.json();

      if (data.success && data.email) {
        setEmails(prev => [...prev, data.email]);
      } else {
        console.error('Failed to generate additional email:', data.error);
        alert('Failed to generate additional email. Please try again.');
      }
    } catch (error) {
      console.error('Error generating additional email:', error);
      alert('An error occurred while generating the email. Please try again.');
    } finally {
      setIsAddingEmail(false);
    }
  };


  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email sequence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Go Back
                </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800">Email Ladder</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>📧</span>
              <span>{emails.length} emails generated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Sequence */}
      <EmailSequence 
        emails={emails}
        formData={formData}
        onAddEmail={handleAddEmail}
        isAddingEmail={isAddingEmail}
        setEmails={setEmails}
      />
    </div>
  );
}
