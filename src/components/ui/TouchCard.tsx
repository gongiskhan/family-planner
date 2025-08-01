import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { clsx } from 'clsx';
import GlassCard from './GlassCard';

export interface TouchAction {
  id: string;
  label: string;
  icon: ReactNode;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  onAction: () => void;
}

export interface TouchCardProps {
  children: ReactNode;
  className?: string;
  swipeActions?: {
    left?: TouchAction[];
    right?: TouchAction[];
  };
  onTap?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

const TouchCard = ({
  children,
  className,
  swipeActions,
  onTap,
  onLongPress,
  disabled = false,
  hapticFeedback = true
}: TouchCardProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const constraintsRef = useRef(null);
  
  const x = useMotionValue(0);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);
  const opacity = useTransform(x, [-150, 0, 150], [0.8, 1, 0.8]);
  
  // Color mappings for swipe indicators
  const colorMap = {
    red: 'bg-red-500/80 text-white',
    blue: 'bg-blue-500/80 text-white',
    green: 'bg-green-500/80 text-white',
    yellow: 'bg-yellow-500/80 text-white',
    purple: 'bg-purple-500/80 text-white'
  };

  const triggerHaptic = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
  };

  const handlePanStart = () => {
    if (disabled) return;
    setIsDragging(true);
    triggerHaptic();
  };

  const handlePanEnd = (_: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    const threshold = 80;
    
    // Handle left swipe actions
    if (info.offset.x < -threshold && swipeActions?.left) {
      const actionIndex = Math.min(
        Math.floor(Math.abs(info.offset.x) / threshold) - 1,
        swipeActions.left.length - 1
      );
      const action = swipeActions.left[actionIndex];
      if (action) {
        triggerHaptic();
        action.onAction();
      }
    }
    
    // Handle right swipe actions
    else if (info.offset.x > threshold && swipeActions?.right) {
      const actionIndex = Math.min(
        Math.floor(info.offset.x / threshold) - 1,
        swipeActions.right.length - 1
      );
      const action = swipeActions.right[actionIndex];
      if (action) {
        triggerHaptic();
        action.onAction();
      }
    }
    
    x.set(0); // Animate back to center
  };

  const handleTapStart = () => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Start long press timer
    if (onLongPress) {
      const timer = setTimeout(() => {
        triggerHaptic();
        onLongPress();
        setIsPressed(false);
      }, 500); // 500ms for long press
      
      setLongPressTimer(timer);
    }
  };

  const handleTap = () => {
    if (disabled) return;
    
    setIsPressed(false);
    
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Trigger tap action if no long press occurred
    if (onTap && !isDragging) {
      triggerHaptic();
      onTap();
    }
  };

  const handleTapCancel = () => {
    setIsPressed(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const renderSwipeIndicators = () => {
    const xValue = x.get();
    
    // Left swipe indicators (shown on right side when swiping left)
    if (xValue < -20 && swipeActions?.left) {
      return (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {swipeActions.left.map((action, index) => {
            const isActive = Math.abs(xValue) > (index + 1) * 80;
            return (
              <motion.div
                key={action.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isActive ? 1 : 0.7, 
                  opacity: isActive ? 1 : 0.5 
                }}
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  colorMap[action.color],
                  isActive && 'ring-2 ring-white/50'
                )}
              >
                {action.icon}
              </motion.div>
            );
          })}
        </div>
      );
    }
    
    // Right swipe indicators (shown on left side when swiping right)
    if (xValue > 20 && swipeActions?.right) {
      return (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {swipeActions.right.map((action, index) => {
            const isActive = xValue > (index + 1) * 80;
            return (
              <motion.div
                key={action.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isActive ? 1 : 0.7, 
                  opacity: isActive ? 1 : 0.5 
                }}
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  colorMap[action.color],
                  isActive && 'ring-2 ring-white/50'
                )}
              >
                {action.icon}
              </motion.div>
            );
          })}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div ref={constraintsRef} className="relative overflow-hidden">
      <motion.div
        drag={!disabled && (swipeActions?.left || swipeActions?.right) ? "x" : false}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        dragMomentum={false}
        onPanStart={handlePanStart}
        onPanEnd={handlePanEnd}
        onTapStart={handleTapStart}
        onTap={handleTap}
        onTapCancel={handleTapCancel}
        style={{ x, scale, opacity }}
        animate={{
          scale: isPressed ? 0.95 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className={clsx(
          'relative cursor-pointer select-none',
          {
            'pointer-events-none': disabled,
            'active:scale-95': !disabled
          }
        )}
        whileTap={{ scale: 0.98 }}
      >
        <GlassCard className={clsx(
          'relative overflow-hidden transition-shadow duration-200',
          {
            'shadow-glass-elevated': isPressed,
            'opacity-50': disabled
          },
          className
        )}>
          {children}
          
          {/* Touch interaction overlay for visual feedback */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: isPressed 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0)'
            }}
            transition={{ duration: 0.15 }}
          />
        </GlassCard>
        
        {/* Swipe indicators */}
        {renderSwipeIndicators()}
      </motion.div>
      
      {/* Swipe hint overlay for first-time users */}
      {(swipeActions?.left || swipeActions?.right) && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-30">
          <div className="text-xs text-white/60 flex items-center gap-2">
            {swipeActions?.right && <span>← Swipe</span>}
            {swipeActions?.left && <span>Swipe →</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TouchCard;