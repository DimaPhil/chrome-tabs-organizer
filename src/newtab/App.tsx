import { useEffect } from 'react';
import { AppProvider } from '@/store/AppContext';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { useTheme } from '@/hooks/useTheme';

function AppContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return <Dashboard />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
