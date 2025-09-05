// frontend/src/lib/executiveSummaryService.ts
/**
 * Executive Summary Service - Complete Implementation
 * Handles calculation, formatting, and utilities for executive summary data
 */

export interface ExecutiveSummaryData {
  company_overview: {
    current_price: number;
    market_cap: number;
    sector: string;
    industry: string;
    description: string;
  };
  valuation_summary: {
    dcf_fair_value: number;
    eps_fair_value: number;
    valuation_gap_pct: number;
    investment_recommendation: string;
    phase1_contribution_pct: number;
    phase2_contribution_pct: number;
    terminal_contribution_pct: number;
  };
  growth_metrics: {
    revenue_cagr_3y: number;
    eps_cagr_3y: number;
    projected_revenue_growth: number;
    projected_eps_growth: number;
  };
  profitability_metrics: {
    net_margin: number;
    gross_margin: number;
    operating_margin: number;
    roe: number;
    roa: number;
  };
  financial_health: {
    debt_to_equity: number;
    current_ratio: number;
    quick_ratio: number;
    financial_strength_score: number;
  };
  key_highlights: {
    strengths: string[];
    risks: string[];
    opportunities: string[];
  };
}

class ExecutiveSummaryService {
  
  /**
   * Calculate executive summary from raw metrics and valuation results
   */
  static calculateExecutiveSummary(
    metrics: any,
    valuationResults: any,
    assumptions?: any
  ): ExecutiveSummaryData {
    console.log('🔄 [ExecutiveSummaryService] Starting calculation...');
    console.log('📊 Input metrics:', metrics);
    console.log('💰 Valuation results:', valuationResults);
    console.log('⚙️ Assumptions:', assumptions);

    try {
      // Helper function to safely get numeric values
      const safe = (value: any, fallback: number = 0): number => {
        if (value === null || value === undefined) return fallback;
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        return isFinite(num) ? num : fallback;
      };

      // Company Overview
      const company_overview = {
        current_price: safe(
          metrics?.current_price || 
          metrics?.price || 
          metrics?.currentPrice
        ),
        market_cap: safe(
          metrics?.market_cap || 
          metrics?.marketCap || 
          metrics?.market_capitalization
        ),
        sector: String(metrics?.sector || 'N/A'),
        industry: String(metrics?.industry || 'N/A'),
        description: String(metrics?.description || metrics?.longBusinessSummary || 'No description available')
      };

      console.log('🏢 Company overview processed:', company_overview);

      // Valuation Summary
      const dcf_fair_value = safe(valuationResults?.dcf?.dcf_fair_value);
      const eps_fair_value = safe(valuationResults?.eps?.eps_fair_value || valuationResults?.eps?.target_price);
      const current_price = company_overview.current_price;
      
      // Calculate valuation gap - prioritize DCF if available, otherwise use EPS
      let primary_fair_value = dcf_fair_value > 0 ? dcf_fair_value : eps_fair_value;
      if (primary_fair_value === 0 && eps_fair_value > 0) primary_fair_value = eps_fair_value;
      
      const valuation_gap_pct = current_price > 0 && primary_fair_value > 0
        ? ((primary_fair_value - current_price) / current_price) * 100 
        : 0;

      // Investment recommendation based on valuation gap
      let investment_recommendation = 'HOLD';
      if (valuation_gap_pct > 25) investment_recommendation = 'STRONG BUY';
      else if (valuation_gap_pct > 10) investment_recommendation = 'BUY';
      else if (valuation_gap_pct < -25) investment_recommendation = 'STRONG SELL';
      else if (valuation_gap_pct < -10) investment_recommendation = 'SELL';

      // Phase contributions from DCF results
      const dcf = valuationResults?.dcf || {};
      const valuation_summary = {
        dcf_fair_value,
        eps_fair_value,
        valuation_gap_pct,
        investment_recommendation,
        phase1_contribution_pct: safe(dcf.phase1_contribution_pct, 35),
        phase2_contribution_pct: safe(dcf.phase2_contribution_pct, 30),
        terminal_contribution_pct: safe(dcf.terminal_contribution_pct, 35)
      };

      console.log('💎 Valuation summary processed:', valuation_summary);

      // Growth Metrics
      const growth_metrics = {
        revenue_cagr_3y: safe(
          metrics?.revenue_growth_3y || 
          metrics?.revenue_cagr || 
          metrics?.revenueGrowth
        ),
        eps_cagr_3y: safe(
          metrics?.eps_growth_3y || 
          metrics?.eps_cagr || 
          metrics?.earningsGrowth
        ),
        projected_revenue_growth: safe(
          assumptions?.revenue_growth_rate || 
          assumptions?.revenueGrowthRate ||
          valuationResults?.dcf?.revenue_growth_rate
        ),
        projected_eps_growth: safe(
          assumptions?.eps_growth_rate || 
          assumptions?.epsGrowthRate ||
          valuationResults?.eps?.eps_growth_rate
        )
      };

      console.log('📈 Growth metrics processed:', growth_metrics);

      // Profitability Metrics
      const profitability_metrics = {
        net_margin: safe(
          metrics?.net_margin || 
          metrics?.netMargin || 
          metrics?.profitMargins
        ),
        gross_margin: safe(
          metrics?.gross_margin || 
          metrics?.grossMargin || 
          metrics?.grossMargins
        ),
        operating_margin: safe(
          metrics?.operating_margin || 
          metrics?.operatingMargin || 
          metrics?.operatingMargins
        ),
        roe: safe(
          metrics?.roe || 
          metrics?.return_on_equity || 
          metrics?.returnOnEquity
        ),
        roa: safe(
          metrics?.roa || 
          metrics?.return_on_assets || 
          metrics?.returnOnAssets
        )
      };

      console.log('💰 Profitability metrics processed:', profitability_metrics);

      // Financial Health
      const debt_to_equity = safe(
        metrics?.debt_to_equity || 
        metrics?.debtEquityRatio || 
        metrics?.debtToEquity
      );
      const current_ratio = safe(
        metrics?.current_ratio || 
        metrics?.currentRatio
      );
      const quick_ratio = safe(
        metrics?.quick_ratio || 
        metrics?.quickRatio
      );
      
      // Calculate financial strength score (0-100)
      let financial_strength_score = 50; // Start with neutral
      
      // Liquidity scoring
      if (current_ratio >= 2.5) financial_strength_score += 20;
      else if (current_ratio >= 2) financial_strength_score += 15;
      else if (current_ratio >= 1.5) financial_strength_score += 10;
      else if (current_ratio < 1) financial_strength_score -= 15;
      
      if (quick_ratio >= 1.5) financial_strength_score += 15;
      else if (quick_ratio >= 1) financial_strength_score += 10;
      else if (quick_ratio < 0.5) financial_strength_score -= 10;
      
      // Debt scoring
      if (debt_to_equity < 0.3) financial_strength_score += 15;
      else if (debt_to_equity < 0.5) financial_strength_score += 10;
      else if (debt_to_equity < 1) financial_strength_score += 5;
      else if (debt_to_equity > 2) financial_strength_score -= 15;
      
      // Profitability scoring
      if (profitability_metrics.roe > 20) financial_strength_score += 10;
      else if (profitability_metrics.roe > 15) financial_strength_score += 5;
      else if (profitability_metrics.roe < 5) financial_strength_score -= 10;
      
      const financial_health = {
        debt_to_equity,
        current_ratio,
        quick_ratio,
        financial_strength_score: Math.min(100, Math.max(0, financial_strength_score))
      };

      console.log('🏦 Financial health processed:', financial_health);

      // Generate Key Highlights
      const key_highlights = this.generateKeyHighlights(
        valuation_summary,
        growth_metrics,
        profitability_metrics,
        financial_health,
        company_overview
      );

      console.log('✨ Key highlights generated:', key_highlights);

      const summary: ExecutiveSummaryData = {
        company_overview,
        valuation_summary,
        growth_metrics,
        profitability_metrics,
        financial_health,
        key_highlights
      };

      console.log('✅ [ExecutiveSummaryService] Calculation completed successfully');
      console.log('📋 Final summary:', summary);
      
      return summary;

    } catch (error) {
      console.error('❌ [ExecutiveSummaryService] Calculation failed:', error);
      throw new Error(`Executive summary calculation failed: ${error}`);
    }
  }

