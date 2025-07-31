'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
import EPSInputForm from '@/components/eps/EPSInputForm';
import EPSProjectionTable from '@/components/eps/EPSProjectionTable';
import EPSSensitivityTables from '@/components/eps/EPSSensitivityTables';

export default function EPSValuationSection() {
  const assumptions = useGlobalStore((s) => s.assumptions);

  const [form, setForm] = useState<any>({});
  const [projection, setProjection] = useState<any>(null);

  const runEPSProjection = async () => {
    const payload = {
      base_year: form.base_year?.toString(),
      base_revenue: Number(form.base_revenue || 0),
      revenue_growth: Number(form.revenue_growth || 0),
      ebit_margin: Number(form.ebit_margin || 0),
      interest_exp_pct: Number(form.interest_exp_pct || 0),
      tax_rate: Number(form.tax_rate || 0),
      shares_outstanding: Number(form.shares_outstanding || 0),
      current_price: Number(form.current_price || 0),
      projection_years: Number(form.projection_years || 5),
    };

    console.log("📤 EPS Payload:", payload);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project-eps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log("📥 EPS Result:", data);
      setProjection(data);
    } catch (err) {
      console.error("❌ EPS projection failed:", err);
    }
  };

  // Step 1: Populate form from assumptions
  useEffect(() => {
    if (assumptions && assumptions.latest_revenue) {
      const mapped = {
        base_year: assumptions.base_year || '',
        base_revenue: assumptions.latest_revenue || '',
        revenue_growth: assumptions.revenue_growth || '',
        ebit_margin: assumptions.ebit_margin || '',
        interest_exp_pct: assumptions.interest_exp_pct || '',
        tax_rate: assumptions.tax_rate || '',
        shares_outstanding: assumptions.shares_outstanding || '',
        current_price: assumptions.current_price || '',
        projection_years: '5'
      };
      setForm(mapped);
    }
  }, [assumptions]);

  // Step 2: Trigger projection after form is ready
  useEffect(() => {
    if (Number(form.base_revenue) > 0) {
      runEPSProjection();
    }
  }, [form]);

  return (
    <section className="mb-2" id="eps-projection">
      <CollapsibleCard title="📈 EPS Projection">
        {/* Form for reference only, no button */}
        <EPSInputForm form={form} setForm={setForm} handleProject={() => {}} />

        {!projection && (
          <p className="text-sm text-blue-500 mt-2">⏳ Auto-generating EPS projection...</p>
        )}

        {projection?.projection_table && <EPSProjectionTable data={projection} />}
        {(projection?.sensitivity_eps || projection?.sensitivity_price) && (
          <EPSSensitivityTables data={projection} />
        )}
      </CollapsibleCard>
    </section>
  );
}
