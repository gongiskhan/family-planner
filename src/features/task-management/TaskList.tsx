import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassSelectOption, GlassCheckbox, BulkOperationsToolbar, BulkAction } from '@/components/ui';
import { Task, TaskFrequency } from '@/types';
import { useTask } from '@/providers';
import { sortTasks, filterTasks, getFrequencyDisplayName } from '@/utils/taskCalculations';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Copy,
  UserCheck,
} from 'lucide-react';
import TaskCard from './TaskCard';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
}

export default function TaskList({ onEditTask, onViewTask }: TaskListProps) {
  const { state, actions } = useTask();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'category' | 'monthlyPoints' | 'assignment' | 'frequency' | 'createdAt'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(state.tasks, {
      search: searchTerm,
      category: selectedCategory || undefined,
      assignment: selectedAssignment as 'goncalo' | 'marilia' | 'tie' || undefined,
      frequency: selectedFrequency as TaskFrequency || undefined
    });

    return sortTasks(filtered, sortBy, sortOrder);
  }, [
    state.tasks,
    searchTerm,
    selectedCategory,
    selectedAssignment,
    selectedFrequency,
    sortBy,
    sortOrder
  ]);

  // Generate filter options
  const categoryOptions: GlassSelectOption[] = [
    { value: '', label: 'All Categories' },
    ...state.categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ];

  const assignmentOptions: GlassSelectOption[] = [
    { value: '', label: 'All Assignments' },
    { value: 'goncalo', label: 'Gonçalo' },
    { value: 'marilia', label: 'Marília' },
    { value: 'tie', label: 'Tie - Decide Together' }
  ];

  const frequencyOptions: GlassSelectOption[] = [
    { value: '', label: 'All Frequencies' },
    ...Object.keys(state.tasks.reduce((acc, task) => {
      acc[task.frequency] = true;
      return acc;
    }, {} as Record<string, boolean>)).map(freq => ({
      value: freq,
      label: getFrequencyDisplayName(freq as TaskFrequency)
    }))
  ];

  const sortOptions: GlassSelectOption[] = [
    { value: 'title', label: 'Title' },
    { value: 'category', label: 'Category' },
    { value: 'monthlyPoints', label: 'Monthly Points' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'frequency', label: 'Frequency' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      actions.deleteTask(taskId);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedAssignment('');
    setSelectedFrequency('');
    setSortBy('title');
    setSortOrder('asc');
  };

  // Bulk operations handlers
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedTaskIds(new Set());
  };

  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTaskIds);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTaskIds(newSelected);
  };

  const handleSelectAll = () => {
    const allTaskIds = new Set(filteredAndSortedTasks.map(task => task.id));
    setSelectedTaskIds(allTaskIds);
  };

  const handleSelectNone = () => {
    setSelectedTaskIds(new Set());
  };

  const handleBulkDelete = (taskIds: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${taskIds.length} tasks? This action cannot be undone.`)) {
      taskIds.forEach(id => actions.deleteTask(id));
      setSelectedTaskIds(new Set());
    }
  };

  const handleBulkDuplicate = (taskIds: string[]) => {
    taskIds.forEach(id => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        const duplicatedTask = {
          ...task,
          id: `${task.id}-copy-${Date.now()}`,
          title: `${task.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        actions.addTask(duplicatedTask);
      }
    });
    setSelectedTaskIds(new Set());
  };

  const handleBulkAssign = (taskIds: string[], assignment: 'goncalo' | 'marilia') => {
    taskIds.forEach(id => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        actions.updateTask(id, { assignment });
      }
    });
    setSelectedTaskIds(new Set());
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleBulkDelete,
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete ${selectedTaskIds.size} selected tasks? This action cannot be undone.`
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      onClick: handleBulkDuplicate
    },
    {
      id: 'assign-goncalo',
      label: 'Assign to Gonçalo',
      icon: UserCheck,
      onClick: (taskIds) => handleBulkAssign(taskIds, 'goncalo')
    },
    {
      id: 'assign-marilia',
      label: 'Assign to Marília',
      icon: UserCheck,
      onClick: (taskIds) => handleBulkAssign(taskIds, 'marilia')
    }
  ];

  const isAllSelected = selectedTaskIds.size === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0;
  const isPartiallySelected = selectedTaskIds.size > 0 && selectedTaskIds.size < filteredAndSortedTasks.length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Task List</h2>
            <p className="text-white/80">
              {filteredAndSortedTasks.length} of {state.tasks.length} tasks
            </p>
          </div>

          <div className="flex items-center gap-3">
            <GlassButton
              variant={bulkMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={toggleBulkMode}
              icon={CheckSquare}
            >
              {bulkMode ? 'Exit Select' : 'Select'}
            </GlassButton>

            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              icon={Filter}
            >
              Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </GlassButton>

            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            >
              {viewMode === 'cards' ? 'Table View' : 'Card View'}
            </GlassButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <GlassInput
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
            fullWidth
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-glass bg-white/5">
                <GlassSelect
                  label="Category"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  size="sm"
                />

                <GlassSelect
                  label="Assignment"
                  options={assignmentOptions}
                  value={selectedAssignment}
                  onChange={(e) => setSelectedAssignment(e.target.value)}
                  size="sm"
                />

                <GlassSelect
                  label="Frequency"
                  options={frequencyOptions}
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  size="sm"
                />

                <div className="flex items-end gap-2">
                  <GlassSelect
                    label="Sort By"
                    options={sortOptions}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    size="sm"
                  />
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={toggleSortOrder}
                    icon={sortOrder === 'asc' ? ChevronUp : ChevronDown}
                  >
                    <span className="sr-only">Toggle sort order</span>
                  </GlassButton>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <GlassButton variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Task List */}
      {filteredAndSortedTasks.length === 0 ? (
        <GlassCard className="p-12">
          <div className="text-center text-white/80">
            <p className="text-lg mb-2">No tasks found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        </GlassCard>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAndSortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative"
              >
                {bulkMode && (
                  <div className="absolute top-3 left-3 z-10">
                    <GlassCheckbox
                      checked={selectedTaskIds.has(task.id)}
                      onChange={() => handleTaskSelect(task.id)}
                      size="md"
                    />
                  </div>
                )}
                <TaskCard
                  task={task}
                  category={state.categories.find(cat => cat.id === task.category)}
                  onEdit={() => onEditTask?.(task)}
                  onView={() => onViewTask?.(task)}
                  onDelete={() => handleDeleteTask(task.id)}
                  className={bulkMode ? 'pl-12' : ''}
                  disabled={bulkMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // Table View
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {bulkMode && (
                    <th className="text-left p-4 text-white font-semibold w-12">
                      <GlassCheckbox
                        checked={isAllSelected}
                        indeterminate={isPartiallySelected}
                        onChange={isAllSelected ? handleSelectNone : handleSelectAll}
                        size="md"
                      />
                    </th>
                  )}
                  <th className="text-left p-4 text-white font-semibold">Task</th>
                  <th className="text-left p-4 text-white font-semibold">Category</th>
                  <th className="text-left p-4 text-white font-semibold">Frequency</th>
                  <th className="text-left p-4 text-white font-semibold">Points</th>
                  <th className="text-left p-4 text-white font-semibold">Assignment</th>
                  {!bulkMode && (
                    <th className="text-right p-4 text-white font-semibold">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredAndSortedTasks.map((task, index) => {
                    const category = state.categories.find(cat => cat.id === task.category);
                    const assignmentColor = task.assignment === 'goncalo' ? 'text-blue-300' :
                                          task.assignment === 'marilia' ? 'text-pink-300' : 'text-yellow-300';

                    return (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        {bulkMode && (
                          <td className="p-4">
                            <GlassCheckbox
                              checked={selectedTaskIds.has(task.id)}
                              onChange={() => handleTaskSelect(task.id)}
                              size="md"
                            />
                          </td>
                        )}
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-white">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-white/70 mt-1">{task.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category?.icon}</span>
                            <span className="text-white/80 text-sm">{category?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white/80">
                          {getFrequencyDisplayName(task.frequency)}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="text-blue-300">G: {task.points.goncalo}</div>
                            <div className="text-pink-300">M: {task.points.marilia}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${assignmentColor}`}>
                            {task.assignment === 'goncalo' ? 'Gonçalo' :
                             task.assignment === 'marilia' ? 'Marília' : 'Tie'}
                          </span>
                        </td>
                        {!bulkMode && (
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <GlassButton
                                size="sm"
                                variant="ghost"
                                onClick={() => onViewTask?.(task)}
                                icon={Eye}
                              >
                                <span className="sr-only">View</span>
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                variant="ghost"
                                onClick={() => onEditTask?.(task)}
                                icon={Edit3}
                              >
                                <span className="sr-only">Edit</span>
                              </GlassButton>
                              <GlassButton
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTask(task.id)}
                                icon={Trash2}
                              >
                                <span className="sr-only">Delete</span>
                              </GlassButton>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Bulk Operations Toolbar */}
      <AnimatePresence>
        {bulkMode && selectedTaskIds.size > 0 && (
          <BulkOperationsToolbar
            selectedCount={selectedTaskIds.size}
            totalCount={filteredAndSortedTasks.length}
            onSelectAll={handleSelectAll}
            onSelectNone={handleSelectNone}
            onClose={() => {
              setSelectedTaskIds(new Set());
              setBulkMode(false);
            }}
            actions={bulkActions}
            selectedIds={Array.from(selectedTaskIds)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}