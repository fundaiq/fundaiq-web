'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { GrowthSection } from '@/components/health/sections/GrowthSection';
import { GrowthRateSection } from '@/components/health/sections/GrowthRateSection';
import { ProfitabilitySection } from '@/components/health/sections/ProfitabilitySection';
import { LeverageSection } from '@/components/health/sections/LeverageSection';
import { BalanceSheetSection } from '@/components/health/sections/BalanceSheetSection';
import { QuarterlySection } from '@/components/health/sections/QuarterlySection';
import { CashflowSection } from '@/components/health/sections/CashflowSection';
import { QuarterlyGrowthRateSection } from '@/components/health/sections/QuarterlyGrowthRateSection';
import { SummaryBox } from '@/components/health/SummaryBox';
import { Activity } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

export default function FinancialHealthSection() {
  const metrics = useGlobalStore((state) => state.metrics);
  const [hydrated, setHydrated] = useState(false);
  
  
  useEffect(() => {
    setHydrated(true);
  }, []);

  const rawYears = metrics?.years || [];
  const years_with_ttm = metrics?.years_with_ttm || [];
  const qtrs = metrics?.qtrs || [];
  const years = rawYears.map((y: string) => y.replace("Mar-", ""));

  if (!hydrated || !metrics || Object.keys(metrics).length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>📂</div>
        <p className={styles.emptyStateText}>No financial data available.</p>
      </div>
    );
  }

  return (
    <section className={styles.container} id="financial-health">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <Activity size={16} />
        </div>
        <h1 className={styles.sectionTitle}>Financial Health Analysis</h1>
      </div>

      {/* Subsections Container */}
      <div className={styles.subsectionsContainer}>
        <div className={styles.subsection}>
          <QuarterlySection metrics={metrics} qtrs={qtrs} />
        </div>
        <div className={styles.subsection}>
          <QuarterlyGrowthRateSection metrics={metrics} qtrs={qtrs} />
        </div>

        <div className={styles.subsection}>
          <GrowthSection metrics={metrics} years_with_ttm={years_with_ttm} />
        </div>

        <div className={styles.subsection}>
          <GrowthRateSection metrics={metrics} years={years} />
        </div>

        <div className={styles.subsection}>
          <ProfitabilitySection metrics={metrics} years={years} />
        </div>

        <div className={styles.subsection}>
          <BalanceSheetSection metrics={metrics} years={years} />
        </div>

        <div className={styles.subsection}>
          <LeverageSection metrics={metrics} years={years} />
        </div>
        
        <div className={styles.subsection}>
          <CashflowSection metrics={metrics} years={years} />
        </div>
        {/* Summary Box - Special Styling */}
        {/* <div className={styles.summaryCard}>
          <SummaryBox metrics={metrics} />
        </div> */}
      </div>
    </section>
  );
}