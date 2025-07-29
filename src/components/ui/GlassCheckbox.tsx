import { InputHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, Minus } from 'lucide-react';

export interface GlassCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
  error?: string;
  fullWidth?: boolean;
}

const GlassCheckbox = forwardRef<HTMLInputElement, GlassCheckboxProps>(({
  label,
  description,
  size = 'md',
  indeterminate = false,
  error,
  fullWidth = false,
  className,
  disabled,
  checked,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <div className={clsx('flex items-start gap-3', { 'w-full': fullWidth }, className)}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={ref}
          type="checkbox"
          checked={indeterminate ? false : checked}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        
        <motion.div
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          className={clsx(
            'relative rounded-lg border transition-all duration-200 cursor-pointer',
            'backdrop-blur-sm flex items-center justify-center',
            sizeClasses[size],
            {
              // Default state
              'bg-white/10 border-white/20 hover:bg-white/15': !checked && !indeterminate && !disabled,
              
              // Checked state
              'bg-blue-500/80 border-blue-400/50 text-white': (checked || indeterminate) && !disabled,
              
              // Disabled state
              'bg-white/5 border-white/10 cursor-not-allowed opacity-50': disabled,
              
              // Error state
              'border-red-400/50': error,
              
              // Focus state
              'focus-within:ring-2 focus-within:ring-blue-500/50': !disabled
            }
          )}
          onClick={!disabled ? props.onChange as any : undefined}
        >
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none rounded-lg" />
          
          {/* Check/Indeterminate icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: (checked || indeterminate) ? 1 : 0, 
              opacity: (checked || indeterminate) ? 1 : 0 
            }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {indeterminate ? (
              <Minus size={iconSize[size]} className="text-white" />
            ) : (
              <Check size={iconSize[size]} className="text-white" />
            )}
          </motion.div>
        </motion.div>
      </div>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              htmlFor={props.id}
              className={clsx(
                'block font-medium cursor-pointer select-none',
                {
                  'text-white': !disabled,
                  'text-white/50': disabled,
                  'text-red-300': error
                }
              )}
            >
              {label}
            </label>
          )}
          
          {description && (
            <p className={clsx(
              'text-sm mt-1',
              {
                'text-white/70': !disabled && !error,
                'text-white/40': disabled,
                'text-red-300/80': error
              }
            )}>
              {description}
            </p>
          )}
          
          {error && (
            <p className="text-red-300 text-sm mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

GlassCheckbox.displayName = 'GlassCheckbox';

export default GlassCheckbox;