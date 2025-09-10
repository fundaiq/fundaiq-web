'use client';

import React from 'react';
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
import { PieChart, Pie, Cell } from 'recharts';
import styles from '@/styles/ValuationOverview.module.css';

// ValuationGauge Component - Exact copy from ValuationOverview.tsx
function ValuationGauge({ fairValue, currentPrice, epsValue }: { fairValue: number; currentPrice: number; epsValue?: number }) {
  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);
  
  const margin = currentPrice > 0 ? ((fairValue - currentPrice) / currentPrice) * 100 : 0;
  const safety = margin;

  // Gauge data for visualization
  const gaugeData = [
    { name: 'Below', value: 33.33, color: '#10B981' },    // Green
    { name: 'Fair', value: 33.33, color: '#F59E0B' },     // Yellow  
    { name: 'Above', value: 33.34, color: '#EF4444' }     // Red
  ];

  // Determine current position for needle (0-100 scale, converted to 0-180 degrees)
  const getGaugePosition = () => {
    if (margin >= 50) return 15;      // Deep undervalued - far left
    if (margin >= 10) return 45;      // Undervalued - left side
    if (margin >= -10) return 90;     // Fair value - center
    if (margin >= -50) return 135;    // Overvalued - right side
    return 165;                       // Deep overvalued - far right
  };

  const needleAngle = getGaugePosition();

  return (
    <div>
      {/* Labels above gauge */}
      <div className={styles.gaugeLabels}>
        <span className={styles.gaugeLabelBelow}>Below</span>
        <span className={styles.gaugeLabelFair}>Fair</span>
        <span className={styles.gaugeLabelAbove}>Above</span>
      </div>

      {/* Gauge Chart */}
      <div className={styles.gaugeChart} style={{ position: 'relative' }}>
        <PieChart width={240} height={120}>
          <Pie
            data={gaugeData}
            cx={120}
            cy={120}
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        
        {/* Needle indicator - Fixed positioning */}
        <div 
          style={{
            position: 'absolute',
            bottom: '0px', /* Position at bottom of chart */
            left: '50%',
            width: '2px',
            height: '30px', /* Shorter needle */
            background: '#1f2937',
            transformOrigin: 'bottom center',
            transform: `translate(-50%, 0) rotate(${needleAngle}deg)`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '-6px',
            width: '14px',
            height: '14px',
            background: '#1f2937',
            borderRadius: '50%',
            border: '2px solid white',
          }} />
        </div>
      </div>

      {/* Safety badge */}
      <div className={`${styles.safetyBadge} ${
        safety > 10 ? styles.safetyPositive : 
        safety > -10 ? styles.safetyNeutral : 
        styles.safetyNegative
      }`}>
        Safety: {safety > 0 ? '+' : ''}{safety.toFixed(1)}%
      </div>
    </div>
  );
}

interface DemoGaugeProps {
  fairValue: number;
  currentPrice: number;
  epsValue?: number;
}

export default function DemoGauge({ fairValue, currentPrice, epsValue }: DemoGaugeProps) {
  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcfFairValue = safe(fairValue);
  const epsFairValue = safe(epsValue);
  const currentPriceValue = safe(currentPrice);

  const margin = currentPriceValue > 0 ? ((dcfFairValue - currentPriceValue) / currentPriceValue) * 100 : 0;
  
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

  const dcfVsCurrentPercent = currentPriceValue > 0 ? ((dcfFairValue - currentPriceValue) / currentPriceValue) * 100 : 0;
  const epsVsCurrentPercent = currentPriceValue > 0 ? ((epsFairValue - currentPriceValue) / currentPriceValue) * 100 : 0;

  return (
    <div className={styles.container} style={{ maxWidth: 'none', width: '100%' }}>
      {/* Header with status - Exact same as ValuationOverview */}
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
          <ValuationGauge fairValue={dcfFairValue} currentPrice={currentPriceValue} epsValue={epsFairValue} />
        </div>

        <div className={styles.valuesSection}>
          {/* Current Price Box */}
          <div className={`${styles.valueBox} ${styles.currentPriceBox}`}>
            <div className={styles.valueCenter}>
              <div className={styles.valueLabel}>Current Price</div>
              <div className={styles.valueAmount}>₹{currentPriceValue.toFixed(0)}</div>
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