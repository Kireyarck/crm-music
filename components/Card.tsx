// Implemented the generic Card component used for consistent UI content display.
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={`bg-cyber-surface/80 backdrop-blur-sm border border-cyber-border rounded-xl p-6 shadow-lg card-epic-hover ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;