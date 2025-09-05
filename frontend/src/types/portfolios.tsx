// types/portfolio.ts
export type Holding = {
  symbol: string; 
  qty: string; 
  avg_cost_in_inr: string;
  ltp_ccy: string; 
  value_in_inr: string | null; 
  cost_in_inr: string;
  unrealized_pnl_in_inr: string | null; 
  realized_pnl_in_inr?: string; 
  weight_pct: string | null;
};

export type Summary = {
  id: string; 
  name: string; 
  base_currency: string;
  holdings: Holding[];
  totals: { 
    total_cost_in_inr: string; 
    total_value_in_inr: string | null; 
    unrealized_pnl_in_inr: string | null; 
    realized_pnl_in_inr?: string | null; 
    note: string; 
  }
};

export type Transaction = {
  id: string; 
  trade_date: string; 
  symbol: string; 
  side: string; 
  quantity: string; 
  price: string | null; 
  fees: string; 
  trade_ccy: string; 
  fx_rate: string | null; 
  notes: string | null;
};

export type NewTransaction = {
  trade_date: string; 
  symbol: string; 
  side: string; 
  quantity: string; 
  price: string; 
  fees: string; 
  trade_ccy: string;
  fx_rate?: string;
};