# schemas/transactions.py
from datetime import date
from typing import Optional, Literal
from pydantic import BaseModel, Field, validator

Side = Literal["BUY", "SELL", "DIV", "SPLIT", "BONUS", "FEE"]

class TransactionOut(BaseModel):
    id: int
    portfolio_id: int
    trade_date: date
    symbol: str                # Yahoo ticker
    side: Side
    quantity: float
    price: float
    fees: float
    trade_ccy: str
    fx_rate: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class TransactionPatch(BaseModel):
    trade_date: Optional[date] = None
    symbol: Optional[str] = Field(default=None, min_length=1)
    side: Optional[Side] = None
    quantity: Optional[float] = Field(default=None, ge=0)
    price: Optional[float] = Field(default=None, ge=0)
    fees: Optional[float] = Field(default=None, ge=0)
    trade_ccy: Optional[str] = None
    fx_rate: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None

    @validator("symbol")
    def uppercase_symbol(cls, v):
        return v.upper() if v else v
