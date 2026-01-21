import { useEffect } from 'react';
import { AppProvider, useAppContext } from '@/store/AppContext';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { ErrorBoundary, ErrorNotification } from '@/components/common';
import { useTheme } from '@/hooks/useTheme';

function AppContent() {
  const { isDark } = useTheme();
  const { state, clearError } = useAppContext();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
      <Dashboard />
      <ErrorNotification error={state.error} onDismiss={clearError} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
