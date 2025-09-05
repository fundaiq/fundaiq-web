'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';
import { BarChart3 } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const GrowthRateSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'revenue_growth', label: 'Revenue Growth (%)' },
    { key: 'ebitda_growth', label: 'EBITDA Growth (%)' },
    { key: 'net_profit_growth', label: 'Net Profit Growth (%)' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <BarChart3 size={18} />
        <h2 className={styles.subsectionTitle}>📈 Growth Rates</h2>
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

          // Calculate average growth rate for trend
          const avgGrowth = alignedData.reduce((sum, val) => sum + val, 0) / alignedData.length;
          const latestGrowth = alignedData[alignedData.length - 1];
          
          // Color coding for growth rates
          const trendClass = latestGrowth > 15 ? styles.trendPositive : 
                           latestGrowth < 0 ? styles.trendNegative : styles.trendNeutral;

          return (
            <div key={key} className={styles.metricCard}>
              <div className={styles.chartContainer}>
                <MetricLineChart 
                  label={label} 
                  data={alignedData} 
                  labels={alignedYears} 
                  percent 
                />
              </div>
              <div className={`${styles.trendIndicator} ${trendClass}`}>
                <span>•</span>
                <span>Latest: {latestGrowth.toFixed(1)}%</span>
                <span className="text-xs ml-2 opacity-75">
                  Avg: {avgGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};