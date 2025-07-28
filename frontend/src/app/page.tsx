'use client';

import { useEffect, useRef, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import DataImportSection from '@/components/report/DataImport';
import CompanyInfoSection from '@/components/report/CompanyInfo';
import FinancialHealthSection from '@/components/report/FinancialHealthSection';
import DCFValuationSection from '@/components/report/DCFValuationSection';
import EPSValuationSection from '@/components/report/EPSValuationSection';

export default function CompanyReportPage() {
  const [mounted, setMounted] = useState(false);
  const companyInfo = useGlobalStore((state) => state.company_info);
  const resetAll = useGlobalStore((state) => state.resetAll);
  
  const [resetKey, setResetKey] = useState(0);
  
  const handleReset = () => {
    resetAll();
    setResetKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const showSections = !!companyInfo?.name?.trim();
  console.log("DEBUG: showSections =", showSections);

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
    <div>
      {/* Top nav */}
      <div className="sticky top-14 bg-white dark:bg-zinc-900 z-40 border-b shadow-sm">
        <nav className="flex flex-wrap gap-4 text-sm px-6 py-3 underline text-blue-600 cursor-pointer max-w-6xl mx-auto">
          <span onClick={() => scrollTo('import')}>📥 Data Import</span>
          {showSections && (
            <>
              <span onClick={() => scrollTo('overview')}>🏢 Company Info</span>
              <span onClick={() => scrollTo('health')}>💊 Financial Health</span>
              <span onClick={() => scrollTo('valuation')}>📉 DCF Valuation</span>
              <span onClick={() => scrollTo('eps')}>📈 EPS Projection</span>
              <span onClick={() => scrollTo('conclusion')}>📝 Summary</span>
            </>
          )}
        </nav>
      </div>
      <div className="flex justify-end px-6 pt-4">
      <button
        onClick={handleReset}
        className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        🔄 Reset Report
      </button>
    </div>    
      {/* Main content */}
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📊 One-Page Company Report</h1>

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
