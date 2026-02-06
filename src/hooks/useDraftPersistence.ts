import { useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

const STORAGE_PREFIX = 'draft_';

export function useStepDraft<T extends Record<string, unknown>>(
  storageKey: string,
  formData: T,
  debounceMs = 2000
) {
  const debouncedFormData = useDebounce(formData, debounceMs);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    const fullKey = `${STORAGE_PREFIX}${storageKey}`;
    console.log('debouncedFormData', debouncedFormData);
    
    try {
      localStorage.setItem(fullKey, JSON.stringify(debouncedFormData));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Draft not saved.');
      } else {
        console.error('Error saving draft:', error);
      }
    }
  }, [debouncedFormData, storageKey]);

  const clearDraft = useCallback(() => {
    const fullKey = `${STORAGE_PREFIX}${storageKey}`;
    try {
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [storageKey]);

  return { clearDraft };
}

export function restoreStepDraft<T>(storageKey: string): T | null {
  const fullKey = `${STORAGE_PREFIX}${storageKey}`;
  
  try {
    const saved = localStorage.getItem(fullKey);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.error('Error restoring draft:', error);
  }
  
  return null;
}

export function clearAllDrafts(role: string) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${role}_step1`);
    localStorage.removeItem(`${STORAGE_PREFIX}${role}_step2`);
  } catch (error) {
    console.error('Error clearing drafts:', error);
  }
}
