import { useState, useEffect, useCallback } from 'react';
import { loadFromStorage, saveToStorage, isStorageAvailable } from '../utils/storage';

/**
 * Hook for persistent state via localStorage.
 * Uses stable keys from STORAGE_KEYS.
 * Never auto-clears. Survives refresh.
 */
export function useLocalStorage(key, initialValue) {
  const storageAvailable = isStorageAvailable();

  const [value, setValue] = useState(() => {
    if (!storageAvailable) return initialValue;
    const stored = loadFromStorage(key);
    return stored !== null ? stored : initialValue;
  });

  // Sync to localStorage on change
  useEffect(() => {
    if (!storageAvailable) return;
    saveToStorage(key, value);
  }, [key, value, storageAvailable]);

  // Wrapped setter that also persists
  const setPersistedValue = useCallback((newValue) => {
    setValue(prev => {
      const resolved = typeof newValue === 'function' ? newValue(prev) : newValue;
      return resolved;
    });
  }, []);

  return [value, setPersistedValue];
}
