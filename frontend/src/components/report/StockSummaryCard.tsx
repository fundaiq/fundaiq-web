'use client';

import { useGlobalStore } from '@/store/globalStore';
import clsx from 'clsx';

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
function getBadgeColor(metric: string, value: number | undefined) {
  if (value === undefined || isNaN(value)) return 'bg-gray-300 dark:bg-zinc-700';
  const val = Number(value);

  switch (metric) {
    case 'ROE':
    case 'ROCE':
      return val >= 15
        ? 'bg-green-100 text-green-800'
        : val >= 11
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

    case 'PEG':
      return val < 0 
        ? 'bg-red-100 text-red-800'
        : val <= 1.5
        ? 'bg-green-100 text-green-800'
        : val <= 1
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

    case 'DebtEquity':
      return val < 1
        ? 'bg-green-100 text-green-800'
        : val <= 2
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

    case 'TTM_PE':
      return val < 30
        ? 'bg-green-100 text-green-800'
        : val <= 50
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

    case 'TTM_PB':
      return val < 2
        ? 'bg-green-100 text-green-800'
        : val <= 4
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';
    
    case 'EPSCAGR3Y':
    case 'RevCAGR3Y':
      return val >= 15
        ? 'bg-green-100 text-green-800'
        : val >= 8
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

    default:
      return 'bg-zinc-200 dark:bg-zinc-700';
  }
}

export default function StockSummaryCard() {
  const info = useGlobalStore((s) => s.companyInfo);
  const raw = useGlobalStore((s) => s.metrics);
  const metrics = Array.isArray(raw) ? raw[0] : raw;

  const companyName = info?.name || '—';
  const price = metrics?.current_price;

  const flatMetrics = [
    { label: 'Enterprise Value (Cr)', value: formatCurrency(metrics?.ev) },
    { label: 'Market Cap (Cr)', value: formatCurrency(metrics?.market_cap) },
    { label: 'Book Value', value: formatCurrency(metrics?.book_value) },
    { label: 'TTM P/E', value: format(metrics?.ttm_pe), badge: getBadgeColor('TTM_PE', metrics?.ttm_pe) },
    { label: 'TTM P/B', value: format(metrics?.ttm_pb),badge: getBadgeColor('TTM_PB', metrics?.ttm_pb) },
    { label: 'PEG Ratio', value: format(metrics?.peg_ratio, 2), badge: getBadgeColor('PEG', metrics?.peg_ratio) },
    { label: 'EPS CAGR (3Y)', value: formatPercent(metrics?.eps_cagr_3y),badge: getBadgeColor('EPSCAGR3Y', metrics?.eps_cagr_3y)  },
    { label: 'Rev CAGR (3Y)', value: formatPercent(metrics?.revenue_cagr_3y),badge: getBadgeColor('RevCAGR3Y', metrics?.revenue_cagr_3y)  },
    { label: 'ROCE', value: formatPercent(metrics?.roce?.at(-1)), badge: getBadgeColor('ROCE', metrics?.roce?.at(-1)) },
    { label: 'ROE', value: formatPercent(metrics?.roe?.at(-1)), badge: getBadgeColor('ROE', metrics?.roe?.at(-1)) },
    { label: 'Debt/Equity', value: format(metrics?.debt_to_equity?.at(-1), 2), badge: getBadgeColor('DebtEquity', metrics?.debt_to_equity?.at(-1)) },
    { label: 'Current Ratio', value: format(metrics?.current_ratio, 2) },
    { label: 'Quick Ratio', value: format(metrics?.quick_ratio, 2) },
    { label: 'Price to Sales', value: format(metrics?.price_to_sales, 2) },
    { label: 'EV to EBIT', value: format(metrics?.ev_to_ebit, 2) },
    { label: 'Dividend Yield', value: formatPercent(metrics?.div_yield, 2) },
  ];

  return (
    <section className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-1 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-blue-600 font-bold">{companyName}</span>
          <span className="text-blue-600 font-bold">— ₹{price?.toFixed(2) || 'N/A'}</span>
        </div>
      </div>

      {/* Sector & Industry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 mb-4">
        <div>
          <p className="text-sm text-gray-600">
            <span className="text-gray-800 dark:text-gray-300"><strong>Sector:</strong></span>{' '}
            {info?.sector || '—'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="text-gray-800 dark:text-gray-300"><strong>Industry:</strong></span>{' '}
            {info?.industry || '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            <span className="text-gray-800 dark:text-gray-300"><strong>52W H/L:</strong></span>{' '}
            <strong>
              {metrics?.high_52w && metrics?.low_52w
                ? `₹${metrics.high_52w.toFixed(2)} / ₹${metrics.low_52w.toFixed(2)}`
                : '—'}
            </strong>
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm leading-tight">
        {flatMetrics.map((item, idx) => (
          <div key={idx}>
            <p className="text-sm text-gray-500" title={item.label}>
              {item.label}
            </p>
            <p className="mt-1">
              <span
                className={clsx(
                  'inline-block px-2 py-0.5 rounded-full text-sm font-normal',
                  item.badge || 'bg-zinc-200 dark:bg-zinc-700'
                )}
              >
                {item.value}
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
