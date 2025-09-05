// components/report/ValuationDisplay/ValuationDisplay.tsx
import React from 'react';
import styles from './ValuationDisplay.module.css';

interface ValuationDisplayProps {
  value: number;
  label: string;
  change?: number;
  disclaimer?: boolean;
}

export const ValuationDisplay: React.FC<ValuationDisplayProps> = ({
  value,
  label,
  change,
  disclaimer = true
}) => {
  const changeClass = change && change > 0 ? styles.positive : 
                     change && change < 0 ? styles.negative : styles.neutral;

  return (
    <div className={styles.container}>
      {disclaimer && (
        <div className={styles.disclaimer}>
          Educational Analysis Only - Not Investment Advice
        </div>
      )}
      
      <div className={styles.value}>
        ₹{value.toLocaleString('en-IN')}
      </div>
      
      <div className={styles.label}>
        {label}
      </div>
      
      {change !== undefined && (
        <div className={changeClass}>
          {change > 0 ? '+' : ''}{change.toFixed(2)}%
        </div>
      )}
    </div>
  );
};