'use client';

import { useSyncExternalStore, useCallback } from 'react';

export type FontSizePreset = 'small' | 'normal' | 'large';

const FONT_SIZE_STORAGE_KEY = 'paralar_font_size';

export function getStoredFontSize(): FontSizePreset {
  if (typeof window === 'undefined') return 'normal';
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizePreset | null;
    if (stored === 'small' || stored === 'normal' || stored === 'large') return stored;
    return 'normal';
  } catch {
    return 'normal';
  }
}

export function applyFontSizeToDOM(size: FontSizePreset) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-font-size', size);
}

function subscribeFontSize(callback: () => void) {
  window.addEventListener('paralarFontSizeChanged', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('paralarFontSizeChanged', callback);
    window.removeEventListener('storage', callback);
  };
}

export function useFontSize() {
  const fontSize = useSyncExternalStore(
    subscribeFontSize,
    getStoredFontSize,
    () => 'normal' as FontSizePreset
  );

  const setFontSize = useCallback((newSize: FontSizePreset) => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, newSize);
      applyFontSizeToDOM(newSize);
      window.dispatchEvent(new Event('paralarFontSizeChanged'));
    } catch (e) {
      console.error('Error saving font size preference:', e);
    }
  }, []);

  return {
    fontSize,
    setFontSize,
  };
}
