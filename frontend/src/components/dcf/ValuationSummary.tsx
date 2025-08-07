'use client';

import PhaseSplitChart from './PhaseSplitChart';
import { useGlobalStore } from '@/store/globalStore';

export default function ValuationSummary() {
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcf_fair_value = safe(results?.dcf?.dcf_fair_value);
  const fv_phase1_per_share = safe(results?.dcf?.fv_phase1_per_share);
  const fv_phase2_per_share = safe(results?.dcf?.fv_phase2_per_share);
  const terminal_value_per_share = safe(results?.dcf?.terminal_value_per_share);

  
  const current_price = safe(metrics?.current_price);


  const total = dcf_fair_value;
  const pct1 = (fv_phase1_per_share / total) * 100;
  const pct2 = (fv_phase2_per_share / total) * 100;
  const pct3 = (terminal_value_per_share / total) * 100;

  const diffPct = current_price
    ? ((dcf_fair_value - current_price) / current_price) * 100
    : NaN;

  let verdict = '';
  let verdictColor = '';
  let verdictIcon = '';

  if (isNaN(diffPct)) {
    verdict = '⚠️ Current Price not available';
    verdictColor = 'text-gray-500';
  } else if (diffPct > 15) {
    verdict = 'Undervalued';
    verdictColor = 'text-green-600';
    verdictIcon = '✅';
  } else if (diffPct < -15) {
    verdict = 'Overvalued';
    verdictColor = 'text-red-600';
    verdictIcon = '❌';
  } else {
    verdict = 'Fairly Valued';
    verdictColor = 'text-yellow-600';
    verdictIcon = '⚖️';
  }

  return (
    <div className="space-y-4">

      {/* 📋 Summary Text */}
      <div className="space-y-1 text-sm">
        <p className="font-semibold mt-2">
          Total Fair Value / Share: ₹{dcf_fair_value.toFixed(1)}
        </p>
      </div>

      {/* 📊 Chart-style Bar */}
      <div className="mt-3">
        <PhaseSplitChart
          phase1={fv_phase1_per_share}
          phase2={fv_phase2_per_share}
          phase3={terminal_value_per_share}
          total={dcf_fair_value}
        />
      </div>

      {/* 📈 Verdict Box */}
      <div className={`text-sm font-medium p-3 rounded border ${verdictColor} border-opacity-50 flex items-start gap-2`}>
        <span className="text-xl">{verdictIcon}</span>
        <div>
          <span className={`${verdictColor} font-semibold`}>{verdict}</span>{' '}
          <span className="text-neutral-800 dark:text-neutral-200">
            – Fair Value is ₹{dcf_fair_value.toFixed(1)} vs Current Price of ₹{current_price.toFixed(1)},
            giving the room for {diffPct.toFixed(1)}% {diffPct > 0 ? 'increase' : 'decrease'}.
          </span>
        </div>
      </div>

    </div>
  );
}
