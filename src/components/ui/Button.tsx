import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 focus:ring-pink-400',
    secondary: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 focus:ring-cyan-400',
    outline: 'border-2 border-transparent bg-clip-padding bg-gradient-to-r from-purple-500 to-pink-500 bg-origin-border hover:from-purple-600 hover:to-pink-600 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 focus:ring-gray-400 shadow-none',
    gradient: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:ring-purple-400',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 focus:ring-emerald-400',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 focus:ring-amber-400',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}