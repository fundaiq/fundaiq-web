// lib/csvParser.ts
import { NewTransaction } from "@/types/portfolio";

export type ValidationError = {
  row: number;
  field: string;
  value: string;
  message: string;
};

const REQUIRED_HEADERS = ['trade_date', 'symbol', 'side', 'quantity', 'price', 'fees', 'trade_ccy'];

export function parseCsv(content: string): {
  transactions: NewTransaction[];
  errors: ValidationError[];
} {
  const lines = content.trim().split('\n');
  const errors: ValidationError[] = [];
  const transactions: NewTransaction[] = [];

  if (lines.length < 2) {
    return { transactions, errors: [{ row: 0, field: 'file', value: '', message: 'CSV must have at least a header and one data row' }] };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
  if (missing.length) {
    return { transactions, errors: [{ row: 0, field: 'headers', value: '', message: `Missing required columns: ${missing.join(', ')}` }] };
  }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      errors.push({ row: i + 1, field: 'format', value: lines[i], message: 'Row has incorrect number of columns' });
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });

    // validations
    if (!row.trade_date) errors.push({ row: i + 1, field: 'trade_date', value: row.trade_date, message: 'Trade date is required' });
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.trade_date)) errors.push({ row: i + 1, field: 'trade_date', value: row.trade_date, message: 'Trade date must be YYYY-MM-DD' });

    if (!row.symbol) errors.push({ row: i + 1, field: 'symbol', value: row.symbol, message: 'Symbol is required' });

    const side = (row.side || '').toUpperCase();
    if (!['BUY', 'SELL', 'DIV', 'SPLIT', 'BONUS', 'FEE'].includes(side)) {
      errors.push({ row: i + 1, field: 'side', value: row.side, message: 'Side must be BUY, SELL, DIV, SPLIT, BONUS, or FEE' });
    }

    if (!row.quantity || isNaN(parseFloat(row.quantity))) errors.push({ row: i + 1, field: 'quantity', value: row.quantity, message: 'Quantity must be a number' });
    if (!row.price || isNaN(parseFloat(row.price))) errors.push({ row: i + 1, field: 'price', value: row.price, message: 'Price must be a number' });
    if (row.fees && isNaN(parseFloat(row.fees))) errors.push({ row: i + 1, field: 'fees', value: row.fees, message: 'Fees must be a number' });
    if (!row.trade_ccy) errors.push({ row: i + 1, field: 'trade_ccy', value: row.trade_ccy, message: 'Trade currency is required' });
    if (row.fx_rate && isNaN(parseFloat(row.fx_rate))) errors.push({ row: i + 1, field: 'fx_rate', value: row.fx_rate, message: 'FX rate must be a number' });

    if (!errors.find(e => e.row === i + 1)) {
      transactions.push({
        trade_date: row.trade_date,
        symbol: (row.symbol || '').toUpperCase(),
        side,
        quantity: row.quantity,
        price: row.price,
        fees: row.fees || '0',
        trade_ccy: (row.trade_ccy || '').toUpperCase(),
        fx_rate: row.fx_rate || ''
      });
    }
  }

  return { transactions, errors };
}
