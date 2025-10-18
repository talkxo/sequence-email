'use client';

import { useState } from 'react';
import { Email } from '@/types';

interface EmailCardProps {
  email: Email;
}

export default function EmailCard({ email }: EmailCardProps) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      if (type === 'subject') {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Email {email.emailNumber}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(email.subject, 'subject')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            {copiedSubject ? 'Copied!' : 'Copy Subject'}
          </button>
          <button
            onClick={() => copyToClipboard(email.body, 'body')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            {copiedBody ? 'Copied!' : 'Copy Body'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-gray-900 font-medium">{email.subject}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Body
          </label>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {email.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
