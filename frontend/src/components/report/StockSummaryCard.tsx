'use client';

import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/StockSummaryCard.module.css';

function formatCr(value: number | undefined) {
  return value ? `₹${(value / 1e7).toFixed(1)} Cr` : 'N/A';
}

function formatPercent(value: number | undefined, digits = 1) {
  return value || value === 0 ? `${value.toFixed(digits)}%` : 'N/A';
}

function formatCurrency(value: number | undefined) {
  return value || value === 0
    ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '₹—';
}

function format(value: number | undefined, digits = 1) {
  return value || value === 0 ? value.toFixed(digits) : 'N/A';
}

function getMarketCapCategory(marketCap: number | undefined) {
  if (!marketCap || marketCap === 0) return { label: 'N/A', style: styles.badgeGray };
  
  // Market cap could be in different units, let's check the magnitude
  let capInCrores = marketCap;
  
  // If the value is very large (like in paisa or rupees), convert to crores
  if (marketCap > 10000000) { // Greater than 1 crore in paisa/rupees
    capInCrores = marketCap / 1e7; // Convert to crores
  }
  
  
  
  if (capInCrores >= 100000) {
    return { label: 'Large Cap', style: styles.badgeGreen };
  } else if (capInCrores >= 25000) {
    return { label: 'Mid Cap', style: styles.badgeYellow };
  } else if (capInCrores >= 1000) {
    return { label: 'Small Cap', style: styles.badgeYellow };
  } else {
    return { label: 'Micro Cap', style: styles.badgeRed };
  }
}

function getBadgeStyle(metric: string, value: number | undefined) {
  if (value === undefined || isNaN(value)) return styles.badgeGray;
  const val = Number(value);

  switch (metric) {
    case 'ROE':
    case 'ROCE':
      return val >= 15 ? styles.badgeGreen : val >= 11 ? styles.badgeYellow : styles.badgeRed;

    case 'PEG':
      return val < 0 ? styles.badgeRed 
        : val <= 1.5 ? styles.badgeGreen 
        : val <= 2 ? styles.badgeYellow 
        : styles.badgeRed;

    case 'DebtEquity':
      return val < 1 ? styles.badgeGreen : val <= 2 ? styles.badgeYellow : styles.badgeRed;

    case 'TTM_PE':
      return val < 30 ? styles.badgeGreen : val <= 50 ? styles.badgeYellow : styles.badgeRed;

    case 'TTM_PB':
      return val < 2 ? styles.badgeGreen : val <= 4 ? styles.badgeYellow : styles.badgeRed;
    
    case 'EPSCAGR3Y':
    case 'RevCAGR3Y':
      return val >= 15 ? styles.badgeGreen : val >= 8 ? styles.badgeYellow : styles.badgeRed;

    default:
      return styles.badgeGray;
  }
}

function getBadgeText(metric: string, value: number | undefined) {
  if (value === undefined || isNaN(value)) return 'N/A';
  const val = Number(value);

  switch (metric) {
    case 'ROE':
    case 'ROCE':
      return val >= 15 ? 'Good' : val >= 11 ? 'Fair' : 'Weak';

    case 'PEG':
      return val < 0 ? 'N/A' 
        : val <= 1.5 ? 'Good' 
        : val <= 2 ? 'Fair' 
        : 'High';

    case 'DebtEquity':
      return val < 1 ? 'Low' : val <= 2 ? 'Med' : 'High';

    case 'TTM_PE':
      return val < 30 ? 'Good' : val <= 50 ? 'Fair' : 'High';

    case 'TTM_PB':
      return val < 2 ? 'Good' : val <= 4 ? 'Fair' : 'High';
    
    case 'EPSCAGR3Y':
    case 'RevCAGR3Y':
      return val >= 15 ? 'High' : val >= 8 ? 'Med' : 'Low';

    default:
      return '';
  }
}

