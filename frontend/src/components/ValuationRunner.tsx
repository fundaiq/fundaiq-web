// src/components/ValuationRunner.tsx
'use client';
import { useEffect } from 'react';
import { useGlobalStore } from '@/store/globalStore';

export default function ValuationRunner() {
  const calcToken = useGlobalStore((s) => s.calcToken);
  const runValuations = useGlobalStore((s) => s.runValuations);

  useEffect(() => {
    if (typeof runValuations === 'function') {
      runValuations();
    }
  }, [calcToken, runValuations]);

  return null;
}
