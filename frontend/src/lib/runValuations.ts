import { fetchDCF } from './fetchDCF';
import { fetchEPS } from './fetchEPS';
import { useGlobalStore } from '@/store/globalStore';

/**
 * Maps frontend assumptions to the backend API input shape.
 */
function transformAssumptionsForAPI(a) {
  return {
    current_price: a.current_price,
    base_revenue: a.base_revenue,
    latest_net_debt: a.net_debt,
    shares_outstanding: a.shares_outstanding,
    ebit_margin: a.ebit_margin,
    tax_rate: a.tax_rate,
    capex_pct: a.capex_pct,
    depreciation_pct: a.depreciation_pct,
    wc_change_pct: a.wc_change_pct,
    interest_pct: a.interest_pct_of_ebit,
    wacc: a.wacc,
    x_years: 3,
    growth_x: a.growth_1_3,
    y_years: 10,
    growth_y: a.growth_4_10,
    growth_terminal: a.growth_terminal,
    base_year: a.base_year,
  };
}

/**
 * Main function to trigger all valuation models (e.g. DCF, EPS)
 * @param assumptions - clean assumption object with no missing values
 */
export async function runValuations(assumptions) {
  const setValuationResults = useGlobalStore.getState().setValuationResults;

  try {
    const input = transformAssumptionsForAPI(assumptions);

    const [dcf, eps] = await Promise.all([
      fetchDCF(input),
      fetchEPS(input),
    ]);

    setValuationResults({ dcf, eps });

    console.log('[Valuations] ✅ DCF and EPS valuations complete');
  } catch (error) {
    console.error('[Valuations] ❌ Failed:', error);
    setValuationResults({ dcf: null, eps: null });
  }
}
