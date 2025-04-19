import React from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  readOnly?: boolean;
  size?: number;
  onChange?: (rating: number) => void;
  className?: string;
}

/**
 * Star rating component for displaying and selecting ratings
 * 
 * @param rating - Current rating value
 * @param maxRating - Maximum rating value (default: 5)
 * @param readOnly - Whether the rating can be changed (default: true)
 * @param size - Size of stars in pixels (default: 20)
 * @param onChange - Callback when rating changes (only in interactive mode)
 * @param className - Additional CSS classes
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  readOnly = true,
  size = 20,
  onChange,
  className = '',
}) => {
  // Convert rating to nearest 0.5 for display
  const displayRating = Math.round(rating * 2) / 2;
  
  // Helper function to get the appropriate fill width class based on percentage
  const getFillWidthClass = (percentage: number): string => {
    // Round to nearest 10%
    const roundedPercentage = Math.round(percentage / 10) * 10;
    return `fill-width-${roundedPercentage}`;
  };
  
  const handleClick = (selectedRating: number) => {
    if (!readOnly && onChange) {
      onChange(selectedRating);
    }
  };

  // Function stub for future hover effects implementation
  const handleMouseEnter = () => {
    // Not implemented in this version for simplicity
  };

  return (
    <div 
      className={`star-container ${!readOnly ? 'star-interactive' : ''} ${className}`}
      role="img"
      aria-label={`${rating} out of ${maxRating} stars`}
    >
      {[...Array(maxRating)].map((_, index) => {
        // Calculate fill percentage for this star
        const starIndex = index + 1;
        let fillPercentage = 0;
        
        if (displayRating >= starIndex) {
          // Full star
          fillPercentage = 100;
        } else if (displayRating > index && displayRating < starIndex) {
          // Partial star (half star)
          fillPercentage = (displayRating - index) * 100;
        }
        
        return (
          <div 
            key={index}
            className="star-wrapper"
            onClick={() => handleClick(starIndex)}
            onMouseEnter={handleMouseEnter}
          >
            {/* Empty star (background) */}
            <Star 
              size={size} 
              className="empty-star" 
              fill="none"
            />
            
            {/* Filled star (overlay with clip-path) */}
            {fillPercentage > 0 && (
              <div 
                className={`filled-star ${getFillWidthClass(fillPercentage)}`}
              >
                <Star 
                  size={size} 
                  fill="currentColor"
                />
              </div>
            )}
          </div>
        );
      })}
      
      {/* Optionally display numeric rating */}
      {/* <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span> */}
    </div>
  );
};

export default StarRating;
