import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassSelectOption } from '@/components/ui';
import { Task, TaskFrequency, FREQUENCY_MULTIPLIERS } from '@/types';
import { useTask } from '@/providers';
import { validateTaskPoints, calculateMonthlyPoints, getFrequencyDisplayName } from '@/utils/taskCalculations';
import { X, Save, Plus } from 'lucide-react';

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  frequency: TaskFrequency;
  gonçaloPoints: number;
  maríliaPoints: number;
  notes: string;
}

interface TaskFormProps {
  task?: Task;
  onClose?: () => void;
  onSubmit?: (task: Task) => void;
}

export default function TaskForm({ task, onClose, onSubmit }: TaskFormProps) {
  const { state, actions } = useTask();
  const [previewPoints, setPreviewPoints] = useState({ goncalo: 0, marilia: 0 });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      category: task?.category || '',
      frequency: task?.frequency || 'diária',
      gonçaloPoints: task?.points.goncalo || 0,
      maríliaPoints: task?.points.marilia || 0,
      notes: task?.notes || ''
    }
  });

  const watchedValues = watch();

  // Update preview calculations when form values change
  React.useEffect(() => {
    const gonçaloPoints = watchedValues.gonçaloPoints || 0;
    const maríliaPoints = watchedValues.maríliaPoints || 0;
    const frequency = watchedValues.frequency || 'diária';

    setPreviewPoints({
      goncalo: calculateMonthlyPoints(gonçaloPoints, frequency),
      marilia: calculateMonthlyPoints(maríliaPoints, frequency)
    });
  }, [watchedValues.gonçaloPoints, watchedValues.maríliaPoints, watchedValues.frequency]);

  // Category options
  const categoryOptions: GlassSelectOption[] = state.categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  // Frequency options
  const frequencyOptions: GlassSelectOption[] = Object.keys(FREQUENCY_MULTIPLIERS).map(freq => ({
    value: freq,
    label: getFrequencyDisplayName(freq as TaskFrequency)
  }));

  const onFormSubmit = async (data: TaskFormData) => {
    try {
      // Validate points
      const validation = validateTaskPoints(data.gonçaloPoints, data.maríliaPoints);
      if (!validation.valid) {
        // Handle validation errors
        return;
      }

      const taskData = {
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        points: {
          goncalo: data.gonçaloPoints,
          marilia: data.maríliaPoints
        },
        notes: data.notes
      };

      if (task) {
        // Update existing task
        actions.updateTask(task.id, taskData);
      } else {
        // Create new task
        actions.addTask(taskData);
      }

      if (onSubmit && task) {
        onSubmit({ ...task, ...taskData });
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const getAssignmentPreview = () => {
    const gonçaloPoints = watchedValues.gonçaloPoints || 0;
    const maríliaPoints = watchedValues.maríliaPoints || 0;

    if (gonçaloPoints < maríliaPoints) {
      return { person: 'Gonçalo', color: 'text-blue-300' };
    } else if (maríliaPoints < gonçaloPoints) {
      return { person: 'Marília', color: 'text-pink-300' };
    } else {
      return { person: 'Tie - Decide Together', color: 'text-yellow-300' };
    }
  };

  const assignment = getAssignmentPreview();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard variant="elevated" className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          {onClose && (
            <GlassButton variant="ghost" size="sm" onClick={onClose} icon={X}>
              Close
            </GlassButton>
          )}
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              label="Task Title"
              placeholder="Enter task name..."
              error={errors.title?.message}
              {...register('title', { 
                required: 'Task title is required',
                minLength: { value: 2, message: 'Title must be at least 2 characters' }
              })}
            />

            <GlassSelect
              label="Category"
              placeholder="Select category..."
              options={categoryOptions}
              error={errors.category?.message}
              {...register('category', { required: 'Category is required' })}
            />
          </div>

          <GlassInput
            label="Description (Optional)"
            placeholder="Describe the task..."
            {...register('description')}
          />

          {/* Frequency Selection */}
          <GlassSelect
            label="Frequency"
            options={frequencyOptions}
            error={errors.frequency?.message}
            {...register('frequency', { required: 'Frequency is required' })}
          />

          {/* Point Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Point Assignment (0-50 scale)</h3>
            <p className="text-sm text-white/80">
              Rate the effort, time, and stress level for each person. Lower score gets the task.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <GlassInput
                  label="Gonçalo's Points"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="0-50"
                  error={errors.gonçaloPoints?.message}
                  {...register('gonçaloPoints', {
                    required: 'Points are required',
                    min: { value: 0, message: 'Minimum 0 points' },
                    max: { value: 50, message: 'Maximum 50 points' },
                    valueAsNumber: true
                  })}
                />
                <div className="mt-2 text-sm text-blue-300">
                  Monthly: {previewPoints.goncalo.toFixed(1)} points
                </div>
              </div>

              <div>
                <GlassInput
                  label="Marília's Points"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  placeholder="0-50"
                  error={errors.maríliaPoints?.message}
                  {...register('maríliaPoints', {
                    required: 'Points are required',
                    min: { value: 0, message: 'Minimum 0 points' },
                    max: { value: 50, message: 'Maximum 50 points' },
                    valueAsNumber: true
                  })}
                />
                <div className="mt-2 text-sm text-pink-300">
                  Monthly: {previewPoints.marilia.toFixed(1)} points
                </div>
              </div>
            </div>

            {/* Assignment Preview */}
            <GlassCard className="p-4">
              <div className="text-center">
                <p className="text-white/80 mb-2">Task will be assigned to:</p>
                <p className={`text-xl font-bold ${assignment.color}`}>
                  {assignment.person}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Notes */}
          <GlassInput
            label="Notes (Optional)"
            placeholder="Any additional notes..."
            {...register('notes')}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {onClose && (
              <GlassButton variant="ghost" onClick={onClose}>
                Cancel
              </GlassButton>
            )}
            
            <GlassButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              icon={task ? Save : Plus}
            >
              {task ? 'Update Task' : 'Create Task'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
}