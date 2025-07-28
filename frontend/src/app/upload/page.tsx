'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalStore } from '@/store/globalStore';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ticker, setTicker] = useState("");
  const [tickersList, setTickersList] = useState<string[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [status, setStatus] = useState("");

  const setAssumptions = useGlobalStore((state) => state.setAssumptions);
  const setMetrics = useGlobalStore((state) => state.setMetrics);
  const setCompanyInfo = useGlobalStore((state) => state.setCompanyInfo);
  const setRawYahooData = useGlobalStore((state) => state.setRawYahooData);
  const rawYahoo = useGlobalStore((state) => state.raw_yahoo_data);
  const router = useRouter();

  useEffect(() => {
    const fetchTickers = async () => {
      const res = await fetch("/tickers.json");
      const data = await res.json();
      setAssumptions(data.assumptions);          // ✅ you're already doing this
      setMetrics(data.metrics);                  // ❌ probably missing
      setCompanyInfo(data.companyInfo);          // ❌ probably missing
      
      setTickersList(data);
    };
    fetchTickers();
    
  }, []);

  const handleTickerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  const handleTickerFetch = async () => {
    if (!ticker) return;
    setStatus("🔄 Fetching from Yahoo...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/yahoo-profile/${ticker}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Ticker fetch error:", errorText);
        setStatus("❌ Failed to fetch ticker data: " + errorText);
        return;
      }

      const data = await res.json();
      console.log("✅ Yahoo response:", data);
      localStorage.setItem("lastYahooData", JSON.stringify(data));

      // ✅ Set assumptions
      if (data.assumptions) setAssumptions(data.assumptions);

      // ✅ Set metrics
      if (data.calculated_metrics) setMetrics(data.calculated_metrics);

      // ✅ Set company info (use correct Zustand key `name`)
      if (data.company_name || data.ticker) {
        setCompanyInfo({
          name: data.company_name,  // ✅ your Zustand uses `name`, not `company_name`
          ticker: data.ticker,
          sector: data.sector || '',
          industry: data.industry || '',
          description: data.description || '',
        });
      }

      // ✅ Optional: raw financials (for other pages)
      if (data.pnl || data.balance_sheet || data.cashflow) {
        setRawYahooData({
          pnl: data.pnl,
          balance_sheet: data.balance_sheet,
          cashflow: data.cashflow,
          years: data.years,
        });
      }

      // ✅ Finally, go to the report page
      setStatus(`✅ ${data.company_name} loaded from Yahoo Finance`);
      router.push("/report");
    } catch (err) {
      console.error("❌ Fetch/network error:", err);
      setStatus("❌ Ticker fetch failed. See console.");
    }
  };



  const handleUpload = async () => {
    if (!file) return;
    setStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/upload-excel`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Upload error:", errorText);
        setStatus("❌ Upload failed: " + errorText);
        return;
      }

      const data = await res.json();
      console.log("✅ Yahoo response:", data);

      if (data.assumptions) setAssumptions(data.assumptions);
      if (data.calculated_metrics) setMetrics(data.calculated_metrics);

      setStatus("✅ Data uploaded and assumptions stored.");
      router.push("/dcf");
    } catch (err) {
      console.error("❌ Fetch/network error:", err);
      setStatus("❌ Upload failed. See console.");
    }
  };

  const clearStoredData = () => {
    localStorage.removeItem('dcf-assumptions');
    localStorage.removeItem('dcf-metrics');
    localStorage.removeItem('dcf-company');
    localStorage.removeItem('dcf-raw');
    setStatus('🧹 Cleared stored company data.');
    setAssumptions({});
    setMetrics({});
    setCompanyInfo({});
    setRawYahooData({});
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">📊 Company Report Generator</h1>

      <div className="space-y-2 relative z-10">
        <label className="block font-medium">Enter Yahoo Finance Ticker (e.g. TCS.NS)</label>
        <input
          type="text"
          value={ticker}
          onChange={handleTickerInput}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === 'Tab') && filteredTickers.length > 0) {
              e.preventDefault();
              setTicker(filteredTickers[0]);
              setShowSuggestions(false);
            }
          }}
          placeholder="e.g. INFY.NS"
          className="w-full border border-gray-300 px-3 py-2 rounded"
        />

        {showSuggestions && filteredTickers.length > 0 && (
          <ul className="absolute bg-white z-20 border w-full shadow mt-1 rounded max-h-60 overflow-auto">
            {filteredTickers.map((item) => (
              <li
                key={item}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setTicker(item);
                  setShowSuggestions(false);
                }}
              >
                <span className="font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        )}

        <Button onClick={handleTickerFetch} className="mt-2">Fetch</Button>
      </div>

      <hr className="my-4" />

      <h2 className="text-lg font-semibold">📥 Upload Screener Excel File</h2>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload} disabled={!file} className="mt-2">
        Upload & Import
      </Button>

      <hr className="my-4" />

      

      <p className="text-sm text-gray-600 mt-2">{status}</p>
          <hr className="my-4" />

      <Button
        onClick={() => {
          localStorage.removeItem('dcf-assumptions');
          localStorage.removeItem('dcf-metrics');
          localStorage.removeItem('dcf-company');
          localStorage.removeItem('dcf-raw');
          setAssumptions({});
          setMetrics({});
          setCompanyInfo({});
          setRawYahooData({});
          setStatus('🧹 Cleared stored company data.');
        }}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        🧹 Clear Stored Company Data
      </Button>
    </div>
  );
}
