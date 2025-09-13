'use client';

import { MetricBarChart } from '@/components/health/MetricBarChart';
import { getTrendSummaryLine } from '@/lib/TrendAnalyzer';
import { TrendingUp } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const GrowthSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'ebitda', label: 'EBITDA' },
    { key: 'net_profit', label: 'Net Profit' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <TrendingUp size={18} />
        <h2 className={styles.subsectionTitle}>📊 Past Growth</h2>
      </div>

      <div className={`${styles.cardsGrid} ${styles.cols3}`}>
        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data) ? data.map((n) => Number(n)).filter((n) => !isNaN(n)) : [];

          // Test fallback chart if data is missing
          if (label === 'Revenue' && (!validData.length || !years.length)) {
            console.warn(`🔍 Showing test fallback chart for ${label}`);
            return (
              <div key="test" className={styles.metricCard}>
                <h3 className={styles.subsectionTitle}>Test Chart</h3>
                <div className={styles.chartContainer}>
                  <MetricBarChart
                    label="Test"
                    data={[100, 200, 300]}
                    labels={['2021', '2022', '2023']}
                  />
                </div>
              </div>
            );
          }

          if (!validData.length || !years.length) return null;

          const minLen = Math.min(validData.length, years.length);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(-minLen);
          const trend = getTrendSummaryLine(alignedData);
          
          return (
            <div key={key} className={styles.metricCard}>
              <div className={styles.chartContainer}>
                <MetricBarChart label={label} data={alignedData} labels={alignedYears} />
              </div>
              <div className={`${styles.trendIndicator} ${
                trend.color.includes('green') ? styles.trendPositive : 
                trend.color.includes('red') ? styles.trendNegative : styles.trendNeutral
              }`}>
                <span>•</span>
                <span>{trend.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};