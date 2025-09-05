'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import {
  ComposedChart,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import styles from '@/styles/StockPriceChart.module.css';

// ============================================================================
// Types & constants
// ============================================================================

type Range = '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | '5Y' | 'MAX';
type ChartMode = 'price' | 'return';
export type MovingAverage = 10 | 20 | 50 | 100 | 200;
export type Benchmark = 'NIFTY50' | 'NIFTY500' | 'SENSEX';

const RANGES: Range[] = ['1W', '1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', 'MAX'];
const MOVING_AVERAGES: MovingAverage[] = [10, 20, 50, 100, 200];
const BENCHMARKS: Benchmark[] = ['NIFTY50', 'NIFTY500', 'SENSEX'];

const YAHOO_TICKER_CANDIDATES: Record<Benchmark, string[]> = {
  NIFTY50: ['^NSEI'],
  NIFTY500: [
    '^CNX500',     // common legacy symbol
    '^NIFTY500',   // sometimes used
    '^CRSLDX',     // occasional vendor alias
  ],
  SENSEX: ['^BSESN'],
};


// Approx trading bars for each range (used to slice visible window)
const POINTS_BY_RANGE: Record<Range, number> = {
  '1W': 5,
  '1M': 22,
  '3M': 66,
  '6M': 126,
  '1Y': 252,
  '2Y': 504,
  '3Y': 756,
  '5Y': 1260,
  'MAX': Number.POSITIVE_INFINITY,
};

// Widen fetch when large MAs are active (so we have lookback)
function chooseFetchRange(range: Range, maxMA: number): Range {
  const bumpOne: Record<Range, Range> = {
    '1W':'3M','1M':'6M','3M':'1Y','6M':'2Y','1Y':'3Y','2Y':'5Y','3Y':'5Y','5Y':'MAX','MAX':'MAX'
  };
  if (maxMA >= 200) return bumpOne[range];
  if (maxMA >= 100) {
    const mid: Record<Range, Range> = {
      '1W':'1Y','1M':'1Y','3M':'1Y','6M':'2Y','1Y':'3Y','2Y':'5Y','3Y':'5Y','5Y':'MAX','MAX':'MAX'
    };
    return mid[range];
  }
  if (maxMA >= 50) {
    const small: Record<Range, Range> = {
      '1W':'6M','1M':'6M','3M':'1Y','6M':'1Y','1Y':'2Y','2Y':'3Y','3Y':'5Y','5Y':'MAX','MAX':'MAX'
    };
    return small[range];
  }
  return range;
}

// ============================================================================
// CSS helpers (tokens)
// ============================================================================

const cssVar = (prop: string): string => {
  if (typeof window === 'undefined') return '';
  const el = document.body?.getAttribute('data-theme') ? document.body : document.documentElement;
  return getComputedStyle(el).getPropertyValue(prop).trim();
};

const getChartColors = () => ({
  stock: cssVar('--chart-stock-color') || '#2563eb',
  ma10: cssVar('--chart-ma10-color') || '#f59e0b',
  ma20: cssVar('--chart-ma20-color') || '#10b981',
  ma50: cssVar('--chart-ma50-color') || '#8b5cf6',
  ma100: cssVar('--chart-ma100-color') || '#ef4444',
  ma200: cssVar('--chart-ma200-color') || '#06b6d4',
  benchmark1: cssVar('--chart-benchmark1-color') || '#f59e0b',
  benchmark2: cssVar('--chart-benchmark2-color') || '#10b981',
  benchmark3: cssVar('--chart-benchmark3-color') || '#8b5cf6',
});

// ============================================================================
// Date & normalization helpers (UTC-safe)
// ============================================================================

type Point = { date: string; close: number; volume?: number };

const toUTCDateOnly = (d: string | number | Date) => {
  const x = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
  return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
};
const toISODate = (d: string | number | Date) => toUTCDateOnly(d).toISOString().slice(0, 10);

