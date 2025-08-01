import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface GlassSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface GlassSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  fullWidth?: boolean;
  options: GlassSelectOption[];
  placeholder?: string;
}

const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({
    label,
    error,
    helper,
    icon: Icon,
    size = 'md',
    variant = 'default',
    fullWidth = true,
    options,
    placeholder,
    className,
    disabled,
    ...props
  }, ref) => {
    const selectClasses = clsx(
      'glass-input-dark appearance-none cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Variants
        'shadow-glass': variant === 'default',
        'border-transparent bg-white/5': variant === 'minimal',

        // Sizes
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-3 py-2 text-base': size === 'md',
        'px-4 py-3 text-lg': size === 'lg',

        // Icon spacing
        'pl-10': Icon && size === 'sm',
        'pl-11': Icon && size === 'md',
        'pl-12': Icon && size === 'lg',

        // Chevron spacing
        'pr-10': size === 'sm',
        'pr-11': size === 'md',
        'pr-12': size === 'lg',

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

    const chevronSize = {
      sm: 16,
      md: 18,
      lg: 20,
    }[size];

    const iconPositionClasses = {
      sm: 'left-3',
      md: 'left-3',
      lg: 'left-4',
    };

    const chevronPositionClasses = {
      sm: 'right-3',
      md: 'right-3',
      lg: 'right-4',
    };

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-100 mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            className={selectClasses}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-gray-800 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {Icon && (
            <div className={clsx(
              'absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none',
              iconPositionClasses[size]
            )}>
              <Icon size={iconSize} />
            </div>
          )}
          
          {/* Chevron icon */}
          <div className={clsx(
            'absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none',
            chevronPositionClasses[size]
          )}>
            <ChevronDown size={chevronSize} />
          </div>
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none rounded-lg" />
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

GlassSelect.displayName = 'GlassSelect';

export default GlassSelect;