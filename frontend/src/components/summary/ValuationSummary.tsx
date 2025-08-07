'use client';

import CollapsibleCard from '@/components/ui/CollapsibleCard';
import { useGlobalStore } from '@/store/globalStore';

export default function ValuationSummary() {
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcf = safe(results?.dcf?.dcf_fair_value);
  const eps = safe(results?.eps?.eps_fair_value);
  const price = safe(metrics?.current_price);




  const dcfMargin = dcf && price ? ((dcf - price) / price) * 100 : null;
  const epsMargin = eps && price ? ((eps - price) / price) * 100 : null;

  const verdict =
    dcfMargin > 20 && epsMargin > 20
      ? 'Stock appears undervalued — worth considering.'
      : dcfMargin < -10 && epsMargin < -10
      ? 'Stock appears overvalued — consider avoiding.'
      : 'Valuation is near fair levels — look deeper.';

  return (
    <section>
      <p>
        DCF Value: ₹{dcf?.toFixed(0) || 'N/A'}, EPS Value: ₹
        {eps?.toFixed(0) || 'N/A'}, Current Price: ₹
        {price?.toFixed(0) || 'N/A'}
      </p>
      <p className="mt-1">{verdict}</p>
      
    </section>
  );
}