  /**
   * Generate intelligent key highlights based on calculated metrics
   */
  private static generateKeyHighlights(
    valuation: any,
    growth: any,
    profitability: any,
    health: any,
    company: any
  ) {
    const strengths: string[] = [];
    const risks: string[] = [];
    const opportunities: string[] = [];

    // Valuation-based insights
    if (valuation.valuation_gap_pct > 20) {
      strengths.push(`Stock appears significantly undervalued by ${valuation.valuation_gap_pct.toFixed(1)}%`);
      opportunities.push('Strong potential for price appreciation based on fair value analysis');
    } else if (valuation.valuation_gap_pct > 10) {
      strengths.push(`Stock shows moderate undervaluation of ${valuation.valuation_gap_pct.toFixed(1)}%`);
    } else if (valuation.valuation_gap_pct < -20) {
      risks.push(`Stock appears overvalued by ${Math.abs(valuation.valuation_gap_pct).toFixed(1)}%`);
    }

    // Profitability insights
    if (profitability.roe > 20) {
      strengths.push(`Exceptional return on equity of ${profitability.roe.toFixed(1)}%`);
    } else if (profitability.roe > 15) {
      strengths.push(`Strong return on equity of ${profitability.roe.toFixed(1)}%`);
    } else if (profitability.roe < 5) {
      risks.push(`Low return on equity of ${profitability.roe.toFixed(1)}%`);
    }

    if (profitability.net_margin > 15) {
      strengths.push(`High profit margins at ${profitability.net_margin.toFixed(1)}%`);
    } else if (profitability.net_margin < 3) {
      risks.push(`Thin profit margins at ${profitability.net_margin.toFixed(1)}%`);
    }

    // Financial health insights
    if (health.financial_strength_score > 80) {
      strengths.push(`Excellent financial health score of ${health.financial_strength_score}/100`);
      opportunities.push('Strong balance sheet enables strategic investments and expansion');
    } else if (health.financial_strength_score > 60) {
      strengths.push(`Good financial health score of ${health.financial_strength_score}/100`);
    } else if (health.financial_strength_score < 40) {
      risks.push(`Weak financial health score of ${health.financial_strength_score}/100`);
    }

    if (health.current_ratio > 2.5) {
      strengths.push(`Excellent liquidity with current ratio of ${health.current_ratio.toFixed(1)}`);
    } else if (health.current_ratio < 1.2) {
      risks.push(`Potential liquidity concerns with current ratio of ${health.current_ratio.toFixed(1)}`);
    }

    if (health.debt_to_equity > 1.5) {
      risks.push(`High debt burden with debt-to-equity ratio of ${health.debt_to_equity.toFixed(1)}`);
    } else if (health.debt_to_equity < 0.3) {
      strengths.push(`Conservative debt management with low debt-to-equity ratio`);
      opportunities.push('Low debt levels provide room for strategic financing');
    }

    // Growth insights
    if (growth.revenue_cagr_3y > 20) {
      strengths.push(`Exceptional revenue growth of ${growth.revenue_cagr_3y.toFixed(1)}% CAGR`);
    } else if (growth.revenue_cagr_3y > 10) {
      strengths.push(`Solid revenue growth of ${growth.revenue_cagr_3y.toFixed(1)}% CAGR`);
    } else if (growth.revenue_cagr_3y < 0) {
      risks.push(`Declining revenue trend with ${growth.revenue_cagr_3y.toFixed(1)}% CAGR`);
    }

    if (growth.projected_revenue_growth > growth.revenue_cagr_3y && growth.projected_revenue_growth > 5) {
      opportunities.push('Accelerating revenue growth projected for future periods');
    }

    // Market position insights
    if (company.market_cap > 50000000000) { // 50B+ INR
      strengths.push('Large-cap stability with established market position');
    } else if (company.market_cap < 5000000000) { // <5B INR
      opportunities.push('Small-cap growth potential with room for expansion');
      risks.push('Higher volatility typical of smaller companies');
    }

    // Ensure minimum highlights
    if (strengths.length === 0) {
      strengths.push('Company maintains operational stability in current market conditions');
    }
    if (risks.length === 0) {
      risks.push('Market volatility and economic conditions may impact performance');
    }
    if (opportunities.length === 0) {
      opportunities.push('Potential for operational efficiency improvements and market expansion');
    }

    return {
      strengths: strengths.slice(0, 5), // Limit to top 5
      risks: risks.slice(0, 4),        // Limit to top 4
      opportunities: opportunities.slice(0, 3) // Limit to top 3
    };
  }

