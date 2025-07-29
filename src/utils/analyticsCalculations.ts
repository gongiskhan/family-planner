import { Task, Category } from '@/types';
import { ChartDataPoint } from '@/components/ui';

export interface TaskAnalytics {
  totalTasks: number;
  totalMonthlyPoints: number;
  goncaloPoints: number;
  mariliaPoints: number;
  categoryDistribution: ChartDataPoint[];
  frequencyDistribution: ChartDataPoint[];
  assignmentDistribution: ChartDataPoint[];
  pointsComparison: ChartDataPoint[];
  workloadBalance: number; // 0-100, 50 is perfectly balanced
  topCategories: Array<{ name: string; taskCount: number; points: number; icon: string }>;
  tasksByFrequency: Array<{ frequency: string; count: number; totalPoints: number }>;
}

const FREQUENCY_COLORS = {
  '8x/dia': '#EF4444',      // red
  '6x/dia': '#F97316',      // orange  
  '4x/dia': '#F59E0B',      // amber
  '3x/dia': '#EAB308',      // yellow
  '2x/dia': '#84CC16',      // lime
  'diária': '#22C55E',      // green
  'dias alternados': '#10B981', // emerald
  'semanal': '#14B8A6',     // teal
  'quinzenal': '#06B6D4',   // cyan
  'mensal': '#0EA5E9',      // blue
  'bimestral': '#3B82F6',   // blue
  'trimestral': '#6366F1',  // indigo
  'semestral': '#8B5CF6',   // violet
  'anual': '#A855F7'        // purple
};

const CATEGORY_COLORS = {
  'Laura Care': '#EC4899',      // pink
  'Diogo Care': '#3B82F6',      // blue
  'Household': '#10B981',       // emerald
  'Financial': '#F59E0B',       // amber
  'Shopping': '#8B5CF6',        // violet
  'Transportation': '#06B6D4',  // cyan
  'Clothing': '#84CC16',        // lime
  'Family Development': '#EF4444' // red
};

