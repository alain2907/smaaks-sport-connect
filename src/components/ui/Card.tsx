interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'gradient' | 'glass' | 'neon';
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  const clickableClasses = onClick ? 'cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl' : '';

  const variantClasses = {
    default: 'bg-white shadow-xl hover:shadow-2xl border border-gray-100',
    gradient: 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-xl hover:shadow-2xl border border-purple-100',
    glass: 'bg-white/80 backdrop-blur-lg shadow-xl hover:shadow-2xl border border-white/20',
    neon: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 shadow-xl hover:shadow-2xl border-2 border-purple-400/50 hover:border-purple-500'
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-b border-gradient-to-r from-purple-200/50 via-pink-200/50 to-blue-200/50 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gradient-to-r from-purple-200/50 via-pink-200/50 to-blue-200/50 ${className}`}>
      {children}
    </div>
  );
}