  /**
   * Format executive summary data for PDF generation
   * This is the critical method that was missing!
   */
  static formatForPDF(summaryData: ExecutiveSummaryData): any {
    console.log('📄 [ExecutiveSummaryService] Formatting data for PDF...');
    console.log('📊 Input summary data:', summaryData);

    if (!summaryData) {
      console.error('❌ No summary data provided for PDF formatting');
      throw new Error('No summary data available for PDF generation');
    }

    try {
      const formattedData = {
        company_overview: {
          current_price: summaryData.company_overview?.current_price || 0,
          market_cap: summaryData.company_overview?.market_cap || 0,
          sector: summaryData.company_overview?.sector || 'N/A',
          industry: summaryData.company_overview?.industry || 'N/A',
          description: summaryData.company_overview?.description || 'No description available'
        },
        valuation_summary: {
          dcf_fair_value: summaryData.valuation_summary?.dcf_fair_value || 0,
          eps_fair_value: summaryData.valuation_summary?.eps_fair_value || 0,
          valuation_gap_pct: summaryData.valuation_summary?.valuation_gap_pct || 0,
          investment_recommendation: summaryData.valuation_summary?.investment_recommendation || 'HOLD',
          phase1_contribution_pct: summaryData.valuation_summary?.phase1_contribution_pct || 0,
          phase2_contribution_pct: summaryData.valuation_summary?.phase2_contribution_pct || 0,
          terminal_contribution_pct: summaryData.valuation_summary?.terminal_contribution_pct || 0
        },
        growth_metrics: {
          revenue_cagr_3y: summaryData.growth_metrics?.revenue_cagr_3y || 0,
          eps_cagr_3y: summaryData.growth_metrics?.eps_cagr_3y || 0,
          projected_revenue_growth: summaryData.growth_metrics?.projected_revenue_growth || 0,
          projected_eps_growth: summaryData.growth_metrics?.projected_eps_growth || 0
        },
        profitability_metrics: {
          net_margin: summaryData.profitability_metrics?.net_margin || 0,
          gross_margin: summaryData.profitability_metrics?.gross_margin || 0,
          operating_margin: summaryData.profitability_metrics?.operating_margin || 0,
          roe: summaryData.profitability_metrics?.roe || 0,
          roa: summaryData.profitability_metrics?.roa || 0
        },
        financial_health: {
          debt_to_equity: summaryData.financial_health?.debt_to_equity || 0,
          current_ratio: summaryData.financial_health?.current_ratio || 0,
          quick_ratio: summaryData.financial_health?.quick_ratio || 0,
          financial_strength_score: summaryData.financial_health?.financial_strength_score || 0
        },
        key_highlights: {
          strengths: summaryData.key_highlights?.strengths || ['Company maintains stable operations'],
          risks: summaryData.key_highlights?.risks || ['Market volatility may impact performance'],
          opportunities: summaryData.key_highlights?.opportunities || ['Potential for operational improvements']
        }
      };

      console.log('✅ [ExecutiveSummaryService] PDF formatting completed');
      console.log('📋 Formatted data:', formattedData);
      
      return formattedData;

    } catch (error) {
      console.error('❌ [ExecutiveSummaryService] PDF formatting failed:', error);
      throw new Error(`PDF data formatting failed: ${error}`);
    }
  }

  /**
   * Recalculate executive summary (for manual refresh)
   */
  static async recalculateExecutiveSummary(
    metrics: any,
    valuationResults: any,
    assumptions?: any
  ): Promise<ExecutiveSummaryData> {
    console.log('🔄 [ExecutiveSummaryService] Manual recalculation triggered...');
    
    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return this.calculateExecutiveSummary(metrics, valuationResults, assumptions);
  }

  /**
   * Validate executive summary data
   */
  static validateSummaryData(summaryData: ExecutiveSummaryData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔍 [ExecutiveSummaryService] Validating summary data...');

    // Check required fields
    if (!summaryData?.company_overview?.current_price) {
      errors.push('Current price is required');
    }
    if (!summaryData?.valuation_summary) {
      errors.push('Valuation summary is required');
    }

    // Check for warning conditions
    if (summaryData?.financial_health?.current_ratio < 1) {
      warnings.push('Low current ratio may indicate liquidity issues');
    }
    if (Math.abs(summaryData?.valuation_summary?.valuation_gap_pct || 0) > 50) {
      warnings.push('Large valuation gap may indicate data quality issues');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    console.log('✅ [ExecutiveSummaryService] Validation completed:', result);
    return result;
  }
}

export default ExecutiveSummaryService;