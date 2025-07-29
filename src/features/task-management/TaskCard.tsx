import { motion } from 'framer-motion';
import { GlassCard, GlassButton } from '@/components/ui';
import { Task, Category } from '@/types';
import { getFrequencyDisplayName } from '@/utils/taskCalculations';
import { 
  Edit3, 
  Trash2, 
  Eye,
  Clock,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function TaskCard({ task, category, onEdit, onView, onDelete, className, disabled }: TaskCardProps) {
  const getAssignmentDisplay = () => {
    switch (task.assignment) {
      case 'goncalo':
        return { name: 'Gonçalo', color: 'text-blue-300', bgColor: 'bg-blue-500/20' };
      case 'marilia':
        return { name: 'Marília', color: 'text-pink-300', bgColor: 'bg-pink-500/20' };
      case 'tie':
        return { name: 'Decide Together', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20' };
      default:
        return { name: 'Unassigned', color: 'text-gray-300', bgColor: 'bg-gray-500/20' };
    }
  };

  const assignment = getAssignmentDisplay();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className={`p-6 h-full ${className || ''}`} hover={!disabled}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-white/70 text-sm line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {category && (
            <div className="ml-3 flex-shrink-0">
              <span className="text-2xl">{category.icon}</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80">
              {category.name}
            </span>
          </div>
        )}

        {/* Frequency and Points */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-white/60" />
            <span className="text-white/80">
              {getFrequencyDisplayName(task.frequency)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10">
              <span className="text-blue-300 font-medium">Gonçalo</span>
              <span className="font-bold text-blue-300">{task.points.goncalo}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-pink-500/10">
              <span className="text-pink-300 font-medium">Marília</span>
              <span className="font-bold text-pink-300">{task.points.marilia}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-white/60 mb-1">Monthly Points</p>
            <p className="text-xl font-bold text-white">
              {task.monthlyPoints.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Assignment */}
        <div className="mb-4">
          <div className={`p-3 rounded-lg ${assignment.bgColor} text-center`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <User size={16} className={assignment.color} />
              <span className="text-xs text-white/60 uppercase tracking-wide">
                Assigned to
              </span>
            </div>
            <p className={`font-bold ${assignment.color}`}>
              {assignment.name}
            </p>
          </div>
        </div>

        {/* Notes */}
        {task.notes && (
          <div className="mb-4 p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-white/60" />
              <span className="text-xs text-white/60 uppercase tracking-wide">
                Notes
              </span>
            </div>
            <p className="text-sm text-white/80 line-clamp-3">
              {task.notes}
            </p>
          </div>
        )}

        {/* Created Date */}
        <div className="mb-4 text-xs text-white/50 flex items-center gap-1">
          <Calendar size={12} />
          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        {!disabled && (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
            <GlassButton
              size="sm"
              variant="ghost"
              onClick={onView}
              icon={Eye}
              className="flex-1"
            >
              View
            </GlassButton>
            
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={onEdit}
              icon={Edit3}
              className="flex-1"
            >
              Edit
            </GlassButton>
            
            <GlassButton
              size="sm"
              variant="destructive"
              onClick={onDelete}
              icon={Trash2}
            >
              <span className="sr-only">Delete</span>
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}