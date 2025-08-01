import TouchCard, { TouchAction } from '@/components/ui/TouchCard';
import { Task, Category } from '@/types';
import { getFrequencyDisplayName } from '@/utils/taskCalculations';
import { 
  Edit3, 
  Trash2, 
  Calendar,
  AlertCircle,
  Star,
  Check
} from 'lucide-react';

interface MobileTaskCardProps {
  task: Task;
  category?: Category;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onToggleComplete?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
  disabled?: boolean;
  isCompleted?: boolean;
  isFavorite?: boolean;
}

export default function MobileTaskCard({ 
  task, 
  category, 
  onEdit, 
  onView, 
  onDelete, 
  onToggleComplete,
  onToggleFavorite,
  className, 
  disabled,
  isCompleted = false,
  isFavorite = false
}: MobileTaskCardProps) {
  const getAssignmentDisplay = () => {
    switch (task.assignment) {
      case 'goncalo':
        return { name: 'Gonçalo', color: 'text-blue-300', bgColor: 'bg-blue-500/20', dotColor: 'bg-blue-400' };
      case 'marilia':
        return { name: 'Marília', color: 'text-pink-300', bgColor: 'bg-pink-500/20', dotColor: 'bg-pink-400' };
      case 'tie':
        return { name: 'Decide', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20', dotColor: 'bg-yellow-400' };
      default:
        return { name: 'Unassigned', color: 'text-gray-300', bgColor: 'bg-gray-500/20', dotColor: 'bg-gray-400' };
    }
  };

  const assignment = getAssignmentDisplay();

  // Define swipe actions
  const leftSwipeActions: TouchAction[] = [
    {
      id: 'complete',
      label: 'Complete',
      icon: <Check size={16} />,
      color: 'green',
      onAction: () => onToggleComplete?.()
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      color: 'red',
      onAction: () => onDelete?.()
    }
  ];

  const rightSwipeActions: TouchAction[] = [
    {
      id: 'favorite',
      label: 'Favorite',
      icon: <Star size={16} />,
      color: isFavorite ? 'yellow' : 'blue',
      onAction: () => onToggleFavorite?.()
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit3 size={16} />,
      color: 'purple',
      onAction: () => onEdit?.()
    }
  ];

  return (
    <TouchCard
      swipeActions={{
        left: leftSwipeActions,
        right: rightSwipeActions
      }}
      onTap={onView}
      onLongPress={onEdit}
      disabled={disabled}
      className={className}
    >
      <div className="p-4">
        {/* Header with title and category */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-white text-base leading-tight mb-1 ${
              isCompleted ? 'line-through opacity-60' : ''
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-white/60 text-sm line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Category icon and status indicators */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isFavorite && (
              <Star size={16} className="text-yellow-400 fill-current" />
            )}
            {category && (
              <span className="text-xl">{category.icon}</span>
            )}
            {isCompleted && (
              <div className="w-2 h-2 rounded-full bg-green-400" />
            )}
          </div>
        </div>

        {/* Assignment indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${assignment.dotColor}`} />
          <span className={`text-sm font-medium ${assignment.color}`}>
            {assignment.name}
          </span>
          <span className="text-white/40 text-xs">•</span>
          <span className="text-white/60 text-xs">
            {getFrequencyDisplayName(task.frequency)}
          </span>
        </div>

        {/* Points display - compact mobile version */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-blue-300">G:</span>
              <span className="font-bold text-blue-300">{task.points.goncalo}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-pink-300">M:</span>
              <span className="font-bold text-pink-300">{task.points.marilia}</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-white/50">Monthly</p>
            <p className="text-lg font-bold text-white">
              {task.monthlyPoints.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Category badge and created date */}
        <div className="flex items-center justify-between">
          {category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70">
              {category.name}
            </span>
          )}
          
          <div className="text-xs text-white/40 flex items-center gap-1">
            <Calendar size={10} />
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Notes indicator */}
        {task.notes && (
          <div className="mt-3 flex items-center gap-2">
            <AlertCircle size={12} className="text-white/40" />
            <span className="text-xs text-white/40">Has notes</span>
          </div>
        )}

        {/* Mobile interaction hint */}
        <div className="mt-2 pt-2 border-t border-white/5">
          <div className="flex justify-between items-center text-xs text-white/30">
            <span>← Swipe for actions</span>
            <span>Tap to view • Hold to edit</span>
          </div>
        </div>
      </div>
    </TouchCard>
  );
}