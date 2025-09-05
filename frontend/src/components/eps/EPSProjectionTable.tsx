'use client';

import styles from '@/styles/EPSValuationSection.module.css';

export default function EPSProjectionTable({ data }: any) {
  if (!data?.projection_table) return null;

  return (
    <div className={styles.tableSection}>
      <h3 className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>📊</span>
        EPS Projection Table
      </h3>
      
      <div className={styles.tableWrapper}>
        <div className={styles.scrollContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                {['Year', 'Revenue', 'EBIT', 'Interest', 'Tax', 'Net Profit', 'EPS', 'PE (Projected)'].map((label, index) => (
                  <th 
                    key={label} 
                    className={`${styles.headerCell} ${index === 0 ? styles.rowLabel : ''}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {data.projection_table.map((row: any, i: number) => (
                <tr key={i} className={styles.bodyRow}>
                  <td className={`${styles.bodyCell} ${styles.rowLabel}`}>
                    {row.year}
                  </td>
                  <td className={styles.bodyCell}>
                    {typeof row.revenue === 'number' 
                      ? `₹${row.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      : row.revenue}
                  </td>
                  <td className={styles.bodyCell}>
                    {typeof row.ebit === 'number' 
                      ? `₹${row.ebit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      : row.ebit}
                  </td>
                  <td className={styles.bodyCell}>
                    {typeof row.interest === 'number' 
                      ? `₹${row.interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      : row.interest}
                  </td>
                  <td className={styles.bodyCell}>
                    {typeof row.tax === 'number' 
                      ? `₹${row.tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      : row.tax}
                  </td>
                  <td className={styles.bodyCell}>
                    {typeof row.net_profit === 'number' 
                      ? `₹${row.net_profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      : row.net_profit}
                  </td>
                  <td className={`${styles.bodyCell} ${styles.positiveValue}`}>
                    {typeof row.eps === 'number' 
                      ? `₹${row.eps.toFixed(2)}`
                      : row.eps}
                  </td>
                  <td className={styles.bodyCell}>
                    {row.pe ? `${row.pe}x` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}