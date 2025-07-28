# upload.py

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from .upload_parser import parse_excel
from .metrics_calculator import calculate_metrics, make_json_safe
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
        meta = parsed["meta"]
        pnl = parsed["pnl"]
        bs = parsed["balance_sheet"]
        cf = parsed["cashflow"]
        quarters = parsed["quarters"]
        years = parsed["years"]

        calculated_metrics, assumptions = calculate_metrics(pnl, bs, cf, years)
        calculated_metrics["years"] = years
        # Additional assumptions
        revenue_row = pnl.get("Sales", [])
        latest_revenue = revenue_row[-1] if revenue_row else 0

        shares_row = bs.get("No. of Equity Shares", [])
        if shares_row:
            last = shares_row[-1]
            second_last = shares_row[-2] if len(shares_row) > 1 else last
            shares_outstanding = round((second_last if last == 0 else last) / 1e7, 2)
        else:
            shares_outstanding = 0

        debt_row = bs.get("Borrowings", [])
        investments = bs.get("Investments", [])
        cash = bs.get("Cash & Bank", [])
        net_debt = (
            (debt_row[-1] if debt_row else 0) -
            ((investments[-1] if investments else 0) + (cash[-1] if cash else 0))
        )
        
        current_price = float(meta.get("Current Price", 0))

        assumptions.update({
            #"latest_revenue": round(latest_revenue,2),
            "shares_outstanding": round(shares_outstanding,2),
            "net_debt": round(net_debt,2),
            #"wacc": 11,
            #"growth_x": 20,
            #"growth_y": 12,
            #"period_x": 5,
            #"period_y": 15,
            #"growth_terminal": 4,
            "current_price": round(current_price, 2),
            "company_name": company_name
        })
        assumptions = clean_dict(assumptions)
        calculated_metrics = clean_dict(calculated_metrics)
        
        response = {
            "company_name": company_name,
            "years": years,
            "pnl": pnl,
            "balance_sheet": bs,
            "cashflow": cf,
            "quarters": quarters,
            "metadata": meta,
            "calculated_metrics": calculated_metrics,
            "assumptions": assumptions
        }
        import pprint
        pprint.pprint(response)  # 👀 See the full dictionary
        response = deep_clean_dict(response)
        return JSONResponse(content=make_json_safe(response))

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
