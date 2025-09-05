# core/prices.py
from __future__ import annotations
from typing import Optional, Tuple

def get_last_price(symbol: str) -> Tuple[Optional[float], Optional[str]]:
    """
    Returns (last_price, currency) using yfinance.
    Keeps it simple for now; you can add caching later.
    """
    try:
        import yfinance as yf
        t = yf.Ticker(symbol)
        fi = getattr(t, "fast_info", None)
        if fi and "last_price" in fi and "currency" in fi:
            return float(fi["last_price"]), fi["currency"]
        # fallback: 1d history close
        hist = t.history(period="1d")
        if not hist.empty:
            return float(hist["Close"].iloc[-1]), getattr(fi, "currency", None)
        return None, None
    except Exception:
        return None, None
