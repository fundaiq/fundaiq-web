// frontend/src/components/ExecutiveSummaryPage.tsx
/**
 * Complete Executive Summary integration example
 * Shows how to use all the components together with manual recalculation
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, RefreshCw, CheckCircle, Eye, EyeOff } from 'lucide-react';
import EnhancedExecutiveSummary from '@/components/summary/EnhancedExecutiveSummary';
import { useExecutiveSummary, useManualRecalculation, usePDFGeneration } from '@/hooks/useExecutiveSummary';
import { useGlobalStore } from '@/store/globalStore';

interface ExecutiveSummaryControlsProps {
  className?: string;
}

function ExecutiveSummaryControls({ className = '' }: ExecutiveSummaryControlsProps) {
  const { handleRecalculate, isRecalculating, error, showSuccess } = useManualRecalculation();
  const { handleGeneratePDF, isGenerating, generationError, canGenerate } = usePDFGeneration();
  const { validateData, summaryData } = useExecutiveSummary();
  
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleValidation = async () => {
    const result = await validateData();
    setValidationResult(result);
    setShowValidation(true);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Executive Summary Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Manual Recalculation */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculating...' : 'Manual Recalculate'}
            </Button>
            
            {showSuccess && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Updated!</span>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* PDF Generation */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating || !canGenerate}
            className="flex items-center gap-2"
            variant="default"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating PDF...' : 'Download Executive Summary PDF'}
          </Button>
          
          {generationError && (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {generationError}
            </div>
          )}
        </div>

        {/* Data Validation */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleValidation}
            disabled={!summaryData}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Validate Data Quality
          </Button>
          
          {showValidation && validationResult && (
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Validation Results</span>
                <Badge variant={validationResult.is_valid ? "default" : "destructive"}>
                  {validationResult.is_valid ? "Valid" : "Issues Found"}
                </Badge>
              </div>
              
              <div className="text-sm space-y-1">
                <div>Completeness: {validationResult.completeness_score?.toFixed(1)}%</div>
                
                {validationResult.warnings?.length > 0 && (
                  <div className="text-yellow-600">
                    Warnings: {validationResult.warnings.length}
                  </div>
                )}
                
                {validationResult.errors?.length > 0 && (
                  <div className="text-red-600">
                    Errors: {validationResult.errors.length}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {summaryData && (
          <div className="pt-3 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Company: {summaryData.company_overview.sector}</div>
              <div>Recommendation: {summaryData.valuation_summary.investment_recommendation}</div>
              <div>Financial Strength: {summaryData.financial_health.financial_strength_score}/100</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ExecutiveSummaryPage() {
  const [showControls, setShowControls] = useState(true);
  const companyInfo = useGlobalStore((s) => s.companyInfo);
  const { summaryData, isLoading, lastCalculated } = useExecutiveSummary();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Executive Summary</h1>
          <p className="text-secondary mt-1">
            {companyInfo?.name || 'Company'} ({companyInfo?.symbol || 'N/A'}) Analysis
          </p>
          {lastCalculated && (
            <p className="text-sm text-tertiary mt-1">
              Last updated: {lastCalculated.toLocaleString()}
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className="flex items-center gap-2"
        >
          {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Calculating executive summary...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Executive Summary Component */}
        <div className="lg:col-span-3">
          <EnhancedExecutiveSummary />
        </div>

        {/* Controls Sidebar */}
        {showControls && (
          <div className="lg:col-span-1">
            <ExecutiveSummaryControls />
          </div>
        )}
      </div>

      {/* Footer Information */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="text-sm text-tertiary space-y-2">
            <h4 className="font-medium text-primary">About Executive Summary</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Automatically updates when underlying data changes</li>
              <li>Use "Manual Recalculate" to force refresh calculations</li>
              <li>PDF export includes all key metrics and highlights</li>
              <li>Data validation helps ensure analysis quality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Usage example in your main application
/*
// pages/executive-summary.tsx or your route component
import ExecutiveSummaryPage from '@/components/ExecutiveSummaryPage';

export default function ExecutiveSummaryRoute() {
  return <ExecutiveSummaryPage />;
}

// Or include it in your existing dashboard
// components/Dashboard.tsx
import EnhancedExecutiveSummary from '@/components/summary/EnhancedExecutiveSummary';
import { useExecutiveSummary } from '@/hooks/useExecutiveSummary';

export default function Dashboard() {
  const { summaryData, recalculate, generatePDF } = useExecutiveSummary();
  
  return (
    <div className="dashboard">
      <EnhancedExecutiveSummary />
      
      <div className="controls">
        <button onClick={recalculate}>Recalculate</button>
        <button onClick={generatePDF}>Download PDF</button>
      </div>
    </div>
  );
}
*/