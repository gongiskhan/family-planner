import { useState } from 'react';
import { AppProviders } from '@/providers';
import { GlassCard, GlassButton, GlassModal, GlassNavigation, NavigationItem } from '@/components/ui';
import { Home, Plus, Settings, BarChart3, Users, ListTodo } from 'lucide-react';
import { useTask } from '@/providers';
import { TaskForm, TaskList } from '@/features/task-management';
import { AnalyticsDashboard } from '@/features/analytics';

function AppContent() {
  const { state, actions } = useTask();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showTaskForm, setShowTaskForm] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      active: currentView === 'dashboard'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: ListTodo,
      active: currentView === 'tasks',
      badge: state.tasks.length > 0 ? state.tasks.length : undefined
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      active: currentView === 'analytics'
    },
    {
      id: 'family',
      label: 'Family',
      icon: Users,
      active: currentView === 'family'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: currentView === 'settings'
    }
  ];

  const handleNavigation = (item: NavigationItem) => {
    setCurrentView(item.id);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'tasks':
        return (
          <TaskList 
            onEditTask={() => setShowTaskForm(true)}
            onViewTask={() => {}} 
          />
        );
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'family':
        return (
          <GlassCard className="p-8">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Family Management</h2>
              <p className="text-white/80">Coming soon: Family member management</p>
            </div>
          </GlassCard>
        );
      
      case 'settings':
        return (
          <GlassCard className="p-8">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-white/80">Coming soon: Application settings</p>
            </div>
          </GlassCard>
        );
      
      default: // dashboard
        return (
          <GlassCard className="p-8">
            <div className="text-center text-white">
              {state.loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <p>Loading family data...</p>
                </div>
              ) : state.error ? (
                <div className="text-red-300">
                  <p className="text-lg font-semibold mb-2">Error</p>
                  <p>{state.error}</p>
                  <GlassButton 
                    className="mt-4" 
                    onClick={actions.clearError}
                  >
                    Clear Error
                  </GlassButton>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Welcome to Your Family Dashboard</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <GlassCard variant="elevated" className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Total Tasks</h3>
                      <p className="text-3xl font-bold text-blue-300">{state.tasks.length}</p>
                    </GlassCard>
                    
                    <GlassCard variant="elevated" className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Categories</h3>
                      <p className="text-3xl font-bold text-purple-300">{state.categories.length}</p>
                    </GlassCard>
                    
                    <GlassCard variant="elevated" className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">Family Members</h3>
                      <p className="text-3xl font-bold text-pink-300">2</p>
                    </GlassCard>
                  </div>

                  {state.categories.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-white mb-4">Task Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {state.categories.map(category => (
                          <GlassCard key={category.id} className="p-4" hover>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.icon}</span>
                              <div>
                                <h4 className="font-semibold text-white">{category.name}</h4>
                                <p className="text-sm text-white/80">{category.taskCount} tasks</p>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      <div className="flex h-screen">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:block w-64 p-4">
          <GlassNavigation
            variant="sidebar"
            items={navigationItems}
            onItemClick={handleNavigation}
            collapsible
            className="h-full"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="p-4 md:p-6">
            <GlassCard className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                {/* Mobile Navigation */}
                <div className="md:hidden">
                  <GlassNavigation
                    variant="mobile"
                    items={navigationItems}
                    onItemClick={handleNavigation}
                  />
                </div>

                <div className="flex-1 md:flex-none">
                  <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
                    Family Task Manager
                  </h1>
                  <p className="text-white/80 text-sm md:text-base">
                    Fair distribution of household responsibilities
                  </p>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="hidden md:block text-right text-sm text-white/80">
                    {state.lastSaved ? (
                      <p>Last saved: {state.lastSaved.toLocaleTimeString()}</p>
                    ) : (
                      <p>No saves yet</p>
                    )}
                    {state.hasUnsavedChanges && (
                      <p className="text-yellow-300">Unsaved changes</p>
                    )}
                  </div>
                  
                  <GlassButton
                    onClick={() => setShowTaskForm(true)}
                    icon={Plus}
                    size="sm"
                  >
                    <span className="hidden md:inline">Add Task</span>
                  </GlassButton>
                  
                  <GlassButton
                    onClick={actions.saveData}
                    disabled={!state.hasUnsavedChanges}
                    variant="secondary"
                    size="sm"
                  >
                    <span className="hidden md:inline">Save</span>
                    <span className="md:hidden">💾</span>
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <GlassNavigation
        variant="bottom"
        items={navigationItems}
        onItemClick={handleNavigation}
      />

      {/* Task Form Modal */}
      <GlassModal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        title="Create New Task"
        size="lg"
      >
        <TaskForm onClose={() => setShowTaskForm(false)} />
      </GlassModal>
    </div>
  );
}

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;