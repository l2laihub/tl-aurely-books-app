import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Testimonial } from '../types/Testimonial';
import TestimonialCard from './TestimonialCard';

interface TestimonialListProps {
  testimonials: Testimonial[];
  bookId?: string;
  amazonLink?: string;
  maxDisplay?: number;
  showMoreLink?: boolean;
  showActions?: boolean;
  onEdit?: (testimonial: Testimonial) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/**
 * Component for displaying a list of testimonials
 * 
 * @param testimonials - Array of testimonials to display
 * @param bookId - ID of the book (optional)
 * @param amazonLink - Link to Amazon reviews (optional)
 * @param maxDisplay - Maximum number of testimonials to display initially
 * @param showMoreLink - Whether to show "See more reviews" link
 * @param showActions - Whether to show edit/delete actions (for admin)
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param className - Additional CSS classes
 */
const TestimonialList: React.FC<TestimonialListProps> = ({
  testimonials,
  bookId,
  amazonLink,
  maxDisplay = 3,
  showMoreLink = true,
  showActions = false,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [showAll, setShowAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get testimonials to display based on maxDisplay and showAll state
  const displayTestimonials = showAll 
    ? testimonials 
    : testimonials.slice(0, maxDisplay);

  // Handle delete with confirmation
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        if (onDelete) {
          await onDelete(id);
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Show "See more" button only if there are more testimonials than maxDisplay
  const showSeeMore = showMoreLink && testimonials.length > maxDisplay && !showAll;
  
  // Show "View all on Amazon" link only if amazonLink is provided
  const showAmazonLink = !!amazonLink;

  return (
    <div className={`testimonial-list ${className}`}>
      {displayTestimonials.length > 0 ? (
        <>
          {displayTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              showActions={showActions}
              isDeleting={deletingId === testimonial.id}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
          
          <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
            {showSeeMore && (
              <button
                onClick={() => setShowAll(true)}
                className="text-primary-600 hover:text-primary-800 font-medium text-sm"
              >
                See more reviews ({testimonials.length - maxDisplay} more)
              </button>
            )}
            
            {showAmazonLink && (
              <a
                href={amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary-600 hover:text-primary-800 font-medium text-sm"
              >
                View all reviews on Amazon
                <ExternalLink size={14} className="ml-1" />
              </a>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500">No reviews yet.</p>
          {showAmazonLink && (
            <a
              href={amazonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center mt-2 text-primary-600 hover:text-primary-800 font-medium"
            >
              View reviews on Amazon
              <ExternalLink size={14} className="ml-1" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default TestimonialList;
