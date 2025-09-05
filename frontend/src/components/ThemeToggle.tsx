// components/ThemeToggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme(); // theme: 'light' | 'dark' | 'system'
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Cycle preference: light → dark → system → light
  const getNextTheme = (t: 'light' | 'dark' | 'system'): 'light' | 'dark' | 'system' =>
    t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light';

  const next = getNextTheme(theme);
  const labelMap = {
    light: 'Light (click for Dark)',
    dark: 'Dark (click for System)',
    system: `System${resolvedTheme ? ` – ${resolvedTheme} now` : ''} (click for Light)`,
  } as const;

  const handleClick = () => setTheme(next);

  // Icons: Sun (light), Moon (dark), Auto (system - laptop)
  const Icon =
    theme === 'light' ? (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 4v2m0 12v2M4 12H2m20 0h-2m-2.636 6.364l-1.414-1.414M6.05 6.05 4.636 4.636M17.95 6.05l1.414-1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) : theme === 'dark' ? (
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ) : (
      // system
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 21h8M12 17v4" />
      </svg>
    );

  return (
    <button
      onClick={handleClick}
      className={styles.themeToggle}
      aria-label={`Theme: ${theme}. Click to switch to ${next}.`}
      title={`${labelMap[theme]} • Resolved: ${resolvedTheme}`}
      type="button"
    >
      {Icon}
    </button>
  );
}
