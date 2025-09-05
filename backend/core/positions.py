# core/positions.py
from __future__ import annotations
from collections import defaultdict, deque
from decimal import Decimal
from typing import Any
from datetime import date

from sqlalchemy.orm import Session
from core.models import Transaction
from core.prices import get_last_price
from core.fx import get_fx_rate

D = Decimal

def _dec(x) -> Decimal:
    return D(str(x)) if x is not None else D("0")

def compute_positions(db: Session, portfolio_id) -> dict[str, Any]:
    """
    FIFO lots with INR normalization:
      - BUY: push lot (qty, unit_cost_in_inr) using trade-date FX (or stored fx_rate).
      - SELL: pop from FIFO lots, compute realized P&L in INR vs. sold proceeds in INR.
    Unrealized = remaining lots market value (today's FX) minus remaining cost.
    Returns per-holding and totals in INR.
    """
    # FIFO lots per symbol: deque of {"qty": Decimal, "unit_cost_in_inr": Decimal}
    lots: dict[str, deque] = defaultdict(deque)

    # Running aggregates
    realized_by_symbol: dict[str, Decimal] = defaultdict(D)
    fees_in_inr_by_symbol: dict[str, Decimal] = defaultdict(D)

    txs = (
        db.query(Transaction)
        .filter(Transaction.portfolio_id == portfolio_id)
        .order_by(Transaction.trade_date.asc(), Transaction.created_at.asc())
        .all()
    )

    for tx in txs:
        side = (tx.side or "").upper()
        qty = _dec(tx.quantity)
        price = _dec(tx.price)
        fees = _dec(tx.fees)
        tccy = (tx.trade_ccy or "INR").upper()

        # FX at trade date (for costs/proceeds)
        if tccy == "INR":
            fx_td = D("1")
        else:
            fx_td = _dec(tx.fx_rate) if tx.fx_rate else get_fx_rate(db, tccy, "INR", tx.trade_date)

        if side == "BUY":
            # total cash out in INR
            cash_out_in_inr = (qty * price + fees) * fx_td
            unit_cost_in_inr = (cash_out_in_inr / qty) if qty > 0 else D("0")
            lots[tx.symbol].append({"qty": qty, "unit_cost_in_inr": unit_cost_in_inr})

        elif side == "SELL":
            if qty <= 0:
                continue
            # proceeds in INR (credit fees as negative)
            proceeds_in_inr = (qty * price - fees) * fx_td
            fees_in_inr_by_symbol[tx.symbol] += (fees * fx_td)

            # match against FIFO lots
            remaining = qty
            realized = D("0")
            while remaining > 0 and lots[tx.symbol]:
                lot = lots[tx.symbol][0]
                take = min(remaining, lot["qty"])
                # cost in INR for the taken shares
                cost_in_inr = take * lot["unit_cost_in_inr"]
                # average sell price in INR for this slice
                sell_price_in_inr = proceeds_in_inr / qty if qty > 0 else D("0")
                realized += take * (sell_price_in_inr - lot["unit_cost_in_inr"])
                # reduce lot
                lot["qty"] -= take
                if lot["qty"] <= 0:
                    lots[tx.symbol].popleft()
                remaining -= take

            realized_by_symbol[tx.symbol] += realized

        # DIV/SPLIT/BONUS/FEE can be added later

    # Build holdings with LTP and unrealized P&L in INR
    today = date.today()
    holdings = []
    total_value_inr = D("0")
    total_cost_inr = D("0")
    total_realized_inr = D("0")

    for symbol, dq in lots.items():
        # remaining qty and cost
        rem_qty = D("0")
        rem_cost_in_inr = D("0")
        for lot in dq:
            rem_qty += lot["qty"]
            rem_cost_in_inr += lot["qty"] * lot["unit_cost_in_inr"]
        if rem_qty <= 0:
            continue

        # price + FX today for value
        ltp, ltp_ccy = get_last_price(symbol)
        ltp_ccy = (ltp_ccy or "INR").upper()
        ltp_dec = _dec(ltp) if ltp is not None else None
        if ltp_dec is not None:
            fx_today = D("1") if ltp_ccy == "INR" else get_fx_rate(db, ltp_ccy, "INR", today)
            value_in_inr = (rem_qty * ltp_dec * fx_today).quantize(D("0.01"))
        else:
            value_in_inr = None

        avg_cost_in_inr = (rem_cost_in_inr / rem_qty).quantize(D("0.01"))
        unrealized_pnl_in_inr = (value_in_inr - rem_cost_in_inr).quantize(D("0.01")) if value_in_inr is not None else None

        if value_in_inr is not None:
            total_value_inr += value_in_inr
        total_cost_inr += rem_cost_in_inr

        # realized for this symbol
        realized_in_inr = realized_by_symbol.get(symbol, D("0"))
        total_realized_inr += realized_in_inr

        holdings.append({
            "symbol": symbol,
            "qty": str(rem_qty),
            "avg_cost_in_inr": str(avg_cost_in_inr),
            "ltp_ccy": ltp_ccy,
            "value_in_inr": str(value_in_inr) if value_in_inr is not None else None,
            "cost_in_inr": str(rem_cost_in_inr.quantize(D("0.01"))),
            "unrealized_pnl_in_inr": str(unrealized_pnl_in_inr) if unrealized_pnl_in_inr is not None else None,
            "realized_pnl_in_inr": str(realized_in_inr.quantize(D("0.01"))),
        })

    # weights by INR value
    if total_value_inr > 0:
        for h in holdings:
            v = D(h["value_in_inr"]) if h["value_in_inr"] is not None else D("0")
            h["weight_pct"] = str((v / total_value_inr * D("100")).quantize(D("0.01")))
    else:
        for h in holdings:
            h["weight_pct"] = None

    totals = {
        "total_cost_in_inr": str(total_cost_inr.quantize(D("0.01"))),
        "total_value_in_inr": str(total_value_inr.quantize(D("0.01"))) if total_value_inr > 0 else None,
        "unrealized_pnl_in_inr": (
            str((total_value_inr - total_cost_inr).quantize(D("0.01"))) if total_value_inr > 0 else None
        ),
        "realized_pnl_in_inr": str(total_realized_inr.quantize(D("0.01"))),
        "note": "FIFO realized P&L uses trade-date FX for proceeds/cost; unrealized uses today's FX for market value."
    }

    return {"holdings": holdings, "totals": totals}
