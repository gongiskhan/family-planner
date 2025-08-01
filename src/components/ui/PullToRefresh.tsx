import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  refreshThreshold?: number;
  maxPullDistance?: number;
  disabled?: boolean;
  className?: string;
}

const PullToRefresh = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  maxPullDistance = 120,
  disabled = false,
  className
}: PullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, refreshThreshold], [0, 1]);
  const refreshIconRotation = useTransform(y, [0, refreshThreshold], [0, 180]);
  const refreshIconScale = useTransform(y, [0, refreshThreshold], [0.8, 1.2]);
  
  const handlePanStart = (_: any, info: PanInfo) => {
    if (disabled || isRefreshing) return;
    
    // Only allow pull-to-refresh at the top of the scroll container
    const container = containerRef.current;
    if (container && container.scrollTop > 0) return;
    
    // Only respond to downward pulls
    if (info.delta.y > 0) {
      setIsPulling(true);
    }
  };

  const handlePan = (_: any, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    const container = containerRef.current;
    if (container && container.scrollTop > 0) {
      setIsPulling(false);
      return;
    }
    
    // Update pull distance with elastic resistance
    const pullDistance = Math.max(0, Math.min(info.offset.y, maxPullDistance));
    const resistance = pullDistance > refreshThreshold ? 0.5 : 1;
    y.set(pullDistance * resistance);
  };

  const handlePanEnd = async (_: any, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    setIsPulling(false);
    
    const pullDistance = Math.max(0, info.offset.y);
    
    if (pullDistance >= refreshThreshold) {
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      setIsRefreshing(true);
      
      // Animate to refresh position
      y.set(refreshThreshold);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        // Animate back to top
        y.set(0);
      }
    } else {
      // Animate back to top
      y.set(0);
    }
  };

  const getRefreshText = () => {
    if (isRefreshing) return 'Refreshing...';
    const progress = pullProgress.get();
    if (progress >= 1) return 'Release to refresh';
    if (progress > 0.5) return 'Keep pulling...';
    return 'Pull to refresh';
  };

  const getRefreshIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="animate-spin" size={20} />;
    }
    
    const progress = pullProgress.get();
    if (progress >= 1) {
      return <RefreshCw size={20} />;
    }
    
    return <ChevronDown size={20} />;
  };

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <motion.div
        style={{ y: y }}
        className="absolute top-0 left-0 right-0 z-10"
      >
        <motion.div
          style={{ 
            opacity: isPulling || isRefreshing ? 1 : 0,
            scale: refreshIconScale 
          }}
          className="flex flex-col items-center justify-center h-20 backdrop-blur-lg bg-white/10 border-b border-white/20"
        >
          <motion.div
            style={{ rotate: refreshIconRotation }}
            className="text-white mb-2"
          >
            {getRefreshIcon()}
          </motion.div>
          <p className="text-sm font-medium text-white/80">
            {getRefreshText()}
          </p>
          
          {/* Progress indicator */}
          <div className="w-8 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
            <motion.div
              style={{ scaleX: pullProgress }}
              className="h-full bg-white/60 rounded-full origin-left"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ y }}
        className="h-full overflow-auto"
      >
        {/* Spacer for pull indicator */}
        <motion.div
          style={{ 
            height: useTransform(y, [0, refreshThreshold], [0, 80])
          }}
        />
        
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;