export default function StockSummaryCard() {
  const info = useGlobalStore((s) => s.companyInfo);
  const raw = useGlobalStore((s) => s.metrics);
  const metrics = Array.isArray(raw) ? raw[0] : raw;

  const companyName = info?.name || '—';
  const price = metrics?.current_price;
  const marketCapCategory = getMarketCapCategory(metrics?.market_cap);

  // Debug log to see market cap value
  

  // Extract first letter of company name for icon
  const companyInitial = companyName.charAt(0).toUpperCase();

  const flatMetrics = [
    { 
      label: 'Enterprise Value (Cr)', 
      value: formatCurrency(metrics?.ev),
      showBadge: false
    },
    { 
      label: 'Market Cap (Cr)', 
      value: formatCurrency(metrics?.market_cap),
      showBadge: true,
      customBadge: marketCapCategory
    },
    { 
      label: 'Book Value', 
      value: formatCurrency(metrics?.book_value),
      showBadge: false
    },
    { 
      label: 'TTM P/E', 
      value: format(metrics?.ttm_pe), 
      metric: 'TTM_PE', 
      rawValue: metrics?.ttm_pe,
      showBadge: true
    },
    { 
      label: 'TTM P/B', 
      value: format(metrics?.ttm_pb),
      metric: 'TTM_PB', 
      rawValue: metrics?.ttm_pb,
      showBadge: true
    },
    { 
      label: 'PEG Ratio', 
      value: format(metrics?.peg_ratio, 2), 
      metric: 'PEG', 
      rawValue: metrics?.peg_ratio,
      showBadge: true
    },
    { 
      label: 'EPS CAGR (3Y)', 
      value: formatPercent(metrics?.eps_cagr_3y),
      metric: 'EPSCAGR3Y', 
      rawValue: metrics?.eps_cagr_3y,
      showBadge: true
    },
    { 
      label: 'Rev CAGR (3Y)', 
      value: formatPercent(metrics?.revenue_cagr_3y),
      metric: 'RevCAGR3Y', 
      rawValue: metrics?.revenue_cagr_3y,
      showBadge: true
    },
    { 
      label: 'ROCE', 
      value: formatPercent(metrics?.roce?.at(-1)), 
      metric: 'ROCE', 
      rawValue: metrics?.roce?.at(-1),
      showBadge: true
    },
    { 
      label: 'ROE', 
      value: formatPercent(metrics?.roe?.at(-1)), 
      metric: 'ROE', 
      rawValue: metrics?.roe?.at(-1),
      showBadge: true
    },
    { 
      label: 'Debt/Equity', 
      value: format(metrics?.debt_to_equity?.at(-1), 2), 
      metric: 'DebtEquity', 
      rawValue: metrics?.debt_to_equity?.at(-1),
      showBadge: true
    },
    { 
      label: 'Current Ratio', 
      value: format(metrics?.current_ratio, 2),
      showBadge: false
    },
    { 
      label: 'Quick Ratio', 
      value: format(metrics?.quick_ratio, 2),
      showBadge: false
    },
    { 
      label: 'Price to Sales', 
      value: format(metrics?.price_to_sales, 2),
      showBadge: false
    },
    { 
      label: 'EV to EBIT', 
      value: format(metrics?.ev_to_ebit, 2),
      showBadge: false
    },
    { 
      label: 'Dividend Yield', 
      value: formatPercent(metrics?.div_yield, 2),
      showBadge: false
    },
  ];

  return (
    <section className={styles.cardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <div className={styles.stockIcon}>
            {companyInitial}
          </div>
          <h2 className={styles.companyName}>{companyName}</h2>
        </div>
        
        {price && (
          <div className={styles.priceInfo}>
            <span className={styles.currency}>₹</span>
            <h3 className={styles.currentPrice}>
              {price.toLocaleString('en-IN', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 2 
              })}
            </h3>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        {flatMetrics.map((metric, index) => (
          <div key={index} className={styles.metricItem}>
            <p className={styles.metricLabel}>{metric.label}</p>
            
            {metric.showBadge ? (
              <div className={styles.metricValueWithBadge}>
                <span className={styles.metricValue}>{metric.value}</span>
                {metric.customBadge ? (
                  <span 
                    className={metric.customBadge.style}
                    title={`${metric.label}: ${metric.customBadge.label}`}
                  >
                    {metric.customBadge.label}
                  </span>
                ) : metric.metric ? (
                  <span 
                    className={getBadgeStyle(metric.metric, metric.rawValue)}
                    title={`${metric.label}: ${getBadgeText(metric.metric, metric.rawValue)}`}
                  >
                    {getBadgeText(metric.metric, metric.rawValue)}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className={styles.metricValue}>{metric.value}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}