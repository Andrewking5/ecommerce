import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const errorId = error ? `${textareaId}-error` : undefined;
  const helperId = helperText && !error ? `${textareaId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // 实时验证模式：当用户开始输入时显示错误
  const [hasInteracted, setHasInteracted] = React.useState(false);
  
  React.useEffect(() => {
    const handleBlur = () => setHasInteracted(true);
    const handleInput = () => setHasInteracted(true);
    
    const textareaElement = document.getElementById(textareaId);
    if (textareaElement) {
      textareaElement.addEventListener('blur', handleBlur);
      textareaElement.addEventListener('input', handleInput);
      return () => {
        textareaElement.removeEventListener('blur', handleBlur);
        textareaElement.removeEventListener('input', handleInput);
      };
    }
  }, [textareaId]);
  
  const showError = error && hasInteracted;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-text-primary mb-2"
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        className={clsx(
          'w-full px-4 py-3 border border-gray-300 rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent',
          'transition-all duration-200',
          'placeholder:text-text-tertiary',
          'resize-none',
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

Textarea.displayName = 'Textarea';

export default Textarea;

