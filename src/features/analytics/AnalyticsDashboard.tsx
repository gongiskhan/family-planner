import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  GlassCard, 
  GlassBarChart, 
  GlassPieChart, 
  GlassProgressRing
} from '@/components/ui';
import { useTask } from '@/providers';
import { calculateTaskAnalytics, getWorkloadBalanceStatus, generateInsights } from '@/utils/analyticsCalculations';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  BarChart3,
  Activity,
  Award,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { state } = useTask();
  
  const analytics = useMemo(() => 
    calculateTaskAnalytics(state.tasks, state.categories), 
    [state.tasks, state.categories]
  );
  
  const workloadStatus = getWorkloadBalanceStatus(analytics.workloadBalance);
  const insights = generateInsights(analytics);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (state.tasks.length === 0) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BarChart3 size={64} className="text-white/40" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
              <p className="text-white/70">
                Create some tasks to see analytics and insights about your family's task distribution.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={32} className="text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-white/70">Insights into your family's task management</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle2 size={24} className="text-green-400" />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Total Tasks
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.totalTasks}
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Target size={24} className="text-purple-400" />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Monthly Points
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.totalMonthlyPoints}
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Activity size={24} className={`text-[${workloadStatus.color}]`} />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Balance Score
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.workloadBalance}%
            </div>
            <div className="text-xs text-white/60 mt-1">
              {workloadStatus.message}
            </div>
          </GlassCard>
          
          <GlassCard className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Award size={24} className="text-yellow-400" />
              <span className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Categories
              </span>
            </div>
            <div className="text-3xl font-bold text-white">
              {analytics.topCategories.length}
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Workload Balance */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GlassCard className="p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                <Users size={20} />
                Workload Balance
              </h3>
              
              <GlassProgressRing
                value={analytics.workloadBalance}
                maxValue={100}
                size={160}
                strokeWidth={12}
                color={workloadStatus.color}
                className="mb-4"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {analytics.workloadBalance}%
                  </div>
                  <div className="text-xs text-white/60">
                    Balance Score
                  </div>
                </div>
              </GlassProgressRing>
              
              <div className={`text-sm font-medium`} style={{ color: workloadStatus.color }}>
                {workloadStatus.message}
              </div>
            </GlassCard>
          </div>
          
          <div className="lg:col-span-2">
            <GlassBarChart
              data={analytics.pointsComparison}
              title="Monthly Points Distribution"
              height={240}
              showValues={true}
            />
          </div>
        </div>
      </motion.div>

      {/* Distribution Charts */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassPieChart
            data={analytics.categoryDistribution}
            title="Tasks by Category"
            size={200}
            centerText={`${analytics.totalTasks} Tasks`}
          />
          
          <GlassPieChart
            data={analytics.assignmentDistribution}
            title="Task Assignment Distribution"
            size={200}
            centerText="Assignment"
          />
        </div>
      </motion.div>

      {/* Frequency Analysis */}
      <motion.div variants={itemVariants}>
        <GlassBarChart
          data={analytics.frequencyDistribution}
          title="Tasks by Frequency"
          height={280}
          showValues={true}
        />
      </motion.div>

      {/* Top Categories */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Top Categories by Workload
          </h3>
          
          <div className="space-y-4">
            {analytics.topCategories.map((category, index) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{category.name}</div>
                    <div className="text-sm text-white/70">
                      {category.taskCount} tasks
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {category.points}
                  </div>
                  <div className="text-xs text-white/60">
                    monthly points
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Insights */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Key Insights
          </h3>
          
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-300">
                    {index + 1}
                  </span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  {insight}
                </p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Frequency Analysis Table */}
      <motion.div variants={itemVariants}>
        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={20} />
              Frequency Analysis
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/80 font-medium">Frequency</th>
                  <th className="text-center p-4 text-white/80 font-medium">Task Count</th>
                  <th className="text-right p-4 text-white/80 font-medium">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {analytics.tasksByFrequency.map((freq) => (
                  <tr key={freq.frequency} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: analytics.frequencyDistribution
                            .find(f => f.label === freq.frequency)?.color || '#6B7280' }}
                        />
                        <span className="text-white font-medium">{freq.frequency}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-white/80">
                      {freq.count}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-white font-semibold">
                        {freq.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}