interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full shadow-md transition-all duration-300 hover:scale-110';

  const variantClasses = {
    default: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400',
    success: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white hover:from-emerald-500 hover:to-green-600',
    warning: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600',
    error: 'bg-gradient-to-r from-red-400 to-pink-500 text-white hover:from-red-500 hover:to-pink-600',
    info: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-600'
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}