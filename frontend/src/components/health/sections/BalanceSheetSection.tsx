'use client';

import { MetricBarChart } from '@/components/health/MetricBarChart';

interface Props {
  metrics: Record<string, number[]>;
  years: string[];
}

export const BalanceSheetSection = ({ metrics, years }: Props) => {
  const items = [
    { key: 'equity', label: 'Equity (₹ Cr)' },
    { key: 'net_debt', label: 'Net Debt (₹ Cr)' },
    { key: 'net_block', label: 'Net Block (₹ Cr)' },
    { key: 'cwip', label: 'Capital WIP (₹ Cr)' },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">🏢 Balance Sheet Snapshot</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {items.map(({ key, label }) => {
          const data = metrics[key];
          const validData = Array.isArray(data)
            ? data.map((n) => Number(n)).filter((n) => !isNaN(n))
            : [];

          const minLen = Math.min(validData.length, years.length);
          const alignedData = validData.slice(-minLen);
          const alignedYears = years.slice(-minLen);

          if (!alignedData.length || !alignedYears.length) return null;

          return (
            <div key={key} className="bg-white rounded-md p-4 shadow-sm">
              <MetricBarChart label={label} data={alignedData} labels={alignedYears} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
