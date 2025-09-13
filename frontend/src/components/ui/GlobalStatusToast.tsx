'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { CheckCircle, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import styles from '@/styles/GlobalStatusToast.module.css';

export default function GlobalStatusToast() {
  const status = useGlobalStore((s) => s.status);
  const [isVisible, setIsVisible] = useState(false);
  const [toastType, setToastType] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (status) {
      setIsVisible(true);
      
      // Determine toast type based on status content
      if (status.includes('✅') || status.includes('successfully')) {
        setToastType('success');
        // Auto hide success messages after 3 seconds
        setTimeout(() => setIsVisible(false), 3000);
      } else if (status.includes('❌') || status.includes('failed') || status.includes('error')) {
        setToastType('error');
        // Auto hide error messages after 5 seconds
        setTimeout(() => setIsVisible(false), 5000);
      } else {
        setToastType('loading');
      }
    } else {
      setIsVisible(false);
    }
  }, [status]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !status) return null;

  const getIcon = () => {
    switch (toastType) {
      case 'success':
        return <CheckCircle className={styles.icon} />;
      case 'error':
        return <AlertCircle className={styles.icon} />;
      default:
        return <FileSpreadsheet className={`${styles.icon} ${styles.spinning}`} />;
    }
  };

  return (
    <div className={`${styles.toast} ${styles[toastType]} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.content}>
        {getIcon()}
        <span className={styles.message}>{status}</span>
      </div>
      
      {toastType !== 'loading' && (
        <button onClick={handleClose} className={styles.closeButton}>
          <X className={styles.closeIcon} />
        </button>
      )}
      
      {toastType === 'loading' && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>
      )}
    </div>
  );
}