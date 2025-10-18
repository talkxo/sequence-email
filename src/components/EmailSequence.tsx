'use client';

import { useState, useEffect, useRef } from 'react';
import { Email, FormData } from '@/types';

interface EmailSequenceProps {
  emails: Email[];
  formData: FormData;
  onAddEmail: () => void;
  isAddingEmail: boolean;
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
}

export default function EmailSequence({ emails, formData, onAddEmail, isAddingEmail, setEmails }: EmailSequenceProps) {
  const [copiedSubjects, setCopiedSubjects] = useState<Set<number>>(new Set());
  const [generatingABFor, setGeneratingABFor] = useState<number | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const parseEmailBodyForHints = (body: string) => {
    const objectiveMatch = body.match(/🎯\s*(.+)/);
    const keyPointsMatch = body.match(/📝\s*([\s\S]+?)(?=🚀|$)/);
    const ctaMatch = body.match(/🚀\s*(.+)/);

    const objective = objectiveMatch?.[1]?.trim();
    const keyPoints = keyPointsMatch?.[1]?.trim();
    const cta = ctaMatch?.[1]?.trim();

    if (objective && keyPoints) {
      const firstKeyPoint = keyPoints.split('\n')[0];
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">{objective}</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">{firstKeyPoint}</span>
            </div>
          </div>
          {cta && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm text-gray-600">{cta}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return <span className="text-sm text-gray-500">No details available</span>;
  };

  const handleCopySubject = async (email: Email) => {
    const subjectToCopy = email.abVariants ? 
      `${email.abVariants.variantA} (A) / ${email.abVariants.variantB} (B)` : 
      email.subject;
    
    try {
      await navigator.clipboard.writeText(subjectToCopy);
      setCopiedSubjects(prev => new Set([...prev, email.emailNumber]));
      
      // Remove the copied state after 2 seconds
      setTimeout(() => {
        setCopiedSubjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(email.emailNumber);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy subject:', error);
      alert('Failed to copy subject to clipboard');
    }
  };

  const generateHubspotFormat = () => {
    const hubspotData = {
      campaignName: `${formData.productDescription.slice(0, 50)} - Email Sequence`,
      emails: emails.map((email, index) => ({
        emailNumber: email.emailNumber,
        subject: email.abVariants ? `${email.abVariants.variantA} | ${email.abVariants.variantB}` : email.subject,
        delay: index === 0 ? 0 : 1, // 1 day delay between emails
        content: `Subject: ${email.subject}\n\nObjective: ${parseEmailBodyForHints(email.body).props.children[0].props.children[1]}\n\nKey Points: ${parseEmailBodyForHints(email.body).props.children[1].props.children[1]}\n\nCTA: ${parseEmailBodyForHints(email.body).props.children[2].props.children[1]}`,
        status: 'draft'
      }))
    };
    
    const blob = new Blob([JSON.stringify(hubspotData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hubspot-sequence-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMailchimpFormat = () => {
    const mailchimpData = {
      campaign_name: `${formData.productDescription.slice(0, 50)} - Email Sequence`,
      type: 'automation',
      emails: emails.map((email, index) => ({
        step: email.emailNumber,
        subject_line: email.abVariants ? `${email.abVariants.variantA} | ${email.abVariants.variantB}` : email.subject,
        delay: index === 0 ? 0 : 1,
        content: {
          subject: email.subject,
          objective: parseEmailBodyForHints(email.body).props.children[0].props.children[1],
          key_points: parseEmailBodyForHints(email.body).props.children[1].props.children[1],
          cta: parseEmailBodyForHints(email.body).props.children[2].props.children[1]
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(mailchimpData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailchimp-sequence-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePardotFormat = () => {
    const pardotData = {
      drip_campaign_name: `${formData.productDescription.slice(0, 50)} - Email Sequence`,
      emails: emails.map((email, index) => ({
        step: email.emailNumber,
        subject: email.abVariants ? `${email.abVariants.variantA} | ${email.abVariants.variantB}` : email.subject,
        delay_days: index === 0 ? 0 : 1,
        content: {
          subject: email.subject,
          objective: parseEmailBodyForHints(email.body).props.children[0].props.children[1],
          key_points: parseEmailBodyForHints(email.body).props.children[1].props.children[1],
          cta: parseEmailBodyForHints(email.body).props.children[2].props.children[1]
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(pardotData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pardot-sequence-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateServerCommand = () => {
    const command = `# Email Sequence Setup Command
# Generated on ${new Date().toLocaleDateString()}

# Create email sequence for: ${formData.productDescription.slice(0, 100)}...

# Email 1: ${emails[0]?.subject || 'N/A'}
# Email 2: ${emails[1]?.subject || 'N/A'}
# Email 3: ${emails[2]?.subject || 'N/A'}
# Email 4: ${emails[3]?.subject || 'N/A'}
# Email 5: ${emails[4]?.subject || 'N/A'}

# Total emails in sequence: ${emails.length}
# Campaign goal: ${formData.primaryGoal}
# Tone: ${formData.toneOfVoice}

# Use this data to set up your email automation in your preferred platform.`;

    const blob = new Blob([command], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-sequence-command-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleGenerateAB = async (email: Email) => {
    setGeneratingABFor(email.emailNumber);
    try {
      console.log('Generating A/B test for email:', email.emailNumber);
      
      const response = await fetch('/api/generate-ab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalSubject: email.subject,
          formData: formData,
          emailNumber: email.emailNumber
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('A/B test response:', data);

      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to generate A/B variants');
      }

      if (!data.variants || !data.variants.variantB) {
        throw new Error('Invalid A/B variants received from server');
      }

      // Update the email with A/B variants
      setEmails(prevEmails => 
        prevEmails.map(e => 
          e.emailNumber === email.emailNumber 
            ? { ...e, abVariants: data.variants }
            : e
        )
      );
      
      console.log('A/B test generated successfully');
    } catch (error) {
      console.error('Error generating A/B test:', error);
      alert(`Failed to generate A/B test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGeneratingABFor(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white relative" id="email-sequence-container">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Email Nurture Sequence</h1>
          </div>
          
          {/* Export Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={() => { generateHubspotFormat(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">HubSpot</div>
                      <div className="text-xs text-gray-500">Download JSON for HubSpot</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => { generateMailchimpFormat(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">Mailchimp</div>
                      <div className="text-xs text-gray-500">Download JSON for Mailchimp</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => { generatePardotFormat(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">Pardot</div>
                      <div className="text-xs text-gray-500">Download JSON for Pardot</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => { generateServerCommand(); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">Server Command</div>
                      <div className="text-xs text-gray-500">Download setup command</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          Generated {emails.length} emails for: {formData.productDescription.slice(0, 60)}...
        </p>
      </div>

      {/* Sequence Flow */}
      <div className="space-y-6">

        {/* Vertical Line */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-300"></div>
        </div>

        {/* Email Cards */}
        {emails.map((email, index) => (
          <div key={email.emailNumber} className="space-y-4">
            {/* Email Card */}
            <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="p-5">
                {/* Email Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Email {email.emailNumber}</span>
                  </div>
                  {!email.abVariants ? (
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors font-medium"
                      onClick={() => handleGenerateAB(email)}
                      disabled={generatingABFor === email.emailNumber}
                    >
                      {generatingABFor === email.emailNumber ? 'Generating...' : 'Generate A/B'}
                    </button>
                  ) : (
                    <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-md font-medium">
                      A/B Ready
                    </span>
                  )}
                </div>

                {/* Subject Line */}
                <div>
                  {email.abVariants ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">A</span>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1">
                          {email.abVariants.variantA}
                        </h3>
                        <button
                          onClick={() => email.abVariants && navigator.clipboard.writeText(email.abVariants.variantA)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy variant A"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">B</span>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1">
                          {email.abVariants.variantB}
                        </h3>
                        <button
                          onClick={() => email.abVariants && navigator.clipboard.writeText(email.abVariants.variantB)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy variant B"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1">
                        {email.subject}
                      </h3>
                      <button
                        onClick={() => handleCopySubject(email)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="Copy subject"
                      >
                        {copiedSubjects.has(email.emailNumber) ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Hints */}
                <div className="mt-3 text-sm text-gray-600">
                  {parseEmailBodyForHints(email.body)}
                </div>
              </div>
            </div>

            {/* Wait Period (except for last email) */}
            {index < emails.length - 1 && (
              <>
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-gray-300"></div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Wait 2 day(s)</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-gray-300"></div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add Email Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onAddEmail}
            disabled={isAddingEmail}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isAddingEmail ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Email...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Another Email</span>
              </>
            )}
          </button>
        </div>
      </div>


    </div>
  );
}
