'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/AssumptionsPanel.module.css';

export default function AssumptionsPanel() {
  const metrics = useGlobalStore((s) => Array.isArray(s.metrics) ? s.metrics[0] : s.metrics);
  const assumptions = useGlobalStore((s) => s.assumptions);
  const defaultAssumptions = useGlobalStore((s) => s.defaultAssumptions);

  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const triggerCalculation = useGlobalStore((s) => s.triggerCalculation);
  const resetAssumptions = useGlobalStore((s) => s.resetAssumptions);
  const setDefaultAssumptions = useGlobalStore((s) => s.setDefaultAssumptions);

  // Listen so we can disable the button while a run is in-flight
  const calculationTriggered = useGlobalStore((s) => s.calculationTriggered);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (defaultAssumptions && Object.keys(defaultAssumptions).length > 0) {
      
    }
  }, [defaultAssumptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = parseFloat(value.replace(/,/g, ''));
    const percentFields = [
      'ebit_margin', 'tax_rate', 'capex_pct',
      'depreciation_pct', 'interest_exp_pct',
      'interest_pct', 'wacc', 'growth_x',
      'growth_y', 'growth_terminal'
    ];
    const safeValue = percentFields.includes(name)
      ? Math.min(Math.max(parsed, 0), 100)
      : parsed;

    setAssumptions((prev: any) => ({
      ...prev,
      [name]: isNaN(safeValue) ? 0 : safeValue,
    }));
  };

  // Manual calculate to ensure DCF + EPS (and sensitivities) run with the latest assumptions
  const handleCalculate = () => {
    if (!assumptions || Object.keys(assumptions).length === 0) return;
    triggerCalculation(assumptions); // DCF/EPS sections will read this and re-run using current store values
  };

  if (!metrics || !assumptions) {
    return (
      <section className={styles.panel}>
        <div className="text-sm text-tertiary italic">Waiting for data...</div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      {/* Header with toggle + actions */}
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>
          <span className={styles.headerIcon}>📊</span>
          Valuation Assumptions
        </h2>
        <div className={styles.buttonGroup}>
          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={calculationTriggered}
            className={`${styles.button} ${styles.buttonPrimary}`}
            title="Run DCF & EPS with current assumptions"
          >
            {calculationTriggered ? 'Calculating…' : 'Calculate'}
          </button>

          {/* Reset Button */}
          <button
            onClick={resetAssumptions}
            className={`${styles.button} ${styles.buttonSecondary}`}
            title="Reset to your saved defaults"
          >
            Reset to Default
          </button>
          
        </div>
      </div>

      {/* Assumptions Grid */}
      {visible && (
        <div className={styles.contentContainer}>
          <div className={styles.inputGrid}>
            {fields.map((field) => (
              <Input
                key={field.name}
                label={field.label}
                name={field.name}
                value={assumptions[field.name]}
                defaultValue={defaultAssumptions?.[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const fields = [
  { label: 'Base Rev (₹ Cr)', name: 'base_revenue' },
  { label: 'Net Debt (₹ Cr)', name: 'latest_net_debt' },
  { label: 'EBIT Margin (%)', name: 'ebit_margin' },
  { label: 'Tax Rate (%)', name: 'tax_rate' },
  { label: 'CapEx (% of Revenue)', name: 'capex_pct' },
  { label: 'Depreciation (% of Revenue)', name: 'depreciation_pct' },
  { label: 'Interest Expense % of EBIT', name: 'interest_exp_pct' },
  { label: 'Change in WC (%)', name: 'wc_change_pct' },
  { label: 'WACC (%)', name: 'interest_pct' },
  { label: 'Growth Rate (Years 1–3) (%)', name: 'growth_x' },
  { label: 'Growth Rate (Years 4–10) (%)', name: 'growth_y' },
  { label: 'Terminal Growth Rate (%)', name: 'growth_terminal' },
];

function Input({ label, name, value, defaultValue, onChange }) {
  const isChanged =
    typeof value === 'number' &&
    typeof defaultValue === 'number' &&
    value.toFixed(2) !== defaultValue.toFixed(2);

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={name} className={styles.inputLabel}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        inputMode="decimal"
        value={value ?? ''}
        onChange={onChange}
        className={`${styles.input} ${isChanged ? styles.inputChanged : ''}`}
      />
    </div>
  );
}