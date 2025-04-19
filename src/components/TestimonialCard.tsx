import React from 'react';
import { Edit, Trash, Loader } from 'lucide-react';
import { Testimonial } from '../types/Testimonial';
import StarRating from './StarRating';

interface TestimonialCardProps {
  testimonial: Testimonial;
  showActions?: boolean;
  isDeleting?: boolean;
  onEdit?: (testimonial: Testimonial) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/**
 * Component for displaying a single testimonial
 * 
 * @param testimonial - The testimonial data to display
 * @param showActions - Whether to show edit/delete actions (for admin)
 * @param isDeleting - Whether the testimonial is being deleted
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param className - Additional CSS classes
 */
const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  showActions = false,
  isDeleting = false,
  onEdit,
  onDelete,
  className = '',
}) => {
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      // Parse the date string and handle timezone issues
      // First, check if the date is in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // For YYYY-MM-DD format, parse with UTC to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(year, month - 1, day));
      } else {
        // For other formats, try to parse normally but force UTC
        const date = new Date(dateString + 'T12:00:00Z');
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date);
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return the original string if parsing fails
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(testimonial);
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (onDelete && !isDeleting) {
      onDelete(testimonial.id);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <StarRating rating={testimonial.rating} size={16} />
            <span className="ml-2 text-sm text-gray-500">
              {formatDate(testimonial.date)}
            </span>
            {testimonial.verified_purchase && (
              <span className="ml-2 text-xs text-green-600 border border-green-600 rounded-sm px-1">
                Verified Purchase
              </span>
            )}
          </div>
          
          {testimonial.title && (
            <h3 className="text-md font-semibold text-gray-800 mb-1">
              {testimonial.title}
            </h3>
          )}
          
          <p className="text-gray-700 text-sm italic mb-3">"{testimonial.content}"</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium">{testimonial.reviewer_name}</span>
              
              {testimonial.source && (
                <>
                  <span className="mx-1">•</span>
                  <span>{testimonial.source}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="text-blue-500 hover:text-blue-700"
              aria-label="Edit testimonial"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`text-red-500 hover:text-red-700 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Delete testimonial"
            >
              {isDeleting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash size={18} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialCard;
