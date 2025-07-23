import { TaskDataFile, FamilySettings, Category } from '@/types';

// File System Service for Node.js backend
export class FileSystemService {
  private readonly dataPath: string;
  private readonly backupPath: string;

  constructor(dataPath = './data/families', backupPath = './data/backups') {
    this.dataPath = dataPath;
    this.backupPath = backupPath;
  }

  // Generate checksum for data integrity
  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Validate data structure
  private validateData(data: TaskDataFile): boolean {
    if (!data.version || !data.familyId || !Array.isArray(data.tasks)) {
      return false;
    }
    
    // Validate each task
    for (const task of data.tasks) {
      if (!task.id || !task.title || !task.category || !task.frequency) {
        return false;
      }
      if (!task.points || typeof task.points.goncalo !== 'number' || typeof task.points.marilia !== 'number') {
        return false;
      }
    }
    
    return true;
  }

  // Create family directory structure
  async createFamilyDirectory(familyId: string): Promise<void> {
    try {
      // In a real Node.js environment, you would use fs.mkdir
      // For now, we'll simulate this with localStorage in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem(`family_${familyId}_created`, 'true');
      }
    } catch (error) {
      throw new Error(`Failed to create family directory: ${error}`);
    }
  }

  // Save task data to file
  async save(familyId: string, data: TaskDataFile): Promise<void> {
    try {
      if (!this.validateData(data)) {
        throw new Error('Invalid data structure');
      }

      // Update metadata
      data.lastModified = new Date().toISOString();
      data.metadata.totalTasks = data.tasks.length;
      
      const jsonData = JSON.stringify(data, null, 2);
      data.metadata.checksum = this.generateChecksum(jsonData);

      // Save to storage (localStorage for browser, fs for Node.js)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`family_${familyId}_tasks`, jsonData);
        localStorage.setItem(`family_${familyId}_lastSave`, new Date().toISOString());
      } else {
        // In Node.js environment
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const familyPath = path.join(this.dataPath, familyId);
        const filePath = path.join(familyPath, 'tasks.json');
        
        await fs.mkdir(familyPath, { recursive: true });
        await fs.writeFile(filePath, jsonData, 'utf8');
      }
    } catch (error) {
      throw new Error(`Failed to save data: ${error}`);
    }
  }

  // Load task data from file
  async load(familyId: string): Promise<TaskDataFile> {
    try {
      let jsonData: string;

      if (typeof window !== 'undefined') {
        // Browser environment
        const stored = localStorage.getItem(`family_${familyId}_tasks`);
        if (!stored) {
          return this.createDefaultData(familyId);
        }
        jsonData = stored;
      } else {
        // Node.js environment
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const filePath = path.join(this.dataPath, familyId, 'tasks.json');
        
        try {
          jsonData = await fs.readFile(filePath, 'utf8');
        } catch (error) {
          return this.createDefaultData(familyId);
        }
      }

      const data: TaskDataFile = JSON.parse(jsonData);
      
      if (!this.validateData(data)) {
        throw new Error('Corrupted data file');
      }

      // Verify checksum
      const currentChecksum = this.generateChecksum(JSON.stringify({
        ...data,
        metadata: { ...data.metadata, checksum: '' }
      }, null, 2));
      
      if (data.metadata.checksum && data.metadata.checksum !== currentChecksum) {
        console.warn('Data integrity warning: checksum mismatch');
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to load data: ${error}`);
    }
  }

  // Create backup
  async backup(familyId: string): Promise<string> {
    try {
      const data = await this.load(familyId);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `${familyId}-${timestamp}`;
      
      if (typeof window !== 'undefined') {
        // Browser environment - store in localStorage
        localStorage.setItem(`backup_${backupId}`, JSON.stringify(data));
        
        // Keep track of backups
        const backups = JSON.parse(localStorage.getItem('backups') || '[]');
        backups.push({ id: backupId, familyId, timestamp: new Date().toISOString() });
        localStorage.setItem('backups', JSON.stringify(backups));
      } else {
        // Node.js environment
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const backupFilePath = path.join(this.backupPath, `${backupId}.json`);
        await fs.mkdir(this.backupPath, { recursive: true });
        await fs.writeFile(backupFilePath, JSON.stringify(data, null, 2), 'utf8');
      }

      // Update last backup time
      data.metadata.lastBackup = new Date().toISOString();
      await this.save(familyId, data);

      return backupId;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  // Restore from backup
  async restore(familyId: string, backupId: string): Promise<void> {
    try {
      let backupData: TaskDataFile;

      if (typeof window !== 'undefined') {
        const backup = localStorage.getItem(`backup_${backupId}`);
        if (!backup) {
          throw new Error('Backup not found');
        }
        backupData = JSON.parse(backup);
      } else {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const backupFilePath = path.join(this.backupPath, `${backupId}.json`);
        const backupJson = await fs.readFile(backupFilePath, 'utf8');
        backupData = JSON.parse(backupJson);
      }

      await this.save(familyId, backupData);
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error}`);
    }
  }

  // Create default data structure
  private createDefaultData(familyId: string): TaskDataFile {
    const defaultSettings: FamilySettings = {
      familyId,
      members: {
        goncalo: {
          name: 'Gonçalo',
          color: '#3B82F6'
        },
        marilia: {
          name: 'Marília',
          color: '#EC4899'
        }
      },
      preferences: {
        theme: 'auto',
        autoSave: true,
        backupFrequency: 'daily',
        notifications: true
      }
    };

    const defaultCategories: Category[] = [
      {
        id: 'laura-care',
        name: '👶 Laura Care (1.5 years)',
        icon: '👶',
        color: '#FEF3C7',
        description: 'Daily care tasks for Laura',
        taskCount: 0
      },
      {
        id: 'diogo-care',
        name: '👦 Diogo Care (5 years)',
        icon: '👦',
        color: '#DBEAFE',
        description: 'Daily care tasks for Diogo',
        taskCount: 0
      },
      {
        id: 'household',
        name: '🏠 Household Coordination',
        icon: '🏠',
        color: '#D1FAE5',
        description: 'House management and coordination',
        taskCount: 0
      },
      {
        id: 'financial',
        name: '💰 Financial & Administrative',
        icon: '💰',
        color: '#FEE2E2',
        description: 'Financial and administrative tasks',
        taskCount: 0
      }
    ];

    return {
      version: '1.0.0',
      familyId,
      lastModified: new Date().toISOString(),
      tasks: [],
      categories: defaultCategories,
      settings: defaultSettings,
      metadata: {
        totalTasks: 0,
        lastBackup: '',
        checksum: ''
      }
    };
  }

  // Get backup list
  async getBackups(familyId: string): Promise<Array<{ id: string; timestamp: string }>> {
    try {
      if (typeof window !== 'undefined') {
        const backups = JSON.parse(localStorage.getItem('backups') || '[]');
        return backups.filter((backup: any) => backup.familyId === familyId);
      } else {
        const fs = await import('fs/promises');
        
        try {
          const files = await fs.readdir(this.backupPath);
          return files
            .filter(file => file.startsWith(familyId) && file.endsWith('.json'))
            .map(file => ({
              id: file.replace('.json', ''),
              timestamp: file.split('-').slice(-6).join('-').replace('.json', '')
            }))
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        } catch {
          return [];
        }
      }
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }
}

// Create singleton instance
export const fileSystemService = new FileSystemService();