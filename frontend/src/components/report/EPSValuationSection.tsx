'use client';

import { useEffect } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { Calculator, TrendingUp } from 'lucide-react';
import EPSSensitivityTables from '@/components/eps/EPSSensitivityTables';
import EPSProjectionTable from '@/components/eps/EPSProjectionTable';
import styles from '@/styles/EPSValuationSection.module.css';

export default function EPSValuationSection() {
  const metrics = useGlobalStore((s) =>
    Array.isArray(s.metrics) ? s.metrics[0] : s.metrics
  );
  const assumptions = useGlobalStore((s) => s.assumptions);
  const calculationTriggered = useGlobalStore((s) => s.calculationTriggered);
  const resetCalculation = useGlobalStore((s) => s.resetCalculation);
  const setValuationResults = useGlobalStore((s) => s.setValuationResults);
  const eps_results = useGlobalStore((s) => s.valuationResults?.eps);

  // Format the fair value for display
  const fairValue = typeof eps_results?.eps_fair_value === 'number' 
    ? eps_results.eps_fair_value.toFixed(0) 
    : 'N/A';

  // Empty state with beautiful styling
  if (!eps_results || !eps_results.projection_table) {
    return (
      <section className={styles.container} id="eps-projection">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <Calculator className={styles.icon} />
            </div>
            <div className={styles.titleSection}>
              <h3 className={styles.title}>EPS Valuation Model</h3>
              <p className={styles.subtitle}>Earnings-based fair value analysis</p>
            </div>
          </div>
        </div>
        
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <p>EPS projection not available yet. Run valuation to see results.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container} id="eps-projection">
      {/* Beautiful Header with Fair Value Highlight */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <TrendingUp className={styles.icon} />
          </div>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>EPS Valuation Model</h2>
            <p className={styles.subtitle}>
              Fair value based on PE = 20 and 3-year projected earnings
            </p>
          </div>
        </div>
        
        <div className={styles.fairValueHighlight}>
          <div className={styles.fairValueAmount}>₹{fairValue}</div>
          <div className={styles.fairValueLabel}>Fair Value</div>
        </div>
      </div>

      {/* EPS Projection Table */}
      <EPSProjectionTable data={eps_results} />
      
      {/* Sensitivity Analysis Tables */}
      <EPSSensitivityTables data={eps_results} />
    </section>
  );
}