'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'cashflow_monochrome_theme';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Default to dark mode for elegant modern look
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    // Apply current theme on mount
    applyThemeToDOM(theme);

    const handleThemeChange = () => {
      const current = getStoredTheme();
      setThemeState(current);
      applyThemeToDOM(current);
    };

    window.addEventListener('cashflowThemeChanged', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);

    return () => {
      window.removeEventListener('cashflowThemeChanged', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
      applyThemeToDOM(newTheme);
      window.dispatchEvent(new Event('cashflowThemeChanged'));
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
