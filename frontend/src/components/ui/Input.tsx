import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-2"
        >
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'w-full px-4 py-3 border border-gray-300 rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent',
          'transition-all duration-200',
          'placeholder:text-text-tertiary',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-tertiary">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;


