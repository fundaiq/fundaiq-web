'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

// Import sections (excluding ExecutiveSummarySection)
import StockSummaryCard from '@/components/report/StockSummaryCard';
import Disclaimer from '@/components/Disclaimer';
import AssumptionsPanel from '@/components/report/AssumptionsPanel';
import CompanyInfoSection from '@/components/report/CompanyInfoSection';
import FinancialHealthSection from '@/components/report/FinancialHealthSection';
import DCFValuationSection from '@/components/report/DCFValuationSection';
import EPSValuationSection from '@/components/report/EPSValuationSection';

// Import components
import CompanyHeader from '@/components/report/CompanyHeader';
import EmptyState from '@/components/report/EmptyState';
import ValuationOverview from '@/components/report/ValuationOverview';
import ScrollToTop from '@/components/ui/ScrollToTop';
import ValuationRunner from '@/components/ValuationRunner';
import StockPriceChart from '@/components/report/StockPriceChart';
import ReportTopNav from '@/components/report/ReportTopNav';
import { 
  Calculator, 
  FileBarChart, 
  TrendingUp, 
  Building, 
  Activity, 
  Target, 
  Sparkles
} from 'lucide-react';

import styles from '@/styles/report-page.module.css';

export default function CompanyReportPage() {
  const [mounted, setMounted] = useState(false);
  const companyInfo = useGlobalStore((s) => s.companyInfo);
  const resetAll = useGlobalStore((state) => state.resetAll);
  const [showSections, setShowSections] = useState(false);

  // ORIGINAL LOGIC PRESERVED: Show sections when company data is available
  // FIX: Only depend on the company name to prevent infinite loops
  // FIXED: Proper logic for string company_info
  useEffect(() => {
    // Since company_info is a string, check if it exists and has content
    const hasValidData = Boolean(
      companyInfo && 
      typeof companyInfo === 'string' && 
      companyInfo.trim().length > 0
    );
    
    setShowSections(hasValidData);
    
    // Debug logs to help troubleshoot
    // console.log('CompanyInfo:', companyInfo);
    // console.log('CompanyInfo type:', typeof companyInfo);
    // console.log('ShowSections:', hasValidData);
  }, [companyInfo]);


  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleReset = () => {
    resetAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120; // Account for sticky nav height
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.reportLayout}>
      {/* TOP NAVIGATION - Fixed positioning issue */}
      {showSections && (
        <ReportTopNav 
          scrollTo={scrollToSection}
          showSections={showSections}
          onReset={handleReset}
        />
      )}
      
      <div className={styles.reportMain}>
        <main className={styles.contentContainer}>
          
          {/* Valuation Runner Section - Use CSS classes for proper spacing */}
          <section className={showSections ? styles.valuationSectionWithNav : styles.valuationSectionWithoutNav}>
            <ValuationRunner />
          </section>

          {showSections && (
            <div className={styles.sectionsContainer}>
              
              {/* 1. Disclaimer - Fixed ID */}
              <section id="disclaimer" className={styles.section}>
                <Disclaimer />
              </section>
              {/* 2. Company Header  */}
              {/* <section id="companyheader" className={styles.section}>
                <CompanyHeader />
              </section> */}
              {/* 2. Stock Price Chart - Fixed ID
              <section id="pricechart" className={styles.section}>
                 <StockPriceChart ticker={"NSE:TCS"} />
              </section>
              <button onClick={() => console.log('Testing symbol format:', toTradingViewSymbol('TCS'))}>
                Test Symbol Format
              </button> */}
              {/* 3. Stock Summary - Fixed ID */}
              <section id="stockmetrics" className={styles.section}>
                <StockSummaryCard />
              </section>

              {/* 4. Financial Health - Fixed ID */}
              <section id="health" className={styles.section}>
                <FinancialHealthSection />
              </section>

              {/* 5. Valuation Overview - Fixed ID */}
              <section id="valuation" className={styles.section}>
                <ValuationOverview />
              </section>

              {/* 6. Assumptions Panel - Fixed ID */}
              <section id="assumptions" className={styles.section}>
                <AssumptionsPanel />
              </section>

              {/* 7. DCF Valuation - Fixed ID (using second 'valuation' as per your nav) */}
              <section id="dcf" className={styles.section}>
                <DCFValuationSection />
              </section>

              {/* 8. EPS Valuation - Fixed ID */}
              <section id="eps" className={styles.section}>
                <EPSValuationSection />
              </section>

              {/* 9. Company Info - Fixed ID
              <section id="info" className={styles.section}>
                <CompanyInfoSection />
              </section> */}

            </div>
          )}

          {/* Empty State */}
          {!showSections && (
            <section className={styles.emptyStateSection}>
              <EmptyState />
            </section>
          )}

        </main>
      </div>

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}