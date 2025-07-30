from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import yfinance as yf

router = APIRouter()

class DCFInput(BaseModel):
    base_revenue: float
    latest_net_debt: float
    shares_outstanding: float
    ebit_margin: float
    depreciation_pct: float
    capex_pct: float
    wc_change_pct: float
    tax_rate: float
    interest_pct: float
    x_years: int
    growth_x: float
    y_years: int
    growth_y: float
    growth_terminal: float

@router.post("/dcf")
def calculate_dcf(input: DCFInput):
    fcf_table = []
    revenue = input.base_revenue
    fcf_results = []

    for year in range(1, input.y_years + 1):
        if year <= input.x_years:
            growth = input.growth_x / 100
        elif year < input.y_years:
            growth = input.growth_y / 100
        else:
            growth = input.growth_terminal / 100

        revenue *= (1 + growth)
        ebit = revenue * (input.ebit_margin / 100)
        tax = ebit * (input.tax_rate / 100)
        nopat = ebit - tax
        depreciation = revenue * (input.depreciation_pct / 100)
        capex = revenue * (input.capex_pct / 100)
        wc_change = revenue * (input.wc_change_pct / 100)
        fcf = nopat + depreciation - capex - wc_change
        discount_factor = (1 + input.interest_pct / 100) ** year
        pv_fcf = fcf / discount_factor
        pv_fcf_pershare =  pv_fcf / input.shares_outstanding
        
        fcf_results.append(pv_fcf)

        fcf_table.append({
            "Year": year,
            "Revenue": round(revenue, 2),
            "EBIT": round(ebit, 2),
            "Tax": round(tax, 2),
            "NOPAT": round(nopat, 2),
            "Depreciation": round(depreciation, 2),
            "CapEx": round(capex, 2),
            "WC Change": round(wc_change, 2),
            "FCF": round(fcf, 2),
            "PV of FCF": round(pv_fcf, 2),
            "PV of FCF per Share" : round(pv_fcf_pershare,2)
        })

    terminal_value = (fcf * (1 + input.growth_terminal / 100)) / ((input.interest_pct - input.growth_terminal) / 100)
    pv_terminal = terminal_value / ((1 + input.interest_pct / 100) ** input.y_years)

    enterprise_value = sum(fcf_results) + pv_terminal
    equity_value = enterprise_value - input.latest_net_debt
    fair_value_per_share = equity_value / input.shares_outstanding

    terminal_weight = (pv_terminal / enterprise_value) * 100
    phase1_pv = sum(fcf_results[:input.x_years])
    phase2_pv = sum(fcf_results[input.x_years:])

    return {
    "fcf_table": fcf_table,
    "fair_value_per_share": round(fair_value_per_share, 2),
    "enterprise_value": round(enterprise_value, 2),
    "equity_value": round(equity_value, 2),
    "latest_net_debt": round(input.latest_net_debt, 2),
    "shares_outstanding": round(input.shares_outstanding, 2),
    "terminal_value_pv": round(pv_terminal, 2),
    "terminal_weight": round(terminal_weight, 2),
    "phase1_pv": round(phase1_pv, 2),
    "phase2_pv": round(phase2_pv, 2),
    "fv_phase1_per_share": round(phase1_pv / input.shares_outstanding, 2),
    "fv_phase2_per_share": round(phase2_pv / input.shares_outstanding, 2),
    "terminal_value_per_share": round(pv_terminal / input.shares_outstanding, 2)
}

