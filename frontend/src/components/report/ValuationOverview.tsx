'use client';

import React, { useEffect, useRef } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { 
  Gauge, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  TrendingDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import styles from '@/styles/ValuationOverview.module.css';

// ValuationGauge Component
function ValuationGauge({ fairValue, currentPrice, epsValue }: { fairValue: number; currentPrice: number; epsValue?: number }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const safety = ((fairValue - currentPrice) / currentPrice) * 100;
  
  // Get CSS variable values from computed styles
  const getColorFromCSS = (varName: string) => {
    if (typeof window === 'undefined') return '#999';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  let meterValue;
  if (safety >= 50) {
    meterValue = Math.max(0, 20 - (safety - 50) / 5);
  } else if (safety >= 10) {
    meterValue = 20 + (50 - safety) * 0.5;
  } else if (safety >= -10) {
    meterValue = 40 + (10 - safety);
  } else if (safety >= -50) {
    meterValue = 60 + (-10 - safety) * 0.5;
  } else {
    meterValue = Math.min(100, 80 + (-50 - safety) / 5);
  }

  // Use CSS variables for colors
  const colorBands = [
    { range: [0, 20], color: getColorFromCSS('--color-positive') },
    { range: [20, 40], color: getColorFromCSS('--color-success') },
    { range: [40, 60], color: getColorFromCSS('--color-warning') },
    { range: [60, 80], color: getColorFromCSS('--color-error') },
    { range: [80, 100], color: getColorFromCSS('--color-negative') },
  ];

  const sectors = colorBands.map((band) => ({
    value: band.range[1] - band.range[0],
    fill: band.color,
  }));

  return (
    <div className={styles.gaugeContainer} ref={chartRef}>
      <div className={styles.gaugeChart}>
        <PieChart width={220} height={110}>
          <Pie
            data={sectors}
            cx={110}
            cy={110}
            startAngle={180}
            endAngle={0}
            innerRadius={44}
            outerRadius={82}
            paddingAngle={2}
            dataKey="value"
          >
            {sectors.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Sector
            cx={110}
            cy={110}
            innerRadius={0}
            outerRadius={38}
            startAngle={180 - (meterValue * 1.8) - 2}
            endAngle={180 - (meterValue * 1.8) + 2}
            fill={getColorFromCSS('--surface-primary')}
            stroke={getColorFromCSS('--text-primary')}
            strokeWidth={1}
          />
        </PieChart>
      </div>

      <div className={styles.gaugeLabels}>
        <span className={styles.gaugeLabelBelow}>Below</span>
        <span className={styles.gaugeLabelFair}>Fair</span>
        <span className={styles.gaugeLabelAbove}>Above</span>
      </div>

      <div className={`${styles.safetyBadge} ${
        safety > 20 ? styles.safetyPositive : 
        safety > -10 ? styles.safetyNeutral : 
        styles.safetyNegative
      }`}>
        Safety: {safety > 0 ? '+' : ''}{safety.toFixed(1)}%
      </div>
    </div>
  );
}

export default function ValuationOverview() {
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcfFairValue = safe(results?.dcf?.dcf_fair_value);
  const epsFairValue = safe(results?.eps?.eps_fair_value);
  const currentPrice = safe(metrics?.current_price);

  const margin = currentPrice > 0 ? ((dcfFairValue - currentPrice) / currentPrice) * 100 : 0;
  
  const getValuationStatus = () => {
    if (margin >= 50) return { 
      status: 'Analysis: Significantly Below Models', 
      style: styles.statusGreen,
      icon: CheckCircle 
    };
    if (margin >= 10) return { 
      status: 'Analysis: Below Model Values', 
      style: styles.statusGreen,
      icon: TrendingUp 
    };
    if (margin >= -10) return { 
      status: 'Analysis: Near Model Values', 
      style: styles.statusYellow,
      icon: Target 
    };
    if (margin >= -50) return { 
      status: 'Analysis: Above Model Values', 
      style: styles.statusRed,
      icon: AlertTriangle 
    };
    return { 
      status: 'Analysis: Significantly Above Models', 
      style: styles.statusRed,
      icon: TrendingDown 
    };
  };

  const valuationStatus = getValuationStatus();
  const StatusIcon = valuationStatus.icon;

  // Empty state
  if (!currentPrice && !dcfFairValue && !epsFairValue) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrapper}>
              <Gauge className={styles.icon} />
            </div>
            <h2 className={styles.title}>Valuation Analysis</h2>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>
            Analysis will appear here once data is loaded
          </div>
        </div>
      </div>
    );
  }

  const dcfVsCurrentPercent = currentPrice > 0 ? ((dcfFairValue - currentPrice) / currentPrice) * 100 : 0;
  const epsVsCurrentPercent = currentPrice > 0 ? ((epsFairValue - currentPrice) / currentPrice) * 100 : 0;

  return (
    <div className={styles.container}>
      {/* Header with status */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <Gauge className={styles.icon} />
          </div>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>Valuation Analysis</h2>
            <div className={styles.statusContainer}>
              <StatusIcon className={`${styles.statusIcon} ${valuationStatus.style}`} />
              <span className={`${styles.statusText} ${valuationStatus.style}`}>
                {valuationStatus.status}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.marginDisplay}>
          <div className={`${styles.marginValue} ${valuationStatus.style}`}>
            {margin > 0 ? '+' : ''}{margin.toFixed(1)}%
          </div>
          <p className={styles.marginLabel}>vs Current</p>
        </div>
      </div>

      {/* Main content - Desktop: side by side, Mobile: stacked */}
      <div className={styles.mainContent}>
        <div className={styles.gaugeSection}>
          <ValuationGauge fairValue={dcfFairValue} currentPrice={currentPrice} epsValue={epsFairValue} />
        </div>

        <div className={styles.valuesSection}>
          {/* Current Price Box */}
          <div className={`${styles.valueBox} ${styles.currentPriceBox}`}>
            <div className={styles.valueCenter}>
              <div className={styles.valueLabel}>Current Price</div>
              <div className={styles.valueAmount}>₹{currentPrice.toFixed(0)}</div>
            </div>
          </div>

          {/* DCF Fair Value */}
          <div className={`${styles.valueBox} ${styles.dcfValueBox}`}>
            <div className={styles.valueHeader}>
              <div>
                <div className={styles.valueLabel}>DCF Model Value</div>
                <div className={styles.valueAmount}>₹{dcfFairValue.toFixed(0)}</div>
              </div>
              <div className={`${styles.valueChange} ${
                dcfVsCurrentPercent >= 0 ? styles.changePositive : styles.changeNegative
              }`}>
                {dcfVsCurrentPercent >= 0 ? 
                  <ArrowUp className={styles.changeIcon} /> : 
                  <ArrowDown className={styles.changeIcon} />
                }
                <span>
                  {dcfVsCurrentPercent >= 0 ? '+' : ''}{dcfVsCurrentPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* EPS Fair Value */}
          <div className={`${styles.valueBox} ${styles.epsValueBox}`}>
            <div className={styles.valueHeader}>
              <div>
                <div className={styles.valueLabel}>EPS Model Value</div>
                <div className={styles.valueAmount}>₹{epsFairValue.toFixed(0)}</div>
              </div>
              <div className={`${styles.valueChange} ${
                epsVsCurrentPercent >= 0 ? styles.changePositive : styles.changeNegative
              }`}>
                {epsVsCurrentPercent >= 0 ? 
                  <ArrowUp className={styles.changeIcon} /> : 
                  <ArrowDown className={styles.changeIcon} />
                }
                <span>
                  {epsVsCurrentPercent >= 0 ? '+' : ''}{epsVsCurrentPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerText}>Model Assessment Only</span>
        <span className={`${styles.footerText} ${styles.footerEmphasis}`}>
          No Buy/Sell/Hold Recommendations
        </span>
      </div>
    </div>
  );
}