'use client';

import { useGlobalStore } from '@/store/globalStore';

type Pointer = {
  percent: number;
  color: string;
  label: string;
  value: number;
  lineH: number;
};

export default function ValuationMeter() {
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcfFairValue = safe(results?.dcf?.dcf_fair_value);
  const epsFairValue = safe(results?.eps?.eps_fair_value);
  const currentPrice = safe(metrics?.current_price);

  // ===== Scale logic =====
  let maxValue: number;
  let colorBands;

  if (currentPrice <= dcfFairValue * 2) {
    // Normal case — DCF at 50%
    maxValue = dcfFairValue * 2;
    colorBands = [
      { range: [0, 20], color: '#2ecc71' },
      { range: [20, 40], color: '#27ae60' },
      { range: [40, 60], color: '#f1c40f' },
      { range: [60, 80], color: '#f39c12' },
      { range: [80, 100], color: '#e74c3c' },
    ];
  } else {
    // Overheated case — stretch red zone
    const extra = currentPrice - dcfFairValue * 2;
    maxValue = dcfFairValue * 2 + extra;

    // Calculate where red starts so DCF stays in yellow
    const redStartPercent = (dcfFairValue * 2 / maxValue) * 100;
    colorBands = [
      { range: [0, 20], color: '#2ecc71' },
      { range: [20, 40], color: '#27ae60' },
      { range: [40, 60], color: '#f1c40f' },
      { range: [60, redStartPercent], color: '#f39c12' },
      { range: [redStartPercent, 100], color: '#e74c3c' },
    ];
  }

  const toPercent = (val: number) =>
    Math.min(Math.max((val / maxValue) * 100, 0), 100);

  const pricePercent = toPercent(currentPrice);
  const dcfPercent = toPercent(dcfFairValue);
  const epsPercent = toPercent(epsFairValue);

  // Keep pointers visually inside edges
  const edgePosition = (pct: number) => {
    if (pct <= .01) return { left: '0.01%', translate: 'translateX(0)' };
    if (pct >= 99.99) return { left: '99.99%', translate: 'translateX(-100%)' };
    return { left: `${pct}%`, translate: 'translateX(-50%)' };
  };

  const margin =
    currentPrice > 0 ? ((dcfFairValue - currentPrice) / currentPrice) * 100 : 0;
  const marginColor = margin >= 0 ? 'text-green-600' : 'text-red-500';

  // Pointers with staggered heights
  const basePointers: Pointer[] = [
    { percent: pricePercent, color: '#000000', label: 'Price', value: currentPrice, lineH: 23 },
    { percent: dcfPercent, color: '#14532d', label: 'DCF FV', value: dcfFairValue, lineH: 23 },
    { percent: epsPercent, color: '#16a34a', label: 'EPS FV', value: epsFairValue, lineH: 23 },
  ];

  // Avoid overlapping labels
  const MIN_SEP = 10;
  const STEP = 18;
  const adjustedPointers: Pointer[] = [...basePointers]
    .sort((a, b) => a.percent - b.percent)
    .map((p, idx, arr) => {
      if (idx === 0) return p;
      const prev = arr[idx - 1];
      if (p.percent - prev.percent < MIN_SEP) {
        p.lineH = prev.lineH + STEP;
      }
      return p;
    });

  const steps = 5;
  const tickValues = Array.from({ length: steps + 1 }, (_, i) =>
    Math.round((maxValue / steps) * i)
  );

  return (
    <>
      <div className="w-full max-w-3xl mx-auto px-2 mt-0 text-left">
        <h3 className="text-lg sm:text-base font-semibold text-gray-800 dark:text-gray-100 mb-15">
          📊 Valuation Meter
        </h3>
      </div>

      <div className="w-full max-w-3xl mx-auto mt-12 px-2">
        <div className="relative">
          {/* Color bar */}
          <div className="flex w-full rounded overflow-hidden border h-6 relative z-0">
            {colorBands.map((band, i) => {
              const width = band.range[1] - band.range[0];
              return (
                <div
                  key={i}
                  className="h-full"
                  style={{ width: `${width}%`, backgroundColor: band.color }}
                />
              );
            })}
          </div>

          {/* Tick marks */}
          <div className="absolute inset-0 flex justify-between items-center z-10 pointer-events-none">
            {tickValues.map((_, i) => (
              <div
                key={i}
                className="h-3 w-[1px] bg-gray-400 opacity-40"
                style={{ transform: 'translateY(-6px)' }}
              />
            ))}
          </div>

          {/* Pointers */}
          {adjustedPointers.map((p, i) => {
            const pos = edgePosition(p.percent);
            return (
              <div key={i} className="absolute" style={{ left: pos.left }}>
                <div
                  className="absolute flex flex-col items-center"
                  style={{ bottom: '100%', transform: pos.translate }}
                >
                  <span
                    className="text-sm font-semibold text-center px-1 rounded bg-white shadow-sm whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis mb-1"
                    style={{ color: p.color }}
                    title={`${p.label}: ₹${p.value.toFixed(0)}`}
                  >
                    {p.label}: ₹{p.value.toFixed(0)}
                  </span>
                  <div
                    className="w-[2px]"
                    style={{ height: p.lineH, backgroundColor: p.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-sm text-gray-500 px-1 mt-1">
          {tickValues.map((val, i) => (
            <span key={i} className="whitespace-nowrap">
              ₹{val.toLocaleString('en-IN')}
            </span>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-2 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium flex flex-wrap justify-center gap-4 text-center">
          <span>
            Current Price: <span className="font-bold">₹{currentPrice.toFixed(2)}</span>
          </span>
          <span>
            DCF Fair Value: <span className="font-bold">₹{dcfFairValue.toFixed(2)}</span>
          </span>
          <span>
            EPS Fair Value: <span className="font-bold">₹{epsFairValue.toFixed(2)}</span>
          </span>
        </div>

        <div className="text-center mt-0 text-sm">
          <span className={marginColor}>
            Margin of Safety:{' '}
            <span className="font-bold">
              {margin >= 0 ? '+' : ''}{margin.toFixed(2)}%
            </span>
          </span>
        </div>

        <div className="text-center mt-0">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            * DCF and EPS values are calculated based on the assumptions mentioned below.
          </p>
        </div>
      </div>
    </>
  );
}
