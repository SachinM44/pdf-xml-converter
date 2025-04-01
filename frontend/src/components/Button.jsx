import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  loading = false, 
  disabled = false,
  variant = 'primary',
  className = '',
  fullWidth = false
}) => {
  const baseStyles = `
    inline-flex items-center justify-center px-4 py-2 border border-transparent
    text-sm font-medium rounded-lg shadow-sm
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200
    ${fullWidth ? 'w-full' : ''}
  `;

  const variants = {
    primary: `
      text-white bg-indigo-600 hover:bg-indigo-700
      focus:ring-indigo-500
      disabled:bg-indigo-400
    `,
    secondary: `
      text-gray-700 bg-white border-gray-300 hover:bg-gray-50
      focus:ring-indigo-500
      disabled:bg-gray-100
    `,
    danger: `
      text-white bg-red-600 hover:bg-red-700
      focus:ring-red-500
      disabled:bg-red-400
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 