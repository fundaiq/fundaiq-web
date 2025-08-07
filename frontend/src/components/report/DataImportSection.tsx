'use client';

import { useEffect, useState } from 'react';
import { useGlobalStore } from '@/store/globalStore';
import TickerInput from './TickerInput';
import ExcelUpload from './ExcelUpload';
import Spinner from '@/components/ui/Spinner';
import { useFetchTicker } from './hooks/useFetchTicker';
import { useUploadExcel } from './hooks/useUploadExcel';

type Props = {
  resetKey: number;
};

export default function DataImportSection({ resetKey }: Props) {
  const setStatus = useGlobalStore((s) => s.setStatus);
  const setTicker = useGlobalStore((s) => s.setTickerInput);
  const status = useGlobalStore((s) => s.status);
  const resetAll = useGlobalStore((s) => s.resetAll);           // ⬅️ add this
  const [loading, setLoading] = useState(false);

  const fetchTickerData = useFetchTicker(setLoading);
  const uploadExcel = useUploadExcel(setLoading);

  useEffect(() => {
    setTicker('');
    setStatus('');
  }, [resetKey, setTicker, setStatus]);

  const handleReset = () => {
    if (loading) return;
    resetAll();            // ⬅️ wipe global state
    setTicker('');         // ⬅️ tidy local UI bits
    setStatus('');
  };

  return (
    <section className="w-full mb-1" id="import">
      <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-1 shadow-sm">
        {/* Row */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full min-w-0 md:overflow-visible">
          {/* Instruction */}
          <p className="text-sm text-zinc-600 dark:text-zinc-300 shrink-0 font-medium whitespace-nowrap">
            📥 Enter Ticker or Upload Excel →
          </p>

          {/* Ticker Input */}
          <div className="shrink-0">
            <TickerInput onFetch={fetchTickerData} loading={loading} />
          </div>

          {/* Excel Upload */}
          <div className="shrink-0">
            <ExcelUpload onUpload={uploadExcel} loading={loading} />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={loading}
            className="shrink-0 text-xs sm:text-sm px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset all imported data and calculated results"
          >
            Reset All
          </button>
        </div>

        {/* Status / Loading */}
        <div className="shrink-0 min-w-[120px] mt-1">
          {loading ? (
            <span className="text-blue-600 text-sm">Loading...</span>
          ) : (
            status && <span className="text-green-700 text-sm">{status}</span>
          )}
        </div>
      </div>
    </section>
  );
}
