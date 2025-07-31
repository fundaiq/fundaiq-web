'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGlobalStore } from '@/store/globalStore';
import CollapsibleCard from '@/components/ui/CollapsibleCard';

type Props = {
  resetKey: number;
};

type TickerEntry = {
  name: string;
  ticker: string;
};

export default function DataImportSection({ resetKey }: Props) {
  const ticker = useGlobalStore((s) => s.tickerInput);
  const setTicker = useGlobalStore((s) => s.setTickerInput);
  const [file, setFile] = useState<File | null>(null);
  const status = useGlobalStore((s) => s.status);
  const setStatus = useGlobalStore((s) => s.setStatus);
  const [tickersList, setTickersList] = useState<TickerEntry[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<TickerEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const setAssumptions = useGlobalStore((s) => s.setAssumptions);
  const setMetrics = useGlobalStore((s) => s.setMetrics);
  const setCompanyInfo = useGlobalStore((s) => s.setCompanyInfo);
  const setRawYahooData = useGlobalStore((s) => s.setRawYahooData);

  useEffect(() => {
    setFile(null);
    setTicker('');
    setStatus('');
    setShowSuggestions(false);
  }, [resetKey]);

  useEffect(() => {
    const fetchTickers = async () => {
      const res = await fetch('/tickers.json');
      const data = await res.json();
      setTickersList(data);
    };
    fetchTickers();
  }, []);

  const resolveTicker = (input: string): TickerEntry | null => {
    const inputLower = input.toLowerCase().trim();
    return (
      tickersList.find(
        (entry) =>
          entry.name.toLowerCase() === inputLower ||
          entry.ticker.toLowerCase() === inputLower
      ) || null
    );
  };

  const handleFetch = async () => {
    const entry = resolveTicker(ticker);
    const finalTicker = entry?.ticker || ticker;

    if (!finalTicker) return;
    setStatus('🔄 Fetching from Yahoo...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/yahoo-profile/${finalTicker}`);
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
      const matches = tickersList.filter(
        (entry) =>
          entry.name.toLowerCase().includes(value.toLowerCase()) ||
          entry.ticker.toLowerCase().includes(value.toLowerCase())
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
      const selected = filteredTickers[0];
      setTicker(selected.name); // Display name
      setShowSuggestions(false);
      handleFetch();
    }
  };

  return (
    <section className="mb-2" id="import">
      <CollapsibleCard title="📥 Data Import">
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={ticker}
              onChange={(e) => handleTickerInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 3M India or 3MINDIA.NS"
              className="border px-3 py-1 rounded w-full"
            />
            {showSuggestions && filteredTickers.length > 0 && (
              <ul className="absolute w-full mt-1 rounded max-h-60 overflow-auto z-20 border 
                bg-white text-black dark:bg-zinc-800 dark:text-white 
                shadow dark:shadow-md">
                {filteredTickers.map((item) => (
                  <li
                    key={item.ticker}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                    onClick={() => {
                      setTicker(item.name);
                      setShowSuggestions(false);
                      handleFetch();
                    }}
                  >
                    📈 {item.name} — <span className="text-gray-500 dark:text-gray-300">{item.ticker}</span>
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
