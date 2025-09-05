'use client';

import { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/SensitivityTable.module.css';

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
    <div className={styles.container}>
      
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={`${styles.headerCell} ${styles.headerCellSticky}`}>
              EBIT ↓ / Growth →
            </th>
            {Array.isArray(sensitivityData?.growth_values) &&
              sensitivityData.growth_values.map((g: number, i: number) => (
                <th key={i} className={styles.headerCell}>
                  {g}%
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(sensitivityData?.ebit_values) &&
            sensitivityData.ebit_values.map((ebit: number, rowIdx: number) => (
              <tr key={rowIdx}>
                <td className={styles.rowHeader}>
                  {ebit.toFixed(2)}%
                </td>
                {Array.isArray(sensitivityData?.fair_values?.[rowIdx]) &&
                  sensitivityData.fair_values[rowIdx].map((val: number, colIdx: number) => {
                    const fv = val;
                    const cp = parseFloat(current_price || '0');
                    const priceDiff = Math.abs(fv - cp) / cp;
                    
                    const isCloseToMarket = priceDiff < 0.15; // Within 15%
                    const isUserInputs =
                      ebit === parseFloat(form.ebit_margin) &&
                      sensitivityData.growth_values[colIdx] === parseFloat(form.growth_y);

                    // Determine cell class based on fair value vs current price
                    let cellClass = styles.dataCell;
                    
                    if (isCloseToMarket) {
                      cellClass += ` ${styles.cellNearPrice}`;
                    } else if (fv > cp) {
                      cellClass += ` ${styles.cellAbovePrice}`;
                    } else {
                      cellClass += ` ${styles.cellBelowPrice}`;
                    }

                    if (isUserInputs) {
                      cellClass += ` ${styles.cellUserInputs}`;
                    }

                    return (
                      <td key={colIdx} className={cellClass}>
                        ₹{fv.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    );
                  })}
              </tr>
            ))}
        </tbody>
      </table>      
    </div>
  );
}