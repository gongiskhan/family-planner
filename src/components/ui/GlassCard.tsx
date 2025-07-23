import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'floating';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: 'light' | 'medium' | 'heavy';
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  blur = 'md',
  opacity = 'light',
  className,
  animate = true,
  onClick,
  hover = false,
}) => {
  const baseClasses = clsx(
    'relative overflow-hidden transition-all duration-300',
    {
      // Variants
      'backdrop-blur-md bg-glass-light border border-glass rounded-glass shadow-glass':
        variant === 'default',
      'backdrop-blur-lg bg-glass-medium border border-glass rounded-glass-lg shadow-glass-elevated':
        variant === 'elevated',
      'backdrop-blur-xl bg-glass-heavy border border-glass-dark rounded-glass-xl shadow-glass-elevated':
        variant === 'floating',

      // Blur levels
      'backdrop-blur-sm': blur === 'sm',
      'backdrop-blur-md': blur === 'md',
      'backdrop-blur-lg': blur === 'lg',
      'backdrop-blur-xl': blur === 'xl',

      // Opacity levels
      'bg-glass-light': opacity === 'light',
      'bg-glass-medium': opacity === 'medium',
      'bg-glass-heavy': opacity === 'heavy',

      // Interactive states
      'cursor-pointer hover:shadow-glass-elevated hover:scale-[1.02] active:scale-[0.98]':
        onClick || hover,
    },
    className
  );

  const CardComponent = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: 'easeOut' },
        whileHover: hover
          ? { scale: 1.02, transition: { duration: 0.2 } }
          : undefined,
        whileTap: onClick
          ? { scale: 0.98, transition: { duration: 0.1 } }
          : undefined,
      }
    : {};

  return (
    <CardComponent
      className={baseClasses}
      onClick={onClick}
      {...animationProps}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Shimmer effect for interactive cards */}
      {(onClick || hover) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
      )}
    </CardComponent>
  );
};

export default GlassCard;