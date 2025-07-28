"use client";
import Disclaimer from '@/components/Disclaimer';

import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useGlobalStore } from "@/store/globalStore";

export default function EPSProjectionPage() {
  const assumptions = useGlobalStore((state) => state.assumptions);
  const meta = useGlobalStore((state) => state.meta);
  const financials = useGlobalStore((state) => state.financials);
  const parsed = useGlobalStore((state) => state.parsed);

  const [baseRevenue, setBaseRevenue] = useState(0);
  const [baseYear, setBaseYear] = useState(0);
  const [projectionYears, setProjectionYears] = useState(5);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [ebitMargin, setEbitMargin] = useState(0);
  const [interestExp, setInterestExp] = useState(0);
  const [taxRate, setTaxRate] = useState(27);
  const [sharesOutstanding, setSharesOutstanding] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [projection, setProjection] = useState(null);

  useEffect(() => {
    if (Object.keys(assumptions).length > 0) {
      if (assumptions.missing_fields?.length > 0) {
        console.warn("📉 Missing fields in upload:", assumptions.missing_fields.join(", "));
      }

      if (assumptions.latest_revenue) setBaseRevenue(assumptions.latest_revenue);
      if (assumptions.base_year) setBaseYear(assumptions.base_year);
      if (assumptions.revenue_growth) setRevenueGrowth(assumptions.revenue_growth);
      if (assumptions.ebit_margin) setEbitMargin(assumptions.ebit_margin);
      if (assumptions.interest_exp) setInterestExp(assumptions.interest_exp);
      if (assumptions.tax_rate) setTaxRate(assumptions.tax_rate);
      if (assumptions.shares_outstanding) setSharesOutstanding(assumptions.shares_outstanding);
      if (assumptions.current_price) setCurrentPrice(assumptions.current_price);
    }
  }, [assumptions]);

  const handleProjectEPS = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project-eps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_revenue: baseRevenue,
          projection_years: projectionYears,
          revenue_growth: revenueGrowth,
          ebit_margin: ebitMargin,
          interest_exp: interestExp,
          tax_rate: taxRate,
          shares_outstanding: sharesOutstanding,
          current_price: currentPrice,
          base_year: baseYear.toString(),
        }),
      });
      const data = await response.json();
      setProjection(data);
    } catch (error) {
      console.error("EPS projection failed:", error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Disclaimer />
      <h1 className="text-2xl font-bold mb-4">EPS Projection</h1>
      {assumptions.company_name && (
        <div className="text-xl font-semibold text-center mb-4">
          🏷️ {assumptions.company_name}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Base Revenue (₹ Cr)</label>
          <input type="number" value={baseRevenue} onChange={(e) => setBaseRevenue(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Projection Years</label>
          <input type="number" value={projectionYears} onChange={(e) => setProjectionYears(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Revenue Growth (%)</label>
          <input type="number" value={revenueGrowth} onChange={(e) => setRevenueGrowth(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">EBIT Margin (%)</label>
          <input type="number" value={ebitMargin} onChange={(e) => setEbitMargin(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Interest Expense (₹ Cr)</label>
          <input type="number" value={interestExp} onChange={(e) => setInterestExp(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Tax Rate (%)</label>
          <input type="number" value={taxRate} onChange={(e) => setTaxRate(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Shares Outstanding (Cr)</label>
          <input type="number" value={sharesOutstanding} disabled className="border px-3 py-2 rounded bg-gray-100" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Current Market Price (₹)</label>
          <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(+e.target.value)} className="border px-3 py-2 rounded" />
        </div>
      </div>
        
      <button onClick={handleProjectEPS} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Project EPS</button>

      {projection && (
        <div className="mt-10 space-y-8">
          <div>
            <h2 className="text-lg font-semibold">EPS Projection Table</h2>
            <table className="w-full table-auto border mt-2 text-sm">
              <thead>
                <tr className="bg-gray-100">
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
                {Array.isArray(projection?.projection_table) &&
                  projection.projection_table.map((row, i) => (
                    <tr key={i} className="text-center border-t">
                      <td>{row.year}</td>
                      <td>{row.revenue}</td>
                      <td>{row.ebit}</td>
                      <td>{row.interest}</td>
                      <td>{row.tax}</td>
                      <td>{row.net_profit}</td>
                      <td>{row.eps}</td>
                      <td>{row.pe || "-"}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>

          

          {projection?.sensitivity_eps?.growth_options && (
            <div>
              <h2 className="text-lg font-semibold">Sensitivity Table A: EPS</h2>
              <table className="table-auto w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th>EBIT \ Growth</th>
                    {projection.sensitivity_eps.growth_options.map((g, j) => (
                      <th key={j}>{g}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projection.sensitivity_eps.matrix.map((row, i) => (
                    <tr key={i} className="text-center">
                      <td>{projection.sensitivity_eps.margin_options[i]}%</td>
                      {row.map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {projection?.sensitivity_price?.eps_options && (
            <div>
              <h2 className="text-lg font-semibold">Sensitivity Table B: Target Price</h2>
              <table className="table-auto w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th>EPS \ PE</th>
                    {projection.sensitivity_price.pe_options.map((pe, j) => (
                      <th key={j}>{pe}x</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projection.sensitivity_price.matrix.map((row, i) => (
                    <tr key={i} className="text-center">
                      <td>₹{projection.sensitivity_price.eps_options[i]}</td>
                      {row.map((val, j) => (
                        <td key={j}>₹{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
