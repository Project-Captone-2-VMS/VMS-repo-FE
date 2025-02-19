// ui/LoadingSpinner.jsx
import React from 'react';

const variants = {
  default: 'border-blue-500',
  primary: 'border-blue-600',
  secondary: 'border-gray-600',
  success: 'border-green-600',
  warning: 'border-yellow-600',
  danger: 'border-red-600'
};

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4'
};

export const LoadingSpinner = ({ 
  variant = 'default',
  size = 'md',
  fullScreen = false,
  text = 'Loading...'
}) => {
  const spinnerClasses = `
    inline-block rounded-full
    border-solid border-t-transparent
    animate-spin
    ${variants[variant] || variants.default}
    ${sizes[size] || sizes.md}
  `;

  const containerClasses = `
    flex flex-col items-center justify-center gap-3
    ${fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'p-4'}
  `;

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Usage Examples:
export const LoadingSpinnerExamples = () => {
  return (
    <div className="space-y-8">
      {/* Different sizes */}
      <div className="flex items-center gap-4">
        <LoadingSpinner size="sm" />
        <LoadingSpinner size="md" />
        <LoadingSpinner size="lg" />
        <LoadingSpinner size="xl" />
      </div>

      {/* Different variants */}
      <div className="flex items-center gap-4">
        <LoadingSpinner variant="default" />
        <LoadingSpinner variant="primary" />
        <LoadingSpinner variant="secondary" />
        <LoadingSpinner variant="success" />
        <LoadingSpinner variant="warning" />
        <LoadingSpinner variant="danger" />
      </div>

      {/* With custom text */}
      <div className="flex items-center gap-4">
        <LoadingSpinner text="Processing..." />
        <LoadingSpinner text="Please wait" />
        <LoadingSpinner text={null} /> {/* No text */}
      </div>
    </div>
  );
};

export default LoadingSpinner;