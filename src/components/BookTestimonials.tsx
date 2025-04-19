import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Loader, AlertCircle } from 'lucide-react';
import { getTestimonialsByBookId } from '../services/testimonialService';
import { Testimonial } from '../types/Testimonial';
import TestimonialList from './TestimonialList';

interface BookTestimonialsProps {
  bookId: string;
  amazonLink?: string;
  className?: string;
}

/**
 * Component for displaying testimonials for a specific book
 * 
 * @param bookId - ID of the book to display testimonials for
 * @param amazonLink - Link to Amazon reviews (optional)
 * @param className - Additional CSS classes
 */
const BookTestimonials: React.FC<BookTestimonialsProps> = ({
  bookId,
  amazonLink,
  className = '',
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch testimonials for this book
        const data = await getTestimonialsByBookId(bookId);
        setTestimonials(data);
      } catch (err) {
        console.error('Error loading testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      loadTestimonials();
    }
  }, [bookId]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-md p-8 mb-12 ${className}`}>
        <h2 className="text-2xl font-bold mb-6 font-display text-primary-800 flex items-center">
          <MessageSquareQuote className="mr-2" size={24} />
          Reader Reviews
        </h2>
        <div className="flex justify-center items-center py-12">
          <Loader size={40} className="animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-md p-8 mb-12 ${className}`}>
        <h2 className="text-2xl font-bold mb-6 font-display text-primary-800 flex items-center">
          <MessageSquareQuote className="mr-2" size={24} />
          Reader Reviews
        </h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start">
          <AlertCircle size={24} className="mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if there are no testimonials and no Amazon link
  if (testimonials.length === 0 && !amazonLink) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl shadow-md p-8 mb-12 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 font-display text-primary-800 flex items-center">
        <MessageSquareQuote className="mr-2" size={24} />
        Reader Reviews
      </h2>
      
      <TestimonialList 
        testimonials={testimonials}
        bookId={bookId}
        amazonLink={amazonLink}
        maxDisplay={3}
        showMoreLink={true}
      />
    </div>
  );
};

export default BookTestimonials;
