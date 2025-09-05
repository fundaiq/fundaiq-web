// frontend/src/components/summary/EnhancedExecutiveSummary.tsx
'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import ExecutiveSummaryService, { ExecutiveSummaryData } from '@/lib/executiveSummaryService';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

function MetricCard({ label, value, trend, subtitle, className = '' }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className={`bg-surface-elevated rounded-lg p-4 border border-default ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-tertiary">{label}</span>
        {getTrendIcon()}
      </div>
      <div className="text-xl font-semibold text-primary">{value}</div>
      {subtitle && <div className="text-xs text-tertiary mt-1">{subtitle}</div>}
    </div>
  );
}

interface RecommendationBadgeProps {
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  gap: number;
}

function RecommendationBadge({ recommendation, gap }: RecommendationBadgeProps) {
  const getColor = () => {
    switch (recommendation) {
      case 'BUY': return 'bg-green-100 text-green-800 border-green-200';
      case 'SELL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColor()}`}>
      <span className="mr-2">{recommendation}</span>
      <span className="text-xs">
        {gap > 0 ? `+${gap.toFixed(1)}%` : `${gap.toFixed(1)}%`}
      </span>
    </div>
  );
}

export default function EnhancedExecutiveSummary() {
  const [summaryData, setSummaryData] = useState<ExecutiveSummaryData | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);

  // Global store data
  const rawMetrics = useGlobalStore((s) => s.metrics);
  const rawResults = useGlobalStore((s) => s.valuationResults);
  const assumptions = useGlobalStore((s) => s.assumptions);

  const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
  const results = rawResults || {};

  // Auto-calculate on data changes
  useEffect(() => {
    if (metrics && results) {
      const newSummary = ExecutiveSummaryService.calculateExecutiveSummary(
        metrics,
        results,
        assumptions
      );
      setSummaryData(newSummary);
      setLastCalculated(new Date());
    }
  }, [metrics, results, assumptions]);

  // Manual recalculation
  const handleManualRecalculation = async () => {
    setIsRecalculating(true);
    
    try {
      const newSummary = await ExecutiveSummaryService.recalculateExecutiveSummary(
        metrics,
        results,
        assumptions
      );
      setSummaryData(newSummary);
      setLastCalculated(new Date());
    } catch (error) {
      console.error('Failed to recalculate executive summary:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!summaryData) {
    return (
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">📊 Executive Summary</h2>
        </div>
        <div className="text-sm text-tertiary italic bg-surface-elevated rounded-lg p-4 border border-default">
          📂 Executive summary loading or incomplete data available.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6" id="executive-summary">
      {/* Header with Manual Recalculation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-primary">📊 Executive Summary</h2>
          {lastCalculated && (
            <span className="text-xs text-tertiary">
              Last updated: {lastCalculated.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
            className="flex items-center gap-2"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isVisible ? 'Hide' : 'Show'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRecalculation}
            disabled={isRecalculating}
            className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Recalculating...' : 'Recalculate'}
          </Button>
        </div>
      </div>

      {isVisible && (
        <div className="space-y-6">
          {/* Company Overview & Valuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Current Price"
              value={`₹${summaryData.company_overview.current_price.toFixed(2)}`}
              subtitle={`${summaryData.company_overview.sector}`}
            />
            <MetricCard
              label="Market Cap"
              value={`₹${(summaryData.company_overview.market_cap / 10000000).toFixed(0)}Cr`}
              subtitle={summaryData.company_overview.industry}
            />
            <MetricCard
              label="DCF Fair Value"
              value={`₹${summaryData.valuation_summary.dcf_fair_value.toFixed(2)}`}
              trend={summaryData.valuation_summary.valuation_gap_pct > 0 ? 'up' : 'down'}
              subtitle={`Gap: ${summaryData.valuation_summary.valuation_gap_pct.toFixed(1)}%`}
            />
            <MetricCard
              label="EPS Fair Value"
              value={`₹${summaryData.valuation_summary.eps_fair_value.toFixed(2)}`}
              subtitle="EPS Method"
            />
          </div>

          {/* Investment Recommendation */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-default">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-primary">Investment Recommendation</h3>
              <RecommendationBadge 
                recommendation={summaryData.valuation_summary.investment_recommendation}
                gap={summaryData.valuation_summary.valuation_gap_pct}
              />
            </div>
            
            {/* Valuation Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {summaryData.valuation_summary.phase1_contribution_pct.toFixed(0)}%
                </div>
                <div className="text-sm text-tertiary">Phase 1 (Yrs 1-3)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {summaryData.valuation_summary.phase2_contribution_pct.toFixed(0)}%
                </div>
                <div className="text-sm text-tertiary">Phase 2 (Yrs 4-10)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {summaryData.valuation_summary.terminal_contribution_pct.toFixed(0)}%
                </div>
                <div className="text-sm text-tertiary">Terminal Value</div>
              </div>
            </div>
          </div>

          {/* Financial Health Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Growth & Profitability */}
            <div className="bg-surface-elevated rounded-lg p-4 border border-default">
              <h3 className="text-lg font-medium text-primary mb-3">Growth & Profitability</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">Revenue CAGR (3Y)</span>
                  <span className="font-medium text-primary">
                    {summaryData.growth_metrics.revenue_cagr_3y.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">EPS CAGR (3Y)</span>
                  <span className="font-medium text-primary">
                    {summaryData.growth_metrics.eps_cagr_3y.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">Net Margin</span>
                  <span className="font-medium text-primary">
                    {summaryData.profitability_metrics.net_margin.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">ROE</span>
                  <span className="font-medium text-primary">
                    {summaryData.profitability_metrics.roe.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Strength */}
            <div className="bg-surface-elevated rounded-lg p-4 border border-default">
              <h3 className="text-lg font-medium text-primary mb-3">Financial Strength</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">Debt-to-Equity</span>
                  <span className="font-medium text-primary">
                    {summaryData.financial_health.debt_to_equity.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-tertiary">Current Ratio</span>
                  <span className="font-medium text-primary">
                    {summaryData.financial_health.current_ratio.toFixed(2)}
                  </span>
                </div>
                
                {/* Financial Strength Score */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-tertiary">Financial Strength</span>
                    <span className="font-medium text-primary">
                      {summaryData.financial_health.financial_strength_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${summaryData.financial_health.financial_strength_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-800 dark:text-green-300">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {summaryData.key_highlights.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-green-700 dark:text-green-400">
                    • {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-800 dark:text-red-300">Risks</h4>
              </div>
              <ul className="space-y-2">
                {summaryData.key_highlights.risks.map((risk, index) => (
                  <li key={index} className="text-sm text-red-700 dark:text-red-400">
                    • {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-800 dark:text-blue-300">Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {summaryData.key_highlights.opportunities.map((opportunity, index) => (
                  <li key={index} className="text-sm text-blue-700 dark:text-blue-400">
                    • {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Company Description */}
          <div className="bg-surface-elevated rounded-lg p-4 border border-default">
            <h3 className="text-lg font-medium text-primary mb-3">Company Overview</h3>
            <p className="text-secondary leading-relaxed">
              {summaryData.company_overview.description}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}