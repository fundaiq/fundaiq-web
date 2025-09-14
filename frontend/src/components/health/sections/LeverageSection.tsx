'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';
import { Scale } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const LeverageSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'debt_to_equity', label: 'Debt to Equity (x)' },
    { key: 'interest_coverage', label: 'Interest Coverage (x)' },
    { key: 'cash_and_bank', label: 'Cash & Bank (₹ Cr)' },
    { key: 'div_amount_per_share', label: 'Divindend Amount Per Share' },
    { key: 'net_asset_values_per_share', label: 'Net Asset Value Per Share' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <Scale size={18} />
        <h2 className={styles.subsectionTitle}>⚖️ Leverage & Liquidity</h2>
      </div>

      <div className={`${styles.cardsGrid} ${styles.cols3}`}>
        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data)
            ? data.map((n) => Number(n)).filter((n) => !isNaN(n))
            : [];

          const minLen = Math.min(validData.length, years.length);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(-minLen);

          if (!alignedData.length || !alignedYears.length) return null;

          // Color coding logic based on metric type
          const latestValue = alignedData[alignedData.length - 1];
          let trendClass = styles.trendNeutral;
          
          if (key === 'debt_to_equity') {
            // Lower debt-to-equity is better
            trendClass = latestValue < 0.5 ? styles.trendPositive : 
                        latestValue > 1.0 ? styles.trendNegative : styles.trendNeutral;
          } else if (key === 'interest_coverage') {
            // Higher interest coverage is better
            trendClass = latestValue > 5 ? styles.trendPositive : 
                        latestValue < 2 ? styles.trendNegative : styles.trendNeutral;
          } else if (key === 'cash_and_bank') {
            // More cash is generally better
            const previousValue = alignedData[alignedData.length - 2] || 0;
            trendClass = latestValue > previousValue ? styles.trendPositive : styles.trendNegative;
          } else if (key === 'div_amount_per_share') {
            // More cash is generally better
            const previousValue = alignedData[alignedData.length - 2] || 0;
            trendClass = latestValue > previousValue ? styles.trendPositive : styles.trendNegative;
          } else if (key === 'net_asset_values_per_share') {
            // More cash is generally better
            const previousValue = alignedData[alignedData.length - 2] || 0;
            trendClass = latestValue > previousValue ? styles.trendPositive : styles.trendNegative;
          }


          return (
            <div key={key} className={styles.metricCard}>
              <div className={styles.chartContainer}>
                <MetricLineChart label={label} data={alignedData} labels={alignedYears} />
              </div>
              <div className={`${styles.trendIndicator} ${trendClass}`}>
                <span>•</span>
                <span>
                  {key === 'cash_and_bank' 
                    ? `₹${latestValue.toFixed(0)} Cr` 
                    : `${latestValue.toFixed(2)}x`
                  }
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};