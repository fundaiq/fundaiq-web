'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiFetch from '@/app/lib/api';
import styles from '@/styles/auth.module.css';

export default function VerifyPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'pending'|'ok'|'error'>('pending');

  useEffect(() => {
    const token = sp.get('token');
    if (!token) { 
      setStatus('error'); 
      return; 
    }
    apiFetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [sp]);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => router.push('/report'), 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  const renderIcon = () => {
    if (status === 'pending') {
      return (
        <div className={`${styles.verifyIcon} ${styles.verifyIconPending}`}>
          <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      );
    }
    
    if (status === 'ok') {
      return (
        <div className={`${styles.verifyIcon} ${styles.verifyIconSuccess}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className={`${styles.verifyIcon} ${styles.verifyIconError}`}>
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  };

  const renderMessage = () => {
    if (status === 'pending') {
      return (
        <p className={`${styles.verifyText} ${styles.verifyTextPending}`}>
          Verifying your email…
        </p>
      );
    }
    
    if (status === 'ok') {
      return (
        <div>
          <p className={`${styles.verifyText} ${styles.verifyTextSuccess}`}>
            Email verified successfully!
          </p>
          <p className="text-secondary text-sm mt-2">
            Redirecting you to the dashboard in a moment...
          </p>
        </div>
      );
    }
    
    return (
      <div>
        <p className={`${styles.verifyText} ${styles.verifyTextError}`}>
          Verification failed
        </p>
        <p className="text-secondary text-sm mt-2">
          Invalid or expired link. Try logging in and click "Resend verification".
        </p>
      </div>
    );
  };

  return (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyCard}>
        {renderIcon()}
        {renderMessage()}
      </div>
    </div>
  );
}