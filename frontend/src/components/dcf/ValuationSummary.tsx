'use client';

import PhaseSplitChart from './PhaseSplitChart';
import { useGlobalStore } from '@/store/globalStore';
import { AlertTriangle, TrendingUp, Target, Calculator, DollarSign } from 'lucide-react';
import styles from '@/styles/ValuationSummary.module.css';

export default function ValuationSummary() {
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcf_fair_value = safe(results?.dcf?.dcf_fair_value);
  const fv_phase1_per_share = safe(results?.dcf?.fv_phase1_per_share);
  const fv_phase2_per_share = safe(results?.dcf?.fv_phase2_per_share);
  const terminal_value_per_share = safe(results?.dcf?.terminal_value_per_share);

  const current_price = safe(metrics?.current_price);

  
  const dcfProjected10Years = safe(results?.dcf?.phase1_pv)+safe(results?.dcf?.phase2_pv); // Total 10-year DCF value
  const terminalValue = safe(results?.dcf?.terminal_value_pv); // Terminal value
  const totalEquityValue = safe(results?.dcf?.equity_value); // Total equity value
  const netDebt = safe(results?.dcf?.latest_net_debt); // Net debt
  const totalEnterpriseValue = safe(results?.dcf?.enterprise_value); // Enterprise value
  const outstandingShares = safe(results?.dcf?.shares_outstanding); // Outstanding shares
  const fairValuePerShare = safe(results?.dcf?.dcf_fair_value); // DCF fair value per share

  const total = dcf_fair_value;
  const pct1 = (fv_phase1_per_share / total) * 100;
  const pct2 = (fv_phase2_per_share / total) * 100;
  const pct3 = (terminal_value_per_share / total) * 100;

  const diffPct = current_price
    ? ((dcf_fair_value - current_price) / current_price) * 100
    : NaN;

  // Enhanced verdict logic with styling
  const getVerdictInfo = () => {
    if (isNaN(diffPct) || !current_price) {
      return {
        verdict: 'Price Not Available',
        icon: '⚠️',
        className: styles.verdictUnavailable,
        description: 'Current market price is not available for comparison with our DCF fair value calculation.',
        metrics: []
      };
    }

    if (diffPct > 15) {
      return {
        verdict: 'Potentially Undervalued',
        icon: '✅',
        className: styles.verdictUndervalued,
        description: `Our DCF model suggests the fair value is significantly higher than the current market price.`,
        metrics: [
          { label: 'Upside Potential', value: `+${diffPct.toFixed(1)}%` },
          { label: 'Fair Value', value: `₹${dcf_fair_value.toFixed(1)}` },
          { label: 'Current Price', value: `₹${current_price.toFixed(1)}` }
        ]
      };
    }

    if (diffPct < -15) {
      return {
        verdict: 'Potentially Overvalued',
        icon: '❌',
        className: styles.verdictOvervalued,
        description: `Our DCF model suggests the current market price is higher than the calculated fair value.`,
        metrics: [
          { label: 'Downside Risk', value: `${diffPct.toFixed(1)}%` },
          { label: 'Fair Value', value: `₹${dcf_fair_value.toFixed(1)}` },
          { label: 'Current Price', value: `₹${current_price.toFixed(1)}` }
        ]
      };
    }

    return {
      verdict: 'Fairly Valued',
      icon: '⚖️',
      className: styles.verdictFairly,
      description: `Our DCF model suggests the current market price is close to the calculated fair value.`,
      metrics: [
        { label: 'Price Difference', value: `${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%` },
        { label: 'Fair Value', value: `₹${dcf_fair_value.toFixed(1)}` },
        { label: 'Current Price', value: `₹${current_price.toFixed(1)}` }
      ]
    };
  };

  const verdictInfo = getVerdictInfo();

  // Error state
  if (!dcf_fair_value) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>📊</div>
        <div className={styles.errorMessage}>
          DCF valuation data is not available. Please ensure the analysis has been calculated.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Fair Value Display */}
      <div className={styles.summaryHeader}>
        <div className={styles.fairValueDisplay}>
          <div className={styles.fairValueMain}>
            <div className={styles.fairValueLabel}>DCF Fair Value per Share</div>
            <div className={styles.fairValueAmount}>
              <span className={styles.fairValueCurrency}>₹</span>
              {dcf_fair_value.toFixed(1)}
            </div>
          </div>
          
          {current_price > 0 && (
            <div className={styles.comparisonBox}>
              <div className={styles.currentPriceLabel}>Current Price</div>
              <div className={styles.currentPriceValue}>₹{current_price.toFixed(1)}</div>
              <div className={`${styles.differenceValue} ${
                diffPct > 0 ? styles.differencePositive :
                diffPct < 0 ? styles.differenceNegative :
                styles.differenceNeutral
              }`}>
                {diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DCF Breakdown Details */}
      <div className={styles.dcfBreakdown}>
        <div className={styles.breakdownHeader}>
          <Calculator className={styles.breakdownIcon} />
          <h4 className={styles.breakdownTitle}>DCF Valuation Breakdown</h4>
        </div>
        
        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Total Projected 10-Year DCF Value : </span>
            <span className={styles.breakdownValue}>₹{dcfProjected10Years.toLocaleString()}&nbsp;Cr</span>
            
          </div>
          
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Terminal Value : </span>
            <span className={styles.breakdownValue}>₹{terminalValue.toLocaleString()} Cr</span>
          </div>
          
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Total Enterprise Value : </span>
            <span className={styles.breakdownValue}>₹{totalEnterpriseValue.toLocaleString()} Cr</span>
          </div>
          
          <div className={styles.breakdownCalculation}>
            <span className={styles.calculationLabel}>Total Equity Value : </span>
            <span className={styles.calculationFormula}>
              Enterprise Value - Net Debt = ₹{totalEnterpriseValue.toLocaleString()} Cr - ₹{netDebt.toLocaleString()}Cr = ₹{totalEquityValue.toLocaleString()}Cr
            </span>
          </div>
          
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Outstanding Shares : </span>
            <span className={styles.breakdownValue}>{outstandingShares.toLocaleString()} Cr shares</span>
          </div>
          
          <div className={styles.fairValueCalculation}>
            <div className={styles.calculationContent}>
              <span className={styles.calculationLabel}>DCF Fair Value per Share : </span>
              <span className={styles.calculationResult}>₹{fairValuePerShare}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartSection}>
        <PhaseSplitChart
          phase1={fv_phase1_per_share}
          phase2={fv_phase2_per_share}
          phase3={terminal_value_per_share}
          total={dcf_fair_value}
        />
      </div>

      {/* Verdict */}
      <div className={`${styles.verdictBox} ${verdictInfo.className}`}>
        <div className={styles.verdictHeader}>
          <span className={styles.verdictIcon}>{verdictInfo.icon}</span>
          <span className={styles.verdictTitle}>{verdictInfo.verdict}</span>
        </div>
        <p className={styles.verdictDescription}>{verdictInfo.description}</p>
        
        {verdictInfo.metrics && verdictInfo.metrics.length > 0 && (
          <div className={styles.verdictMetrics}>
            {verdictInfo.metrics.map((metric, index) => (
              <div key={index} className={styles.verdictMetric}>
                <span className={styles.metricLabel}>{metric.label}:</span>
                <span className={styles.metricValue}>{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}