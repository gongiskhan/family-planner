import React from 'react';
import { TaskProvider } from './TaskContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <TaskProvider>
      {children}
    </TaskProvider>
  );
}

export { TaskProvider, useTask } from './TaskContext';