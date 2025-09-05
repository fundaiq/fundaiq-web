'use client';

import { useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('auto');
  const [mounted, setMounted] = useState(false);

  // Get system preference
  const getSystemPreference = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const systemPreference = getSystemPreference();
    
    // Remove existing class
    root.classList.remove('dark');
    
    // Determine if we should apply dark class
    const shouldBeDark = newTheme === 'dark' || (newTheme === 'auto' && systemPreference === 'dark');
    
    if (shouldBeDark) {
      root.classList.add('dark');
    }
  }, [getSystemPreference]);

  // Get stored theme or default to auto
  const getStoredTheme = useCallback((): Theme => {
    if (typeof window === 'undefined') return 'auto';
    const stored = localStorage.getItem('theme') as Theme;
    return stored && ['light', 'dark', 'auto'].includes(stored) ? stored : 'auto';
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
    setMounted(true);
  }, [getStoredTheme, applyTheme]);

  // Listen for system preference changes when in auto mode
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted, applyTheme]);

  // Set theme and persist
  const setAndStoreTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [applyTheme]);

  // Cycle through themes: auto -> light -> dark -> auto
  const cycleTheme = useCallback(() => {
    const nextTheme: Theme = 
      theme === 'auto' ? 'light' :
      theme === 'light' ? 'dark' : 'auto';
    
    setAndStoreTheme(nextTheme);
  }, [theme, setAndStoreTheme]);

  // Get current effective theme (resolves 'auto' to actual theme)
  const getEffectiveTheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'auto') {
      return getSystemPreference();
    }
    return theme;
  }, [theme, getSystemPreference]);

  return {
    theme,
    setTheme: setAndStoreTheme,
    cycleTheme,
    effectiveTheme: getEffectiveTheme(),
    mounted,
  };
}