import { useGlobalStore } from '@/store/globalStore';
import { useRouter } from 'next/navigation';

export const useUploadExcel = (setLoading: (val: boolean) => void) => {
  const router = useRouter();
  const setStatus = useGlobalStore((s) => s.setStatus);
  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const setMetrics = useGlobalStore((s) => s.setMetrics);
  const setCompanyInfo = useGlobalStore((s) => s.setCompanyInfo);
  const setRawYahooData = useGlobalStore((s) => s.setRawYahooData);
  const setDefaultAssumptions = useGlobalStore((s) => s.setDefaultAssumptions);
  const setValuationResults = useGlobalStore((s) => s.setValuationResults);

  const uploadExcel = async (file: File) => {
    setLoading(true);
    
    // Detailed status updates
    setStatus('📤 Uploading Excel file...');
    
    // console.log('🚀 [UPLOAD DEBUG] Starting Excel upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      setStatus('📊 Processing financial data...');
      
      // console.log('📡 [UPLOAD DEBUG] Making API request to:', `${process.env.NEXT_PUBLIC_API_BASE}/upload-excel`);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload-excel`, {
        method: 'POST',
        body: formData,
        // Removed credentials: 'include' since we don't need authentication
      });

      if (!res.ok) {
        const errorText = await res.text();
        setStatus(`❌ ${res.status}: ${errorText.slice(0, 200)}`);
        throw new Error(`Upload failed: ${res.status} - ${errorText.slice(0, 200)}`);
      }

      const data = await res.json();
      setCompanyInfo(data.company_info);
      setMetrics(data.metrics);
      setAssumptions(data.assumptions);
      // console.log('[useUploadExcel hook]assumptions from backend :', data.assumptions);
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
      
      // Redirect to report page after successful upload
      // console.log('🔄 [UPLOAD DEBUG] Redirecting to /report');
      router.push('/report');
      
    } catch (err: any) {
      console.error('❌ [UPLOAD DEBUG] Upload error details:');
      console.error('❌ [UPLOAD DEBUG] Error message:', err.message);
      console.error('❌ [UPLOAD DEBUG] Error stack:', err.stack);
      console.error('❌ [UPLOAD DEBUG] Full error object:', err);
      
      const errorMessage = err.message || 'Upload failed';
      setStatus(`❌ ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
      // console.log('🔄 [UPLOAD DEBUG] Upload process finished, loading set to false');
    }
  };

  return uploadExcel;
};