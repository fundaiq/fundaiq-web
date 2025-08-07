'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import { Button } from '@/components/ui/button';

type Props = {
  onFetch: (ticker: string) => void;
  loading: boolean;
};

export default function TickerInput({ onFetch, loading }: Props) {
  const tickerInput = useGlobalStore((s) => s.tickerInput);
  const setTickerInput = useGlobalStore((s) => s.setTickerInput);
  const [tickersList, setTickersList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [resolvedTicker, setResolvedTicker] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch('/tickers.json')
      .then((res) => res.json())
      .then((data) => {
        // ✅ Filter out incomplete entries
        const valid = data.filter((d) => d?.name && d?.ticker);
        setTickersList(valid);
      });
  }, []);

  const handleInput = (value: string) => {
    setTickerInput(value);
    if (value.length >= 2) {
      const matches = tickersList.filter(
        (entry) =>
          entry?.name?.toLowerCase?.().includes(value.toLowerCase()) ||
          entry?.ticker?.toLowerCase?.().includes(value.toLowerCase())
      );
      setFiltered(matches.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setResolvedTicker('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === 'Tab') && filtered.length > 0) {
      e.preventDefault();
      const selected = filtered[0];
      setTickerInput(selected.name);
      setResolvedTicker(selected.ticker);
      setShowSuggestions(false);
      onFetch(selected.ticker); // ✅ use actual ticker
    }
  };

  const handleFetchClick = () => {
    const input = tickerInput?.toLowerCase?.() || '';
    const match = tickersList.find((entry) => {
      const name = entry?.name?.toLowerCase?.() || '';
      const ticker = entry?.ticker?.toLowerCase?.() || '';
      return name === input || ticker === input;
    });

    const finalTicker = match?.ticker || tickerInput;
    setResolvedTicker(finalTicker);
    onFetch(finalTicker); // ✅ always use resolved ticker
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative w-48">
        <input
          type="text"
          value={tickerInput}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. TCS or INFY"
          className="border px-2 py-1 rounded w-full text-sm"
        />
        {showSuggestions && filtered.length > 0 && (
          <ul className="absolute left-0 w-full mt-1 rounded max-h-60 overflow-auto z-50 border border-gray-300 bg-white dark:bg-zinc-800 text-black dark:text-white shadow-lg">

            {filtered.map((item) => (
              <li
                key={item.ticker}
                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                onClick={() => {
                  setTickerInput(item.name);
                  setResolvedTicker(item.ticker);
                  setShowSuggestions(false);
                  onFetch(item.ticker);
                }}
              >
                📈 {item.name} —{' '}
                <span className="text-gray-500 dark:text-gray-300">{item.ticker}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button onClick={handleFetchClick} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch'}
      </Button>
    </div>
  );


}
