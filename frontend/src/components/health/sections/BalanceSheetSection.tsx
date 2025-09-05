'use client';

import { MetricBarChart } from '@/components/health/MetricBarChart';
import { Building } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const BalanceSheetSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'equity', label: 'Equity (₹ Cr)' },
    { key: 'net_debt', label: 'Net Debt (₹ Cr)' },
    { key: 'net_block', label: 'Net Block (₹ Cr)' },
    { key: 'cwip', label: 'Capital WIP (₹ Cr)' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <Building size={18} />
        <h2 className={styles.subsectionTitle}>🏢 Balance Sheet Snapshot</h2>
      </div>

      <div className={`${styles.cardsGrid} ${styles.cols4}`}>
        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data)
            ? data.map((n) => Number(n)).filter((n) => !isNaN(n))
            : [];

          const minLen = Math.min(validData.length, years.length);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(-minLen);

          if (!alignedData.length || !alignedYears.length) return null;

          // Calculate growth trend
          const latestValue = alignedData[alignedData.length - 1];
          const previousValue = alignedData[alignedData.length - 2] || 0;
          const growthRate = previousValue !== 0 ? ((latestValue - previousValue) / Math.abs(previousValue)) * 100 : 0;
          
          // Color coding based on metric type and growth
          let trendClass = styles.trendNeutral;
          if (key === 'equity' || key === 'net_block') {
            // Growth in equity and net block is positive
            trendClass = growthRate > 5 ? styles.trendPositive : 
                        growthRate < -5 ? styles.trendNegative : styles.trendNeutral;
          } else if (key === 'net_debt') {
            // Growth in net debt is negative (we want less debt)
            trendClass = growthRate < -5 ? styles.trendPositive : 
                        growthRate > 5 ? styles.trendNegative : styles.trendNeutral;
          } else if (key === 'cwip') {
            // CWIP growth can be positive (expansion) but should be monitored
            trendClass = growthRate > 0 ? styles.trendPositive : styles.trendNeutral;
          }

          return (
            <div key={key} className={styles.metricCard}>
              <div className={styles.chartContainer}>
                <MetricBarChart label={label} data={alignedData} labels={alignedYears} />
              </div>
              <div className={`${styles.trendIndicator} ${trendClass}`}>
                <span>•</span>
                <span>₹{latestValue.toFixed(0)} Cr</span>
                {Math.abs(growthRate) > 1 && (
                  <span className="ml-2 text-xs">
                    ({growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};