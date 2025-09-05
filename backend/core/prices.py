# core/prices.py
from __future__ import annotations
from typing import Optional, Tuple

def get_last_price(symbol: str) -> Tuple[Optional[float], Optional[str]]:
    """Returns (last_price, currency) using yfinance."""
    try:
        import yfinance as yf
        t = yf.Ticker(symbol)
        fi = getattr(t, "fast_info", None)
        if fi and ("last_price" in fi) and ("currency" in fi):
            return float(fi["last_price"]), fi["currency"]
        hist = t.history(period="1d")
        if not hist.empty:
            # currency may still be in fast_info, try to read again
            ccy = None
            if fi and ("currency" in fi):
                ccy = fi["currency"]
            return float(hist["Close"].iloc[-1]), ccy
        return None, None
    except Exception:
        return None, None
