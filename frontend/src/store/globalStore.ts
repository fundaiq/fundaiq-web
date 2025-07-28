import { create } from "zustand";

interface Assumptions {
  [key: string]: any;
}

interface Metrics {
  [key: string]: any;
}

interface CompanyInfo {
  name?: string;
  ticker?: string;
  sector?: string;
  industry?: string;
  description?: string;
}

interface GlobalState {
  assumptions: Assumptions;
  calculated_metrics: Metrics;
  company_info: CompanyInfo;
  raw_yahoo_data: any;
  setAssumptions: (a: Assumptions) => void;
  setMetrics: (m: Metrics) => void;
  setCompanyInfo: (c: CompanyInfo) => void;
  setRawYahooData: (d: any) => void;
  tickerInput: string;
  setTickerInput: (t: string) => void;
  status: string;
  setStatus: (s: string) => void;
}

// ✅ Safe getter
const load = (key: string) => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const useGlobalStore = create<GlobalState>((set) => ({
  assumptions: load('dcf-assumptions'),
  calculated_metrics: load('dcf-metrics'),
  company_info: load('dcf-company'),
  raw_yahoo_data: load('dcf-raw'),
  
  tickerInput: '',
  setTickerInput: (t) => set({ tickerInput: t }),
  
  status: '',
  setStatus: (s) => set({ status: s }),

  setAssumptions: (a) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dcf-assumptions', JSON.stringify(a));
    }
    set({ assumptions: a });
  },

  setMetrics: (m) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dcf-metrics', JSON.stringify(m));
    }
    set({ calculated_metrics: m });
  },

  setCompanyInfo: (c) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dcf-company', JSON.stringify(c));
    }
    set({ company_info: c });
  },

  setRawYahooData: (d) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dcf-raw', JSON.stringify(d));
    }
    set({ raw_yahoo_data: d });
  },
  // ✅ Add this reset function
  resetAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dcf-assumptions');
      localStorage.removeItem('dcf-metrics');
      localStorage.removeItem('dcf-company');
      localStorage.removeItem('dcf-raw');
    }
    set({
      assumptions: {},
      calculated_metrics: {},
      company_info: {},
      raw_yahoo_data: {},
      tickerInput: '',
      status: ''
    });
  }
}));
