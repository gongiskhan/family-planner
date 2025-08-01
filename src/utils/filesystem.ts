import { TaskDataFile, FamilySettings, Category, Task, TaskFrequency } from '@/types';
import { updateTaskCalculations } from '@/utils/taskCalculations';

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
        name: '👶 Cuidados com Laura (1,5 anos)',
        icon: '👶',
        color: '#FEF3C7',
        description: 'Cuidados diários com a Laura',
        taskCount: 0
      },
      {
        id: 'diogo-care',
        name: '👦 Cuidados com Diogo (5 anos)',
        icon: '👦',
        color: '#DBEAFE',
        description: 'Cuidados diários com o Diogo',
        taskCount: 0
      },
      {
        id: 'household',
        name: '🏠 Coordenação Empregada & Casa',
        icon: '🏠',
        color: '#D1FAE5',
        description: 'Gestão da casa e coordenação',
        taskCount: 0
      },
      {
        id: 'financial',
        name: '💰 Questões Financeiras & Administrativas',
        icon: '💰',
        color: '#FEE2E2',
        description: 'Questões financeiras e administrativas',
        taskCount: 0
      },
      {
        id: 'shopping',
        name: '🛒 Compras & Logística',
        icon: '🛒',
        color: '#E0E7FF',
        description: 'Compras e logística familiar',
        taskCount: 0
      },
      {
        id: 'transport',
        name: '🚗 Transporte & Veículos',
        icon: '🚗',
        color: '#F3E8FF',
        description: 'Gestão de transportes e veículos',
        taskCount: 0
      },
      {
        id: 'clothing',
        name: '👕 Gestão Roupa',
        icon: '👕',
        color: '#FDF2F8',
        description: 'Gestão e organização de roupa',
        taskCount: 0
      },
      {
        id: 'family-development',
        name: '👨‍👩‍👧‍👦 Desenvolvimento Familiar',
        icon: '👨‍👩‍👧‍👦',
        color: '#F0FDF4',
        description: 'Atividades e desenvolvimento familiar',
        taskCount: 0
      }
    ];

    const defaultTasks: Omit<Task, 'id' | 'monthlyPoints' | 'assignment' | 'createdAt' | 'updatedAt'>[] = [
      // 👶 Cuidados com Laura (1,5 anos) - 21 tasks
      { title: 'Dar pequeno-almoço à Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Dar jantar à Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Dar lanche manhã à Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Dar lanche tarde à Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Mudar fralda - manhã', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Mudar fralda - tarde', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Mudar fralda - noite', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Mudar fraldas extra (3-4x)', category: 'laura-care', frequency: '4x/dia' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Vestir Laura de manhã', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Vestir Laura após banho', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Dar banho à Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Escovar dentes Laura', category: 'laura-care', frequency: '2x/dia' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Rotina sono Laura (sesta)', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Rotina sono Laura (noite)', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Supervisão segurança Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Atividades desenvolvimento Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Leitura com Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Tempo exterior com Laura', category: 'laura-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Consultas médicas Laura', category: 'laura-care', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Compras roupa Laura', category: 'laura-care', frequency: 'trimestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Pesquisa alimentação Laura', category: 'laura-care', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 👦 Cuidados com Diogo (5 anos) - 17 tasks
      { title: 'Dar pequeno-almoço ao Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Dar jantar ao Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Lanche manhã Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Lanche tarde Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Vestir Diogo de manhã', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Dar banho ao Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Escovar dentes Diogo', category: 'diogo-care', frequency: '2x/dia' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Levar Diogo à escola', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Buscar Diogo à escola', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Ajuda trabalhos casa Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Leitura com Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Rotina sono Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Atividades educativas Diogo', category: 'diogo-care', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Comunicação escola Diogo', category: 'diogo-care', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Atividades extra Diogo', category: 'diogo-care', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Consultas médicas Diogo', category: 'diogo-care', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Gestão assuntos saúde Diogo', category: 'diogo-care', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 🏠 Coordenação Empregada & Casa - 10 tasks
      { title: 'Planear jantar diário', category: 'household', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Orientar tarefas empregada', category: 'household', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Verificar qualidade limpeza', category: 'household', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Coordenar limpeza profunda escritório', category: 'household', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Orientar limpeza roupeiros', category: 'household', frequency: 'quinzenal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Coordenar limpeza vidros exteriores', category: 'household', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Gerir stock produtos limpeza', category: 'household', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Orientar cuidados objectos delicados', category: 'household', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Coordenar organização despensa', category: 'household', frequency: 'quinzenal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Supervisão limpeza zona crianças', category: 'household', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 💰 Questões Financeiras & Administrativas - 13 tasks
      { title: 'Pagamento salário empregada', category: 'financial', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Pagamento Segurança Social empregada', category: 'financial', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Gestão férias empregada', category: 'financial', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Contrato manutenção piscina', category: 'financial', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Supervisão limpeza piscina semanal', category: 'financial', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Manutenção jardim - poda', category: 'financial', frequency: 'trimestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Manutenção jardim - relva', category: 'financial', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Pagamento seguros casa', category: 'financial', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'IMI e taxas municipais', category: 'financial', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Condomínio (se aplicável)', category: 'financial', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Revisão sistema alarme', category: 'financial', frequency: 'semestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Manutenção equipamentos casa', category: 'financial', frequency: 'trimestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Gestão orçamento familiar', category: 'financial', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 🛒 Compras & Logística - 7 tasks
      { title: 'Fazer lista compras', category: 'shopping', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Ir ao supermercado', category: 'shopping', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Compras farmácia', category: 'shopping', frequency: 'quinzenal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Compras produtos bebé Laura', category: 'shopping', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Material escolar Diogo', category: 'shopping', frequency: 'trimestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Marcar consultas médicas', category: 'shopping', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Organizar documentos importantes', category: 'shopping', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 🚗 Transporte & Veículos - 7 tasks
      { title: 'Lavar carro', category: 'transport', frequency: 'quinzenal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Abastecer carro', category: 'transport', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Manutenção carro', category: 'transport', frequency: 'semestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Seguro automóvel', category: 'transport', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Inspeção automóvel', category: 'transport', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Organizar agenda familiar', category: 'transport', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Coordenar babysitter', category: 'transport', frequency: 'mensal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 👕 Gestão Roupa - 4 tasks
      { title: 'Supervisão lavandaria empregada', category: 'clothing', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Passar ferro roupa trabalho', category: 'clothing', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Compras roupa família', category: 'clothing', frequency: 'trimestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Organização roupeiros sazonais', category: 'clothing', frequency: 'semestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },

      // 👨‍👩‍👧‍👦 Desenvolvimento Familiar - 8 tasks
      { title: 'Planear atividades fim semana', category: 'family-development', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Tempo qualidade c/ ambas crianças', category: 'family-development', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Mediar conflitos irmãos', category: 'family-development', frequency: 'diária' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Planear festas aniversário', category: 'family-development', frequency: 'anual' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Contacto família alargada', category: 'family-development', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Pesquisa atividades crianças', category: 'family-development', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Registo memórias (fotos, vídeos)', category: 'family-development', frequency: 'semanal' as TaskFrequency, points: { goncalo: 0, marilia: 0 } },
      { title: 'Planear férias familiares', category: 'family-development', frequency: 'semestral' as TaskFrequency, points: { goncalo: 0, marilia: 0 } }
    ];

    // Create Task objects with proper structure and calculate monthly points
    const tasksWithDetails: Task[] = defaultTasks.map((task, index) => {
      const baseTask: Task = {
        id: `task-${index + 1}`,
        ...task,
        monthlyPoints: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return updateTaskCalculations(baseTask);
    });

    return {
      version: '1.0.0',
      familyId,
      lastModified: new Date().toISOString(),
      tasks: tasksWithDetails,
      categories: defaultCategories,
      settings: defaultSettings,
      metadata: {
        totalTasks: tasksWithDetails.length,
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