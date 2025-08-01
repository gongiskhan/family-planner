import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  fullWidth?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({
    label,
    error,
    helper,
    icon: Icon,
    iconPosition = 'left',
    size = 'md',
    variant = 'default',
    fullWidth = true,
    className,
    disabled,
    ...props
  }, ref) => {
    const inputClasses = clsx(
      'glass-input-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Variants
        'shadow-glass': variant === 'default',
        'border-transparent bg-white/5': variant === 'minimal',

        // Sizes
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-3 py-2 text-base': size === 'md',
        'px-4 py-3 text-lg': size === 'lg',

        // Icon spacing
        'pl-10': Icon && iconPosition === 'left' && size === 'sm',
        'pl-11': Icon && iconPosition === 'left' && size === 'md',
        'pl-12': Icon && iconPosition === 'left' && size === 'lg',
        'pr-10': Icon && iconPosition === 'right' && size === 'sm',
        'pr-11': Icon && iconPosition === 'right' && size === 'md',
        'pr-12': Icon && iconPosition === 'right' && size === 'lg',

        // Full width
        'w-full': fullWidth,

        // Error state
        'border-red-500/50 focus:border-red-500 focus:ring-red-500/50': error,
      },
      className
    );

    const iconSize = {
      sm: 16,
      md: 18,
      lg: 20,
    }[size];

    const iconPositionClasses = {
      left: {
        sm: 'left-3',
        md: 'left-3',
        lg: 'left-4',
      },
      right: {
        sm: 'right-3',
        md: 'right-3',
        lg: 'right-4',
      },
    };

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />
          
          {Icon && (
            <div className={clsx(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-300 pointer-events-none',
              iconPositionClasses[iconPosition][size]
            )}>
              <Icon size={iconSize} />
            </div>
          )}
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none rounded-lg" />
        </div>
        
        {(error || helper) && (
          <motion.div
            className="mt-1 text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error ? (
              <span className="text-red-400">{error}</span>
            ) : (
              <span className="text-gray-400">{helper}</span>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;