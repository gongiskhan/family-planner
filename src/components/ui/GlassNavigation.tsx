import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { LucideIcon, Menu, X } from 'lucide-react';
import GlassButton from './GlassButton';
import GlassCard from './GlassCard';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  disabled?: boolean;
}

export interface GlassNavigationProps {
  items: NavigationItem[];
  variant?: 'sidebar' | 'mobile' | 'bottom';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
  activeItemId?: string;
  collapsible?: boolean;
}

const GlassNavigation = ({
  items,
  variant = 'sidebar',
  className,
  onItemClick,
  activeItemId,
  collapsible = false
}: GlassNavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleItemClick = (item: NavigationItem) => {
    if (item.disabled) return;
    
    onItemClick?.(item);
    item.onClick?.();
    
    // Close mobile menu after item selection
    if (variant === 'mobile') {
      setIsMobileMenuOpen(false);
    }
  };

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => (
    <motion.div
      key={item.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={() => handleItemClick(item)}
        disabled={item.disabled}
        className={clsx(
          'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left',
          'backdrop-blur-sm border border-transparent hover:border-white/20',
          {
            // Active state
            'bg-white/20 border-white/30 text-white shadow-glass': 
              item.active || item.id === activeItemId,
            
            // Default state
            'text-white/80 hover:text-white hover:bg-white/10': 
              !item.active && item.id !== activeItemId && !item.disabled,
            
            // Disabled state
            'text-white/40 cursor-not-allowed': item.disabled,
            
            // Mobile specific styles
            'text-lg py-4': isMobile,
            
            // Collapsed sidebar styles
            'justify-center': variant === 'sidebar' && isCollapsed && !isMobile
          }
        )}
      >
        <item.icon 
          size={isMobile ? 24 : 20} 
          className="flex-shrink-0" 
        />
        
        {(!isCollapsed || isMobile || variant !== 'sidebar') && (
          <>
            <span className="font-medium flex-1">{item.label}</span>
            
            {item.badge && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-blue-500 text-white min-w-[20px]">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </motion.div>
  );

  // Sidebar Navigation
  if (variant === 'sidebar') {
    return (
      <GlassCard 
        variant="elevated" 
        className={clsx(
          'flex flex-col h-full transition-all duration-300',
          {
            'w-64': !isCollapsed,
            'w-16': isCollapsed
          },
          className
        )}
      >
        {/* Sidebar Header */}
        {collapsible && (
          <div className="p-4 border-b border-white/10">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              icon={isCollapsed ? Menu : X}
              className="w-full justify-center"
            >
              {!isCollapsed && 'Collapse'}
            </GlassButton>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {items.map(item => renderNavigationItem(item))}
        </nav>
      </GlassCard>
    );
  }

  // Mobile Navigation
  if (variant === 'mobile') {
    return (
      <>
        {/* Mobile Menu Button */}
        <GlassButton
          variant="ghost"
          onClick={() => setIsMobileMenuOpen(true)}
          icon={Menu}
          className="md:hidden"
        >
          Menu
        </GlassButton>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Mobile Menu Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 md:hidden"
              >
                <GlassCard variant="elevated" className="h-full flex flex-col">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Navigation</h2>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      icon={X}
                    >
                      <span className="sr-only">Close menu</span>
                    </GlassButton>
                  </div>

                  {/* Mobile Navigation Items */}
                  <nav className="flex-1 p-6 space-y-3">
                    {items.map(item => renderNavigationItem(item, true))}
                  </nav>
                </GlassCard>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Bottom Navigation
  if (variant === 'bottom') {
    return (
      <GlassCard 
        variant="elevated" 
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-40 md:hidden',
          className
        )}
      >
        <nav className="flex items-center justify-around p-4">
          {items.map(item => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={clsx(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]',
                {
                  'text-white bg-white/20': item.active || item.id === activeItemId,
                  'text-white/60 hover:text-white': !item.active && item.id !== activeItemId && !item.disabled,
                  'text-white/30 cursor-not-allowed': item.disabled
                }
              )}
            >
              <div className="relative">
                <item.icon size={20} className="mb-1" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white min-w-[18px] h-[18px]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-[50px]">
                {item.label}
              </span>
            </motion.button>
          ))}
        </nav>
      </GlassCard>
    );
  }

  return null;
};

export default GlassNavigation;