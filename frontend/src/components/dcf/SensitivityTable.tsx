'use client';

import { useEffect } from 'react';
import { useGlobalStore } from '@/store/globalStore';
type Props = {
  valuationResult: any;
  current_price: string;
  form: any;
  setSensitivityData: (data: any) => void;
  sensitivityData: any;
};

export default function SensitivityTable({
  valuationResult,
  current_price,
  form,
  setSensitivityData,
  sensitivityData
}: Props) {
  
  
  const fetchSensitivity = async () => {
    

    const requiredKeys = [
      "base_revenue", "latest_net_debt", "shares_outstanding",
      "depreciation_pct", "capex_pct", "wc_change_pct",
      "tax_rate", "interest_pct", "x_years", "y_years",
      "growth_y", "ebit_margin", "growth_terminal"
    ];

    const missing = requiredKeys.filter((key) => form[key] === undefined || form[key] === null);
    if (missing.length > 0) {
      console.warn("⚠️ Required fields missing in form:", form);
      console.warn("Missing keys:", missing);
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf/sensitivity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_revenue: Number(form.base_revenue),
        latest_net_debt: Number(form.latest_net_debt),
        shares_outstanding: Number(form.shares_outstanding),
        depreciation_pct: Number(form.depreciation_pct),
        capex_pct: Number(form.capex_pct),
        wc_change_pct: Number(form.wc_change_pct),
        tax_rate: Number(form.tax_rate),
        interest_pct: Number(form.interest_pct),
        x_years: Number(form.x_years),
        y_years: Number(form.y_years),
        growth_y: Number(form.growth_y),
        ebit_margin: Number(form.ebit_margin),
        growth_terminal: Number(form.growth_terminal),
      }),
    });

    const data = await res.json();
    setSensitivityData(data);
  };

  useEffect(() => {
    if (form?.base_revenue && !sensitivityData) {
      fetchSensitivity();
    }
  }, [form]);

  if (!valuationResult || !sensitivityData) return null;

  return (
    <div className="mt-6 border rounded shadow p-4 bg-white dark:bg-zinc-800">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">📊 Sensitivity Analysis</h3>
      <div className="overflow-auto max-w-full">
        <table className="border-collapse text-sm w-full">
          <thead>
            <tr>
              <th className="p-2 border bg-gray-200 dark:bg-zinc-700 dark:text-white sticky left-0">
                EBIT ↓ / Growth →
              </th>
              {Array.isArray(sensitivityData?.growth_values) &&
                sensitivityData.growth_values.map((g: number, i: number) => (
                  <th key={i} className="p-2 border bg-gray-100 dark:bg-zinc-700 dark:text-white">
                    {g}%
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sensitivityData?.ebit_values) &&
              sensitivityData.ebit_values.map((ebit: number, rowIdx: number) => (
                <tr key={rowIdx}>
                  <td className="p-2 border font-medium sticky left-0 bg-white dark:bg-zinc-800 dark:text-white">
                    {ebit.toFixed(2)}%
                  </td>
                  {Array.isArray(sensitivityData?.fair_values?.[rowIdx]) &&
                    sensitivityData.fair_values[rowIdx].map((val: number, colIdx: number) => {
                      const fv = val;
                      const cp = parseFloat(current_price || '0');
                      const isCloseToMarket = Math.abs(fv - cp) / cp < 0.15;
                      const isUserInputs =
                        ebit === parseFloat(form.ebit_margin) &&
                        sensitivityData.growth_values[colIdx] === parseFloat(form.growth_y);

                      let bg = 'bg-white dark:bg-zinc-800';
                      if (isCloseToMarket) bg = 'bg-yellow-100 dark:bg-yellow-600';
                      else if (fv > cp) bg = 'bg-green-100 dark:bg-green-700';
                      else if (fv < cp) bg = 'bg-red-100 dark:bg-red-900';

                      return (
                        <td
                          key={colIdx}
                          className={`p-2 border text-center text-black dark:text-white ${bg} ${
                            isUserInputs ? 'font-bold ring-2 ring-blue-500' : ''
                          }`}
                        >
                          ₹{fv.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      );
                    })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
