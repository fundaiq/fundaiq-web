// ===============================
// file: src/components/portfolio/TransactionsTable.tsx
// ===============================
'use client';

import { useEffect, useState } from "react";
import { Pencil, X, Check, Trash2, Search } from "lucide-react";

import apiFetch from "@/app/lib/api"; 

// Types for ticker suggestions
type TickerRow = { name: string; ticker: string };

async function loadTickers(): Promise<TickerRow[]> {
  try {
    const r = await fetch("/tickers.json");
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? (data as TickerRow[]) : [];
  } catch {
    return [];
  }
}

function filterSuggestions(q: string, list: TickerRow[], limit = 10): TickerRow[] {
  const query = q.trim().toUpperCase();
  if (!query) return [];
  const scored = list
    .map((row) => {
      const t = row.ticker.toUpperCase();
      const n = row.name.toUpperCase();
      let score = 0;
      if (t.startsWith(query)) score = 100;
      else if (t.includes(query)) score = 90;
      else if (n.startsWith(query)) score = 80;
      else if (n.includes(query)) score = 70;
      return { row, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.row);
  return scored;
}

// Transaction types
type Tx = {
  id: string; // UUID
  trade_date: string; // YYYY-MM-DD
  symbol: string; // Yahoo ticker
  side: "BUY" | "SELL" | "DIV" | "SPLIT" | "BONUS" | "FEE";
  quantity: number;
  price: number | null;
  fees: number;
  trade_ccy: string;
  fx_rate: number | null;
  notes: string | null;
};

type Props = {
  pid: string; // portfolio id
  onTransactionUpdate?: () => void;
};

export default function TransactionsTable({ pid, onTransactionUpdate }: Props) {
  // State
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Tx>>({});

  // Ticker suggestions
  const [tickers, setTickers] = useState<TickerRow[]>([]);
  const [sugForId, setSugForId] = useState<string | null>(null);
  const [sugs, setSugs] = useState<TickerRow[]>([]);

  // Load tickers once
  useEffect(() => {
    (async () => setTickers(await loadTickers()))();
  }, []);

  // Load transactions
  useEffect(() => {
    if (!pid) {
      setLoading(false);
      setErr("Portfolio ID is required");
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data: Tx[] = await apiFetch(`/portfolios/${pid}/tx`);
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("Error loading transactions:", e);
        setErr(e?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    })();
  }, [pid]);

  // Editing helpers
  const startEdit = (row: Tx) => {
    setEditingId(row.id);
    setForm({ ...row });
    setSugForId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
    setSugForId(null);
    setSugs([]);
  };

  const validate = (f: Partial<Tx>): string | null => {
    if (!f.trade_date || !/^\d{4}-\d{2}-\d{2}$/.test(String(f.trade_date))) return "Date must be YYYY-MM-DD";
    if (!f.symbol) return "Symbol is required";
    if (!f.side) return "Side is required";
    if (!["BUY", "SELL", "DIV", "SPLIT", "BONUS", "FEE"].includes(String(f.side))) return "Invalid side";
    if (f.quantity == null || isNaN(Number(f.quantity))) return "Quantity must be a number";
    if (f.price != null && f.price !== "" && isNaN(Number(f.price))) return "Price must be a number";
    if (f.fees != null && isNaN(Number(f.fees))) return "Fees must be a number";
    if (!f.trade_ccy) return "Currency is required";
    if (f.fx_rate != null && f.fx_rate !== "" && isNaN(Number(f.fx_rate))) return "FX rate must be a number";
    return null;
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const payload: Partial<Tx> = {
      trade_date: form.trade_date,
      symbol: String(form.symbol || "").toUpperCase(),
      side: form.side,
      quantity: form.quantity != null ? Number(form.quantity) : undefined,
      price: form.price == null || form.price === "" ? null : Number(form.price),
      fees: form.fees != null ? Number(form.fees) : undefined,
      trade_ccy: form.trade_ccy,
      fx_rate: form.fx_rate == null || form.fx_rate === "" ? null : Number(form.fx_rate),
      notes: form.notes ?? null,
    };

    const msg = validate(payload);
    if (msg) {
      alert(msg);
      return;
    }

    // Optimistic update
    const before = rows;
    setRows(rows.map((r) => (r.id === editingId ? ({ ...r, ...payload } as Tx) : r)));

    try {
      const fresh: Tx = await apiFetch(`/portfolios/${pid}/tx/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setRows((cur) => cur.map((r) => (r.id === fresh.id ? fresh : r)));
      cancelEdit();
      onTransactionUpdate?.();
    } catch (e: any) {
      alert(`Update failed: ${e.message}`);
      setRows(before);
    }
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    const before = rows;
    setRows(rows.filter((r) => r.id !== id));
    try {
      await apiFetch(`/portfolios/${pid}/tx/${id}`, { method: "DELETE" });
      onTransactionUpdate?.();
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
      setRows(before);
    }
  };

  const onSymbolChange = (value: string, rowId: string) => {
    const up = value.toUpperCase();
    setForm((f) => ({ ...f, symbol: up }));
    const list = filterSuggestions(up, tickers, 10);
    setSugs(list);
    setSugForId(rowId);
  };

  // UI states
  if (loading)
    return (
      <div className="bg-surface rounded-xl border-default border overflow-hidden">
        <div className="px-6 py-4 bg-surface-secondary border-b border-default">
          <h4 className="font-medium text-primary">Transactions</h4>
        </div>
        <div className="p-6 text-secondary text-center">Loading transactions...</div>
      </div>
    );

  if (err)
    return (
      <div className="bg-surface rounded-xl border-default border overflow-hidden">
        <div className="px-6 py-4 bg-surface-secondary border-b border-default">
          <h4 className="font-medium text-primary">Transactions</h4>
        </div>
        <div className="p-6 text-red-600 dark:text-red-400 text-center">
          <p>Error: {err}</p>
          <p className="text-sm text-tertiary mt-2">Check the browser console for more details.</p>
        </div>
      </div>
    );

  if (rows.length === 0)
    return (
      <div className="bg-surface rounded-xl border-default border overflow-hidden">
        <div className="px-6 py-4 bg-surface-secondary border-b border-default flex items-center justify-between">
          <h4 className="font-medium text-primary">Transactions</h4>
          <div className="text-sm text-tertiary">0 rows</div>
        </div>
        <div className="p-6 text-tertiary text-center space-y-2">
          <p>No transactions found for this portfolio.</p>
          <div className="text-sm text-tertiary space-y-1">
            <p>Portfolio ID: {pid}</p>
            <p>Error state: {err || "None"}</p>
            <p className="text-xs">Check browser console for API request details</p>
          </div>
        </div>
      </div>
    );

  // Main table render
  return (
    <div className="bg-surface rounded-xl border-default border overflow-hidden">
      <div className="px-6 py-4 bg-surface-secondary border-b border-default flex items-center justify-between">
        <h4 className="font-medium text-primary">Transactions</h4>
        <div className="text-sm text-tertiary">{rows.length} row(s)</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-3 py-2 text-left text-tertiary">Date</th>
              <th className="px-3 py-2 text-left text-tertiary">Symbol</th>
              <th className="px-3 py-2 text-left text-tertiary">Side</th>
              <th className="px-3 py-2 text-right text-tertiary">Qty</th>
              <th className="px-3 py-2 text-right text-tertiary">Price</th>
              <th className="px-3 py-2 text-right text-tertiary">Fees</th>
              <th className="px-3 py-2 text-left text-tertiary">CCY</th>
              <th className="px-3 py-2 text-right text-tertiary">FX</th>
              <th className="px-3 py-2 text-left text-tertiary">Notes</th>
              <th className="px-3 py-2 text-right text-tertiary">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((r) => {
              const editing = editingId === r.id;
              return (
                <tr key={r.id} className="hover:bg-surface-secondary align-top">
                  {/* Date */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="date"
                        className="px-2 py-1 border-default border rounded w-40 bg-surface text-primary"
                        value={String(form.trade_date ?? r.trade_date)}
                        onChange={(e) => setForm((f) => ({ ...f, trade_date: e.target.value }))}
                      />
                    ) : (
                      <span className="text-primary">{r.trade_date}</span>
                    )}
                  </td>

                  {/* Symbol + suggestions */}
                  <td className="px-3 py-2 relative">
                    {editing ? (
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="px-2 py-1 border-default border rounded w-44 bg-surface text-primary placeholder:text-tertiary"
                            placeholder="e.g., TCS.NS"
                            value={String(form.symbol ?? r.symbol)}
                            onChange={(e) => onSymbolChange(e.target.value, r.id)}
                            onFocus={(e) => onSymbolChange(e.target.value, r.id)}
                            onBlur={() => setTimeout(() => setSugForId(null), 150)}
                          />
                          <Search className="w-4 h-4 text-tertiary" />
                        </div>
                        {sugForId === r.id && sugs.length > 0 && (
                          <div className="absolute z-20 mt-1 w-64 max-h-56 overflow-auto bg-surface border-default border rounded-lg shadow-lg">
                            {sugs.map((t, i) => (
                              <button
                                key={t.ticker + i}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-surface-secondary"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setForm((f) => ({ ...f, symbol: t.ticker.toUpperCase() }));
                                  setSugForId(null);
                                }}
                              >
                                <div className="font-medium text-primary">{t.ticker}</div>
                                <div className="text-xs text-secondary">{t.name}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium text-primary">{r.symbol}</span>
                    )}
                  </td>

                  {/* Side */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <select
                        className="px-2 py-1 border-default border rounded bg-surface text-primary"
                        value={String(form.side ?? r.side)}
                        onChange={(e) => setForm((f) => ({ ...f, side: e.target.value as Tx["side"] }))}
                      >
                        {["BUY", "SELL", "DIV", "SPLIT", "BONUS", "FEE"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-primary">{r.side}</span>
                    )}
                  </td>

                  {/* Quantity */}
                  <td className="px-3 py-2 text-right">
                    {editing ? (
                      <input
                        type="number"
                        step="any"
                        className="px-2 py-1 border-default border rounded w-28 text-right bg-surface text-primary"
                        value={String(form.quantity ?? r.quantity)}
                        onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                      />
                    ) : (
                      <span className="text-primary">{r.quantity.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2 text-right">
                    {editing ? (
                      <input
                        type="number"
                        step="any"
                        className="px-2 py-1 border-default border rounded w-28 text-right bg-surface text-primary placeholder:text-tertiary"
                        value={form.price == null ? "" : String(form.price)}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            price: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        placeholder="optional"
                      />
                    ) : (
                      <span className="text-primary">{(r.price ?? 0).toLocaleString()}</span>
                    )}
                  </td>

                  {/* Fees */}
                  <td className="px-3 py-2 text-right">
                    {editing ? (
                      <input
                        type="number"
                        step="any"
                        className="px-2 py-1 border-default border rounded w-24 text-right bg-surface text-primary"
                        value={String(form.fees ?? r.fees)}
                        onChange={(e) => setForm((f) => ({ ...f, fees: Number(e.target.value) }))}
                      />
                    ) : (
                      <span className="text-primary">{r.fees.toLocaleString()}</span>
                    )}
                  </td>

                  {/* Currency */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="text"
                        className="px-2 py-1 border-default border rounded w-20 uppercase bg-surface text-primary"
                        value={String(form.trade_ccy ?? r.trade_ccy)}
                        onChange={(e) => setForm((f) => ({ ...f, trade_ccy: e.target.value.toUpperCase() }))}
                      />
                    ) : (
                      <span className="px-2 py-1 bg-surface-secondary text-secondary rounded text-xs">{r.trade_ccy}</span>
                    )}
                  </td>

                  {/* FX Rate */}
                  <td className="px-3 py-2 text-right">
                    {editing ? (
                      <input
                        type="number"
                        step="any"
                        className="px-2 py-1 border-default border rounded w-24 text-right bg-surface text-primary placeholder:text-tertiary"
                        value={form.fx_rate == null ? "" : String(form.fx_rate)}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            fx_rate: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        placeholder="optional"
                      />
                    ) : (
                      <span className="text-primary">{r.fx_rate?.toString() ?? "–"}</span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        type="text"
                        className="px-2 py-1 border-default border rounded w-56 bg-surface text-primary placeholder:text-tertiary"
                        value={String(form.notes ?? (r.notes ?? ""))}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        placeholder="optional"
                      />
                    ) : (
                      <span className="text-primary">{r.notes ?? "–"}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {editing ? (
                      <>
                        <button
                          className="inline-flex items-center px-3 py-1 bg-green-600 dark:bg-green-500 text-white rounded-lg mr-2 hover:bg-green-700 dark:hover:bg-green-600"
                          onClick={saveEdit}
                        >
                          <Check className="w-4 h-4 mr-1" /> Save
                        </button>
                        <button
                          className="inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="inline-flex items-center px-3 py-1 btn-primary rounded-lg mr-2"
                          onClick={() => startEdit(r)}
                        >
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center px-3 py-1 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
                          onClick={() => deleteRow(r.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}