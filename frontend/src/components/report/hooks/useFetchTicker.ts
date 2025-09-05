import { useGlobalStore } from '@/store/globalStore';

export const useFetchTicker = (setLoading: (val: boolean) => void) => {
  const setStatus = useGlobalStore((s) => s.setStatus);
  const setMetrics = useGlobalStore((s) => s.setMetrics);
  const setCompanyInfo = useGlobalStore((s) => s.setCompanyInfo);
  const setRawYahooData = useGlobalStore((s) => s.setRawYahooData);
  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const assumptions = useGlobalStore((s) => s.assumptions);
  
  const setDefaultAssumptions = useGlobalStore((s) => s.setDefaultAssumptions);
  const defaultAssumptions = useGlobalStore((s) => s.defaultAssumptions);
  const setValuationResults = useGlobalStore((s)=> s.setValuationResults);

  
  const fetchTickerData = async (input: string) => {
    const ticker = input?.trim();
    if (!ticker) {
      setStatus('❌ No ticker entered.');
      return;
    }

    setLoading(true);
    setStatus(`🔄 Fetching: ${ticker}...`);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/yahoo-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker })
      });

      if (!res.ok) {
        const errorText = await res.text();
        setStatus(`❌ ${res.status}: ${errorText.slice(0, 200)}`);
        return;
      }

      const data = await res.json();
      setCompanyInfo(data.company_info);
      setMetrics(data.metrics);
      setAssumptions(data.assumptions);
      setDefaultAssumptions(data.assumptions);
      
      setValuationResults(data.valuationResults);
      const a = useGlobalStore.getState().assumptions;
      const d = useGlobalStore.getState().defaultAssumptions;
      
      
      setRawYahooData({
        pnl: data.pnl,
        balance_sheet: data.balance_sheet,
        cashflow: data.cashflow,
        years: data.years
      });

      setStatus(`✅ ${data?.company_info?.name || 'Company'} loaded`);
    } catch (err: any) {
      console.error('❌ Network error', err);
      setStatus(`❌ Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return fetchTickerData;
};
