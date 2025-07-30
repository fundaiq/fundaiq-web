'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/store/globalStore';
import CollapsibleCard from '@/components/ui/CollapsibleCard';
type Props = {
  resetKey: number; // 👈 Add this line
};
export default function DataImportSection({ resetKey }: Props) {
  const ticker = useGlobalStore((s) => s.tickerInput);
  const setTicker = useGlobalStore((s) => s.setTickerInput);
  const [file, setFile] = useState<File | null>(null);
  const status = useGlobalStore((s) => s.status);
  const setStatus = useGlobalStore((s) => s.setStatus);
  const [tickersList, setTickersList] = useState<string[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const setMetrics = useGlobalStore((s) => s.setMetrics);
  const setCompanyInfo = useGlobalStore((s) => s.setCompanyInfo);
  const setRawYahooData = useGlobalStore((s) => s.setRawYahooData);
  
  useEffect(() => {
    setFile(null);           // clear uploaded file
    setTicker('');           // clear input box
    setStatus('');           // clear "✅ XYZ loaded" message
    setShowSuggestions(false); // hide dropdown
  }, [resetKey]);

  useEffect(() => {
    const fetchTickers = async () => {
      const res = await fetch('/tickers.json');
      const data = await res.json();
      setTickersList(data);
    };
    fetchTickers();
  }, []);

  const handleFetch = async () => {
    if (!ticker) return;
    setStatus('🔄 Fetching from Yahoo...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/yahoo-profile/${ticker}`);
      const data = await res.json();
      setAssumptions(data.assumptions || {});
      setMetrics(data.calculated_metrics || {});
      setCompanyInfo({
        name: data.company_name,
        ticker: data.ticker,
        sector: data.sector || '',
        industry: data.industry || '',
        description: data.description || ''
      });
      setRawYahooData({
        pnl: data.pnl,
        balance_sheet: data.balance_sheet,
        cashflow: data.cashflow,
        years: data.years
      });
      setStatus(`✅ ${data.company_name} loaded`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Fetch failed');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
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
    }
  };

  const handleTickerInput = (value: string) => {
    setTicker(value);
    if (value.length >= 2) {
      const matches = tickersList.filter((t) =>
        t.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTickers(matches.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && filteredTickers.length > 0) {
      e.preventDefault();
      setTicker(filteredTickers[0]);
      setShowSuggestions(false);
      handleFetch();
    }
  };

  return (
    <section className="mb-10" id="import">
      <CollapsibleCard title="📥 Data Import">
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={ticker}
              onChange={(e) => handleTickerInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. INFY.NS"
              className="border px-3 py-1 rounded w-full"
            />
            {showSuggestions && filteredTickers.length > 0 && (
              <ul className="absolute bg-white border w-full shadow mt-1 rounded max-h-60 overflow-auto z-20">
                {filteredTickers.map((item) => (
                  <li
                    key={item}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setTicker(item);
                      setShowSuggestions(false);
                      handleFetch();
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button onClick={handleFetch}>Fetch</Button>

          <input
            key={resetKey}
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button onClick={handleUpload} disabled={!file}>Upload Excel</Button>

          {file?.name && (
            <span className="text-sm text-gray-500 mt-1">📄 {file.name}</span>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-2">{status}</p>
      </CollapsibleCard>
    </section>
  );

}
