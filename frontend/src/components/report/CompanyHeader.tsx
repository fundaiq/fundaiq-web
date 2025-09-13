// frontend/src/components/report/CompanyHeader.tsx
'use client';

import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/CompanyHeader.module.css'; // ✅ New dedicated CSS module

interface CompanyHeaderProps {
  companyInfo: any;
  showSections: boolean;
  onReset: () => void;
}

export default function CompanyHeader() {
  const companyInfo = useGlobalStore((s) => s.companyInfo);
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  
  const currentPrice = metrics?.current_price;

  return (
    <div className={styles.headerContainer}>
      {/* Gradient accent bar */}
      <div className={styles.gradientAccent}></div>

      {/* Main header content */}
      <div className={styles.innerContainer}>
        {/* Left side - Company info */}
        <div className={styles.companySection}>
          {/* Company details */}
          <div className={styles.companyDetails}>
            <h1 className={styles.companyName}>
              {companyInfo || 'FundaIQ Analysis'}
            </h1>
            
            {currentPrice !== undefined && (
              <div className={styles.priceContainer}>
                <span className={styles.currencySymbol}>₹</span>
                <span className={styles.priceValue}>
                  {currentPrice.toLocaleString('en-IN', { 
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2 
                  })}
                </span>
                <span className={styles.priceLabel}>Current Price</span>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}