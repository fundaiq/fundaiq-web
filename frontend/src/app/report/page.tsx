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

  const [offsetTop, setOffsetTop] = useState(144); // default 36 in px
  const handleReset = () => {
    resetAll();
    setResetKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  useEffect(() => {
    if (disclaimerRef.current) {
      const rect = disclaimerRef.current.getBoundingClientRect();
      setOffsetTop(rect.bottom + window.scrollY + 16); // +16px margin
    }
  }, []);
  const showSections = !!companyInfo?.name?.trim();

  const sections = {
    import: useRef(null),
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
      <Disclaimer />
      
      <ReportTopNav
        scrollTo={scrollTo}
        showSections={showSections}
        onReset={handleReset}
      />
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          📊 <span className="dark:text-white text-[#1F1F1F]">Funda</span>
          <span className="text-[#0073E6]">IQ</span> Report Builder
        </h1>

        <div ref={sections.import}><DataImportSection resetKey={resetKey} /></div>

        {showSections && (
          <>
            <div ref={sections.overview}><CompanyInfoSection /></div>
            <div ref={sections.health}><FinancialHealthSection /></div>
            <div ref={sections.valuation}><DCFValuationSection /></div>
            <div ref={sections.eps}><EPSValuationSection /></div>
          </>
        )}
      </main>
    </div>
  );
}
