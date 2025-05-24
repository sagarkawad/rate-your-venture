import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  hover = false,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-card p-6
        ${hover ? 'transition-shadow duration-200 hover:shadow-card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;