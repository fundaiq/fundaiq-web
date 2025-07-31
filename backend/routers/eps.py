# routes/eps.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from calculators.eps_calculator import project_eps

router = APIRouter()

class EPSProjectionRequest(BaseModel):
    base_revenue: float
    projection_years: int
    revenue_growth: float
    ebit_margin: float
    interest_exp_pct: float
    tax_rate: float
    shares_outstanding: float
    current_price: float
    base_year : str

@router.post("/project-eps")
def calculate_eps_projection(data: EPSProjectionRequest):
    try:
        result = project_eps(
            base_revenue=data.base_revenue,
            projection_years=data.projection_years,
            revenue_growth=data.revenue_growth,
            ebit_margin=data.ebit_margin,
            interest_exp_pct=data.interest_exp_pct,
            tax_rate=data.tax_rate,
            shares_outstanding=data.shares_outstanding,
            current_price=data.current_price,
            base_year = data.base_year
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()  # 👈 logs the full error in terminal
        raise HTTPException(status_code=500, detail=str(e))