'use client';

import PhaseSplitChart from './PhaseSplitChart';

export default function ValuationSummary({ valuation }) {
  if (
    !valuation ||
    typeof valuation.fair_value_per_share !== 'number' ||
    typeof valuation.fv_phase1_per_share !== 'number' ||
    typeof valuation.fv_phase2_per_share !== 'number' ||
    typeof valuation.terminal_value_per_share !== 'number'
  ) {
    return <p className="text-red-500">⚠️ Incomplete valuation data.</p>;
  }

  const {
    fv_phase1_per_share,
    fv_phase2_per_share,
    terminal_value_per_share,
    fair_value_per_share,
    current_price
  } = valuation;

  const total = fair_value_per_share;
  const pct1 = (fv_phase1_per_share / total) * 100;
  const pct2 = (fv_phase2_per_share / total) * 100;
  const pct3 = (terminal_value_per_share / total) * 100;

  const diffPct = current_price
    ? ((fair_value_per_share - current_price) / current_price) * 100
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
          Total Fair Value / Share: ₹{fair_value_per_share.toFixed(1)}
        </p>
      </div>

      {/* 📊 Chart-style Bar */}
      <div className="mt-3">
        <PhaseSplitChart
          phase1={fv_phase1_per_share}
          phase2={fv_phase2_per_share}
          phase3={terminal_value_per_share}
          total={fair_value_per_share}
        />
      </div>

      {/* 📈 Verdict Box */}
      <div className={`text-sm font-medium p-3 rounded border ${verdictColor} border-opacity-50 flex items-start gap-2`}>
        <span className="text-xl">{verdictIcon}</span>
        <div>
          <span className={`${verdictColor} font-semibold`}>{verdict}</span>{' '}
          <span className="text-neutral-800 dark:text-neutral-200">
            – Fair Value is ₹{fair_value_per_share.toFixed(1)} vs Current Price of ₹{current_price.toFixed(1)},
            giving the room for {diffPct.toFixed(1)}% {diffPct > 0 ? 'increase' : 'decrease'}.
          </span>
        </div>
      </div>

    </div>
  );
}
