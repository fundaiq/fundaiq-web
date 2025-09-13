'use client';

import { MetricBarChart } from '@/components/health/MetricBarChart';
import { getTrendSummaryLine } from '@/lib/TrendAnalyzer';
import { BarChart2 } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  qtrs: string[];
}

export const QuarterlySection = ({ metrics, qtrs }: Props) => {
  const items = [
    { key: 'q_sales', label: 'Quarterly Sales' },
    { key: 'q_op', label: 'Quarterly Operating Profit' },
    { key: 'q_np', label: 'Quarterly Net Profit' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <BarChart2 size={18} />
        <h2 className={styles.subsectionTitle}>📈 Quarterly Performance</h2>
      </div>

      <div className={`${styles.cardsGrid} ${styles.cols3}`}>
        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data) ? data.map((n) => Number(n)).filter((n) => !isNaN(n)) : [];

          // Test fallback chart if data is missing
          if (label === 'Quarterly Sales' && (!validData.length || !qtrs.length)) {
            console.warn(`🔍 Showing test fallback chart for ${label}`);
            return (
              <div key="test" className={styles.metricCard}>
                <h3 className={styles.subsectionTitle}>Test Chart</h3>
                <div className={styles.chartContainer}>
                  <MetricBarChart
                    label="Test"
                    data={[100, 200, 300]}
                    labels={['Q1', 'Q2', 'Q3']}
                  />
                </div>
              </div>
            );
          }

          if (!validData.length || !qtrs.length) return null;

          const minLen = Math.min(validData.length, qtrs.length);
          const alignedData = validData.slice(-minLen);
          const alignedQtrs = qtrs.slice(-minLen);
          const trend = getTrendSummaryLine(alignedData);
          
          return (
            <div key={key} className={styles.metricCard}>
              <div className={styles.chartContainer}>
                <MetricBarChart label={label} data={alignedData} labels={alignedQtrs} />
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