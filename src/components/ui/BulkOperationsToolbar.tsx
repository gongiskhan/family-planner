import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  X, 
  MoreHorizontal
} from 'lucide-react';
import { GlassButton, GlassModal } from '@/components/ui';

export interface BulkAction {
  id: string;
  label: string;
  icon: any;
  variant?: 'primary' | 'destructive' | 'secondary' | 'ghost';
  onClick: (selectedIds: string[]) => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onClose: () => void;
  className?: string;
  actions?: BulkAction[];
  selectedIds: string[];
}

const BulkOperationsToolbar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onSelectNone,
  onClose,
  className,
  actions = [],
  selectedIds
}: BulkOperationsToolbarProps) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowConfirmModal(true);
    } else {
      action.onClick(selectedIds);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      pendingAction.onClick(selectedIds);
      setPendingAction(null);
      setShowConfirmModal(false);
    }
  };

  const primaryActions = actions.slice(0, 3);
  const moreActions = actions.slice(3);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={clsx(
          'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40',
          'backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-glass-elevated',
          'p-4 max-w-2xl w-full mx-4',
          className
        )}
      >
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none rounded-2xl" />
        
        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Selection Summary */}
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="font-semibold">{selectedCount}</span>
              <span className="text-white/80 ml-1">selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <GlassButton
                size="sm"
                variant="ghost"
                onClick={selectedCount === totalCount ? onSelectNone : onSelectAll}
              >
                {selectedCount === totalCount ? 'Select None' : 'Select All'}
              </GlassButton>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {primaryActions.map(action => (
              <GlassButton
                key={action.id}
                size="sm"
                variant={action.variant || 'primary'}
                onClick={() => handleActionClick(action)}
                icon={action.icon}
                disabled={selectedCount === 0}
              >
                <span className="hidden md:inline">{action.label}</span>
              </GlassButton>
            ))}

            {moreActions.length > 0 && (
              <div className="relative">
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  icon={MoreHorizontal}
                  disabled={selectedCount === 0}
                >
                  <span className="sr-only">More actions</span>
                </GlassButton>

                <AnimatePresence>
                  {showMoreActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full right-0 mb-2 min-w-48"
                    >
                      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg shadow-glass p-2">
                        {moreActions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => {
                              handleActionClick(action);
                              setShowMoreActions(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <action.icon size={16} />
                            <span className="text-sm">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <GlassButton
              size="sm"
              variant="ghost"
              onClick={onClose}
              icon={X}
            >
              <span className="sr-only">Close</span>
            </GlassButton>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <GlassModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-white/80">
            {pendingAction?.confirmationMessage || 
             `Are you sure you want to ${pendingAction?.label.toLowerCase()} ${selectedCount} selected item${selectedCount === 1 ? '' : 's'}?`}
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <GlassButton
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant={pendingAction?.variant === 'destructive' ? 'destructive' : 'primary'}
              onClick={confirmAction}
            >
              {pendingAction?.label}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </>
  );
};

export default BulkOperationsToolbar;