import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-sm',
        hover && 'hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;


