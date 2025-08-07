'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import ValuationSummary from '@/components/dcf/ValuationSummary';
import DCFTable from '@/components/dcf/DCFTable';
import SensitivityTable from '@/components/dcf/SensitivityTable';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

export default function DCFValuationSection() {
  const raw = useGlobalStore((s) => s.metrics);
  const metrics = Array.isArray(raw) ? raw[0] : raw;
  const assumptions = useGlobalStore((s) => s.assumptions);
  const setValuationResults = useGlobalStore((s) => s.setValuationResults);
  
  const calculationTriggered = useGlobalStore((s) => s.calculationTriggered);
  const resetCalculation = useGlobalStore((s) => s.resetCalculation);
  const valuationResult = useGlobalStore((s) => s.valuationResults?.dcf);
  
  const [sensitivityData, setSensitivityData] = useState(null);

  const form = {
    current_price: metrics?.current_price ?? 0, // still from metrics
    base_revenue: assumptions.base_revenue ?? 0,
    latest_net_debt: assumptions.latest_net_debt ?? 0,
    shares_outstanding: metrics?.shares_outstanding ?? 1, // safe to keep from metrics
    ebit_margin: assumptions.ebit_margin ?? 0,
    depreciation_pct: assumptions.depreciation_pct ?? 0,
    capex_pct: assumptions.capex_pct ?? 0,
    wc_change_pct: assumptions.wc_change_pct ?? 0,
    
    tax_rate: assumptions.tax_rate ?? 25,
    interest_pct: assumptions.interest_pct ?? 0,
    x_years: 3,
    growth_x: assumptions.growth_x ?? 0,
    y_years: 10,
    growth_y: assumptions.growth_y ?? 0,
    growth_terminal: assumptions.growth_terminal ?? 2,
  };

  const runValuation = async () => {
    if (!assumptions || !assumptions.base_revenue) return;

    console.log('[DCF] Sending DCF request with form:', form);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const raw = await res.json();
    const data = Array.isArray(raw) ? raw[0] : raw;

    setValuationResults((prev) => ({
      ...prev,
      dcf: {
        ...data,
      },
      dcf_sensitivity: {
        ...data.sensitivity_table, // if exists
      },
    }));
    

    resetCalculation();
  };

  useEffect(() => {
    if (calculationTriggered) {
      runValuation();
    }
  }, [calculationTriggered]);

  return (
    <section className="mb-2" id="dcf-valuation">
      
      {valuationResult ? (
        <>
          <ValuationSummary valuation={valuationResult?.dcf} />
          <DCFTable table={valuationResult.fcf_table} />
          <SensitivityTable
            valuationResult={valuationResult}
            current_price={metrics?.current_price || ''}
            form={form}
            setSensitivityData={setSensitivityData}
            sensitivityData={sensitivityData}
          />
        </>
      ) : (
        <div className="text-sm text-gray-500 italic">
          No DCF valuation yet. Click “Calculate” in the assumptions panel.
        </div>
      )}
    
    </section>
  );
}
