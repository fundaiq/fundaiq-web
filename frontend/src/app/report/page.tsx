
'use client';

import { useEffect, useRef, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import ReportTopNav from '@/components/report/ReportTopNav';
import DataImportSection from '@/components/report/DataImportSection';
import StockSummaryCard from '@/components/report/StockSummaryCard';
import Disclaimer from '@/components/Disclaimer';
import ExecutiveSummarySection from '@/components/report/ExecutiveSummarySection';
import AssumptionsPanel from '@/components/report/AssumptionsPanel';
import CompanyInfoSection from '@/components/report/CompanyInfoSection';
import FinancialHealthSection from '@/components/report/FinancialHealthSection';
import DCFValuationSection from '@/components/report/DCFValuationSection';
import EPSValuationSection from '@/components/report/EPSValuationSection';
import ValuationMeter from '@/components/ui/ValuationMeter';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';


export default function CompanyReportPage() {
  const [mounted, setMounted] = useState(false);
  const companyInfo = useGlobalStore((s) => s.companyInfo);
  const resetAll = useGlobalStore((state) => state.resetAll);
  const [resetKey, setResetKey] = useState(0);
  const [showSections, setShowSections] = useState(false);

  useEffect(() => {
    const valid = !!companyInfo?.name?.trim();
    setShowSections(valid);
  }, [companyInfo]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleReset = () => {
    resetAll();
    setResetKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white">
       {/* <ReportTopNav showSections={showSections} onReset={handleReset} /> */}

      <main className="px-4 sm:px-6 pb-6 max-w-7xl mx-auto space-y-6">
        {/* Data Import */}
        <section id="import">
          <DataImportSection resetKey={resetKey} />
        </section>

        {!showSections ? (
          <div className="text-center text-gray-500 mt-10">
            📭 Please import data to view the full report.
          </div>
        ) : (
          <>
            {/* Disclaimer */}
            <section>
              <Disclaimer />
            </section>

            {/* Valuation Meter */}
            <section>
              <ValuationMeter />
            </section>

            {/* Tabs for all following sections */}
            <Tabs defaultValue="assumptions" className="w-full mt-6">
              <TabsList
                className="
                  flex-nowrap 
                  overflow-x-auto 
                  whitespace-nowrap 
                  scrollbar-thin 
                  scrollbar-thumb-gray-300 
                  scrollbar-track-transparent 
                  max-w-full
                "
              >
                <TabsTrigger value="executive" className="shrink-0">Executive Summary</TabsTrigger>
                <TabsTrigger value="stock_summary" className="shrink-0">Stock Metrics</TabsTrigger>
                <TabsTrigger value="assumptions" className="shrink-0">Assumptions</TabsTrigger>
                <TabsTrigger value="health" className="shrink-0">Financial Health</TabsTrigger>
                <TabsTrigger value="dcf" className="shrink-0">DCF Valuation</TabsTrigger>
                <TabsTrigger value="eps" className="shrink-0">EPS Valuation</TabsTrigger>
                <TabsTrigger value="info" className="shrink-0">Company Info</TabsTrigger>
              </TabsList>

              <TabsContent value="assumptions" forceMount>
                <AssumptionsPanel />
              </TabsContent>
              
              <TabsContent value="stock_summary" forceMount>
                <StockSummaryCard />
              </TabsContent>

              <TabsContent value="executive" forceMount>
                <ExecutiveSummarySection />
              </TabsContent>

              <TabsContent value="health" forceMount>
                <FinancialHealthSection />
              </TabsContent>

              <TabsContent value="dcf" forceMount>
                <DCFValuationSection />
              </TabsContent>

              <TabsContent value="eps" forceMount>
                <EPSValuationSection />
              </TabsContent>

              <TabsContent value="info" forceMount>
                <CompanyInfoSection />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
