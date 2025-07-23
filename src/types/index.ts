export type TaskFrequency = 
  | '8x/dia' 
  | '6x/dia' 
  | '4x/dia' 
  | '3x/dia' 
  | '2x/dia' 
  | 'diária' 
  | 'dias alternados' 
  | 'semanal' 
  | 'quinzenal' 
  | 'mensal' 
  | 'bimestral' 
  | 'trimestral' 
  | 'semestral' 
  | 'anual';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: TaskFrequency;
  points: {
    goncalo: number;
    marilia: number;
  };
  assignment?: 'goncalo' | 'marilia' | 'tie';
  monthlyPoints: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  taskCount: number;
}

export interface FamilySettings {
  familyId: string;
  members: {
    goncalo: {
      name: string;
      color: string;
    };
    marilia: {
      name: string;
      color: string;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    autoSave: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    notifications: boolean;
  };
}

export interface TaskDataFile {
  version: string;
  familyId: string;
  lastModified: string;
  tasks: Task[];
  categories: Category[];
  settings: FamilySettings;
  metadata: {
    totalTasks: number;
    lastBackup: string;
    checksum: string;
  };
}

export const FREQUENCY_MULTIPLIERS: Record<TaskFrequency, number> = {
  '8x/dia': 240,
  '6x/dia': 180,
  '4x/dia': 120,
  '3x/dia': 90,
  '2x/dia': 60,
  'diária': 30,
  'dias alternados': 15,
  'semanal': 4,
  'quinzenal': 2,
  'mensal': 1,
  'bimestral': 0.5,
  'trimestral': 0.33,
  'semestral': 0.17,
  'anual': 0.08,
};