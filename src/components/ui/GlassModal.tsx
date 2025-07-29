import { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import GlassButton from './GlassButton';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const GlassModal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className
}: GlassModalProps) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={clsx(
                  'w-full transform overflow-hidden text-left align-middle transition-all',
                  sizeClasses[size],
                  className
                )}
              >
                {/* Glass Modal Content */}
                <div className="glass-modal relative">
                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none rounded-glass-xl" />
                  
                  {/* Header */}
                  {(title || showCloseButton) && (
                    <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
                      {title && (
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-bold text-white"
                        >
                          {title}
                        </Dialog.Title>
                      )}
                      
                      {showCloseButton && (
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={onClose}
                          icon={X}
                          className="ml-auto"
                        >
                          <span className="sr-only">Close modal</span>
                        </GlassButton>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-6">
                    {children}
                  </div>

                  {/* Bottom highlight */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GlassModal;