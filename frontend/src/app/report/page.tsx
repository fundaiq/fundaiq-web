'use client';

import { useEffect, useRef, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import DataImportSection from '@/components/report/DataImportSection';
import CompanyInfoSection from '@/components/report/CompanyInfoSection';
import FinancialHealthSection from '@/components/report/FinancialHealthSection';
import DCFValuationSection from '@/components/report/DCFValuationSection';
import EPSValuationSection from '@/components/report/EPSValuationSection';
import Disclaimer from '@/components/Disclaimer';
import ReportTopNav from '@/components/report/ReportTopNav';

export default function CompanyReportPage() {
  const [mounted, setMounted] = useState(false);
  const companyInfo = useGlobalStore((state) => state.company_info);
  const resetAll = useGlobalStore((state) => state.resetAll);
  const [resetKey, setResetKey] = useState(0);
  const disclaimerRef = useRef(null);

  const handleReset = () => {
    resetAll();
    setResetKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showSections = !!companyInfo?.name?.trim();

  const sections = {
    import: useRef(null),
    disclaimer: useRef(null),
    overview: useRef(null),
    health: useRef(null),
    valuation: useRef(null),
    eps: useRef(null),
    conclusion: useRef(null)
  };

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const scrollTo = (section) => {
    sections[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white">
      <ReportTopNav
        scrollTo={scrollTo}
        showSections={showSections}
        onReset={handleReset}
      />

      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <span className="dark:text-white text-[#1F1F1F]">Funda</span>
          <span className="text-[#0073E6]">IQ</span> Report Builder
        </h1>

        <div id="import" ref={sections.import} className="scroll-mt-32">
          <DataImportSection resetKey={resetKey} />
        </div>

        {showSections && (
          <>
            <div id="dislaimer" ref={sections.disclaimer} className="scroll-mt-32">
              <Disclaimer />
            </div>
            <div id="overview" ref={sections.overview} className="scroll-mt-32">
              <CompanyInfoSection />
            </div>
            <div id="health" ref={sections.health} className="scroll-mt-32">
              <FinancialHealthSection />
            </div>
            <div id="valuation" ref={sections.valuation} className="scroll-mt-32">
              <DCFValuationSection />
            </div>
            <div id="eps" ref={sections.eps} className="scroll-mt-32">
              <EPSValuationSection />
            </div>
            <div id="conclusion" ref={sections.conclusion} className="scroll-mt-32">
              {/* Add ConclusionSection here if you have one */}
            </div>
          </>
        )}
      </main>
      
    </div>
    
  );
}
