from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from .metrics_calculator import calculate_metrics, make_json_safe
import yfinance as yf
import pandas as pd
from collections import OrderedDict
import numpy as np

router = APIRouter()


@router.get("/yahoo-profile/{ticker}")
def fetch_yahoo_profile(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        company_name = info.get("longName") or info.get("shortName")
        sector = info.get("sector")
        industry = info.get("industry")
        description = info.get("longBusinessSummary")

        #revenue = info.get("totalRevenue", 0)
        #net_income = info.get("netIncomeToCommon", 0)
        #equity = info.get("totalStockholderEquity", 1)
        #debt = info.get("totalDebt", 0)
        shares = info.get("sharesOutstanding", 0)
        try:
            shares_out = round(shares[0] / 1e7, 2) if isinstance(shares, list) else round(shares / 1e7, 2)
        except Exception:
            shares_out = 0
        
        

        # ✅ Fetch 4Y financials
        financials = fetch_yahoo_financials(ticker)
        pnl = financials["pnl"]
        bs = financials["balance_sheet"]
        cf = financials["cashflow"]
        years = financials["years"] or ["Mar-2024"]

       
        calculated_metrics, assumptions = calculate_metrics(pnl, bs, cf, years, source="yahoo")

        assumptions.update({
            "current_price":info.get("currentPrice", 0),
            "company_name": company_name,
            "shares_outstanding": shares_out
        })

        response = {
            "company_name": company_name,
            "ticker": ticker,
            "sector": sector,
            "industry": industry,
            "description": description,
            "pnl": pnl,
            "balance_sheet": bs,
            "cashflow": cf,
            "quarters": {},
            "metadata": {
                "Current Price": info.get("currentPrice", 0)
            },
            "years": years,
            "calculated_metrics": calculated_metrics,
            "assumptions": assumptions
        }

        return JSONResponse(content=make_json_safe(response))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def fetch_yahoo_financials(ticker: str):
    t = yf.Ticker(ticker)

    # P&L mapping and order
    pnl_row_map = {
        "Sales": "Total Revenue",
        "EBITDA": "EBITDA",
        "EBIT": "EBIT",
        "Interest": "Interest Expense",
        "Net profit": "Net Income"
    }
    pnl_row_order = list(pnl_row_map.keys())

    # Balance Sheet mapping and order
    bs_row_map = {
        "Equity Share Capital": "Common Stock Equity",
        #"Reserves": "Other Equity Interest",
        "Borrowings": "Total Debt",
        "Investments": "Other Short Term Investments",
        "Cash & Bank": "Cash And Cash Equivalents"
    }
    bs_row_order = list(bs_row_map.keys())

    # Cash Flow mapping and order
    cf_row_map = {
        "Cash from Operating Activity": "Operating Cash Flow",
        "Cash from Investing Activity": "Investing Cash Flow",
        "Cash from Financing Activity": "Financing Cash Flow",
        "Net Cash Flow": "Changes In Cash"
    }
    cf_row_order = list(cf_row_map.keys())

    def clean_and_parse_df(df: pd.DataFrame, row_map: dict, row_order: list) -> (OrderedDict, list):
        from collections import OrderedDict

        parsed = OrderedDict()
        if df.empty:
            return parsed, []

        df = df.fillna(0).astype(float)
        df = df[df.columns[::-1]]  # reverse column order (oldest → newest)

        # Remove columns where all rows are 0 or NaN
        df = df.loc[:, df.apply(lambda col: not all(v == 0 or pd.isna(v) for v in col))]

        # ✅ Limit to last 4 columns
        df = df.iloc[:, -4:]

        if df.empty:
            return parsed, []

        df.columns = df.columns.strftime("Mar-%Y")
        years = df.columns.tolist()

        for label in row_order:
            yahoo_label = row_map.get(label)
            if yahoo_label and yahoo_label in df.index:
                values = df.loc[yahoo_label].values
                safe_values = []
                for v in values:
                    try:
                        if isinstance(v, (list, tuple, np.ndarray)):
                            # Handle nested list/array
                            v = v[0] if len(v) > 0 else 0
                        safe_values.append(round(float(v) / 1e7, 2))
                    except Exception as e:
                        print(f"⚠️ Error processing value '{v}' for label '{label}': {e}")
                        safe_values.append(0)
                parsed[label] = safe_values
        return parsed, years


    pnl, pnl_years = clean_and_parse_df(t.financials, pnl_row_map, pnl_row_order)
    bs, bs_years = clean_and_parse_df(t.balance_sheet, bs_row_map, bs_row_order)
    cf, cf_years = clean_and_parse_df(t.cashflow, cf_row_map, cf_row_order)

    # Choose years from the first non-empty set
    years = pnl_years or bs_years or cf_years or ["Mar-2024"]

    return {
        "pnl": pnl,
        "balance_sheet": bs,
        "cashflow": cf,
        "years": years
    }
