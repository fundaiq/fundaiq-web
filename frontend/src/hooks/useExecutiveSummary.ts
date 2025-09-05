// frontend/src/hooks/useExecutiveSummary.ts
/**
 * React hook for Executive Summary functionality
 * Provides manual recalculation, PDF generation, and data management
 */

import { useState, useCallback, useEffect } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import ExecutiveSummaryService, { ExecutiveSummaryData } from '@/lib/executiveSummaryService';
import apiFetch, { API_BASE } from '@/app/lib/api'; // ✅ Import your API system

interface UseExecutiveSummaryReturn {
  summaryData: ExecutiveSummaryData | null;
  isLoading: boolean;
  isRecalculating: boolean;
  lastCalculated: Date | null;
  error: string | null;
  recalculate: () => Promise<void>;
  generatePDF: () => Promise<void>;
  validateData: () => Promise<any>;
  resetSummary: () => void;
}

export function useExecutiveSummary(): UseExecutiveSummaryReturn {
  const [summaryData, setSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Global store data
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);
  const assumptions = useGlobalStore((s) => s.assumptions);
  const companyInfo = useGlobalStore((s) => s.companyInfo);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  // Auto-calculate when data changes
  useEffect(() => {
    const calculateSummary = async () => {
      if (metrics && results && Object.keys(metrics).length > 0) {
        setIsLoading(true);
        setError(null);
        
        try {
          const newSummary = ExecutiveSummaryService.calculateExecutiveSummary(
            metrics,
            results,
            assumptions
          );
          
          setSummaryData(newSummary);
          setLastCalculated(new Date());
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Calculation failed');
          console.error('Executive summary calculation error:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    calculateSummary();
  }, [metrics, results, assumptions]);

  // Manual recalculation
  const recalculate = useCallback(async () => {
    if (!metrics || !results) {
      setError('Insufficient data for recalculation');
      return;
    }

    setIsRecalculating(true);
    setError(null);

    try {
      console.log('🔄 Starting manual executive summary recalculation...');
      
      const newSummary = await ExecutiveSummaryService.recalculateExecutiveSummary(
        metrics,
        results,
        assumptions
      );

      if (newSummary) {
        setSummaryData(newSummary);
        setLastCalculated(new Date());
        console.log('✅ Manual recalculation completed successfully');
      } else {
        throw new Error('Recalculation returned null result');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Recalculation failed';
      setError(errorMessage);
      console.error('❌ Manual recalculation failed:', err);
    } finally {
      setIsRecalculating(false);
    }
  }, [metrics, results, assumptions]);

  // ✅ FIXED: Generate PDF using proper API system
  const generatePDF = useCallback(async () => {
    if (!summaryData || !companyInfo) {
      setError('No summary data available for PDF generation');
      return;
    }

    try {
      console.log('📄 Generating executive summary PDF...');
      
      // Format data for PDF API
      const pdfData = ExecutiveSummaryService.formatForPDF(summaryData);
      
      const requestData = {
        summary_data: pdfData,
        company_name: companyInfo.name || 'Unknown Company',
        ticker_symbol: companyInfo.symbol || 'N/A',
        template_type: 'executive_summary'
      };

      console.log('📄 PDF request data:', requestData);

      // ✅ FIXED: Use direct fetch with correct API_BASE instead of relative URL
      const response = await fetch(`${API_BASE}/executive-summary/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for auth
        body: JSON.stringify(requestData),
      });

      console.log('📄 PDF response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyInfo.name || 'Company'}_Executive_Summary.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ PDF generated and downloaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF generation failed';
      setError(errorMessage);
      console.error('❌ PDF generation failed:', err);
    }
  }, [summaryData, companyInfo]);

  // ✅ FIXED: Validate data using proper API system
  const validateData = useCallback(async () => {
    if (!summaryData || !companyInfo) {
      return { is_valid: false, errors: ['No data available for validation'] };
    }

    try {
      console.log('🔍 Validating executive summary data...');
      
      const requestData = {
        company_overview: summaryData.company_overview,
        valuation_summary: summaryData.valuation_summary,
        growth_metrics: summaryData.growth_metrics,
        profitability_metrics: summaryData.profitability_metrics,
        financial_health: summaryData.financial_health,
        key_highlights: summaryData.key_highlights,
        company_name: companyInfo.name || 'Unknown Company',
        ticker_symbol: companyInfo.symbol || 'N/A'
      };

      // ✅ FIXED: Use apiFetch instead of direct fetch with relative URL
      const validationResult = await apiFetch('executive-summary/validate-data', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      console.log('✅ Data validation completed:', validationResult);
      
      return validationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
      console.error('❌ Data validation failed:', err);
      return { is_valid: false, errors: [errorMessage] };
    }
  }, [summaryData, companyInfo]);

  // Reset summary
  const resetSummary = useCallback(() => {
    setSummaryData(null);
    setLastCalculated(null);
    setError(null);
    console.log('🔄 Executive summary reset');
  }, []);

  return {
    summaryData,
    isLoading,
    isRecalculating,
    lastCalculated,
    error,
    recalculate,
    generatePDF,
    validateData,
    resetSummary
  };
}

// Helper hook for manual recalculation button
export function useManualRecalculation() {
  const { recalculate, isRecalculating, error } = useExecutiveSummary();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRecalculate = useCallback(async () => {
    await recalculate();
    
    if (!error) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [recalculate, error]);

  return {
    handleRecalculate,
    isRecalculating,
    error,
    showSuccess
  };
}

// Hook for PDF generation with loading states
export function usePDFGeneration() {
  const { generatePDF, summaryData } = useExecutiveSummary();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGeneratePDF = useCallback(async () => {
    if (!summaryData) {
      setGenerationError('No summary data available');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      await generatePDF();
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'PDF generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [generatePDF, summaryData]);

  return {
    handleGeneratePDF,
    isGenerating,
    generationError,
    canGenerate: !!summaryData
  };
}