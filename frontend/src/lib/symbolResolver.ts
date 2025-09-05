// lib/symbolResolver.ts
export type TickerRow = { name: string; ticker: string };
export type Candidate = { yahoo_ticker: string; label: string; score: number };

export function normalizeName(s: string): string {
  const STOP = /\b(LIMITED|LTD|INC|CO|CORP|TECH|TECHNOLOGIES|INDUSTRIES|IND|PVT|PRIVATE|PLC)\b/gi;
  return s.toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(STOP, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function makeAcronym(name: string): string {
  const words = normalizeName(name).split(" ");
  const parts = words.map(w => w.replace(/[AEIOU]/g, "").slice(0, 3));
  return parts.join("").slice(0, 8);
}

function scoreSymbolMatch(brokerSymbol: string, candidate: { nameNorm: string; symbol?: string; acronym: string }): number {
  const b = brokerSymbol.toUpperCase();
  if (candidate.symbol && b === candidate.symbol.toUpperCase()) return 100;
  if (b === candidate.acronym) return 96;
  if (candidate.symbol && candidate.symbol.toUpperCase().startsWith(b)) return 92;
  if (candidate.acronym.startsWith(b)) return 90;
  if (candidate.nameNorm.includes(b)) return 88;
  return 0;
}

export function isAutoAccept(score: number): boolean {
  return score >= 92;
}

export async function loadTickers(): Promise<TickerRow[]> {
  try {
    const r = await fetch("/tickers.json");
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data as TickerRow[] : [];
  } catch { return []; }
}

export async function proposeCandidates(brokerSymbol: string, list: TickerRow[]): Promise<Candidate[]> {
  if (!list?.length) return [];
  const expanded = list.map(row => {
    const nameNorm = normalizeName(row.name);
    const acronym = makeAcronym(row.name);
    const symbol = row.ticker.includes(".") ? row.ticker.split(".")[0] : row.ticker;
    const sc = scoreSymbolMatch(brokerSymbol, { nameNorm, symbol, acronym });
    return { row, nameNorm, acronym, symbol, sc };
  });

  return expanded
    .filter(x => x.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 5)
    .map(x => ({
      yahoo_ticker: x.row.ticker,
      label: `${x.row.name} — ${x.row.ticker}`,
      score: x.sc,
    }));
}

export function filterSuggestions(q: string, list: TickerRow[], limit = 10): TickerRow[] {
  const query = q.trim().toUpperCase();
  if (!query) return [];
  const scored = list.map(row => {
    const t = row.ticker.toUpperCase();
    const n = row.name.toUpperCase();
    let score = 0;
    if (t.startsWith(query)) score = 100;
    else if (t.includes(query)) score = 90;
    else if (n.startsWith(query)) score = 80;
    else if (n.includes(query)) score = 70;
    return { row, score };
  }).filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.row);
  return scored;
}
