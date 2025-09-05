from fastapi import APIRouter, Body
from services.yahoo_financials import fetch_yahoo_financials
from services.yahoo_utils import make_json_safe
from metrics.metrics_input_mapper import extract_inputs
from metrics.metrics_calculator import calculate_metrics
from routers.dcf import calculate_dcf as run_dcf
from routers.sensitivity import dcf_sensitivity as run_dcf_sensitivity
from calculators.eps_calculator import project_eps as run_eps
from routers.dcf import DCFInput  # import your model
from routers.sensitivity import SensitivityInput
from routers.eps import EPSProjectionRequest

import math

router = APIRouter()

@router.post("/yahoo-profile")
def get_yahoo_profile(data: dict = Body(...)):
    try:
        
        ticker = data.get("ticker")
        
        result = fetch_yahoo_financials(ticker)

        pnl = result.get("pnl", {})
        bs = result.get("balance_sheet", {})
        cf = result.get("cashflow", {})
        years = result.get("years", [])
        yahoo_info = result.get("info", {})
        company_info = result.get("company_info", {})

        source = "yahoo"
        metrics = calculate_metrics(pnl, bs, cf, years, source=source, yahoo_info=yahoo_info)[0]

        # Derive assumptions from metrics
        assumptions = {
            "current_price": metrics["current_price"],
            "base_revenue": metrics["latest_revenue"],
            "latest_net_debt": metrics["latest_net_debt"],
            "shares_outstanding": metrics["shares_outstanding"],
            "ebit_margin": metrics["ebit_margin"],
            "depreciation_pct": metrics["depreciation_pct"],
            "capex_pct": metrics["capex_pct"],
            "wc_change_pct": metrics["wc_change_pct"],
            "tax_rate": metrics["tax_rate"],
            "interest_pct": metrics["interest_pct"],
            "x_years": 3,
            "growth_x": metrics["growth_x"],
            "y_years": 10,
            "growth_y": metrics["growth_y"],
            "growth_terminal": metrics["growth_terminal"],
            "base_year": metrics["base_year"],
            "interest_exp_pct": metrics["interest_exp_pct"]
        }
        # Run DCF and Sensitivity
        

        dcf_result = run_dcf(DCFInput(**assumptions))
        
        dcf_sens_result = run_dcf_sensitivity(SensitivityInput(**assumptions))

        # Run EPS projection
        eps_input = {
            "base_revenue": assumptions["base_revenue"],
            "projection_years": 3,
            "revenue_growth": assumptions["growth_x"],
            "ebit_margin": assumptions["ebit_margin"],
            "interest_exp_pct": assumptions["interest_exp_pct"],
            "tax_rate": assumptions["tax_rate"],
            "shares_outstanding": assumptions["shares_outstanding"],
            "current_price": assumptions["current_price"],
            "base_year": assumptions["base_year"],
        }
        eps_result = run_eps(
            eps_input["base_revenue"],
            eps_input["projection_years"],
            eps_input["revenue_growth"],
            eps_input["ebit_margin"],
            eps_input["interest_exp_pct"],
            eps_input["tax_rate"],
            eps_input["shares_outstanding"],
            eps_input["current_price"],
            eps_input["base_year"],
            
        )

        return make_json_safe({
            "company_info": company_info,
            "metrics": metrics,
            "assumptions": assumptions,
            "valuationResults": {
                "dcf": dcf_result,
                "dcf_sensitivity": dcf_sens_result,
                "eps": eps_result
            }
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}