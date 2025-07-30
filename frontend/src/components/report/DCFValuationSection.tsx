'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import ValuationSummary from '@/components/dcf/ValuationSummary';
import DCFTable from '@/components/dcf/DCFTable';
import SensitivityTable from '@/components/dcf/SensitivityTable';
import { Button } from '@/components/ui/button';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function DCFValuationSection() {
  const assumptions = useGlobalStore((s) => s.assumptions);
  const [form, setForm] = useState<any>({});
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [sensitivityData, setSensitivityData] = useState(null);

  const runValuation = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setValuationResult({
      ...data,
      current_price: assumptions.current_price // ✅ inject here
    });
  };

  useEffect(() => {
    if (assumptions && assumptions.latest_revenue) {
      const mapped = {
        base_revenue: assumptions.latest_revenue,
        latest_net_debt: assumptions.latest_net_debt,
        shares_outstanding: assumptions.shares_outstanding,
        ebit_margin: assumptions.ebit_margin,
        tax_rate: assumptions.tax_rate,
        capex_pct: assumptions.capex_pct,
        depreciation_pct: assumptions.depreciation_pct,
        wc_change_pct: assumptions.wc_change_pct,
        interest_pct: assumptions.interest_pct,
        x_years: assumptions.period_x,
        y_years: assumptions.period_y,
        growth_x: assumptions.growth_x,
        growth_y: assumptions.growth_y,
        growth_terminal: assumptions.growth_terminal
      };
      setForm(mapped);
    }
  }, [assumptions]);

  useEffect(() => {
    if (form?.base_revenue) {
      runValuation();
    }
  }, [form]);

  return (
    <section className="mb-10" id="dcf-valuation">
      <CollapsibleCard title="📥 DCF Value Projection">

        <div className="bg-white dark:bg-zinc-800 rounded-sm p-4 border dark:border-zinc-700 shadow mb-6">
          <h3 className="text-sm font-medium mb-2">📥 Inputs &  Assumptions</h3>
          <div className="grid md:grid-cols-3 gap-2">
            {Object.entries({
              current_price:'Current Market Price',
              base_revenue: 'Base Revenue (₹ Cr)',
              latest_net_debt: 'Net Debt (₹ Cr)',
              shares_outstanding: 'Shares Outstanding (Cr)',
              ebit_margin: 'EBIT Margin (%)',
              tax_rate: 'Tax Rate (%)',
              capex_pct: 'CapEx (% of Revenue)',
              depreciation_pct: 'Depreciation (% of Revenue)',
              wc_change_pct: 'Change in WC (%)',
              interest_pct: 'WACC (%)',
              x_years: 'High Growth Period (Phase 1)',
              growth_x: 'High Growth Rate (Phase 1)',
              y_years: 'Total Projection Period (Phase 2)',
              growth_y: 'Growth Rate - (Phase 2)',
              growth_terminal: 'Terminal Growth Rate (Phase 3)'
              
            }).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-normal mb-1">{label}</label>
                <input
                  type="number"
                  value={form[key] || ''}
                  onChange={(e) => setForm({ ...form, [key]: +e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900"
                />
              </div>
            ))}
          </div>
          <Button onClick={runValuation} className="mt-4">🔁 Recalculate Valuation</Button>
        </div>

        {valuationResult && (
          <>
            <ValuationSummary valuation={valuationResult} />
            <DCFTable table={valuationResult.fcf_table} />
            <SensitivityTable
              visible={showSensitivity}
              setVisible={setShowSensitivity}
              valuationResult={valuationResult}
              current_price={assumptions?.current_price || ''}
              form={form}
              setSensitivityData={setSensitivityData}
              sensitivityData={sensitivityData}
            />
          </>
        )}
      </CollapsibleCard> 
    </section>
  );
}
