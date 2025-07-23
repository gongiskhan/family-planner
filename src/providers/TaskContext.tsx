import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, Category, TaskDataFile, FamilySettings } from '@/types';
import { fileSystemService } from '@/utils/filesystem';
import { updateTaskCalculations } from '@/utils/taskCalculations';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  settings: FamilySettings;
  loading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: TaskDataFile }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'monthlyPoints' | 'assignment' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id' | 'taskCount'> }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<FamilySettings> }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_UNSAVED' };

const initialState: TaskState = {
  tasks: [],
  categories: [],
  settings: {
    familyId: 'default',
    members: {
      goncalo: { name: 'Gonçalo', color: '#3B82F6' },
      marilia: { name: 'Marília', color: '#EC4899' }
    },
    preferences: {
      theme: 'auto',
      autoSave: true,
      backupFrequency: 'daily',
      notifications: true
    }
  },
  loading: false,
  error: null,
  hasUnsavedChanges: false,
  lastSaved: null
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'LOAD_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        categories: action.payload.categories,
        settings: action.payload.settings,
        loading: false,
        error: null,
        hasUnsavedChanges: false,
        lastSaved: new Date(action.payload.lastModified)
      };

    case 'ADD_TASK': {
      const newTask = updateTaskCalculations({
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update category task count
      const updatedCategories = state.categories.map(cat =>
        cat.id === newTask.category
          ? { ...cat, taskCount: cat.taskCount + 1 }
          : cat
      );

      return {
        ...state,
        tasks: [...state.tasks, newTask],
        categories: updatedCategories,
        hasUnsavedChanges: true
      };
    }

    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(task => {
        if (task.id === action.payload.id) {
          const updatedTask = { ...task, ...action.payload.updates, updatedAt: new Date() };
          return updateTaskCalculations(updatedTask);
        }
        return task;
      });

      return {
        ...state,
        tasks: updatedTasks,
        hasUnsavedChanges: true
      };
    }

    case 'DELETE_TASK': {
      const taskToDelete = state.tasks.find(task => task.id === action.payload);
      const updatedTasks = state.tasks.filter(task => task.id !== action.payload);

      // Update category task count
      const updatedCategories = state.categories.map(cat =>
        taskToDelete && cat.id === taskToDelete.category
          ? { ...cat, taskCount: Math.max(0, cat.taskCount - 1) }
          : cat
      );

      return {
        ...state,
        tasks: updatedTasks,
        categories: updatedCategories,
        hasUnsavedChanges: true
      };
    }

    case 'ADD_CATEGORY': {
      const newCategory: Category = {
        ...action.payload,
        id: crypto.randomUUID(),
        taskCount: 0
      };

      return {
        ...state,
        categories: [...state.categories, newCategory],
        hasUnsavedChanges: true
      };
    }

    case 'UPDATE_CATEGORY': {
      const updatedCategories = state.categories.map(category =>
        category.id === action.payload.id
          ? { ...category, ...action.payload.updates }
          : category
      );

      return {
        ...state,
        categories: updatedCategories,
        hasUnsavedChanges: true
      };
    }

    case 'DELETE_CATEGORY': {
      // Don't delete if category has tasks
      const categoryHasTasks = state.tasks.some(task => task.category === action.payload);
      if (categoryHasTasks) {
        return {
          ...state,
          error: 'Cannot delete category that contains tasks'
        };
      }

      const updatedCategories = state.categories.filter(cat => cat.id !== action.payload);

      return {
        ...state,
        categories: updatedCategories,
        hasUnsavedChanges: true
      };
    }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        hasUnsavedChanges: true
      };

    case 'MARK_SAVED':
      return {
        ...state,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        error: null
      };

    case 'MARK_UNSAVED':
      return {
        ...state,
        hasUnsavedChanges: true
      };

    default:
      return state;
  }
}

interface TaskContextType {
  state: TaskState;
  actions: {
    loadData: (familyId?: string) => Promise<void>;
    saveData: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'monthlyPoints' | 'assignment' | 'createdAt' | 'updatedAt'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    addCategory: (category: Omit<Category, 'id' | 'taskCount'>) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    updateSettings: (settings: Partial<FamilySettings>) => void;
    createBackup: () => Promise<string>;
    restoreBackup: (backupId: string) => Promise<void>;
    clearError: () => void;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Auto-save functionality
  useEffect(() => {
    if (state.hasUnsavedChanges && state.settings.preferences.autoSave) {
      const saveTimer = setTimeout(async () => {
        await actions.saveData();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [state.hasUnsavedChanges, state.settings.preferences.autoSave]);

  // Load data on mount
  useEffect(() => {
    actions.loadData();
  }, []);

  const actions = {
    loadData: async (familyId = 'default') => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const data = await fileSystemService.load(familyId);
        dispatch({ type: 'LOAD_DATA', payload: data });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to load data: ${error}` });
      }
    },

    saveData: async () => {
      if (!state.hasUnsavedChanges) return;

      try {
        const dataToSave: TaskDataFile = {
          version: '1.0.0',
          familyId: state.settings.familyId,
          lastModified: new Date().toISOString(),
          tasks: state.tasks,
          categories: state.categories,
          settings: state.settings,
          metadata: {
            totalTasks: state.tasks.length,
            lastBackup: '',
            checksum: ''
          }
        };

        await fileSystemService.save(state.settings.familyId, dataToSave);
        dispatch({ type: 'MARK_SAVED' });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to save data: ${error}` });
      }
    },

    addTask: (task: Omit<Task, 'id' | 'monthlyPoints' | 'assignment' | 'createdAt' | 'updatedAt'>) => {
      dispatch({ type: 'ADD_TASK', payload: task });
    },

    updateTask: (id: string, updates: Partial<Task>) => {
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    },

    deleteTask: (id: string) => {
      dispatch({ type: 'DELETE_TASK', payload: id });
    },

    addCategory: (category: Omit<Category, 'id' | 'taskCount'>) => {
      dispatch({ type: 'ADD_CATEGORY', payload: category });
    },

    updateCategory: (id: string, updates: Partial<Category>) => {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
    },

    deleteCategory: (id: string) => {
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    },

    updateSettings: (settings: Partial<FamilySettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    },

    createBackup: async () => {
      try {
        const backupId = await fileSystemService.backup(state.settings.familyId);
        return backupId;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to create backup: ${error}` });
        throw error;
      }
    },

    restoreBackup: async (backupId: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await fileSystemService.restore(state.settings.familyId, backupId);
        await actions.loadData(state.settings.familyId);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: `Failed to restore backup: ${error}` });
      }
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  };

  return (
    <TaskContext.Provider value={{ state, actions }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}

export default TaskContext;