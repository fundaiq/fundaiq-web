'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';
import { DollarSign } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const ProfitabilitySection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'ebitda_margin', label: 'EBITDA Margin (%)' },
    { key: 'net_profit_margin', label: 'Net Profit Margin (%)' },
    { key: 'roce', label: 'ROCE (%)' },
    { key: 'roe', label: 'ROE (%)' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <DollarSign size={18} />
        <h2 className={styles.subsectionTitle}>💰 Profitability & Returns</h2>
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

          // Calculate trend for color coding
          const latestValue = alignedData[alignedData.length - 1];
          const previousValue = alignedData[alignedData.length - 2];
          const isPositive = latestValue > (previousValue || 0);

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
              <div className={`${styles.trendIndicator} ${
                isPositive ? styles.trendPositive : styles.trendNegative
              }`}>
                <span>•</span>
                <span>{latestValue.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};