'use client';

import { useState } from 'react';
import { Email } from '@/types';
import EmailCard from './EmailCard';

interface SequenceOutputProps {
  emails: Email[];
}

export default function SequenceOutput({ emails }: SequenceOutputProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadSequence = async (format: 'txt' | 'md') => {
    setDownloading(true);
    
    try {
      let content = '';
      
      if (format === 'md') {
        content = '# Email Nurture Sequence\n\n';
        emails.forEach((email, index) => {
          content += `## Email ${email.emailNumber}\n\n`;
          content += `**Subject:** ${email.subject}\n\n`;
          content += `**Body:**\n\n${email.body}\n\n`;
          if (index < emails.length - 1) {
            content += '---\n\n';
          }
        });
      } else {
        emails.forEach((email) => {
          content += `EMAIL ${email.emailNumber}\n`;
          content += `Subject: ${email.subject}\n`;
          content += `Body:\n${email.body}\n\n`;
          content += '='.repeat(50) + '\n\n';
        });
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-nurture-sequence.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              Generated Email Sequence
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {emails.length} email{emails.length !== 1 ? 's' : ''} generated successfully
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => downloadSequence('txt')}
              disabled={downloading}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              {downloading ? 'Downloading...' : 'Download TXT'}
            </button>
            <button
              onClick={() => downloadSequence('md')}
              disabled={downloading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {downloading ? 'Downloading...' : 'Download MD'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {emails.map((email) => (
          <EmailCard key={email.emailNumber} email={email} />
        ))}
      </div>
    </div>
  );
}
