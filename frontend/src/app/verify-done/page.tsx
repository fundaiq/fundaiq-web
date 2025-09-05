// app/verify-done/page.tsx
'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyDonePage() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = sp.get('status');
    router.replace(status === 'ok' ? '/login?verified=1' : '/login?verify_error=1');
  }, [sp, router]);

  return <p>Completing verification…</p>;
}