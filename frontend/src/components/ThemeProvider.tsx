// components/ThemeProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  // Get system theme preference
  const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): 'dark' | 'light' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Apply theme to document
  const applyTheme = (newTheme: 'dark' | 'light', saveToStorage: boolean = true) => {
    const root = document.documentElement;

    // Disable transitions temporarily if requested
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.appendChild(
        document.createTextNode(
          '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
        )
      );
      document.head.appendChild(css);
      setTimeout(() => {
        document.head.removeChild(css);
      }, 1);
    }

    // ✅ Always set BOTH class and data attribute
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    root.setAttribute('data-theme', newTheme);

    if (saveToStorage) {
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.warn('Failed to save theme preference:', e);
      }
    }
  };

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    
    // Save the user preference, not the resolved theme
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
    
    // Apply the resolved theme to the DOM
    applyTheme(resolved, false);
  };

  // Initialize theme on mount
  useEffect(() => {
    let savedTheme: Theme = defaultTheme;

    try {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && (saved === 'dark' || saved === 'light' || (enableSystem && saved === 'system'))) {
        savedTheme = saved;
      }
    } catch (e) {
      console.warn('Failed to load theme preference:', e);
    }

    setThemeState(savedTheme);
    const resolved = resolveTheme(savedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved, false);
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);
      applyTheme(newResolvedTheme, false);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme, enableSystem]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  const value: ThemeProviderContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}