export const calculateTaskAnalytics = (
  tasks: Task[], 
  categories: Category[]
): TaskAnalytics => {
  const totalTasks = tasks.length;
  const totalMonthlyPoints = tasks.reduce((sum, task) => sum + task.monthlyPoints, 0);
  
  // Calculate individual points
  const goncaloPoints = tasks
    .filter(task => task.assignment === 'goncalo')
    .reduce((sum, task) => sum + task.monthlyPoints, 0);
    
  const mariliaPoints = tasks
    .filter(task => task.assignment === 'marilia')
    .reduce((sum, task) => sum + task.monthlyPoints, 0);

  // Calculate workload balance (0-100, 50 is perfect balance)
  const totalAssignedPoints = goncaloPoints + mariliaPoints;
  const workloadBalance = totalAssignedPoints > 0 
    ? 50 - Math.abs((goncaloPoints - mariliaPoints) / totalAssignedPoints * 50)
    : 50;

  // Category distribution
  const categoryMap = new Map<string, { tasks: Task[], points: number }>();
  tasks.forEach(task => {
    const category = categories.find(cat => cat.id === task.category);
    const categoryName = category?.name || 'Uncategorized';
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { tasks: [], points: 0 });
    }
    
    const categoryData = categoryMap.get(categoryName)!;
    categoryData.tasks.push(task);
    categoryData.points += task.monthlyPoints;
  });

  const categoryDistribution: ChartDataPoint[] = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      label: name,
      value: data.tasks.length,
      color: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] || '#6B7280',
      icon: categories.find(cat => cat.name === name)?.icon
    }))
    .sort((a, b) => b.value - a.value);

  // Frequency distribution
  const frequencyMap = new Map<string, { count: number, points: number }>();
  tasks.forEach(task => {
    if (!frequencyMap.has(task.frequency)) {
      frequencyMap.set(task.frequency, { count: 0, points: 0 });
    }
    const freq = frequencyMap.get(task.frequency)!;
    freq.count++;
    freq.points += task.monthlyPoints;
  });

  const frequencyDistribution: ChartDataPoint[] = Array.from(frequencyMap.entries())
    .map(([frequency, data]) => ({
      label: frequency,
      value: data.count,
      color: FREQUENCY_COLORS[frequency as keyof typeof FREQUENCY_COLORS] || '#6B7280'
    }))
    .sort((a, b) => b.value - a.value);

  // Assignment distribution
  const assignmentCounts = {
    goncalo: tasks.filter(t => t.assignment === 'goncalo').length,
    marilia: tasks.filter(t => t.assignment === 'marilia').length,
    tie: tasks.filter(t => t.assignment === 'tie').length,
    unassigned: tasks.filter(t => !t.assignment).length
  };

  const assignmentDistribution: ChartDataPoint[] = [
    { label: 'Gonçalo', value: assignmentCounts.goncalo, color: '#3B82F6' },
    { label: 'Marília', value: assignmentCounts.marilia, color: '#EC4899' },
    { label: 'Tie/Decide', value: assignmentCounts.tie, color: '#F59E0B' },
    { label: 'Unassigned', value: assignmentCounts.unassigned, color: '#6B7280' }
  ].filter(item => item.value > 0);

  // Points comparison
  const pointsComparison: ChartDataPoint[] = [
    { label: 'Gonçalo', value: Math.round(goncaloPoints), color: '#3B82F6' },
    { label: 'Marília', value: Math.round(mariliaPoints), color: '#EC4899' }
  ];

  // Top categories by task count and points
  const topCategories = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      taskCount: data.tasks.length,
      points: Math.round(data.points),
      icon: categories.find(cat => cat.name === name)?.icon || '📋'
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5);

  // Tasks by frequency analysis
  const tasksByFrequency = Array.from(frequencyMap.entries())
    .map(([frequency, data]) => ({
      frequency,
      count: data.count,
      totalPoints: Math.round(data.points)
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    totalTasks,
    totalMonthlyPoints: Math.round(totalMonthlyPoints),
    goncaloPoints: Math.round(goncaloPoints),
    mariliaPoints: Math.round(mariliaPoints),
    categoryDistribution,
    frequencyDistribution,
    assignmentDistribution,
    pointsComparison,
    workloadBalance: Math.round(workloadBalance),
    topCategories,
    tasksByFrequency
  };
};

export const getWorkloadBalanceStatus = (balance: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
} => {
  if (balance >= 90) {
    return {
      status: 'excellent',
      color: '#10B981',
      message: 'Perfect workload balance!'
    };
  } else if (balance >= 75) {
    return {
      status: 'good', 
      color: '#84CC16',
      message: 'Good workload distribution'
    };
  } else if (balance >= 50) {
    return {
      status: 'fair',
      color: '#F59E0B', 
      message: 'Some workload imbalance'
    };
  } else {
    return {
      status: 'poor',
      color: '#EF4444',
      message: 'Significant workload imbalance'
    };
  }
};

export const generateInsights = (analytics: TaskAnalytics): string[] => {
  const insights: string[] = [];
  
  // Workload balance insight
  const balanceStatus = getWorkloadBalanceStatus(analytics.workloadBalance);
  insights.push(`Workload Balance: ${balanceStatus.message}`);
  
  // Top category insight
  if (analytics.topCategories.length > 0) {
    const topCategory = analytics.topCategories[0];
    insights.push(`${topCategory.name} is your most demanding category with ${topCategory.taskCount} tasks (${topCategory.points} monthly points)`);
  }
  
  // Assignment distribution insight
  const totalAssigned = analytics.goncaloPoints + analytics.mariliaPoints;
  if (totalAssigned > 0) {
    const goncaloPercent = Math.round((analytics.goncaloPoints / totalAssigned) * 100);
    const mariliaPercent = 100 - goncaloPercent;
    insights.push(`Current point distribution: Gonçalo ${goncaloPercent}%, Marília ${mariliaPercent}%`);
  }
  
  // Frequency insight
  if (analytics.tasksByFrequency.length > 0) {
    const topFreq = analytics.tasksByFrequency[0];
    insights.push(`Most common frequency: ${topFreq.frequency} (${topFreq.count} tasks, ${topFreq.totalPoints} points)`);
  }
  
  return insights;
};