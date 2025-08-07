'use client';

import { useEffect } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import EPSSensitivityTables from '@/components/eps/EPSSensitivityTables';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import EPSProjectionTable from '@/components/eps/EPSProjectionTable';

export default function EPSValuationSection() {
  const metrics = useGlobalStore((s) =>
    Array.isArray(s.metrics) ? s.metrics[0] : s.metrics
  );
  const assumptions = useGlobalStore((s) => s.assumptions);
  const calculationTriggered = useGlobalStore((s) => s.calculationTriggered);
  const resetCalculation = useGlobalStore((s) => s.resetCalculation);
  const setValuationResults = useGlobalStore((s) => s.setValuationResults);
  const eps_results = useGlobalStore((s) => s.valuationResults?.eps);

  const form = {
    base_revenue: assumptions.base_revenue,
    projection_years: 3,
    revenue_growth: assumptions.growth_x,
    ebit_margin: assumptions.ebit_margin,
    interest_exp_pct: assumptions.interest_exp_pct,
    tax_rate: assumptions.tax_rate,
    shares_outstanding: metrics?.shares_outstanding ?? 1,
    current_price: metrics?.current_price ?? 0,
    base_year: metrics?.base_year ?? 'FY25',
  };

  const run_eps = async () => {
    if (!assumptions || !assumptions.base_revenue) return;

    console.log('[EPS] Sending EPS request with form:', form);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project-eps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const raw = await res.json();
    const data = Array.isArray(raw) ? raw[0] : raw;
    console.log('[EPS] data:', data);

    setValuationResults((prev) => ({
      ...prev,
      eps: {
        ...data,
      },
    }));

    resetCalculation();
  };

  useEffect(() => {
    if (calculationTriggered) {
      run_eps();
    }
  }, [calculationTriggered]);

  if (!eps_results || !eps_results.projection_table) {
    return (
      <section className="text-sm text-gray-500 italic mb-4">
        📂 EPS projection not available yet.
      </section>
    );
  }

  return (
    <section className="mb-2" id="eps-projection">
      <p>
        EPS Fair Value is calcualted based on FAIR PE = 20 and 3 year projected EPS  ₹{eps_results.eps_fair_value.toFixed(0) || 'N/A'} 
      </p>    
      
      <EPSProjectionTable data={eps_results} />
      <EPSSensitivityTables data={eps_results} />
      
    </section>
  );
}
