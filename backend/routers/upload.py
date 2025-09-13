# upload.py

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from .upload_parser import parse_excel
from metrics.metrics_calculator import calculate_metrics
from metrics.metrics_input_mapper import extract_inputs
from metrics.utils import make_json_safe
from routers.dcf import calculate_dcf as run_dcf
from routers.sensitivity import dcf_sensitivity as run_dcf_sensitivity
from calculators.eps_calculator import project_eps as run_eps
from routers.dcf import DCFInput  # import your model
from routers.sensitivity import SensitivityInput
from routers.eps import EPSProjectionRequest

import pandas as pd

router = APIRouter()
import math

def clean_dict(d):
    for k, v in d.items():
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            d[k] = 0
    return d

import math

def deep_clean_dict(obj):
    if isinstance(obj, dict):
        return {k: deep_clean_dict(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [deep_clean_dict(i) for i in obj]
    elif isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
        return 0
    return obj

@router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        parsed = parse_excel(contents)

        company_name = parsed["company_name"]
        #print(f"ℹ️ [BACKEND DEBUG] company_name : {company_name}")
        meta = parsed["meta"]
        #print(f"ℹ️ [BACKEND DEBUG] Meta data: {meta}")
        pnl = parsed["pnl"]
        #print(f"ℹ️ [BACKEND DEBUG] pnl data: {pnl}")
        bs = parsed["balance_sheet"]
        #print(f"ℹ️ [BACKEND DEBUG] bs data: {bs}")
        cf = parsed["cashflow"]
        #print(f"ℹ️ [BACKEND DEBUG] cf data: {cf}")
        qtr_results = parsed["quarters"]
        #print(f"ℹ️ [BACKEND DEBUG] quarters data: {qtr_results}")
        years = parsed["years"]
        #print(f"ℹ️ [BACKEND DEBUG] years data: {years}")
        
        qtrs = parsed["qtrs"]
        #print(f"ℹ️ [BACKEND DEBUG] Quarters data: {qtrs}")
        
        calculated_metrics = calculate_metrics(pnl, bs, cf, qtr_results, years, qtrs, meta, source="excel")[0]
        
        #print(f"ℹ️ [BACKEND DEBUG]  calculated_metrics: {calculated_metrics}")

         # Derive assumptions from metrics
        assumptions = {
            "current_price": calculated_metrics["current_price"],
            "base_revenue": calculated_metrics["latest_revenue"],
            "latest_net_debt": calculated_metrics["latest_net_debt"],
            "shares_outstanding": calculated_metrics["shares_outstanding"],
            "ebit_margin": calculated_metrics["ebit_margin"],
            "depreciation_pct": calculated_metrics["depreciation_pct"],
            "capex_pct": calculated_metrics["capex_pct"],
            "wc_change_pct": calculated_metrics["wc_change_pct"],
            "tax_rate": calculated_metrics["tax_rate"],
            "interest_pct": calculated_metrics["interest_pct"],
            "x_years": 3,
            "growth_x": calculated_metrics["growth_x"],
            "y_years": 10,
            "growth_y": calculated_metrics["growth_y"],
            "growth_terminal": calculated_metrics["growth_terminal"],
            "base_year": calculated_metrics["base_year"],
            "interest_exp_pct": calculated_metrics["interest_exp_pct"],
        }
        #print(f"ℹ️ [BACKEND DEBUG] assumptions: {assumptions}")
        # Run DCF and Sensitivity
        
        dcf_result = run_dcf(DCFInput(**assumptions))
        #print(f"ℹ️ [BACKEND DEBUG] dcf_result: {dcf_result}")
        dcf_sens_result = run_dcf_sensitivity(SensitivityInput(**assumptions))
        #print(f"ℹ️ [BACKEND DEBUG] dcf_sens_result: {dcf_sens_result}")
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
        #print(f"ℹ️ [BACKEND DEBUG] eps_input: {eps_input}")
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
        #print(f"ℹ️ [BACKEND DEBUG] eps_result: {eps_result}")
        return make_json_safe({
            "company_info": company_name,
            "metrics": calculated_metrics,
            "assumptions": assumptions,
            "valuationResults": {
                "dcf": dcf_result,
                "dcf_sensitivity": dcf_sens_result,
                "eps": eps_result
            }
        })
        

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