const formatDDMMYY = (iso: string) => {
  const dt = new Date(iso + 'T00:00:00Z');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(dt.getUTCFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

const normalizePoints = (arr: Point[]): Point[] =>
  arr
    .filter(p => Number.isFinite(p.close))
    .map(p => ({ date: toISODate(p.date), close: Number(p.close), volume: Number(p.volume || 0) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

// ============================================================================
// Cadence unifier (daily/weekday series) + merge helpers
// ============================================================================

const mergeByDate = (...lists: (Point[] | null | undefined)[]): Point[] => {
  const m = new Map<string, Point>();
  for (const arr of lists) {
    if (!arr) continue;
    for (const p of arr) m.set(p.date, p);
  }
  return [...m.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
};

const dayDiff = (a: string, b: string) =>
  (new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / 86400000;

const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const medianGapDays = (pts: Point[]) => {
  if (pts.length < 2) return 1;
  const gaps: number[] = [];
  for (let i = 1; i < pts.length; i++) gaps.push(dayDiff(pts[i - 1].date, pts[i].date));
  return median(gaps);
};

// Expand to business-day series by filling weekdays between points with last close
const expandToDailyWeekdays = (pts: Point[]): Point[] => {
  if (pts.length < 2) return pts;
  const out: Point[] = [pts[0]];
  let prev = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i];
    let d = new Date(prev.date + 'T00:00:00Z');
    while (true) {
      d.setUTCDate(d.getUTCDate() + 1);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const s = `${yyyy}-${mm}-${dd}`;
      if (s === cur.date) { out.push(cur); break; }
      const dow = d.getUTCDay(); // 0 Sun, 6 Sat
      if (dow !== 0 && dow !== 6) out.push({ date: s, close: prev.close, volume: prev.volume });
    }
    prev = cur;
  }
  return out;
};

const ensureDaily = (pts: Point[]): Point[] => {
  const gap = medianGapDays(pts);
  return gap <= 1.5 ? pts : expandToDailyWeekdays(pts);
};

// ============================================================================
// Prefix sums for trailing SMA (exclude current day)
// ============================================================================

const buildPrefix = (closes: number[]) => {
  const pref = new Array(closes.length + 1).fill(0);
  for (let i = 1; i <= closes.length; i++) pref[i] = pref[i - 1] + closes[i - 1];
  return pref;
};
const smaBefore = (prefix: number[], i: number, n: number): number | null => {
  if (i < n) return null; // need n prior bars
  return (prefix[i] - prefix[i - n]) / n;
};

// ============================================================================
// Derived series
// ============================================================================

const toReturns = (arr: Point[]) => {
  if (!arr.length) return [] as { date: string; value: number }[];
  const base = arr[0].close;
  return arr.map(p => ({ date: p.date, value: ((p.close / base) - 1) * 100 }));
};

// ============================================================================
// UI: Performance metrics (class names preserved)
// ============================================================================

const PerformanceMetrics: React.FC<{
  series: Point[];
  allBenchmarkSeries: Record<string, Point[]>;
  selectedBenchmarks: Benchmark[];
  range: Range;
}> = ({ series, allBenchmarkSeries, selectedBenchmarks, range }) => {
  const perf = useMemo(() => {
    if (series.length < 2) return null;
    const start = series[0];
    const end = series[series.length - 1];
    const total = ((end.close - start.close) / start.close) * 100;
    const years = { '1W': 1/52, '1M': 1/12, '3M': 0.25, '6M': 0.5, '1Y': 1, '2Y': 2, '3Y': 3, '5Y': 5, 'MAX': 10 }[range];
    const cagr = years >= 1 ? (Math.pow(end.close / start.close, 1 / years) - 1) * 100 : null;

    const benches = selectedBenchmarks.map(b => {
      const s = allBenchmarkSeries[b];
      if (!s || s.length < 2) return null;
      const bs = s[0].close, be = s[s.length - 1].close;
      const br = ((be - bs) / bs) * 100;
      const bc = years >= 1 ? (Math.pow(be / bs, 1 / years) - 1) * 100 : null;
      return { name: b, startPrice: bs, endPrice: be, return: br, cagr: bc, alpha: total - br };
    }).filter(Boolean) as any[];

    return { stock: { startDate: start.date, endDate: end.date, startPrice: start.close, endPrice: end.close, return: total, cagr }, benchmarks: benches };
  }, [series, allBenchmarkSeries, selectedBenchmarks, range]);

  if (!perf) return null;

  return (
    <div className={styles.performanceContainer}>
      <h3 className={styles.performanceTitle}>Performance Metrics</h3>
      <div className={styles.performanceSection}>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceItem}><span className={styles.performanceLabel}>Start Price:</span><span className={styles.performanceValue}>₹{perf.stock.startPrice.toFixed(0)}</span></div>
          <div className={styles.performanceItem}><span className={styles.performanceLabel}>End Price:</span><span className={styles.performanceValue}>₹{perf.stock.endPrice.toFixed(0)}</span></div>
          <div className={styles.performanceItem}><span className={styles.performanceLabel}>Period:</span><span className={styles.performanceValue}>{perf.stock.startDate} - {perf.stock.endDate}</span></div>
          <div className={styles.performanceItem}><span className={`${styles.performanceLabel}`}>Total Return:</span><span className={`${styles.performanceValue} ${perf.stock.return >= 0 ? styles.positive : styles.negative}`}>{perf.stock.return.toFixed(2)}%</span></div>
          {perf.stock.cagr !== null && (
            <div className={styles.performanceItem}><span className={styles.performanceLabel}>CAGR:</span><span className={`${styles.performanceValue} ${perf.stock.cagr! >= 0 ? styles.positive : styles.negative}`}>{perf.stock.cagr!.toFixed(2)}%</span></div>
          )}
        </div>
      </div>

      {perf.benchmarks.length > 0 && (
        <div className={styles.performanceSection}>
          <h4 className={styles.performanceSubtitle}>Benchmark Comparison</h4>
          {perf.benchmarks.map((b: any) => (
            <div key={b.name} className={styles.benchmarkPerformance}>
              <h5 className={styles.benchmarkName}>{b.name}</h5>
              <div className={styles.performanceGrid}>
                <div className={styles.performanceItem}><span className={styles.performanceLabel}>Start:</span><span className={styles.performanceValue}>{b.startPrice.toFixed(0)}</span></div>
                <div className={styles.performanceItem}><span className={styles.performanceLabel}>End:</span><span className={styles.performanceValue}>{b.endPrice.toFixed(0)}</span></div>
                <div className={styles.performanceItem}><span className={styles.performanceLabel}>Return:</span><span className={`${styles.performanceValue} ${b.return >= 0 ? styles.positive : styles.negative}`}>{b.return.toFixed(2)}%</span></div>
                {b.cagr !== null && (<div className={styles.performanceItem}><span className={styles.performanceLabel}>CAGR:</span><span className={`${styles.performanceValue} ${b.cagr >= 0 ? styles.positive : styles.negative}`}>{b.cagr.toFixed(2)}%</span></div>)}
                <div className={styles.performanceItem}><span className={styles.performanceLabel}>Alpha:</span><span className={`${styles.performanceValue} ${b.alpha >= 0 ? styles.positive : styles.negative}`}>{b.alpha.toFixed(2)}%</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UI: Tooltip (class names preserved)
// ============================================================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={styles.customTooltip}>
      <p className={styles.tooltipLabel}>{`Date: ${label}`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className={styles.tooltipItem} style={{ color: entry.color }}>
          {`${entry.name}: ${
            entry.dataKey.includes('Return') || entry.dataKey.includes('return')
              ? `${Number(entry.value ?? 0).toFixed(2)}%`
              : entry.dataKey.includes('MA') || entry.dataKey === 'price'
              ? `₹${Number(entry.value ?? 0).toFixed(0)}`
              : Number(entry.value ?? 0).toLocaleString()
          }`}
        </p>
      ))}
    </div>
  );
};

// ============================================================================
// UI: Controls (class names preserved)
// ============================================================================

const ChartControls: React.FC<{
  mode: ChartMode;
  setMode: (m: ChartMode) => void;
  range: Range;
  setRange: (r: Range) => void;
  selectedMAs: MovingAverage[];
  toggleMA: (m: MovingAverage) => void;
  selectedBenchmarks: Benchmark[];
  toggleBenchmark: (b: Benchmark) => void;
  loading: boolean;
}> = ({ mode, setMode, range, setRange, selectedMAs, toggleMA, selectedBenchmarks, toggleBenchmark, loading }) => (
  <div className={styles.controlsContainer}>
    <div className={styles.controlGroup}>
      <span className={styles.controlLabel}>View:</span>
      <div className={styles.modeToggle}>
        {(['price', 'return'] as ChartMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`${styles.modeButton} ${mode === m ? styles.active : ''}`}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
        ))}
      </div>
    </div>

    <div className={styles.controlGroup}>
      <span className={styles.controlLabel}>Period:</span>
      <div className={styles.rangeButtons}>
        {RANGES.map(r => (
          <button key={r} onClick={() => setRange(r)} className={`${styles.rangeButton} ${range === r ? styles.active : ''}`}>{r}</button>
        ))}
      </div>
    </div>

    {mode === 'price' && (
      <div className={styles.controlGroup}>
        <div className={styles.movingAverageControls}>
          <span className={styles.controlLabel}>Moving Avg:</span>
          <div className={styles.maButtons}>
            {MOVING_AVERAGES.map(ma => (
              <button key={ma} onClick={() => toggleMA(ma)} className={`${styles.maButton} ${selectedMAs.includes(ma) ? styles.active : ''}`} disabled={loading}>{ma}</button>
            ))}
          </div>
        </div>
      </div>
    )}

    {mode === 'return' && (
      <div className={styles.controlGroup}>
        <div className={styles.benchmarkControls}>
          <span className={styles.controlLabel}>Benchmarks:</span>
          <div className={styles.benchmarkButtons}>
            {BENCHMARKS.map(bench => (
              <button key={bench} onClick={() => toggleBenchmark(bench)} className={`${styles.benchmarkButton} ${selectedBenchmarks.includes(bench) ? styles.active : ''}`} disabled={loading}>{bench}</button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// ============================================================================
// UI: Price Info Display (shows current price and MA values)
// ============================================================================

const PriceInfoDisplay: React.FC<{
  chartData: any[];
  selectedMAs: MovingAverage[];
  mode: ChartMode;
}> = ({ chartData, selectedMAs, mode }) => {
  // Only show in price mode and when we have data
  if (mode !== 'price' || !chartData.length) return null;

  // Get the latest data point
  const latestData = chartData[chartData.length - 1];
  if (!latestData) return null;

  const currentPrice = latestData.price;

  return (
    <div className={styles.priceInfoContainer}>
      <div className={styles.currentPriceBox}>
        <div className={styles.currentPriceLabel}>Current Price</div>
        <div className={styles.currentPriceValue}>₹{Number(currentPrice).toFixed(0)}</div>
      </div>
      
      {selectedMAs.length > 0 && (
        <div className={styles.maValuesBox}>
          {selectedMAs.map(ma => {
            const maValue = latestData[`MA${ma}`];
            return maValue ? (
              <div key={ma} className={styles.maValue}>
                <div className={styles.maLabel}>{ma}D MA</div>
                <div className={styles.maPrice}>₹{Number(maValue).toFixed(0)}</div>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};




// ============================================================================
// UI: Chart renderer (class names preserved; no Legend)
// ============================================================================

const ChartRenderer: React.FC<{
  mode: ChartMode;
  chartData: any[];
  yDomain: [number | string, number | string];
  selectedMAs: MovingAverage[];
  selectedBenchmarks: Benchmark[];
  colors: ReturnType<typeof getChartColors>;
  getMAColor: (p: MovingAverage) => string;
  getBenchmarkColor: (b: Benchmark, i: number) => string;
}> = ({ mode, chartData, yDomain, selectedMAs, selectedBenchmarks, colors, getMAColor, getBenchmarkColor }) => {
  if (!chartData.length) return null;

  const common = { margin: { top: 10, right: 8, left: 10, bottom: 40 } } as const;

  return mode === 'price' ? (
    <div className={styles.priceChartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} {...common}>
          <CartesianGrid
            horizontal
            vertical={false}
            stroke={cssVar('--chart-grid-color') || '#e5e7eb'}
            strokeDasharray="2 2"
          />
          <XAxis dataKey="formattedDate" interval="preserveStartEnd" minTickGap={40} height={50} angle={-45} textAnchor="end" />
          <YAxis domain={yDomain} orientation="right" tickCount={10} tickFormatter={(v: number) => `₹${Math.round(v)}`} />
          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Line type="monotone" dataKey="price" stroke={colors.stock} strokeWidth={2.5} dot={false} name="Stock Price" connectNulls />
          {selectedMAs.map(ma => (
            <Line key={`MA${ma}`} type="monotone" dataKey={`MA${ma}`} stroke={getMAColor(ma)} strokeWidth={1.5} dot={false} name={`${ma}D MA`} strokeDasharray="3 3" connectNulls />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div className={styles.returnChartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} {...common}>
          <CartesianGrid
            horizontal
            vertical={false}
            stroke={cssVar('--chart-grid-color') || '#e5e7eb'}
            strokeDasharray="2 2"
          />
          <XAxis dataKey="formattedDate" interval="preserveStartEnd" minTickGap={40} height={50} angle={-45} textAnchor="end" />
          <YAxis domain={yDomain} orientation="right" tickCount={10} tickFormatter={(v: number) => `${Math.round(v)}%`} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <ReferenceLine y={0} stroke={cssVar('--text-tertiary') || '#64748b'} strokeDasharray="2 2" />

          <Line type="monotone" dataKey="stockReturn" stroke={colors.stock} strokeWidth={2.5} dot={false} name="Stock Return" connectNulls />
          {selectedBenchmarks.map((b, i) => (
            <Line key={`${b}Return`} type="monotone" dataKey={`${b}Return`} stroke={getBenchmarkColor(b, i)} strokeWidth={1.5} dot={false} name={b} strokeDasharray="5 5" connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================================
// Main component (class names preserved)
// ============================================================================

interface StockPriceChartProps { ticker?: string; apiBase?: string; className?: string }

export default function StockPriceChart({ ticker: propTicker, apiBase: propApiBase, className = '' }: StockPriceChartProps) {
  const { theme } = useGlobalStore();

  // derive ticker from store if prop not supplied
  const company = useGlobalStore(s => s.companyInfo);
  const metrics = useGlobalStore(s => (Array.isArray(s.metrics) ? s.metrics[0] : s.metrics));
  const tickerInput = useGlobalStore(s => s.tickerInput);
  const ticker = useMemo(() => {
    if (propTicker) return propTicker.trim();
    const list = [company?.ticker, metrics?.ticker, tickerInput].filter(Boolean);
    return list[0]?.toString().trim() || '';
  }, [propTicker, company?.ticker, metrics?.ticker, tickerInput]);

  const apiBase = useMemo(() => {
    if (propApiBase) return propApiBase.replace(/\/+$/, '');
    const env = process.env.NEXT_PUBLIC_API_BASE;
    return env ? env.replace(/\/+$/, '') : null;
  }, [propApiBase]);

  // state
  const [fullSeries, setFullSeries] = useState<Point[]>([]); // full (lookback + visible)
  const [series, setSeries] = useState<Point[]>([]);         // visible window only
  const [benchSeries, setBenchSeries] = useState<Record<string, Point[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ChartMode>('price');
  const [range, setRange] = useState<Range>('1Y');
  const [selectedMAs, setSelectedMAs] = useState<MovingAverage[]>([20, 50]);
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<Benchmark[]>([]);

  const colors = useMemo(() => getChartColors(), [theme]);

  // handlers
  const toggleMA = (ma: MovingAverage) => setSelectedMAs(prev => (prev.includes(ma) ? prev.filter(x => x !== ma) : [...prev, ma]));
  const toggleBenchmark = (b: Benchmark) => setSelectedBenchmarks(prev => (prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]));
  const getMAColor = (p: MovingAverage) => ({ 10: 'ma10', 20: 'ma20', 50: 'ma50', 100: 'ma100', 200: 'ma200' }[p] as keyof ReturnType<typeof getChartColors>) && colors[{ 10: 'ma10', 20: 'ma20', 50: 'ma50', 100: 'ma100', 200: 'ma200' }[p] as keyof ReturnType<typeof getChartColors>];
  const getBenchmarkColor = (b: Benchmark, i: number) => [colors.benchmark1, colors.benchmark2, colors.benchmark3][i] || colors.benchmark1;

  // --- fetch helpers (prefer daily if server supports it) ---
  const fetchPoints = async (symbol: string, r: Range): Promise<Point[] | null> => {
    if (!apiBase) return null;
    const qs = `range=${r}&interval=1d`;
    const endpoints = [
      `${apiBase}/series/${encodeURIComponent(symbol)}?${qs}`,
      `${apiBase}/price-series/${encodeURIComponent(symbol)}?${qs}`,
      `${apiBase}/api/series/${encodeURIComponent(symbol)}?${qs}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const pts = (data.points || []).map((p: any) => ({
            date: toISODate(p.date),
            close: Number(p.close),
            volume: Number(p.volume || 0),
          })) as Point[];
          return normalizePoints(pts);
        }
      } catch {}
    }
    return null;
  };

  // --- stock fetch with enforced lookback + fresh tail merge ---
  const loadStock = async (sym: string, r: Range, maxMA: number) => {
    setLoading(true); setError(null);
    try {
      const widened = chooseFetchRange(r, maxMA);

      // merge a widened history + the requested slice + a fresh 1M tail (keeps right edge "today")
      const [widePts, tailPts, freshTail] = await Promise.all([
        fetchPoints(sym, widened),
        r !== widened ? fetchPoints(sym, r) : Promise.resolve(null),
        fetchPoints(sym, '1M'),
      ]);

      let full = normalizePoints(mergeByDate(widePts || [], tailPts || [], freshTail || []));

      // fallback mock
      if (!full.length) {
        const basePrice = 1000;
        const days = 1200;
        full = Array.from({ length: days }, (_, i) => {
          const d = new Date(); d.setUTCDate(d.getUTCDate() - (days - i));
          const price = Math.max(basePrice + i * 0.4 + (Math.random() - 0.5) * 18, basePrice * 0.5);
          return { date: toISODate(d), close: price } as Point;
        });
      }

      // guarantee lookback: ensure >= maxMA bars exist BEFORE first visible
      const visibleCount = POINTS_BY_RANGE[r];
      const firstVisibleIndex = Math.max(0, full.length - (visibleCount === Infinity ? full.length : visibleCount));
      if (firstVisibleIndex < maxMA) {
        const maxPts = await fetchPoints(sym, 'MAX');
        if (maxPts?.length) full = normalizePoints(mergeByDate(full, maxPts));
      }

      const finalVisibleCount = POINTS_BY_RANGE[r];
      const sliced = finalVisibleCount === Infinity ? full : full.slice(-finalVisibleCount);

      setFullSeries(full);
      setSeries(sliced);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data');
      setSeries([]); setFullSeries([]);
    } finally { setLoading(false); }
  };

  // --- benchmark fetch (returns mode) ---
  const loadBenchmark = async (b: Benchmark, r: Range) => {
    if (!ticker || !apiBase) return;

    const candidates = YAHOO_TICKER_CANDIDATES[b] || [b];
    for (const code of candidates) {
      const pts = await fetchPoints(code, r);
      if (pts?.length) {
        setBenchSeries(prev => ({ ...prev, [b]: pts }));
        return; // success on first working symbol
      }
    }
    // optional: clear if none worked (prevents stale data)
    setBenchSeries(prev => ({ ...prev, [b]: [] }));
  };

  // effects
  useEffect(() => { if (ticker && apiBase) loadStock(ticker, range, Math.max(...selectedMAs, 0)); }, [ticker, range, apiBase, selectedMAs.join(',')]);
  useEffect(() => { if (mode === 'return' && series.length) selectedBenchmarks.forEach(b => loadBenchmark(b, range)); }, [mode, selectedBenchmarks.join(','), range, series.map(p => p.date).join(',')]);

  // shape data for charts
  const { chartData, yDomain } = useMemo(() => {
    if (!series.length) return { chartData: [] as any[], yDomain: ['auto', 'auto'] as [string, string] };

    if (mode === 'return') {
      // align on visible dates; compute returns vs first visible
      const visibleDates = series.map(p => p.date);
      const mapByDate = (arr: Point[]) => new Map(arr.map(p => [p.date, p] as const));
      const pMap = mapByDate(series);
      const benchMap: Record<string, Map<string, Point>> = {};
      selectedBenchmarks.forEach(b => { if (benchSeries[b]?.length) benchMap[b] = mapByDate(benchSeries[b]); });

      const base0 = series[0].close;
      const rows = visibleDates.map(d => {
        const r: any = { date: d, formattedDate: formatDDMMYY(d) };
        const p = pMap.get(d)!;
        r.stockReturn = Number((((p.close / base0) - 1) * 100).toFixed(2));
        for (const b of selectedBenchmarks) {
          const bm = benchMap[b]?.get(d);
          if (bm) {
            const b0Arr = benchSeries[b];
            const b0 = b0Arr && b0Arr.length ? b0Arr[0].close : bm.close;
            r[`${b}Return`] = Number((((bm.close / b0) - 1) * 100).toFixed(2));
          } else {
            // ✅ use null instead of 0, so the line doesn't fall to zero
            r[`${b}Return`] = null;
          }
        }
        return r;
      });

      // y-domain from finite values only
      const values: number[] = [];
      rows.forEach(r => {
        if (Number.isFinite(r.stockReturn)) values.push(r.stockReturn);
        selectedBenchmarks.forEach(b => {
          const v = r[`${b}Return`];
          if (Number.isFinite(v)) values.push(v);
        });
      });
      const maxAbs = values.length ? Math.max(...values.map(Math.abs)) : 100;
      return { chartData: rows, yDomain: [-(maxAbs * 1.1), maxAbs * 1.1] as [number, number] };
    }

    // PRICE mode — compute trailing SMA on DAILY cadence (exclude current),
    // then map to visible dates so MA starts on the first visible day.
    const fullDaily = ensureDaily(fullSeries);
    const indexByDateDaily = new Map(fullDaily.map((p, i) => [p.date, i] as const));
    const prefix = buildPrefix(fullDaily.map(p => p.close));

    const rows = series.map(p => {
      const idx = indexByDateDaily.get(p.date);
      const base: any = {
        date: p.date,
        formattedDate: formatDDMMYY(p.date),
        price: Number(p.close),
        volume: Number(p.volume || 0),
      };
      MOVING_AVERAGES.forEach(period => {
        if (selectedMAs.includes(period)) {
          base[`MA${period}`] = idx == null ? null : smaBefore(prefix, idx, period);
        }
      });
      return base;
    });

    // y-domain includes price + active MAs
    const allVals = rows
      .flatMap(r => [r.price, ...selectedMAs.map(ma => r[`MA${ma}`])])
      .filter((v: any) => Number.isFinite(v));
    if (!allVals.length) return { chartData: rows, yDomain: ['auto', 'auto'] as [string, string] };
    const min = Math.min(...allVals), max = Math.max(...allVals); const span = max - min || Math.abs(max) || 1;
    return { chartData: rows, yDomain: [min - span * 0.05, max + span * 0.05] as [number, number] };
  }, [mode, series, fullSeries, selectedMAs, benchSeries, selectedBenchmarks]);

  // guards
  if (!apiBase) return (
    <div className={`${styles.chartContainer} ${className}`}>
      <div className={styles.errorContainer}><div className={styles.errorTitle}>Configuration Error</div><div className={styles.errorMessage}>Please set NEXT_PUBLIC_API_BASE</div></div>
    </div>
  );
  if (!ticker) return (
    <div className={`${styles.chartContainer} ${className}`}>
      <div className={styles.errorContainer}><div className={styles.errorTitle}>No Stock Selected</div><div className={styles.errorMessage}>Please select a stock to view analysis</div></div>
    </div>
  );

  return (
    <div className={`${styles.fadeIn} ${className}`}>
      <div className={styles.controlGroup}>
        <h2 className="text-lg font-semibold">Price Analysis — {ticker}</h2>
        {loading && <div className={styles.loadingSpinner}></div>}
      </div>

      <ChartControls
        mode={mode} setMode={setMode}
        range={range} setRange={setRange}
        selectedMAs={selectedMAs} toggleMA={toggleMA}
        selectedBenchmarks={selectedBenchmarks} toggleBenchmark={toggleBenchmark}
        loading={loading}
      />

      {error && (
        <div className={styles.errorContainer}><div className={styles.errorTitle}>Error Loading Data</div><div className={styles.errorMessage}>{error}</div></div>
      )}

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.emptyState}><div className={styles.loadingSpinner}></div><span style={{ marginLeft: 12 }}>Loading chart data...</span></div>
        ) : !chartData.length ? (
          <div className={styles.emptyState}><span>No data available for {ticker}</span></div>
        ) : (
          <ChartRenderer
            mode={mode}
            chartData={chartData}
            yDomain={yDomain}
            selectedMAs={selectedMAs}
            selectedBenchmarks={selectedBenchmarks}
            colors={colors}
            getMAColor={(p) => ({10:'ma10',20:'ma20',50:'ma50',100:'ma100',200:'ma200'}[p] && (colors as any)[{10:'ma10',20:'ma20',50:'ma50',100:'ma100',200:'ma200'}[p]])}
            getBenchmarkColor={(b, i) => [colors.benchmark1, colors.benchmark2, colors.benchmark3][i] || colors.benchmark1}
          />
        )}
      </div>

      {chartData.length > 0 && (
        <PerformanceMetrics series={series} allBenchmarkSeries={benchSeries} selectedBenchmarks={selectedBenchmarks} range={range} />
      )}
    </div>
  );
}
