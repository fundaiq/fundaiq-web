// lib/symbolRegistry.ts
export type RegistryEntry = {
  broker_symbol: string;
  yahoo_ticker: string;
  source: "registry" | "tickers.json" | "heuristic" | "manual";
  confidence: number;
  updated_at: string; // ISO
};

const LS_KEY = "symbol_registry_v1";

export function loadRegistry(): Record<string, RegistryEntry> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function upsertRegistry(entry: RegistryEntry) {
  const curr = loadRegistry();
  curr[entry.broker_symbol] = entry;
  localStorage.setItem(LS_KEY, JSON.stringify(curr));
}
