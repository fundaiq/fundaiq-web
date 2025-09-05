from __future__ import annotations
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import select
from core.models import FXRate

# Map the most common direct FX tickers on Yahoo
PAIR_MAP = {
    ("USD", "INR"): "USDINR=X",
    ("EUR", "INR"): "EURINR=X",
    ("GBP", "INR"): "GBPINR=X",
    ("INR", "USD"): "INRUSD=X",  # sometimes missing; we handle inversion anyway
}

def _yahoo_close(pair: str, as_of: date) -> Optional[Decimal]:
    """Fetch EOD close for a given FX pair and date via yfinance."""
    try:
        import yfinance as yf
        # fetch [as_of, as_of+1) to get that day's candle
        end = as_of + timedelta(days=1)
        hist = yf.Ticker(pair).history(start=as_of, end=end)
        if hist is not None and not hist.empty:
            return Decimal(str(float(hist["Close"].iloc[-1])))
        # fallback: latest 5d close if exact day missing (weekend/holiday)
        hist = yf.Ticker(pair).history(period="5d")
        if hist is not None and not hist.empty:
            return Decimal(str(float(hist["Close"].iloc[-1])))
    except Exception:
        pass
    return None

def _get_cached(db: Session, base: str, quote: str, as_of: date) -> Optional[Decimal]:
    row = db.execute(
        select(FXRate.rate).where(FXRate.base == base, FXRate.quote == quote, FXRate.as_of == as_of)
    ).scalar_one_or_none()
    return Decimal(row) if row is not None else None

def _put_cache(db: Session, base: str, quote: str, as_of: date, rate: Decimal) -> None:
    db.merge(FXRate(base=base, quote=quote, as_of=as_of, rate=rate))
    db.commit()

def _direct_pair(base: str, quote: str) -> Optional[str]:
    return PAIR_MAP.get((base, quote))

def get_fx_rate(db: Session, base: str, quote: str, as_of: date) -> Decimal:
    """
    1 base = ? quote, on 'as_of' date. Caches results in fx_rates.
    Supports direct, inverse, and triangulation via USD.
    """
    base = base.upper(); quote = quote.upper()
    if base == quote:
        return Decimal("1")

    # cache
    cached = _get_cached(db, base, quote, as_of)
    if cached is not None:
        return cached

    # direct
    pair = _direct_pair(base, quote)
    if pair:
        v = _yahoo_close(pair, as_of)
        if v is not None:
            _put_cache(db, base, quote, as_of, v)
            return v

    # inverse
    inv = _direct_pair(quote, base)
    if inv:
        v = _yahoo_close(inv, as_of)
        if v is not None and v != 0:
            rate = (Decimal("1") / v).quantize(Decimal("0.00000001"))
            _put_cache(db, base, quote, as_of, rate)
            return rate

    # triangulate via USD
    if base != "USD" and quote != "USD":
        r1 = get_fx_rate(db, base, "USD", as_of)
        r2 = get_fx_rate(db, "USD", quote, as_of)
        rate = (r1 * r2).quantize(Decimal("0.00000001"))
        _put_cache(db, base, quote, as_of, rate)
        return rate

    # final attempt: try yfinance generic "BASEQUOTE=X"
    fallback = f"{base}{quote}=X"
    v = _yahoo_close(fallback, as_of)
    if v is not None:
        _put_cache(db, base, quote, as_of, v)
        return v

    raise RuntimeError(f"FX rate not available for {base}/{quote} on {as_of}")
