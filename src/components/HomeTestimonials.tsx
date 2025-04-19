import React, { useState, useEffect } from 'react';
import { Loader, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRandomTestimonials } from '../services/testimonialService';
import StarRating from './StarRating';
import { Testimonial } from '../types/Testimonial';

interface HomeTestimonialsProps {
  limit?: number;
  minRating?: number;
  className?: string;
}

/**
 * Component for displaying random testimonials on the home page
 * 
 * @param limit - Maximum number of testimonials to display
 * @param minRating - Minimum rating to include (1-5)
 * @param className - Additional CSS classes
 */
const HomeTestimonials: React.FC<HomeTestimonialsProps> = ({
  limit = 3,
  minRating = 4,
  className = '',
}) => {
  const [testimonials, setTestimonials] = useState<(Testimonial & { 
    book_title?: string, 
    books?: { 
      id: string, 
      title: string, 
      slug?: string,
      slugWithId?: string 
    } 
  })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch random testimonials
        const data = await getRandomTestimonials(limit, minRating);
        setTestimonials(data);
      } catch (err) {
        console.error('Error loading testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setIsLoading(false);
      }
    };

    loadTestimonials();
  }, [limit, minRating]);



  // If there's an error, show a fallback message
  if (error) {
    return null; // Hide the section completely if there's an error
  }

  // If there are no testimonials, don't render anything
  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center font-display text-primary-800">What Parents & Teachers Say</h2>
        <div className="w-24 h-1 bg-accent-400 mx-auto mt-4"></div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={40} className="animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-2xl shadow-md flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <StarRating rating={testimonial.rating} size={24} />
                {testimonial.books && (
                  <Link 
                    to={`/books/${testimonial.books.slugWithId}`} 
                    className="flex items-center text-sm text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <BookOpen size={16} className="mr-1" />
                    <span>View Book</span>
                  </Link>
                )}
              </div>
              
              {testimonial.title && (
                <h3 className="text-lg font-semibold text-primary-800 mb-2">
                  {testimonial.title}
                </h3>
              )}
              
              <p className="text-primary-700 italic mb-4 flex-grow">
                "{testimonial.content}"
              </p>
              
              <div className="mt-auto">
                <p className="font-bold text-primary-900">
                  - {testimonial.reviewer_name}, {testimonial.source || 'Reader'}
                </p>
                
                {testimonial.book_title && (
                  <p className="text-sm text-primary-600 mt-2">
                    Review for: {testimonial.book_title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeTestimonials;
