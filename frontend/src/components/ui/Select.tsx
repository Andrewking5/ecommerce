import React from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText && !error ? `${selectId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  // 实时验证模式
  const [hasInteracted, setHasInteracted] = React.useState(false);
  
  React.useEffect(() => {
    const handleBlur = () => setHasInteracted(true);
    const handleChange = () => setHasInteracted(true);
    
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
      selectElement.addEventListener('blur', handleBlur);
      selectElement.addEventListener('change', handleChange);
      return () => {
        selectElement.removeEventListener('blur', handleBlur);
        selectElement.removeEventListener('change', handleChange);
      };
    }
  }, [selectId]);
  
  const showError = error && hasInteracted;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-primary mb-2"
        >
          {label}
        </label>
      )}
      
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          'w-full px-4 py-3 border border-gray-300 rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent',
          'transition-all duration-200',
          'bg-white',
          showError && 'border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={showError ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
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

Select.displayName = 'Select';

export default Select;

