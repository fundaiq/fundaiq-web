'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import ValuationSummary from '@/components/dcf/ValuationSummary';
import DCFTable from '@/components/dcf/DCFTable';
import SensitivityTable from '@/components/dcf/SensitivityTable';
import { Calculator, TrendingUp, Lightbulb } from 'lucide-react';
import styles from '@/styles/DCFValuationSection.module.css';

export default function DCFValuationSection() {
  const raw = useGlobalStore((s) => s.metrics);
  const metrics = Array.isArray(raw) ? raw[0] : raw;
  const calcToken = useGlobalStore((s) => s.calcToken); 
  const assumptions = useGlobalStore((s) => s.assumptions);
  const setValuationResults = useGlobalStore((s) => s.setValuationResults);

  const calculationTriggered = useGlobalStore((s) => s.calculationTriggered);
  const resetCalculation = useGlobalStore((s) => s.resetCalculation);
  const valuationResult = useGlobalStore((s) => s.valuationResults?.dcf);

  const [sensitivityData, setSensitivityData] = useState<any>(null);

  const form = {
    current_price: metrics?.current_price ?? 0, // still from metrics
    base_revenue: assumptions?.base_revenue ?? 0,
    latest_net_debt: assumptions?.latest_net_debt ?? 0,
    shares_outstanding: metrics?.shares_outstanding ?? 1, // safe to keep from metrics
    ebit_margin: assumptions?.ebit_margin ?? 0,
    depreciation_pct: assumptions?.depreciation_pct ?? 0,
    capex_pct: assumptions?.capex_pct ?? 0,
    wc_change_pct: assumptions?.wc_change_pct ?? 0,

    tax_rate: assumptions?.tax_rate ?? 25,
    interest_pct: assumptions?.interest_pct ?? 0,
    x_years: 3,
    growth_x: assumptions?.growth_x ?? 0,
    y_years: 10,
    growth_y: assumptions?.growth_y ?? 0,
    growth_terminal: assumptions?.growth_terminal ?? 2,
  };

  const runValuation = async () => {
    // 🔑 always read the latest from the store at call time
    const st = useGlobalStore.getState();
    const rawMetrics = st.metrics;
    const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
    const a = st.assumptions || {};

    const form = {
      current_price: Number(metrics?.current_price ?? 0),
      base_revenue: Number(a.base_revenue ?? 0),
      latest_net_debt: Number(a.latest_net_debt ?? 0),
      shares_outstanding: Number(metrics?.shares_outstanding ?? 1),

      ebit_margin: Number(a.ebit_margin ?? 0),
      depreciation_pct: Number(a.depreciation_pct ?? 0),
      capex_pct: Number(a.capex_pct ?? 0),
      wc_change_pct: Number(a.wc_change_pct ?? 0),

      tax_rate: Number(a.tax_rate ?? 25),
      interest_pct: Number(a.interest_pct ?? 0),

      // fixed horizons per your app
      x_years: 3,
      growth_x: Number(a.growth_x ?? 0),
      y_years: 10,
      growth_y: Number(a.growth_y ?? 0),
      growth_terminal: Number(a.growth_terminal ?? 2),
    };

    if (!form.base_revenue) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const raw = await res.json();
    const data = Array.isArray(raw) ? raw[0] : raw;

    setValuationResults((prev) => ({
      ...prev,
      dcf: { ...data },
      dcf_sensitivity: { ...(data?.sensitivity_table || {}) },
    }));

    resetCalculation();
  };

  useEffect(() => {
    runValuation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcToken]);

  return (
    <section className={styles.container} id="dcf-valuation">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <Calculator className={styles.icon} />
          </div>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>DCF Valuation</h2>
            <p className={styles.subtitle}>Discounted Cash Flow Analysis</p>
          </div>
        </div>
        <div className={`${styles.statusBadge} ${valuationResult ? styles.statusActive : styles.statusPending}`}>
          {valuationResult ? 'Complete' : 'Pending'}
        </div>
      </div>

      {/* Main Content */}
      {valuationResult ? (
        <div className={styles.contentWrapper}>
          {/* Valuation Summary Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <TrendingUp className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Valuation Summary</h3>
            </div>
            <ValuationSummary valuation={valuationResult?.dcf} />
          </div>

          {/* DCF Table Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Calculator className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Cash Flow Projections</h3>
            </div>
            <DCFTable table={valuationResult?.fcf_table} />
          </div>

          {/* Sensitivity Analysis Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <TrendingUp className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Sensitivity Analysis</h3>
            </div>
            <SensitivityTable
              valuationResult={valuationResult}
              current_price={metrics?.current_price || ''}
              form={form}
              setSensitivityData={setSensitivityData}
              sensitivityData={sensitivityData}
            />
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Lightbulb className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>DCF Analysis Ready</h3>
          <p className={styles.emptyMessage}>
            Your discounted cash flow analysis will appear here once you calculate the valuation using the assumptions panel.
          </p>
          <div className={styles.emptyCallout}>
            <Calculator className={styles.emptyCalloutIcon} />
            <span>Click "Calculate" in the assumptions panel to generate your DCF analysis</span>
          </div>
        </div>
      )}
    </section>
  );
}