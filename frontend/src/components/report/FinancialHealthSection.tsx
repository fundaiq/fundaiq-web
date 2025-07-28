'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { GrowthSection } from '@/components/health/sections/GrowthSection';
import { GrowthRateSection } from '@/components/health/sections/GrowthRateSection';
import { ProfitabilitySection } from '@/components/health/sections/ProfitabilitySection';
import { LeverageSection } from '@/components/health/sections/LeverageSection';
import { BalanceSheetSection } from '@/components/health/sections/BalanceSheetSection';
import { SummaryBox } from '@/components/health/SummaryBox';

export default function FinancialHealthSection() {
  const metrics = useGlobalStore((state) => state.calculated_metrics);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const rawYears = metrics?.years || [];
  const years = rawYears.map((y: string) => y.replace("Mar-", ""));

  if (!hydrated || !metrics || Object.keys(metrics).length === 0) {
    return <div className="text-center text-gray-500 p-8">📂 No financial data available.</div>;
  }

  return (
    <section className="mb-10" id="financial-health">
      <h2 className="text-xl font-semibold mb-4">💊 Financial Health Check</h2>
      <GrowthSection metrics={metrics} years={years} />
      <GrowthRateSection metrics={metrics} years={years} />
      <ProfitabilitySection metrics={metrics} years={years} />
      <BalanceSheetSection metrics={metrics} years={years} />
      <LeverageSection metrics={metrics} years={years} />
      <SummaryBox metrics={metrics} />
    </section>
  );
}
