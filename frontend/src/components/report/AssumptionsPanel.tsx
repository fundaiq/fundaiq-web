'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';

export default function AssumptionsPanel() {
  const metrics = useGlobalStore((s) => Array.isArray(s.metrics) ? s.metrics[0] : s.metrics);
  const assumptions = useGlobalStore((s) => s.assumptions);
  const defaultAssumptions = useGlobalStore((s) => s.defaultAssumptions);
  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const triggerCalculation = useGlobalStore((s) => s.triggerCalculation);
  const resetAssumptions = useGlobalStore((s) => s.resetAssumptions);
  const setDefaultAssumptions = useGlobalStore((s) => s.setDefaultAssumptions);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (defaultAssumptions && Object.keys(defaultAssumptions).length > 0) {
      console.log("📊 assumption panel :", defaultAssumptions);
    }
  }, [metrics]);
  // ✅ Auto-calculate when assumptions change
  useEffect(() => {
    if (assumptions && Object.keys(assumptions).length > 0) {
      triggerCalculation(assumptions);
    }
  }, [assumptions]);

  const handleChange = (e) => {
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

    setAssumptions((prev) => ({
      ...prev,
      [name]: isNaN(safeValue) ? 0 : safeValue,
    }));
  };

  if (!metrics || !assumptions) {
    return (
      <section className="mt-8 px-4 max-w-6xl mx-auto">
        <div className="text-sm text-gray-500 italic">Waiting for data...</div>
      </section>
    );
  }

  useEffect(() => {
    if (assumptions && Object.keys(assumptions).length > 0) {
      triggerCalculation();
    }
  }, [assumptions]);

  return (
    <section className="mt-8 px-4 max-w-6xl mx-auto">
      {/* Header with toggle + reset */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          📊 Valuation Assumptions
        </h2>
        <div className="flex gap-2">
          <button
            onClick={resetAssumptions}
            className="text-xs bg-gray-100 dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded px-2 py-1 hover:bg-gray-200 dark:hover:bg-zinc-600"
          >
            Reset to Default
          </button>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-xs text-blue-600 border border-blue-300 dark:border-blue-700 rounded px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Assumptions Grid */}
      {visible && (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
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
    <div>
      <label htmlFor={name} className="block text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        inputMode="decimal"
        value={value ?? ''}
        onChange={onChange}
        className={`w-full rounded border px-2 py-1 text-black ${
          isChanged
            ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-900'
            : 'border-gray-300'
        }`}
      />
    </div>
  );
}
