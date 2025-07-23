import { AppProviders } from '@/providers';
import { GlassCard, GlassButton } from '@/components/ui';
import { Home, Plus, Settings, BarChart3, Users } from 'lucide-react';
import { useTask } from '@/providers';

function AppContent() {
  const { state, actions } = useTask();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Family Task Manager
                </h1>
                <p className="text-white/80">
                  Fair distribution of household responsibilities
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right text-sm text-white/80">
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
                  onClick={actions.saveData}
                  disabled={!state.hasUnsavedChanges}
                  icon={Settings}
                >
                  Save
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center justify-center gap-4">
              <GlassButton variant="ghost" icon={Home}>
                Dashboard
              </GlassButton>
              <GlassButton variant="ghost" icon={Plus}>
                Add Task
              </GlassButton>
              <GlassButton variant="ghost" icon={BarChart3}>
                Analytics
              </GlassButton>
              <GlassButton variant="ghost" icon={Users}>
                Family
              </GlassButton>
              <GlassButton variant="ghost" icon={Settings}>
                Settings
              </GlassButton>
            </div>
          </GlassCard>
        </nav>

        {/* Main Content */}
        <main>
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
        </main>
      </div>
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