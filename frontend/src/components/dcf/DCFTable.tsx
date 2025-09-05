'use client';

import { AlertTriangle, Calculator } from 'lucide-react';
import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/DCFTable.module.css';

export default function DCFTable({ table }: { table: any[] }) {
  // Get assumptions from global store
  const assumptions = useGlobalStore((s) => s.assumptions);
  if (!table || !Array.isArray(table) || table.length === 0) {
    return (
      <div className={styles.errorState}>
        <AlertTriangle className={styles.errorIcon} />
        <span>No DCF cash flow data available</span>
      </div>
    );
  }

  // Get column headers from first row
  const headers = Object.keys(table[0]);
  
  // Extract terminal value calculation data from the last row (Year 10)
  const lastRow = table[table.length - 1] || {};
  const year10FCF = lastRow['FCF'] || 0;
  
  // Get actual values from assumptions
  const terminalGrowth = assumptions?.growth_terminal || 2; // From assumptions
  const wacc = assumptions?.interest_pct || 12; // From assumptions (WACC)
  
  // Calculate terminal value components
  const adjustedFCF = year10FCF * (1 + terminalGrowth / 100);
  const denominator = (wacc - terminalGrowth) / 100;
  const terminalValue = denominator > 0 ? adjustedFCF / denominator : 0;
  
  // Discount terminal value to present value (Year 0)
  const discountFactor = Math.pow(1 + wacc / 100, 10); // 10 years
  const presentValueTerminal = terminalValue / discountFactor;
  
  // Helper function to format numbers with color coding
  const formatValue = (value: any, key: string) => {
    if (typeof value !== 'number') {
      return { formatted: value?.toString() || 'N/A', className: styles.neutralValue };
    }
    
    const formatted = value.toLocaleString('en-IN', {
      maximumFractionDigits: 0
    });
    
    // Add color coding based on value and context
    let className = styles.neutralValue;
    if (key.toLowerCase().includes('revenue') || key.toLowerCase().includes('cash')) {
      className = value > 0 ? styles.positiveValue : styles.negativeValue;
    } else if (key.toLowerCase().includes('expense') || key.toLowerCase().includes('tax')) {
      className = value > 0 ? styles.negativeValue : styles.positiveValue;
    }
    
    return { formatted, className };
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <div className={styles.scrollContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.headerRow}>
                {headers.map((header, index) => (
                  <th 
                    key={header} 
                    className={styles.headerCell}
                    title={header} // Tooltip for truncated headers
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {table.map((row, rowIndex) => (
                <tr key={rowIndex} className={styles.bodyRow}>
                  {Object.entries(row).map(([key, value], cellIndex) => {
                    const { formatted, className } = formatValue(value, key);
                    const isFirstColumn = cellIndex === 0;
                    
                    return (
                      <td 
                        key={`${rowIndex}-${cellIndex}`}
                        className={`${styles.bodyCell} ${
                          isFirstColumn ? styles.rowLabel : ''
                        } ${className}`}
                        title={formatted} // Tooltip for mobile
                      >
                        {formatted}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal Value Breakdown */}
      <div className={styles.terminalBreakdown}>
        <div className={styles.breakdownHeader}>
          <Calculator className={styles.breakdownIcon} />
          <span className={styles.breakdownTitle}>Terminal Value Calculation</span>
        </div>
        <div className={styles.breakdownLines}>
          <div className={styles.breakdownLine}>
            <span>1. Year 10 FCF × (1 + {terminalGrowth}%) = ₹{year10FCF.toLocaleString()} × 1.{(terminalGrowth/100 + 1).toFixed(2).slice(-2)} = ₹{adjustedFCF.toLocaleString()} Cr</span>
          </div>
          <div className={styles.breakdownLine}>
            <span>2. Terminal Value = ₹{adjustedFCF.toLocaleString()} ÷ ({wacc}% - {terminalGrowth}%) = ₹{terminalValue.toLocaleString()} Cr</span>
          </div>
          <div className={styles.breakdownLine}>
            <span>3. Present Value = ₹{terminalValue.toLocaleString()} ÷ (1 + {wacc}%)^10 = ₹{presentValueTerminal.toLocaleString()} Cr</span>
          </div>
        </div>
      </div>
    </div>
  );
}