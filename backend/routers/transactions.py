from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator
from datetime import date
from decimal import Decimal
from core.deps import get_db, get_current_user
from core.models import Portfolio, Transaction
import uuid

router = APIRouter(prefix="/portfolios/{pid}/tx", tags=["transactions"])

class TxIn(BaseModel):
    trade_date: date
    symbol: str = Field(min_length=1, max_length=32)
    side: str = Field(pattern="^(BUY|SELL|DIV|SPLIT|BONUS|FEE)$")
    quantity: Decimal
    price: Decimal | None = None
    fees: Decimal = Decimal("0")
    trade_ccy: str = "INR"
    fx_rate: Decimal | None = None
    notes: str | None = None

class TxOut(BaseModel):
    id: str
    trade_date: date
    symbol: str
    side: str
    quantity: Decimal
    price: Decimal | None
    fees: Decimal
    trade_ccy: str
    fx_rate: Decimal | None
    notes: str | None

class TxPatch(BaseModel):
    trade_date: date | None = None
    symbol: str | None = Field(default=None, min_length=1, max_length=32)
    side: str | None = Field(default=None, pattern="^(BUY|SELL|DIV|SPLIT|BONUS|FEE)$")
    quantity: Decimal | None = None
    price: Decimal | None = None
    fees: Decimal | None = None
    trade_ccy: str | None = None
    fx_rate: Decimal | None = None
    notes: str | None = None

    @validator("symbol")
    def _upper_symbol(cls, v):
        return v.upper() if v is not None else v

def _get_owned_portfolio(db: Session, user_id, pid: str) -> Portfolio:
    try:
        pid_uuid = uuid.UUID(pid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    p = db.get(Portfolio, pid_uuid)
    if not p or p.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return p

def _tx_out(r: Transaction) -> TxOut:
    return TxOut(
        id=str(r.id), trade_date=r.trade_date, symbol=r.symbol, side=r.side,
        quantity=r.quantity, price=r.price, fees=r.fees,
        trade_ccy=r.trade_ccy, fx_rate=r.fx_rate, notes=r.notes
    )

@router.get("", response_model=list[TxOut])
def list_tx(pid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = _get_owned_portfolio(db, user.id, pid)
    rows = (
        db.query(Transaction)
        .filter(Transaction.portfolio_id == p.id)
        .order_by(Transaction.trade_date.desc(), Transaction.id.desc())
        .all()
    )
    return [_tx_out(r) for r in rows]

@router.post("", response_model=TxOut, status_code=201)
def create_tx(pid: str, payload: TxIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = _get_owned_portfolio(db, user.id, pid)
    r = Transaction(
        portfolio_id=p.id, trade_date=payload.trade_date, symbol=payload.symbol,
        side=payload.side, quantity=payload.quantity, price=payload.price,
        fees=payload.fees, trade_ccy=payload.trade_ccy, fx_rate=payload.fx_rate, notes=payload.notes
    )
    db.add(r); db.commit(); db.refresh(r)
    return _tx_out(r)

@router.patch("/{txid}", response_model=TxOut)
def update_tx(pid: str, txid: str, payload: TxPatch, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # ensure user owns the portfolio
    p = _get_owned_portfolio(db, user.id, pid)
    # parse tx id
    try:
        tx_uuid = uuid.UUID(txid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    # load tx + ownership check
    r: Transaction | None = db.get(Transaction, tx_uuid)
    if not r or r.portfolio_id != p.id:
        raise HTTPException(status_code=404, detail="Not found")

    data = payload.dict(exclude_unset=True)
    if "symbol" in data and (data["symbol"] is None or data["symbol"] == ""):
        raise HTTPException(status_code=400, detail="Symbol cannot be empty")

    # apply partial updates
    for k, v in data.items():
        setattr(r, k, v)

    db.add(r); db.commit(); db.refresh(r)
    return _tx_out(r)

@router.delete("/{txid}")
def delete_tx(pid: str, txid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _get_owned_portfolio(db, user.id, pid)
    try:
        tx_uuid = uuid.UUID(txid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    r = db.get(Transaction, tx_uuid)
    if not r or str(r.portfolio_id) != pid:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(r); db.commit()
    return {"ok": True}
