'use client';

import { MetricLineChart } from '@/components/health/MetricLineChart';
import { TrendingUp } from 'lucide-react';
import styles from '@/styles/FinancialHealthSection.module.css';

interface Props {
  metrics: Record<string, number[]>;
  qtrs: string[];
}

export const QuarterlyGrowthRateSection = ({ metrics, qtrs }: Props) => {
  const items = [
    { key: 'q_sales_growth', label: 'Quarterly Sales Growth (%)' },
    { key: 'q_net_profit_growth', label: 'Quarterly Net Profit Growth (%)' },
    { key: 'q_ebitda_margin', label: 'Quarterly EBITDA Margin (%)' },
  ];

  return (
    <div className={styles.subsection}>
      <div className={styles.subsectionHeader}>
        <TrendingUp size={18} />
        <h2 className={styles.subsectionTitle}>📊 Quarterly Growth Rates</h2>
      </div>

      <div className={`${styles.cardsGrid} ${styles.cols3}`}>
        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data)
            ? data.map((n) => Number(n)).filter((n) => !isNaN(n))
            : [];

          const minLen = Math.min(validData.length, qtrs.length);
          const alignedData = validData.slice(-minLen);
          const alignedQtrs = qtrs.slice(-minLen);

          if (!alignedData.length || !qtrs.length) return null;

          // Calculate average growth rate for trend
          const avgGrowth = alignedData.reduce((sum, val) => sum + val, 0) / alignedData.length;
          const latestGrowth = alignedData[alignedData.length - 1];
          
          // Color coding for quarterly growth rates
          let trendClass = styles.trendNeutral;
          
          if (key === 'q_sales_growth' || key === 'q_net_profit_growth') {
            // For growth metrics, positive is good
            trendClass = latestGrowth > 15 ? styles.trendPositive : 
                        latestGrowth < 0 ? styles.trendNegative : styles.trendNeutral;
          } else if (key === 'q_ebitda_margin') {
            // For margin metrics, higher is better
            trendClass = latestGrowth > 20 ? styles.trendPositive : 
                        latestGrowth < 10 ? styles.trendNegative : styles.trendNeutral;
          }

          return (
            <div key={key} className={styles.metricCard}>
              <div className={styles.chartContainer}>
                <MetricLineChart 
                  label={label} 
                  data={alignedData} 
                  labels={alignedQtrs} 
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