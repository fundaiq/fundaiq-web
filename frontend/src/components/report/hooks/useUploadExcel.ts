import { useGlobalStore } from '@/store/globalStore';

export const useUploadExcel = (setLoading: (val: boolean) => void) => {
  const setStatus = useGlobalStore((s) => s.setStatus);
  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const setMetrics = useGlobalStore((s) => s.setMetrics);
  const setCompanyInfo = useGlobalStore((s) => s.setCompanyInfo);
  const setRawYahooData = useGlobalStore((s) => s.setRawYahooData);

  const uploadExcel = async (file: File) => {
    setLoading(true);
    setStatus('📤 Uploading Excel...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload-excel`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setAssumptions(data.assumptions || {});
      setMetrics(data.calculated_metrics || {});
      if (data.assumptions?.company_name) {
        setCompanyInfo({
          name: data.assumptions.company_name,
          ticker: data.assumptions.ticker || '',
          sector: '',
          industry: '',
          description: 'Uploaded via Excel file.'
        });
      }
      setRawYahooData({
        pnl: data.pnl,
        balance_sheet: data.balance_sheet,
        cashflow: data.cashflow,
        years: data.years
      });

      setStatus('✅ Excel uploaded');
    } catch (err) {
      console.error(err);
      setStatus('❌ Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return uploadExcel;
};
