'use client';

import { useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/SensitivityTable.module.css';

type Props = {
  // valuationResult: any;
  // current_price: string;
  // form: any;
  // setSensitivityData: (data: any) => void;
  // sensitivityData: any;
};

export default function SensitivityTable({
  // valuationResult,
  // current_price,
  // form,
  // setSensitivityData,
  // sensitivityData
}: Props) {
  const raw = useGlobalStore((s) => s.metrics);
  const metrics = Array.isArray(raw) ? raw[0] : raw;
  
  const valuationResult = useGlobalStore((s) => s.valuationResults);
  const sensitivityData = useGlobalStore((s) => s.valuationResults?.dcf_sensitivity);
  const assumptions = useGlobalStore((s) => s.assumptions);
  
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
                    const cp = parseFloat(form.current_price || '0');
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