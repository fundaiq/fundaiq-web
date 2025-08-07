import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyInfo {
  name?: string;
  ticker?: string;
  sector?: string;
  industry?: string;
  description?: string;
}

interface GlobalState {
  metrics: Metrics;
  company_info: CompanyInfo;
  raw_yahoo_data: any;

  tickerInput: string;
  status: string;
  
  calculationTriggered: boolean;

  setMetrics: (m: Metrics) => void;
  updateMetrics: (updater: (prev: Metrics) => Metrics) => void;
  setCompanyInfo: (c: CompanyInfo) => void;
  
  setRawYahooData: (d: any) => void;
  setTickerInput: (t: string) => void;
  setStatus: (s: string) => void;
  triggerCalculation: () => void;
  resetCalculation: () => void;
  resetAll: () => void;
  assumptions: {},
  valuationResults: {},
  setAssumptions: (a) => void,
  setValuationResults: (r) => void,
}


// ✅ Safe localStorage wrapper
const safeStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch (err) {
      console.error('Storage getItem failed', err);
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch (err) {
      console.error('Storage setItem failed', err);
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch (err) {
      console.error('Storage removeItem failed', err);
    }
  }
};

export const useGlobalStore = create(
  persist(
    (set, get) => ({
      tickerInput: '',
      setTickerInput: (value) => set({ tickerInput: value }),

      metrics: {},
      setMetrics: (fnOrValue) => {
        if (typeof fnOrValue === 'function') {
          set((state) => ({ metrics: fnOrValue(state.metrics) }));
        } else {
          set({ metrics: fnOrValue });
        }
      },

      valuationResults: {},
      setValuationResults: (fnOrValue) => {
        if (typeof fnOrValue === 'function') {
          set((state) => ({ valuationResults: fnOrValue(state.valuationResults) }));
        } else {
          set({ valuationResults: fnOrValue });
        }
      },

      assumptions: {},
      defaultAssumptions: {},
      setAssumptions: (fnOrValue) => {
        if (typeof fnOrValue === 'function') {
          set((state) => ({ assumptions: fnOrValue(state.assumptions) }));
        } else {
          set({ assumptions: fnOrValue });
        }
      },

      setDefaultAssumptions: (defaults) => {
        set({ defaultAssumptions: { ...defaults } });
      },

      resetAssumptions: () => {
        const defaults = get().defaultAssumptions;
        set({ assumptions: { ...defaults } });

        try {
          const storageKey = 'assumptions-storage';
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(storageKey);
          }
        } catch (err) {
          console.warn('Failed to clear localStorage:', err);
        }

        get().triggerCalculation(defaults);
      },

      companyInfo: {},
      setCompanyInfo: (fnOrValue) => {
        if (typeof fnOrValue === 'function') {
          set((state) => ({ companyInfo: fnOrValue(state.companyInfo) }));
        } else {
          set({ companyInfo: fnOrValue });
        }
      },

      rawYahooData: {},
      setRawYahooData: (fnOrValue) => {
        if (typeof fnOrValue === 'function') {
          set((state) => ({ rawYahooData: fnOrValue(state.rawYahooData) }));
        } else {
          set({ rawYahooData: fnOrValue });
        }
      },

      triggerCalculation: () => {
        set({ calculationTriggered: true });
      },

      status: '',
      setStatus: (fnOrValue) => {
        if (typeof fnOrValue === 'function') {
          set((state) => ({ status: fnOrValue(state.status) }));
        } else {
          set({ status: fnOrValue });
        }
      },
      
      resetCalculation: () => set({ calculationTriggered: false }),

      resetAll: () => {
        set({
          tickerInput: '',
          metrics: {},
          valuationResults: {},
          assumptions: {},
          defaultAssumptions: {},
          companyInfo: {},
          rawYahooData: {},
          status: '',
        });

        try {
          localStorage.removeItem('assumptions-storage');
        } catch (err) {
          console.warn('Failed to clear persisted state:', err);
        }
      },
    }),
    {
      name: 'assumptions-storage',
      storage: safeStorage,
      partialize: (state) => ({
        assumptions: state.assumptions,
        defaultAssumptions: state.defaultAssumptions,
      }),
    }
  )
);
