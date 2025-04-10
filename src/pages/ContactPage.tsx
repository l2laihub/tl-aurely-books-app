import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, Star, BookOpen, Users } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the form element
    const form = e.target as HTMLFormElement;
    
    // Create a FormData object to submit the form
    const formData = new FormData(form);
    
    // Add a hidden field for the destination email
    formData.append('form-name', 'contact');
    
    // Submit the form data to Netlify
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(Object.fromEntries(formData) as Record<string, string>).toString()
    })
      .then(() => {
        console.log('Form successfully submitted');
        setIsSubmitted(true);
        // Reset form
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      })
      .catch((error) => {
        console.error('Form submission error:', error);
        alert('There was an error submitting the form. Please try again later.');
      });
  };

  return (
    <div className="bg-primary-50 min-h-screen">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-[10%]">
          <Star size={24} className="text-accent-300 animate-pulse" />
        </div>
        <div className="absolute bottom-10 right-[20%]">
          <Star size={24} className="text-accent-300 animate-pulse" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 font-display">Contact Us</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border-4 border-primary-200">
            <h2 className="text-2xl font-bold mb-6 font-display text-primary-800">Send us a message</h2>
            
            {isSubmitted ? (
              <div className="bg-accent-100 border-2 border-accent-300 text-primary-800 rounded-2xl p-6 mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-accent-400 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-display font-semibold mb-2 text-center">Thank you for your message!</h3>
                <p className="text-center mb-4">We've received your inquiry and will get back to you as soon as possible.</p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 px-6 rounded-full"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form 
                name="contact" 
                method="POST" 
                data-netlify="true" 
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
              >
                {/* Hidden fields for Netlify Forms */}
                <input type="hidden" name="form-name" value="contact" />
                <input type="hidden" name="destination" value="tlaurely1149@gmail.com" />
                <div hidden>
                  <label>
                    Don't fill this out if you're human: <input name="bot-field" />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-primary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-primary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-primary-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="Book Question">Book Question</option>
                    <option value="Download Issue">Download Issue</option>
                    <option value="School Visit Request">School Visit Request</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-primary-700 mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formState.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-primary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 px-6 rounded-full transition-colors inline-flex items-center"
                >
                  <Send size={18} className="mr-2" />
                  Send Message
                </button>
              </form>
            )}
          </div>
          
          {/* Contact Information */}
          <div>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-3xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 font-display">Get in Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <p className="mt-1">tlaurely1149@gmail.com</p>
                    <p className="mt-1">tlaurely1149@gmail.com (for download issues)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">School Visits</h3>
                    <p className="mt-1">tlaurely1149@gmail.com</p>
                    <p className="text-sm mt-1">Available for in-person and virtual visits</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <Users className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">For Publishers & Media</h3>
                    <p className="mt-1">tlaurely1149@gmail.com</p>
                    <p className="text-sm mt-1">Interview and collaboration requests</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-lg p-8 border-4 border-primary-200">
              <h2 className="text-2xl font-bold mb-6 font-display text-primary-800">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg font-display text-primary-700">How do I download the activities?</h3>
                  <p className="text-primary-600 mt-2">
                    Each book has a dedicated page with downloadable materials. Simply click on the download button next to each item to save it to your device.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg font-display text-primary-700">Are the downloads free?</h3>
                  <p className="text-primary-600 mt-2">
                    Yes! All downloadable materials are completely free and designed to enhance your child's learning experience with our books.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg font-display text-primary-700">Can T.L. Aurely visit our school?</h3>
                  <p className="text-primary-600 mt-2">
                    T.L. Aurely loves visiting schools! Please contact us using the form or email tlaurely1149@gmail.com for availability and details.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg font-display text-primary-700">Are the books available in other languages?</h3>
                  <p className="text-primary-600 mt-2">
                    Currently, our books are available in English and Spanish. We're working on translations for additional languages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;