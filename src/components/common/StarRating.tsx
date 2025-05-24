import React from 'react';
import { Star } from 'lucide-react';
import { RATING } from '../../config';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}) => {
  const totalStars = RATING.MAX;
  
  // Determine star size based on prop
  const starSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  const starSize = starSizes[size];
  
  // Handle click on a star
  const handleStarClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleStarClick(starValue)}
            className={`${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            } p-0.5 focus:outline-none transition-colors duration-200`}
            disabled={readOnly}
            aria-label={`Rate ${starValue} of ${totalStars}`}
          >
            <Star
              size={starSize}
              fill={isFilled ? '#F59E0B' : 'none'}
              stroke={isFilled ? '#F59E0B' : '#D1D5DB'}
              className={`transition-transform ${!readOnly && 'hover:scale-110'}`}
            />
          </button>
        );
      })}
      
      {/* Display numeric value for accessibility */}
      <span className="ml-2 text-sm text-gray-600">
        {value.toFixed(1)} / {totalStars}
      </span>
    </div>
  );
};

export default StarRating;