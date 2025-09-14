'use client';

import { MetricBarChart } from '@/components/health/MetricBarChart';
import { TrendingUp } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const CashflowSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'cf_opa', label: 'Operating Activities (₹ Cr)' },
    { key: 'cf_inva', label: 'Investment Activities (₹ Cr)' },
    { key: 'cf_fina', label: 'Financing Activities (₹ Cr)' },
    { key: 'cf_net', label: 'Net Cashflows (₹ Cr)' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <TrendingUp size={18} />
        <h2 className={styles.subsectionTitle}>💰 Cashflow Statement</h2>
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
          
          // Color coding based on cashflow type and growth
          let trendClass = styles.trendNeutral;
          
          if (key === 'cf_opa' || key === 'cf_net') {
            // Operating cashflows and Net cashflows: positive growth is good
            trendClass = growthRate > 5 ? styles.trendPositive : 
                        growthRate < -5 ? styles.trendNegative : styles.trendNeutral;
          } else if (key === 'cf_inva') {
            // Investment activities: usually negative (outflows for investments), 
            // so less negative growth (moving toward positive) is generally good
            if (latestValue < 0 && previousValue < 0) {
              // Both negative: less negative is better
              trendClass = latestValue > previousValue ? styles.trendPositive : 
                          Math.abs(growthRate) > 20 ? styles.trendNegative : styles.trendNeutral;
            } else {
              // Standard growth analysis
              trendClass = growthRate > 5 ? styles.trendPositive : 
                          growthRate < -5 ? styles.trendNegative : styles.trendNeutral;
            }
          } else if (key === 'cf_fina') {
            // Financing activities: context-dependent
            // Could be positive (raising funds) or negative (paying dividends/debt)
            // We'll use neutral coloring for moderate changes
            trendClass = Math.abs(growthRate) > 20 ? 
                        (growthRate > 0 ? styles.trendPositive : styles.trendNegative) : 
                        styles.trendNeutral;
          }

          // Format value for display
          const formatValue = (value: number) => {
            const absValue = Math.abs(value);
            if (absValue >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toFixed(1);
          };

          const displayValue = formatValue(latestValue);
          const trendSymbol = growthRate > 5 ? '↗' : growthRate < -5 ? '↘' : '→';
          
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