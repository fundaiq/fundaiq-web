'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { Button } from '@/components/ui/button';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function EPSValuationSection() {
  const assumptions = useGlobalStore((state) => state.assumptions);
  const [projection, setProjection] = useState<any>(null);
  const [form, setForm] = useState({
    base_revenue: '',
    base_year: '',
    projection_years: '5',
    revenue_growth: '',
    ebit_margin: '',
    interest_exp: '',
    tax_rate: '',
    shares_outstanding: '',
    current_price: '',
  });

  useEffect(() => {
    if (Object.keys(assumptions).length > 0) {
      setForm({
        base_revenue: assumptions.latest_revenue || '',
        base_year: assumptions.base_year || '',
        projection_years: '5',
        revenue_growth: assumptions.revenue_growth || '',
        ebit_margin: assumptions.ebit_margin || '',
        interest_exp: assumptions.interest_exp || '',
        tax_rate: assumptions.tax_rate || '',
        shares_outstanding: assumptions.shares_outstanding || '',
        current_price: assumptions.current_price || '',
      });
    }
  }, [assumptions]);

  const handleProject = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project-eps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          base_year: form.base_year?.toString(),
          base_revenue: +form.base_revenue,
          revenue_growth: +form.revenue_growth,
          ebit_margin: +form.ebit_margin,
          interest_exp: +form.interest_exp,
          tax_rate: +form.tax_rate,
          shares_outstanding: +form.shares_outstanding,
          current_price: +form.current_price,
          projection_years: +form.projection_years,
        }),
      });
      const data = await response.json();
      setProjection(data);
    } catch (err) {
      console.error('EPS projection failed:', err);
    }
  };

  return (
    <section className="mb-10" id="eps-projection">
      <CollapsibleCard title="📈 EPS Projection">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border dark:border-zinc-700 shadow mb-6">
          <h3 className="text-lg font-medium mb-4">📥 EPS Assumptions & Inputs</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries({
              base_revenue: 'Base Revenue (₹ Cr)',
              projection_years: 'Projection Years',
              revenue_growth: 'Revenue Growth (%)',
              ebit_margin: 'EBIT Margin (%)',
              interest_exp: 'Interest Expense (₹ Cr)',
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
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-zinc-900"
                />
              </div>
            ))}
          </div>
          <Button onClick={handleProject} className="mt-4">📊 Project EPS</Button>
        </div>
        

        {projection?.projection_table && (
          <div className="overflow-x-auto text-sm">
            <h3 className="text-md font-semibold mb-2">EPS Projection Table</h3>
            <table className="w-full border">
              <thead className="bg-gray-100 dark:bg-zinc-700">
                <tr>
                  <th>Year</th>
                  <th>Revenue</th>
                  <th>EBIT</th>
                  <th>Interest</th>
                  <th>Tax</th>
                  <th>Net Profit</th>
                  <th>EPS</th>
                  <th>PE (Projected)</th>
                </tr>
              </thead>
              <tbody>
                {projection.projection_table.map((row: any, i: number) => (
                  <tr key={i} className="text-center border-t">
                    <td>{row.year}</td>
                    <td>{row.revenue}</td>
                    <td>{row.ebit}</td>
                    <td>{row.interest}</td>
                    <td>{row.tax}</td>
                    <td>{row.net_profit}</td>
                    <td>{row.eps}</td>
                    <td>{row.pe || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {projection?.sensitivity_eps && (
          <div className="mt-8">
            <h3 className="text-md font-semibold mb-2">Sensitivity Table A: EPS</h3>
            <table className="table-auto w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-700">
                  <th>EBIT \ Growth</th>
                  {projection.sensitivity_eps.growth_options.map((g: any, j: number) => (
                    <th key={j}>{g}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projection.sensitivity_eps.matrix.map((row: any[], i: number) => (
                  <tr key={i} className="text-center">
                    <td>{projection.sensitivity_eps.margin_options[i]}%</td>
                    {row.map((val: any, j: number) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {projection?.sensitivity_price && (
          <div className="mt-8">
            <h3 className="text-md font-semibold mb-2">Sensitivity Table B: Target Price</h3>
            <table className="table-auto w-full border text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-700">
                  <th>EPS \ PE</th>
                  {projection.sensitivity_price.pe_options.map((pe: any, j: number) => (
                    <th key={j}>{pe}x</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projection.sensitivity_price.matrix.map((row: any[], i: number) => (
                  <tr key={i} className="text-center">
                    <td>₹{projection.sensitivity_price.eps_options[i]}</td>
                    {row.map((val: any, j: number) => (
                      <td key={j}>₹{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleCard> 
    </section>
  );
}
