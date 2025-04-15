import React, { useState, FormEvent } from 'react';
import { KindnessKit, KitFile, addKitSubscriber } from '../services/kindnessKitService';
import { CheckCircle, AlertTriangle, Download, Gift } from 'lucide-react';
import Modal from './Modal'; // Import the Modal component

interface KindnessKitSignupProps {
  kit: KindnessKit;
  files: KitFile[];
}

const KindnessKitSignup: React.FC<KindnessKitSignupProps> = ({ kit, files }) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false); // State for modal
  
  // Files are now listed directly below
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!agreedToTerms) {
      setError('You must agree to receive occasional updates');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      try {
        console.log('Submitting form with data:', { name, email, kitId: kit.id });
        
        // Add subscriber directly to database as a fallback
        try {
          // First try using the Netlify function (which bypasses RLS)
          const functionUrl = import.meta.env.DEV
            ? 'http://localhost:8888/.netlify/functions/add-kit-subscriber' // Local Netlify dev server
            : '/.netlify/functions/add-kit-subscriber'; // Production
          
          console.log('Attempting to use Netlify function at:', functionUrl);
          
          const addSubscriberResponse = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              name,
              kitId: kit.id
            }),
          });
          
          if (!addSubscriberResponse.ok) {
            const errorText = await addSubscriberResponse.text();
            console.error('Error response from Netlify function:', {
              status: addSubscriberResponse.status,
              statusText: addSubscriberResponse.statusText,
              body: errorText
            });
            throw new Error(`Function error: ${errorText || addSubscriberResponse.statusText}`);
          }
          
          const addSubscriberResult = await addSubscriberResponse.json();
          console.log('Successfully added subscriber via Netlify function:', addSubscriberResult);
        } catch (functionError) {
          console.error('Error using Netlify function, falling back to direct database call:', functionError);
          
          // If the Netlify function fails, try adding directly to the database
          // This might still fail due to RLS, but worth trying as a fallback
          await addKitSubscriber({
            kit_id: kit.id,
            email,
            name: name || undefined
          });
          
          console.log('Successfully added subscriber via direct database call');
        }
        
        console.log('Successfully added subscriber to database');
        
        // Call Netlify function to add subscriber to MailerLite
        if (kit.mailerlite_group_id) {
          console.log('Attempting to add subscriber to MailerLite with group ID:', kit.mailerlite_group_id);
          
          try {
            const response = await fetch('/.netlify/functions/add-mailerlite-subscriber', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name,
                groupId: kit.mailerlite_group_id
              }),
            });
            
            const responseText = await response.text();
            
            if (!response.ok) {
              console.error('Error adding subscriber to MailerLite:', responseText);
              // Continue anyway, as we've already saved to our database
            } else {
              console.log('Successfully added subscriber to MailerLite:', responseText);
            }
          } catch (mailerLiteError) {
            console.error('Exception calling MailerLite function:', mailerLiteError);
            // Continue anyway, as we've already saved to our database
          }
        }
        
        // Show success state
        setSubmitted(true);
        
        // Reset form
        setName('');
        setEmail('');
        setAgreedToTerms(false);
      } catch (err: any) {
        console.error('Error submitting form:', err);
        
        // Provide more detailed error message if available
        if (err.message) {
          setError(`Failed to submit form: ${err.message}`);
        } else if (err.code) {
          setError(`Failed to submit form (Error code: ${err.code}). Please try again.`);
        } else {
          setError('Failed to submit form. Please try again.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get file type display name
  const getFileTypeDisplayName = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return 'PDF Documents';
      case 'audio':
        return 'Audio Files';
      case 'image':
        return 'Images';
      default:
        return 'Other Files';
    }
  };
  
  return (
    <> {/* Wrap in Fragment */}
    <div className="bg-gradient-to-br from-sage-100 to-lavender-100 rounded-xl shadow-lg overflow-hidden my-12">
      {!submitted ? (
        <div className="grid md:grid-cols-2">
          {/* Hero Image */}
          {kit.hero_image_url && (
            <div className="relative h-64 md:h-full">
              <img 
                src={kit.hero_image_url} 
                alt={kit.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Signup Form */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-2">
                {kit.headline || 'Start your ripple with a free kindness kit!'}
              </h2>
              <p className="text-gray-700">
                {kit.subheadline || 'Download the audiobook, coloring pages, and gentle activities.'}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary-700 mb-3">What's inside:</h3>
              <ul className="space-y-2">
                {files.map((file) => (
                  <li key={file.id} className="flex items-start">
                    <Gift size={18} className="text-accent-500 mr-2 mt-0.5" />
                    <span>{file.file_name} ({file.file_type})</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle size={20} className="text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name (optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Jane Smith"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="jane@example.com"
                  required
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to receive occasional updates about books and resources.
                    <button
                      type="button"
                      onClick={() => setIsPolicyModalOpen(true)}
                      className="text-primary-600 hover:text-primary-800 ml-1 underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Get My Free Kit'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-primary-800 mb-2">
            Thanks! Your kindness kit is ready.
          </h2>
          
          <p className="text-gray-700 mb-8">
            Download your files below. We've also sent a confirmation email with these links.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <Download size={20} className="text-primary-600 mr-2" />
                <span className="font-medium">{file.file_name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div> {/* End of main component div */}

    {/* Privacy Policy Modal - Placed correctly within the fragment */}
    <Modal
      isOpen={isPolicyModalOpen}
      onClose={() => setIsPolicyModalOpen(false)}
      title="Privacy Policy"
    >
      {/* Extracted content from PrivacyPolicyPage.tsx */}
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Introduction</h2>
          <p>
            T.L. Aurely Books ("we," "our," or "us") respects your privacy and is committed to protecting your personal data.
            This privacy policy explains how we collect, use, and safeguard your information when you visit our website,
            sign up for our kindness kits, or interact with our services.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Personal information (such as name and email address) when you sign up for our kindness kits or newsletter</li>
            <li>Usage data (such as how you interact with our website)</li>
            <li>Device information (such as your browser type and operating system)</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide and maintain our services</li>
            <li>Send you the kindness kits you've requested</li>
            <li>Send you updates about our books and resources (if you've agreed to receive them)</li>
            <li>Improve our website and services</li>
            <li>Respond to your inquiries and provide customer support</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Third-Party Services</h2>
          <p>
            We may use third-party services such as MailerLite to manage our email communications.
            These services may collect and process your data according to their own privacy policies.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the Internet or electronic storage is 100% secure,
            so we cannot guarantee absolute security.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal data, including:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>The right to access your personal data</li>
            <li>The right to correct inaccurate data</li>
            <li>The right to request deletion of your data</li>
            <li>The right to restrict or object to processing of your data</li>
            <li>The right to data portability</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us using the information provided below.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Changes to This Privacy Policy</h2>
          <p>
            We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-primary-700">Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at:
          </p>
          <p className="mt-2 font-medium">
            Email: privacy@tlaurelybooks.com
          </p>
        </section>
        
        <p className="text-sm text-gray-500 mt-8">
          Last updated: April 14, 2025
        </p>
      </div>
    </Modal>
    </> // Close Fragment
  );
};

export default KindnessKitSignup;