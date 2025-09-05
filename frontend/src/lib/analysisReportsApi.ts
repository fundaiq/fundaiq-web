// frontend/src/lib/analysisReportsApi.ts

import apiFetch from '@/app/lib/api'; // Import your main API function

export interface AnalysisReportData {
  executive_summary?: {
    current_price?: number;
    market_cap?: number;
    sector?: string;
    industry?: string;
    description?: string;
  };
  key_metrics?: {
    revenue_ttm?: number;
    net_income?: number;
    eps?: number;
    pe_ratio?: number;
    debt_to_equity?: number;
    roe?: number;
    roa?: number;
  };
  valuation?: {
    dcf_fair_value?: number;
    dcf_upside?: number;
    terminal_value?: number;
    wacc?: number;
    eps_target_price?: number;
    eps_projected_pe?: number;
  };
  financial_health?: {
    profitability?: {
      gross_margin?: number;
      operating_margin?: number;
      net_margin?: number;
    };
    liquidity?: {
      current_ratio?: number;
      quick_ratio?: number;
    };
    efficiency?: {
      asset_turnover?: number;
      inventory_turnover?: number;
    };
  };
  assumptions?: any;
  company_info?: {
    name?: string;
    ticker?: string;
    exchange?: string;
    sector?: string;
    industry?: string;
    employees?: number;
    website?: string;
    description?:string;
  };
}

export interface ReportCreateRequest {
  company_name: string;
  ticker_symbol: string;
  report_title: string;
  report_data: AnalysisReportData;
}

export interface ReportResponse {
  id: string;
  company_name: string;
  ticker_symbol: string;
  report_title: string;
  pdf_file_name: string;
  pdf_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface ReportSummaryResponse {
  id: string;
  company_name: string;
  ticker_symbol: string;
  report_title: string;
  pdf_file_name: string;
  pdf_size_bytes: number;
  created_at: string;
}

class AnalysisReportsApi {
  async createReport(request: ReportCreateRequest): Promise<ReportResponse> {
    try {
      console.log('[AnalysisReportsApi] Creating report:', request.company_name);
      
      const response = await apiFetch('analysis-reports', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      console.log('[AnalysisReportsApi] Report created successfully:', response);
      return response;
    } catch (error) {
      console.error('[AnalysisReportsApi] Error creating report:', error);
      throw new Error('Not authenticated');
    }
  }

  async getReports(skip = 0, limit = 50): Promise<ReportSummaryResponse[]> {
    try {
      const response = await apiFetch(`analysis-reports?skip=${skip}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('[AnalysisReportsApi] Error fetching reports:', error);
      throw error;
    }
  }

  async getReportsCount(): Promise<{ total_reports: number }> {
    try {
      const response = await apiFetch('analysis-reports/count');
      return response;
    } catch (error) {
      console.error('[AnalysisReportsApi] Error fetching reports count:', error);
      throw error;
    }
  }

  async getReport(reportId: string): Promise<ReportResponse> {
    try {
      const response = await apiFetch(`analysis-reports/${reportId}`);
      return response;
    } catch (error) {
      console.error('[AnalysisReportsApi] Error fetching report:', error);
      throw error;
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      // For blob downloads, we need to use fetch directly but with the right headers
      const { getAccessToken } = await import('@/app/lib/api');
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const { API_BASE } = await import('@/app/lib/api');
      const response = await fetch(`${API_BASE}/analysis-reports/${reportId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('[AnalysisReportsApi] Error downloading report:', error);
      throw error;
    }
  }

  async deleteReport(reportId: string): Promise<{ message: string }> {
    try {
      const response = await apiFetch(`analysis-reports/${reportId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('[AnalysisReportsApi] Error deleting report:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analysisReportsApi = new AnalysisReportsApi();