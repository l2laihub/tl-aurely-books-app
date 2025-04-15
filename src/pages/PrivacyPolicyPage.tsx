import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary-800">Privacy Policy</h1>
        
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
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;