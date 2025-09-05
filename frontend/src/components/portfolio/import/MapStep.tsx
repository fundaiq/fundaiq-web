'use client';
import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { TickerRow, proposeCandidates, isAutoAccept, filterSuggestions } from "@/lib/symbolResolver";
import { RegistryEntry, upsertRegistry } from "@/lib/symbolRegistry";

export type MappingRow = {
  broker_symbol: string;
  proposed?: { ticker: string; label: string; score: number } | null;
  alternatives: { ticker: string; label: string; score: number }[];
  selected: string | null; // final yahoo ticker
  status: 'AUTO' | 'REVIEW' | 'MANUAL' | 'UNRESOLVED';
};

type Props = {
  uniqueSymbols: string[];
  tickers: TickerRow[];
  registry: Record<string, RegistryEntry>;
  onReady: (rows: MappingRow[]) => void; // called when rows prepared
  rows: MappingRow[];
  setRows: (rows: MappingRow[]) => void;
};

export default function MapStep({ uniqueSymbols, tickers, registry, onReady, rows, setRows }: Props) {
  const [activeSuggestIndex, setActiveSuggestIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Record<number, TickerRow[]>>({});

  useEffect(() => {
    if (rows.length === 0 && uniqueSymbols.length > 0) {
      (async () => {
        const prepared: MappingRow[] = [];
        for (const bs of uniqueSymbols) {
          // already Yahoo style?
          if (/\.[A-Z]{1,4}$/.test(bs)) {
            prepared.push({ broker_symbol: bs, proposed: { ticker: bs, label: bs, score: 100 }, alternatives: [], selected: bs, status: 'AUTO' });
            continue;
          }

          // registry hit?
          const reg = registry[bs];
          if (reg?.yahoo_ticker) {
            prepared.push({ broker_symbol: bs, proposed: { ticker: reg.yahoo_ticker, label: reg.yahoo_ticker, score: reg.confidence ?? 100 }, alternatives: [], selected: reg.yahoo_ticker, status: 'AUTO' });
            continue;
          }

          // propose from tickers.json
          const cands = await proposeCandidates(bs, tickers);
          const top = cands[0];
          if (top && isAutoAccept(top.score)) {
            prepared.push({ broker_symbol: bs, proposed: { ticker: top.yahoo_ticker, label: top.label, score: top.score }, alternatives: cands.slice(1), selected: top.yahoo_ticker, status: 'AUTO' });
          } else if (top) {
            prepared.push({ broker_symbol: bs, proposed: { ticker: top.yahoo_ticker, label: top.label, score: top.score }, alternatives: cands.slice(1), selected: null, status: 'REVIEW' });
          } else {
            prepared.push({ broker_symbol: bs, proposed: null, alternatives: [], selected: null, status: 'UNRESOLVED' });
          }
        }
        setRows(prepared);
        onReady(prepared);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueSymbols.length]);

  const allMapped = rows.every(r => !!r.selected);

  async function persistSelections() {
    const now = new Date().toISOString();
    for (const r of rows) {
      if (!/\.[A-Z]{1,4}$/.test(r.broker_symbol) && r.selected) {
        const entry: RegistryEntry = {
          broker_symbol: r.broker_symbol,
          yahoo_ticker: r.selected,
          source: r.status === 'MANUAL' ? 'manual' : (r.status === 'AUTO' ? 'tickers.json' : 'heuristic'),
          confidence: r.proposed?.score ?? 100,
          updated_at: now,
        };
        upsertRegistry(entry);
      }
    }
  }

  // UI
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <h4 className="font-medium text-amber-900 dark:text-amber-200 mb-1">Map Symbols</h4>
        <p className="text-sm text-amber-800 dark:text-amber-300">We found <strong>{rows.length}</strong> unique symbol(s). Confirm or edit their Yahoo tickers.</p>
      </div>

      <div className="bg-surface rounded-xl border-default border overflow-hidden">
        <div className="px-6 py-4 bg-surface-secondary border-b border-default">
          <h4 className="font-medium text-primary">Symbol Mapping</h4>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Broker Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Proposed / Selected Yahoo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Alternatives</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row, idx) => {
                const currentValue = row.selected ?? row.proposed?.ticker ?? "";
                const sug = suggestions[idx] || [];
                return (
                  <tr key={row.broker_symbol} className="hover:bg-surface-secondary align-top">
                    <td className="px-4 py-3 font-mono text-primary">{row.broker_symbol}</td>

                    <td className="px-4 py-3 relative">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase();
                            const next = [...rows];
                            next[idx] = { ...row, selected: v, status: 'MANUAL' };
                            setRows(next);
                            const list = filterSuggestions(v, tickers, 10);
                            setSuggestions(prev => ({ ...prev, [idx]: list }));
                          }}
                          onFocus={(e) => {
                            const v = (e.target.value || "").toUpperCase();
                            const list = filterSuggestions(v, tickers, 10);
                            setSuggestions(prev => ({ ...prev, [idx]: list }));
                            setActiveSuggestIndex(idx);
                          }}
                          onBlur={() => setTimeout(() => activeSuggestIndex === idx && setActiveSuggestIndex(null), 150)}
                          placeholder="e.g., TCS.NS"
                          className="w-full px-3 py-2 border-default border rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-surface text-primary placeholder:text-tertiary"
                        />
                        <SearchIcon className="w-4 h-4 text-tertiary shrink-0" />
                      </div>

                      {activeSuggestIndex === idx && sug.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto bg-surface border-default border rounded-lg shadow-lg">
                          {sug.map((t, sidx) => (
                            <button
                              key={t.ticker + sidx}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-surface-secondary"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                const next = [...rows];
                                next[idx] = { ...row, selected: t.ticker.toUpperCase(), status: 'MANUAL' };
                                setRows(next);
                                setActiveSuggestIndex(null);
                              }}
                            >
                              <div className="font-medium text-primary">{t.ticker}</div>
                              <div className="text-xs text-secondary">{t.name}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {row.proposed && (
                        <div className="mt-1 text-xs text-secondary">
                          Suggested: {row.proposed.label} (score {row.proposed.score})
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {row.alternatives.length === 0 ? (
                        <span className="text-tertiary">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {row.alternatives.map(alt => (
                            <button
                              key={alt.yahoo_ticker}
                              type="button"
                              className="px-2 py-1 border-default border rounded hover:bg-surface-secondary text-primary"
                              onClick={() => {
                                const next = [...rows];
                                next[idx] = { ...row, selected: alt.yahoo_ticker, status: 'REVIEW' };
                                setRows(next);
                              }}
                              title={`score ${alt.score}`}
                            >
                              {alt.yahoo_ticker}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.selected ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        row.status === 'UNRESOLVED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}>
                        {row.selected ? 'READY' : row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!allMapped && (
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm">
            Some symbols still need mapping. Please fill or pick alternatives.
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          className="px-6 py-3 btn-primary rounded-xl transition-colors disabled:opacity-50"
          disabled={!allMapped}
          onClick={async () => {
            await persistSelections();
            // parent will switch step on confirm click
            const done = rows.map(r => ({ ...r }));
            onReady(done);
          }}
        >
          Confirm Mappings ({rows.filter(r => !!r.selected).length}/{rows.length})
        </button>
      </div>
    </div>
  );
}