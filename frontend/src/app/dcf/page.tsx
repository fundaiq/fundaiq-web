'use client';

import { useState, useEffect } from 'react';
import Disclaimer from '@/components/Disclaimer';
import { useGlobalStore } from '@/store/globalStore';
import ValuationSummary from '@/components/dcf/ValuationSummary';
import DCFTable from '@/components/dcf/DCFTable';
import SensitivityTable from '@/components/dcf/SensitivityTable';

const formatINR = (num: number) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function DCFPage() {
  const assumptions = useGlobalStore((state) => state.assumptions);

  const [form, setForm] = useState<any>({});
  const [currentPrice, setCurrentPrice] = useState('');
  const [valuationResult, setValuationResult] = useState<any | null>(null);
  const [sensitivityData, setSensitivityData] = useState<any | null>(null);
  const [showSensitivity, setShowSensitivity] = useState(false);

  const loadFromStore = () => {
    if (Object.keys(assumptions).length > 0) {
      const safe = (val: any) => val === null || val === undefined || isNaN(val) ? '' : String(val);
      setForm({
        ticker: '',
        base_revenue: safe(assumptions.latest_revenue),
        net_debt: safe(assumptions.latest_net_debt),
        shares_outstanding: safe(assumptions.shares_outstanding),
        ebit_margin: safe(assumptions.ebit_margin),
        depreciation_pct: safe(assumptions.depreciation_pct),
        capex_pct: safe(assumptions.capex_pct),
        wc_change_pct: safe(assumptions.wc_change_pct),
        tax_rate: safe(assumptions.tax_rate),
        interest_pct: safe(assumptions.interest_pct),
        x_years: safe(assumptions.period_x),
        growth_x: safe(assumptions.growth_x),
        y_years: safe(assumptions.period_y),
        growth_y: safe(assumptions.growth_y),
        growth_terminal: safe(assumptions.growth_terminal),
      });
      setCurrentPrice(safe(assumptions.current_price));
    }
  };

  useEffect(() => {
    loadFromStore();
  }, [assumptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const runValuation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          base_revenue: parseFloat(form.base_revenue),
          net_debt: parseFloat(form.net_debt),
          shares_outstanding: parseFloat(form.shares_outstanding),
          ebit_margin: parseFloat(form.ebit_margin),
          depreciation_pct: parseFloat(form.depreciation_pct),
          capex_pct: parseFloat(form.capex_pct),
          wc_change_pct: parseFloat(form.wc_change_pct),
          tax_rate: parseFloat(form.tax_rate),
          interest_pct: parseFloat(form.interest_pct),
          x_years: parseInt(form.x_years),
          growth_x: parseFloat(form.growth_x),
          y_years: parseInt(form.y_years),
          growth_y: parseFloat(form.growth_y),
          growth_terminal: parseFloat(form.growth_terminal),
        }),
      });
      const data = await res.json();
      setValuationResult(data);
    } catch (err) {
      console.error('Valuation failed', err);
      setValuationResult(null);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-white text-black dark:bg-zinc-900 dark:text-white">
      <Disclaimer />
      <h1 className="text-2xl font-bold mb-4">📊 DCF Valuation</h1>

      {assumptions.company_name && (
        <div className="text-xl font-semibold text-center mb-4">
          🏷️ {assumptions.company_name}
        </div>
      )}

      <button
        onClick={loadFromStore}
        className="mt-2 mb-4 bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300"
      >
        🔄 Load Assumptions from Store
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries({
          base_revenue: 'Latest Annual Revenue',
          net_debt: 'Net Debt',
          shares_outstanding: 'Shares Outstanding (Cr)',
          ebit_margin: 'EBIT Margin (%)',
          depreciation_pct: 'Depreciation (% of Revenue)',
          capex_pct: 'CapEx (% of Revenue)',
          wc_change_pct: 'Change in WC (% of Revenue)',
          tax_rate: 'Tax Rate (%)',
          interest_pct: 'WACC (%)',
          x_years: 'High Growth Period (X years)',
          growth_x: 'Growth Rate in X years (%)',
          y_years: 'Total Projection Period (Y years)',
          growth_y: 'Growth Rate from X to Y years (%)',
          growth_terminal: 'Terminal Growth Rate (%)'
        }).map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="number"
              name={name}
              value={form[name] || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
            />
          </div>
        ))}
      </div>

      <div className="mb-4 mt-4">
        <label className="block text-sm font-medium mb-1">Current Market Price (₹)</label>
        <input
          type="number"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(e.target.value)}
          className="w-full p-2 border rounded bg-white text-black dark:bg-zinc-800 dark:text-white"
          placeholder="e.g. 712.50"
        />
      </div>

      {Object.keys(assumptions).length > 0 && (
        <div className="mt-4 p-3 border-l-4 text-sm rounded bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-100 border-blue-400 dark:border-blue-300">
          📂 Assumptions auto-filled from uploaded data. You can review or click Load to reset.
        </div>
      )}

      {assumptions.missing_fields?.length > 0 && (
        <div className="mt-2 p-3 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-sm rounded">
          ⚠️ Some values couldn't be extracted: <strong>{assumptions.missing_fields.join(", ")}</strong>.
        </div>
      )}

      <button
        onClick={runValuation}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Run Valuation
      </button>

      {valuationResult && (
        <>
          <ValuationSummary result={valuationResult} currentPrice={currentPrice} />
          <DCFTable data={valuationResult.fcf_table} />
        </>
      )}

      {valuationResult && (
        <SensitivityTable
          visible={showSensitivity}
          setVisible={setShowSensitivity}
          valuationResult={valuationResult}
          currentPrice={currentPrice}
          form={form}
          setSensitivityData={setSensitivityData}
          sensitivityData={sensitivityData}
        />
      )}
    </main>
  );
}
