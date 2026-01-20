import { useEffect, useCallback, useState } from 'react';
import { storageService } from '@/services';
import type { StorageData } from '@/types';

export function useStorage() {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const storageData = await storageService.load();
        setData(storageData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load storage'));
      } finally {
        setLoading(false);
      }
    }

    load();

    // Listen for external changes
    const unsubscribe = storageService.onChanged(() => {
      load();
    });

    return unsubscribe;
  }, []);

  const save = useCallback(async (newData: StorageData) => {
    try {
      await storageService.save(newData);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save storage'));
      throw err;
    }
  }, []);

  return { data, loading, error, save };
}
