'use client';

import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/EPSValuationSection.module.css';

export default function EPSSensitivityTables({ data }: any) {
  const metrics = useGlobalStore((s) =>
    Array.isArray(s.metrics) ? s.metrics[0] : s.metrics
  );
  const assumptions = useGlobalStore((s) => s.assumptions);

  if (!data?.sensitivity_eps && !data?.sensitivity_price) return null;

  const currentPrice = metrics?.current_price || 0;

  // Helper function to determine cell styling based on value comparison
  const getCellStyle = (value: number, comparison: number, isUserInput: boolean = false) => {
    let cellClass = styles.bodyCell;
    
    if (isUserInput) {
      cellClass += ` ${styles.cellUserInputs}`;
    }

    if (comparison > 0) {
      const percentDiff = Math.abs(value - comparison) / comparison;
      
      if (percentDiff < 0.15) {
        cellClass += ` ${styles.cellNearPrice}`; // Close to market price (within 15%)
      } else if (value > comparison) {
        cellClass += ` ${styles.cellAbovePrice}`; // Above market price (undervalued)
      } else {
        cellClass += ` ${styles.cellBelowPrice}`; // Below market price (overvalued)
      }
    }

    return cellClass;
  };

  return (
    <>
      {/* EPS Sensitivity Table */}
      {data.sensitivity_eps && (
        <div className={styles.sensitivitySection}>
          <h3 className={styles.sensitivityTitle}>
            <span className={styles.sectionIcon}>🎯</span>
            Sensitivity Analysis A: EPS (EBIT Margin ↓ vs Growth Rate →)
          </h3>
          
          <div className={styles.tableWrapper}>
            <div className={styles.scrollContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={`${styles.headerCell} ${styles.rowLabel}`}>
                      EBIT ↓ / Growth →
                    </th>
                    {data.sensitivity_eps.growth_options.map((g: number, j: number) => (
                      <th key={j} className={styles.headerCell}>
                        {g.toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {data.sensitivity_eps.matrix.map((row: number[], i: number) => {
                    const marginValue = data.sensitivity_eps.margin_options[i];
                    
                    return (
                      <tr key={i} className={styles.bodyRow}>
                        <td className={`${styles.bodyCell} ${styles.rowLabel}`}>
                          {marginValue.toFixed(1)}%
                        </td>
                        {row.map((val: number, j: number) => {
                          const growthValue = data.sensitivity_eps.growth_options[j];
                          const isUserInput = 
                            Math.abs(marginValue - parseFloat(assumptions?.ebit_margin || '0')) < 0.01 &&
                            Math.abs(growthValue - parseFloat(assumptions?.growth_x || '0')) < 0.01;
                            
                          return (
                            <td 
                              key={j} 
                              className={getCellStyle(val, 0, isUserInput)}
                            >
                              ₹{val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Price Sensitivity Table */}
      {data.sensitivity_price && (
        <div className={styles.sensitivitySection}>
          <h3 className={styles.sensitivityTitle}>
            <span className={styles.sectionIcon}>💰</span>
            Sensitivity Analysis B: Target Price (EPS ↓ vs PE →)
          </h3>
          
          <div className={styles.tableWrapper}>
            <div className={styles.scrollContainer}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={`${styles.headerCell} ${styles.rowLabel}`}>
                      EPS ↓ / PE →
                    </th>
                    {data.sensitivity_price.pe_options.map((pe: number, j: number) => (
                      <th key={j} className={styles.headerCell}>
                        {pe.toFixed(1)}x
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {data.sensitivity_price.matrix.map((row: number[], i: number) => {
                    const epsValue = data.sensitivity_price.eps_options[i];
                    
                    return (
                      <tr key={i} className={styles.bodyRow}>
                        <td className={`${styles.bodyCell} ${styles.rowLabel}`}>
                          ₹{epsValue.toFixed(2)}
                        </td>
                        {row.map((val: number, j: number) => {
                          const peValue = data.sensitivity_price.pe_options[j];
                          // Check if this is close to PE = 20 (our base assumption)
                          const isUserInput = Math.abs(peValue - 20) < 0.1;
                          
                          return (
                            <td 
                              key={j} 
                              className={getCellStyle(val, currentPrice, isUserInput)}
                            >
                              ₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}