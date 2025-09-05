// src/store/globalStore.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Updater<T> = T | ((prev: T) => T);

export interface GlobalState {
  // User/session
  user: any | null;
  setUser: (u: any | null) => void;

  // UI / inputs
  tickerInput: string;
  setTickerInput: (v: string) => void;

  status: string;
  setStatus: (v: Updater<string>) => void;

  // Core data
  metrics: Record<string, any>;
  setMetrics: (v: Updater<Record<string, any>>) => void;

  companyInfo: Record<string, any>;
  setCompanyInfo: (v: Updater<Record<string, any>>) => void;

  rawYahooData: Record<string, any>;
  setRawYahooData: (v: Updater<Record<string, any>>) => void;

  // Assumptions (persisted)
  assumptions: Record<string, any>;
  setAssumptions: (v: Updater<Record<string, any>>) => void;

  defaultAssumptions: Record<string, any>;
  setDefaultAssumptions: (v: Record<string, any>) => void;
  resetAssumptions: () => void;

  // Valuation results
  valuationResults: Record<string, any>;
  setValuationResults: (v: Updater<Record<string, any>>) => void;

  // Calc trigger + central runner
  calculationTriggered: boolean;
  calcToken: number;
  triggerCalculation: () => void;
  resetCalculation: () => void;
  runValuations: () => Promise<void>;

  // Utils
  resetAll: () => void;
  resetStorageOnly: () => void;
}

// SSR-safe storage prevents `.bind` crash on server
const storage = createJSONStorage(() =>
  typeof window !== 'undefined'
    ? window.localStorage
    : {
        getItem: (_: string) => null,
        setItem: (_: string, __: string) => {},
        removeItem: (_: string) => {},
      }
);

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      // ----- User / session -----
      user: null,
      setUser: (u) => set({ user: u }),

      // ----- UI / inputs -----
      tickerInput: '',
      setTickerInput: (v) => set({ tickerInput: v }),

      status: '',
      setStatus: (fnOrVal) =>
        set((s) => ({ status: typeof fnOrVal === 'function' ? (fnOrVal as any)(s.status) : fnOrVal })),

      // ----- Core data -----
      metrics: {},
      setMetrics: (fnOrVal) =>
        set((s) => ({ metrics: typeof fnOrVal === 'function' ? (fnOrVal as any)(s.metrics) : fnOrVal })),

      companyInfo: {},
      setCompanyInfo: (fnOrVal) =>
        set((s) => ({ companyInfo: typeof fnOrVal === 'function' ? (fnOrVal as any)(s.companyInfo) : fnOrVal })),

      rawYahooData: {},
      setRawYahooData: (fnOrVal) =>
        set((s) => ({ rawYahooData: typeof fnOrVal === 'function' ? (fnOrVal as any)(s.rawYahooData) : fnOrVal })),

      // ----- Assumptions (persisted) -----
      assumptions: {},
      setAssumptions: (fnOrVal) =>
        set((s) => ({ assumptions: typeof fnOrVal === 'function' ? (fnOrVal as any)(s.assumptions) : fnOrVal })),

      defaultAssumptions: {},
      setDefaultAssumptions: (defaults) => set({ defaultAssumptions: { ...defaults } }),
      resetAssumptions: () => {
        const defaults = get().defaultAssumptions || {};
        set({ assumptions: { ...defaults } });
      },

      // ----- Valuation results -----
      valuationResults: {},
      setValuationResults: (fnOrVal) =>
        set((s) => ({
          valuationResults:
            typeof fnOrVal === 'function' ? (fnOrVal as any)(s.valuationResults) : fnOrVal,
        })),

      // ----- Calculation trigger + runner -----
      calculationTriggered: false,
      calcToken: 0,

      triggerCalculation: () =>
        set((s) => ({ calculationTriggered: true, calcToken: s.calcToken + 1 })),

      resetCalculation: () => set({ calculationTriggered: false }),

      runValuations: async () => {
        const state = get();
        const rawMetrics = state.metrics;
        const metrics = Array.isArray(rawMetrics) ? rawMetrics[0] : rawMetrics;
        const a = state.assumptions || {};

        // guard
        if (!a?.base_revenue) {
          set({ calculationTriggered: false });
          return;
        }

        try {
          // ---- DCF form
          const dcfForm = {
            current_price: Number(metrics?.current_price ?? 0),
            base_revenue: Number(a.base_revenue ?? 0),
            latest_net_debt: Number(a.latest_net_debt ?? 0),
            shares_outstanding: Number(metrics?.shares_outstanding ?? 1),
            ebit_margin: Number(a.ebit_margin ?? 0),
            depreciation_pct: Number(a.depreciation_pct ?? 0),
            capex_pct: Number(a.capex_pct ?? 0),
            wc_change_pct: Number(a.wc_change_pct ?? 0),
            tax_rate: Number(a.tax_rate ?? 25),
            interest_pct: Number(a.interest_pct ?? 0),
            x_years: 3,
            growth_x: Number(a.growth_x ?? 0),
            y_years: 10,
            growth_y: Number(a.growth_y ?? 0),
            growth_terminal: Number(a.growth_terminal ?? 2),
          };

          // ---- EPS form
          const epsForm = {
            base_revenue: Number(a.base_revenue ?? 0),
            projection_years: 3,
            revenue_growth: Number(a.growth_x ?? 0),
            ebit_margin: Number(a.ebit_margin ?? 0),
            interest_exp_pct: Number(a.interest_exp_pct ?? a.interest_pct ?? 0),
            tax_rate: Number(a.tax_rate ?? 25),
            shares_outstanding: Number(metrics?.shares_outstanding ?? 1),
            current_price: Number(metrics?.current_price ?? 0),
            base_year: metrics?.base_year ?? 'FY25',
          };

          // sequential fetches
          const dcfRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/dcf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dcfForm),
          });
          const dcfRaw = await dcfRes.json();
          const dcfData = Array.isArray(dcfRaw) ? dcfRaw[0] : dcfRaw;

          const epsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/project-eps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(epsForm),
          });
          const epsRaw = await epsRes.json();
          const epsData = Array.isArray(epsRaw) ? epsRaw[0] : epsRaw;

          set((s) => ({
            valuationResults: {
              ...s.valuationResults,
              dcf: { ...dcfData },
              dcf_sensitivity: { ...(dcfData?.sensitivity_table || {}) },
              eps: { ...epsData },
            },
            calculationTriggered: false,
          }));
        } catch (e) {
          set({ calculationTriggered: false });
          console.error('[runValuations] error', e);
        }
      },

      // ----- Utils -----
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
          calculationTriggered: false,
          user: null,
          // calcToken left as-is
        });
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('assumptions-storage');
          }
        } catch {}
      },

      resetStorageOnly: () => {
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('assumptions-storage');
          }
        } catch {}
      },
    }),
    {
      name: 'assumptions-storage',
      storage,
      // Persist only safe slices
      partialize: (s) => ({
        assumptions: s.assumptions,
        defaultAssumptions: s.defaultAssumptions,
      }),
      version: 2,
      // Ensure live functions win over any persisted snapshot
      merge: (persisted, current) => ({ ...persisted, ...current }),
      // Strip legacy keys
      migrate: (persisted: any) => ({
        assumptions: persisted?.assumptions || {},
        defaultAssumptions: persisted?.defaultAssumptions || {},
      }),
    }
  )
);
