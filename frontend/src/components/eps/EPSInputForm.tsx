'use client';
import { Button } from '@/components/ui/button';

export default function EPSInputForm({ form, setForm, handleProject }: any) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border dark:border-zinc-700 shadow mb-6">
      <h3 className="text-lg font-medium mb-4">📥 EPS Assumptions & Inputs</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries({
          base_revenue: 'Base Revenue (₹ Cr)',
          projection_years: 'Projection Years',
          revenue_growth: 'Revenue Growth (%)',
          ebit_margin: 'EBIT Margin (%)',
          interest_exp_pct: 'Interest Expense % of EBIT (₹ Cr)',
          tax_rate: 'Tax Rate (%)',
          shares_outstanding: 'Shares Outstanding (Cr)',
          current_price: 'Current Market Price (₹)',
        }).map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="number"
              name={key}
              value={(form as any)[key] || ''}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, [key]: e.target.value }))
              }
              className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900"
            />
          </div>
        ))}
      </div>
      <Button onClick={handleProject} className="mt-4">
        📊 Project EPS
      </Button>
    </div>
  );
}
