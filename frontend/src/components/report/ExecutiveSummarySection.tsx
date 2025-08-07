'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import GrowthSummary from '@/components/summary/GrowthSummary';
import ProfitabilitySummary from '@/components/summary/ProfitabilitySummary';
import SolvencySummary from '@/components/summary/SolvencySummary';
import CapexSummary from '@/components/summary/CapexSummary';
import ValuationSummary from '@/components/summary/ValuationSummary';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import ValuationGauge from '@/components/ui/ValuationGauge';

export default function ExecutiveSummarySection() {
  
  const [hydrated, setHydrated] = useState(false);
  
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  const safe = (v: any) => (typeof v === 'number' && isFinite(v) ? v : 0);

  const dcf = safe(results?.dcf?.dcf_fair_value);
  const eps = safe(results?.eps?.eps_fair_value);
  const price = safe(metrics?.current_price);




  useEffect(() => {
    setHydrated(true);
  }, []);

  const isReady =
    hydrated &&
    metrics &&
    Object.keys(metrics).length > 0 
    

  if(!isReady) {
    return (
      <section className="text-sm text-gray-500 italic mb-4">
        📂 Executive summary loading or incomplete.
      </section>
    );
  }

  return (
    <section className="mb-4" id="executive-summary">
      
      <div className="mb-4">
        <ValuationSummary/>
        <GrowthSummary metrics={metrics}  />
        <ProfitabilitySummary metrics={metrics}  />
        <SolvencySummary metrics={metrics} />
        <CapexSummary metrics={metrics} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        
      </div>
    
    </section>
  );
}
