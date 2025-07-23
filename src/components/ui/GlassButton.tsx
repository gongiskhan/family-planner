import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  onClick,
  type = 'button',
}) => {
  const baseClasses = clsx(
    'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
    {
      // Variants
      'backdrop-blur-sm bg-blue-500/80 text-white border border-blue-400/30 hover:bg-blue-600/80 focus:ring-blue-500/50 shadow-glass':
        variant === 'primary',
      'backdrop-blur-sm bg-gray-500/60 text-gray-100 border border-gray-400/30 hover:bg-gray-600/60 focus:ring-gray-500/50 shadow-glass':
        variant === 'secondary',
      'backdrop-blur-sm bg-red-500/80 text-white border border-red-400/30 hover:bg-red-600/80 focus:ring-red-500/50 shadow-glass':
        variant === 'destructive',
      'backdrop-blur-sm bg-transparent text-gray-100 border border-white/20 hover:bg-white/10 focus:ring-white/50':
        variant === 'ghost',

      // Sizes
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',

      // Full width
      'w-full': fullWidth,
    },
    className
  );

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
  }[size];

  return (
    <motion.button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {Icon && iconPosition === 'left' && (
          <Icon size={iconSize} className={loading ? 'animate-spin' : ''} />
        )}
        
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
        
        {Icon && iconPosition === 'right' && !loading && (
          <Icon size={iconSize} />
        )}
      </div>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.button>
  );
};

export default GlassButton;