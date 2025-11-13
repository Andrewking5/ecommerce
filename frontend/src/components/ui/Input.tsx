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

  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText && !error ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // 实时验证模式：当用户开始输入时显示错误
  const [hasInteracted, setHasInteracted] = React.useState(false);
  
  React.useEffect(() => {
    const handleBlur = () => setHasInteracted(true);
    const handleInput = () => setHasInteracted(true);
    
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.addEventListener('blur', handleBlur);
      inputElement.addEventListener('input', handleInput);
      return () => {
        inputElement.removeEventListener('blur', handleBlur);
        inputElement.removeEventListener('input', handleInput);
      };
    }
  }, [inputId]);
  
  const showError = error && hasInteracted;

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
          showError && 'border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={showError ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      
      {showError && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      
      {helperText && !showError && (
        <p id={helperId} className="mt-1 text-sm text-text-tertiary">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;


