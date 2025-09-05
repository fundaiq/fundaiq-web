from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from core.deps import get_db, get_current_user
from core.models import Portfolio
import uuid
# --- Summary endpoint ---
from core.positions import compute_positions
from core.models import Portfolio

router = APIRouter(prefix="/portfolios", tags=["portfolios"])

class PortfolioCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    base_currency: str = "INR"

class PortfolioOut(BaseModel):
    id: str
    name: str
    base_currency: str

@router.get("", response_model=list[PortfolioOut])
def list_portfolios(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Portfolio).filter(Portfolio.owner_id == user.id).order_by(Portfolio.created_at.desc()).all()
    return [PortfolioOut(id=str(r.id), name=r.name, base_currency=r.base_currency) for r in rows]

@router.post("", response_model=PortfolioOut, status_code=201)
def create_portfolio(payload: PortfolioCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    p = Portfolio(owner_id=user.id, name=payload.name, base_currency=payload.base_currency)
    db.add(p); db.commit(); db.refresh(p)
    return PortfolioOut(id=str(p.id), name=p.name, base_currency=p.base_currency)

@router.delete("/{pid}")
def delete_portfolio(pid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        pid_uuid = uuid.UUID(pid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    p = db.get(Portfolio, pid_uuid)
    if not p or p.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(p); db.commit()
    return {"ok": True}


@router.get("/{pid}")
def get_portfolio_summary(pid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # ownership check
    import uuid
    try:
        pid_uuid = uuid.UUID(pid)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")

    p = db.get(Portfolio, pid_uuid)
    if not p or p.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")

    data = compute_positions(db, p.id)
    return {
        "id": str(p.id),
        "name": p.name,
        "base_currency": p.base_currency,
        **data
    }
