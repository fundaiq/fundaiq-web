'use client';

import { useGlobalStore } from '@/store/globalStore';
import styles from '@/styles/StockSummaryCard.module.css';

function formatCr(value: number | undefined) {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  const numValue = Number(value);
  return `₹${(numValue / 1e7).toFixed(1)} Cr`;
}

function formatPercent(value: number | undefined, digits = 1) {
  if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
  const numValue = Number(value);
  return `${numValue.toFixed(digits)}%`;
}

function formatCurrency(value: number | undefined) {
  if (value === null || value === undefined || isNaN(Number(value))) return '₹—';
  const numValue = Number(value);
  return `₹${numValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// FIXED: This is the main function causing the error
function format(value: number | undefined, digits = 1) {
  // Check if value is null, undefined, or not a valid number
  if (value === null || value === undefined) return 'N/A';
  
  // Convert to number if it's a string
  const numValue = Number(value);
  
  // Check if the conversion resulted in a valid number
  if (isNaN(numValue) || !isFinite(numValue)) return 'N/A';
  
  // Now safely use toFixed
  return numValue.toFixed(digits);
}

function getMarketCapCategory(marketCap: number | undefined) {
  if (!marketCap || marketCap === 0 || isNaN(Number(marketCap))) {
    return { label: 'N/A', style: styles.badgeGray };
  }
  
  // Market cap could be in different units, let's check the magnitude
  let capInCrores = Number(marketCap);
  
  // If the value is very large (like in paisa or rupees), convert to crores
  if (capInCrores > 10000000) { // Greater than 1 crore in paisa/rupees
    capInCrores = capInCrores / 1e7; // Convert to crores
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
  if (value === undefined || value === null || isNaN(Number(value))) return styles.badgeGray;
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
  if (value === undefined || value === null || isNaN(Number(value))) return 'N/A';
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

  const companyName = info || '—';
  const price = metrics?.current_price;
  const marketCapCategory = getMarketCapCategory(metrics?.market_cap);

  // Extract first letter of company name for icon
  const companyInitial = companyName.charAt(0).toUpperCase();

  const flatMetrics = [
    { 
      label: 'Market Cap (Cr)', 
      value: formatCurrency(metrics?.market_cap),
      showBadge: true,
      customBadge: marketCapCategory
    },
    { 
      label: 'Enterprise Value (Cr)', 
      value: formatCurrency(metrics?.ev),
      showBadge: false
    },
    { 
      label: 'Book Value', 
      value: formatCurrency(metrics?.book_value),
      showBadge: false
    },
    { 
      label: 'TTM P/B', 
      value: format(metrics?.ttm_pb),
      metric: 'TTM_PB', 
      rawValue: metrics?.ttm_pb,
      showBadge: true
    },
    { 
      label: 'NAV Per Share', 
      value: format(metrics?.net_asset_values_per_share_last),
      metric: 'net_asset_values_per_share_last', 
      rawValue: metrics?.net_asset_values_per_share_last,
      showBadge: true
    },
    { 
      label: 'EV to EBIDTA', 
      value: format(metrics?.ev_to_ebitda, 2),
      showBadge: false
    },
    { 
      label: 'EV to EBIT', 
      value: format(metrics?.ev_to_ebit, 2),
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
      label: 'Price to Sales', 
      value: format(metrics?.price_to_sales, 2),
      showBadge: false
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
      value: formatPercent(metrics?.ttm_roce), 
      metric: 'ROCE', 
      rawValue: metrics?.ttm_roce,
      showBadge: true
    },
    { 
      label: 'ROE', 
      value: formatPercent(metrics?.ttm_roe), 
      metric: 'ROE', 
      rawValue: metrics?.ttm_roe,
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
      label: 'Interest Coverage', 
      value: format(metrics?.ttm_interest_coverage, 2), 
      metric: 'InterestCoverage', 
      rawValue: metrics?.ttm_interest_coverage,
      showBadge: true
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
        
        {price && !isNaN(Number(price)) && (
          <div className={styles.priceInfo}>
            <span className={styles.currency}>₹</span>
            <h3 className={styles.currentPrice}>
              {Number(price).toLocaleString('en-IN', { 
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
                  <span className={`${styles.badge} ${metric.customBadge.style}`}>
                    {metric.customBadge.label}
                  </span>
                ) : (
                  <span className={`${styles.badge} ${getBadgeStyle(metric.metric, metric.rawValue)}`}>
                    {getBadgeText(metric.metric, metric.rawValue)}
                  </span>
                )}
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