# backend/routers/prices_series.py
from fastapi import APIRouter, HTTPException
from typing import List, Literal, Optional
from datetime import datetime, timedelta
import yfinance as yf

BENCHMARK_MAP = {
    # Feel free to adjust if you prefer different tickers
    "nifty50": "^NSEI",
    "sensex": "^BSESN",
    "nifty500": "^CRSLDX",  # If Yahoo rejects this, swap to another symbol you use
}

router = APIRouter(tags=["prices"])

Range = Literal["1W", "1M", "3M", "6M", "1Y", "2Y", "3Y", "5Y", "10Y", "MAX"]
Interval = Literal["1d", "1wk", "1mo"]

def _range_to_period_and_interval(r: Range):
    r = (r or "1Y").upper()
    if r == "1W":   return ("1wk", "1d")
    if r == "1M":   return ("1mo", "1d")
    if r == "3M":   return ("3mo", "1d")
    if r == "6M":   return ("6mo", "1d")
    if r == "1Y":   return ("1y",  "1d")
    if r == "2Y":   return ("2y",  "1wk")
    if r == "3Y":   return ("3y",  "1wk")
    if r == "5Y":   return ("5y",  "1wk")
    if r == "10Y":   return ("10y",  "1mo")
    if r == "MAX":  return ("max", "1mo")
    return ("1y", "1d")

@router.get("/price-series/{ticker}")
def get_price_series(
    ticker: str,
    range: Range = "1Y",
    interval: Optional[Interval] = None
):
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")

    period, default_interval = _range_to_period_and_interval(range)
    interval = interval or default_interval

    try:
        hist = yf.Ticker(ticker).history(period=period, interval=interval)
        if hist is None or hist.empty:
            raise HTTPException(status_code=404, detail="No price data found")

        # ✅ Correctly iterate over dict records (no tuple unpacking)
        records = hist.reset_index().to_dict("records")
        data = []
        for rec in records:
            dt = rec.get("Date")
            # Handle pandas.Timestamp / datetime / string
            date_str = dt.strftime("%Y-%m-%d") if hasattr(dt, "strftime") else str(dt)[:10]

            close = rec.get("Close")
            if close is None:
                continue
            try:
                close_f = float(close)
            except Exception:
                continue

            data.append({"date": date_str, "close": close_f})

        if not data:
            raise HTTPException(status_code=404, detail="No price data points after normalization")

        return {
            "ticker": ticker.upper(),
            "range": range,
            "interval": interval,
            "points": data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prices: {e}")



def _fetch_history_series(ticker: str, period: str, interval: str):
    import yfinance as yf
    hist = yf.Ticker(ticker).history(period=period, interval=interval)
    if hist is None or hist.empty:
        return []

    records = hist.reset_index().to_dict("records")
    data = []
    for rec in records:
        dt = rec.get("Date")
        date_str = dt.strftime("%Y-%m-%d") if hasattr(dt, "strftime") else str(dt)[:10]

        close = rec.get("Close")
        vol   = rec.get("Volume", None)

        if close is None:
            continue

        try:
            close_f = float(close)
            vol_i = int(vol) if vol is not None else None
        except Exception:
            continue

        data.append({"date": date_str, "close": close_f, "volume": vol_i})
    return data

@router.get("/price-series/benchmark/{code}")
def get_benchmark_series(code: str, range: Range = "1Y", interval: Optional[Interval] = None):
    code_key = code.lower()
    y_ticker = BENCHMARK_MAP.get(code_key)
    if not y_ticker:
        raise HTTPException(status_code=400, detail=f"Unknown benchmark: {code}")

    period, default_interval = _range_to_period_and_interval(range)
    interval = interval or default_interval

    try:
        points = _fetch_history_series(y_ticker, period, interval)
        if not points:
            raise HTTPException(status_code=404, detail="No price data found")
        return {
            "code": code_key,
            "ticker": y_ticker,
            "range": range,
            "interval": interval,
            "points": points,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prices: {e}")