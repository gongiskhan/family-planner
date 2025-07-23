import { Task, TaskFrequency, FREQUENCY_MULTIPLIERS } from '@/types';

// Calculate monthly points for a task
export function calculateMonthlyPoints(points: number, frequency: TaskFrequency): number {
  const multiplier = FREQUENCY_MULTIPLIERS[frequency];
  return Math.round(points * multiplier * 100) / 100; // Round to 2 decimal places
}

// Determine task assignment based on point scoring
export function determineAssignment(
  gonçaloPoints: number,
  maríliaPoints: number
): 'goncalo' | 'marilia' | 'tie' {
  if (gonçaloPoints < maríliaPoints) {
    return 'goncalo';
  } else if (maríliaPoints < gonçaloPoints) {
    return 'marilia';
  } else {
    return 'tie';
  }
}

// Update task with calculated values
export function updateTaskCalculations(task: Omit<Task, 'monthlyPoints' | 'assignment'>): Task {
  const gonçaloMonthly = calculateMonthlyPoints(task.points.goncalo, task.frequency);
  const maríliaMonthly = calculateMonthlyPoints(task.points.marilia, task.frequency);
  
  // Use the lower score to determine monthly points (since lower score gets the task)
  const monthlyPoints = Math.min(gonçaloMonthly, maríliaMonthly);
  const assignment = determineAssignment(task.points.goncalo, task.points.marilia);
  
  return {
    ...task,
    monthlyPoints,
    assignment,
  };
}

// Calculate total monthly points for each person
export function calculateTotalPoints(tasks: Task[]): {
  goncalo: number;
  marilia: number;
  total: number;
  balance: number; // Positive means Gonçalo has more, negative means Marília has more
} {
  let gonçaloTotal = 0;
  let maríliaTotal = 0;
  
  tasks.forEach(task => {
    const gonçaloMonthly = calculateMonthlyPoints(task.points.goncalo, task.frequency);
    const maríliaMonthly = calculateMonthlyPoints(task.points.marilia, task.frequency);
    
    // Add the person's actual score (not the assigned person's lower score)
    if (task.assignment === 'goncalo') {
      gonçaloTotal += gonçaloMonthly;
    } else if (task.assignment === 'marilia') {
      maríliaTotal += maríliaMonthly;
    } else {
      // For ties, split the points
      gonçaloTotal += gonçaloMonthly / 2;
      maríliaTotal += maríliaMonthly / 2;
    }
  });
  
  const total = gonçaloTotal + maríliaTotal;
  const balance = gonçaloTotal - maríliaTotal;
  
  return {
    goncalo: Math.round(gonçaloTotal * 100) / 100,
    marilia: Math.round(maríliaTotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    balance: Math.round(balance * 100) / 100,
  };
}

// Get workload distribution percentages
export function getWorkloadDistribution(tasks: Task[]): {
  goncalo: number;
  marilia: number;
  ties: number;
} {
  if (tasks.length === 0) {
    return { goncalo: 0, marilia: 0, ties: 0 };
  }

  const gonçaloTasks = tasks.filter(task => task.assignment === 'goncalo').length;
  const mariliaTasks = tasks.filter(task => task.assignment === 'marilia').length;
  const tieTasks = tasks.filter(task => task.assignment === 'tie').length;

  const total = tasks.length;

  return {
    goncalo: Math.round((gonçaloTasks / total) * 100),
    marilia: Math.round((mariliaTasks / total) * 100),
    ties: Math.round((tieTasks / total) * 100),
  };
}

// Get fairness score (0-100, where 100 is perfectly fair)
export function getFairnessScore(tasks: Task[]): number {
  const totals = calculateTotalPoints(tasks);
  
  if (totals.total === 0) {
    return 100; // Perfect fairness when no tasks
  }
  
  const imbalance = Math.abs(totals.balance);
  const maxPossibleImbalance = totals.total;
  
  // Convert to percentage where 100 is perfect balance
  const fairnessScore = Math.max(0, 100 - ((imbalance / maxPossibleImbalance) * 100));
  
  return Math.round(fairnessScore);
}

// Validate task point scores
export function validateTaskPoints(gonçaloPoints: number, maríliaPoints: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (gonçaloPoints < 0 || gonçaloPoints > 50) {
    errors.push('Gonçalo points must be between 0 and 50');
  }
  
  if (maríliaPoints < 0 || maríliaPoints > 50) {
    errors.push('Marília points must be between 0 and 50');
  }
  
  if (!Number.isInteger(gonçaloPoints) && gonçaloPoints % 0.5 !== 0) {
    errors.push('Gonçalo points must be whole numbers or half-points');
  }
  
  if (!Number.isInteger(maríliaPoints) && maríliaPoints % 0.5 !== 0) {
    errors.push('Marília points must be whole numbers or half-points');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get frequency display name
export function getFrequencyDisplayName(frequency: TaskFrequency): string {
  const displayNames: Record<TaskFrequency, string> = {
    '8x/dia': '8 times per day',
    '6x/dia': '6 times per day',
    '4x/dia': '4 times per day',
    '3x/dia': '3 times per day',
    '2x/dia': '2 times per day',
    'diária': 'Daily',
    'dias alternados': 'Every other day',
    'semanal': 'Weekly',
    'quinzenal': 'Biweekly',
    'mensal': 'Monthly',
    'bimestral': 'Every 2 months',
    'trimestral': 'Quarterly',
    'semestral': 'Twice a year',
    'anual': 'Annual',
  };
  
  return displayNames[frequency];
}

// Sort tasks by various criteria
export function sortTasks(
  tasks: Task[],
  sortBy: 'title' | 'category' | 'monthlyPoints' | 'assignment' | 'frequency' | 'createdAt',
  order: 'asc' | 'desc' = 'asc'
): Task[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'monthlyPoints':
        comparison = a.monthlyPoints - b.monthlyPoints;
        break;
      case 'assignment':
        comparison = (a.assignment || 'tie').localeCompare(b.assignment || 'tie');
        break;
      case 'frequency':
        const aMultiplier = FREQUENCY_MULTIPLIERS[a.frequency];
        const bMultiplier = FREQUENCY_MULTIPLIERS[b.frequency];
        comparison = aMultiplier - bMultiplier;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    
    return order === 'desc' ? -comparison : comparison;
  });
}

// Filter tasks by various criteria
export function filterTasks(
  tasks: Task[],
  filters: {
    search?: string;
    category?: string;
    assignment?: 'goncalo' | 'marilia' | 'tie';
    frequency?: TaskFrequency;
  }
): Task[] {
  return tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      const matchesNotes = task.notes?.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription && !matchesNotes) {
        return false;
      }
    }
    
    // Category filter
    if (filters.category && task.category !== filters.category) {
      return false;
    }
    
    // Assignment filter
    if (filters.assignment && task.assignment !== filters.assignment) {
      return false;
    }
    
    // Frequency filter
    if (filters.frequency && task.frequency !== filters.frequency) {
      return false;
    }
    
    return true;
  });
}