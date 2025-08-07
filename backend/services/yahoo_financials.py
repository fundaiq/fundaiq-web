import yfinance as yf
import pandas as pd
import numpy as np
from fastapi import HTTPException
from collections import OrderedDict

def fetch_yahoo_financials(ticker):
    result = {}
    ticker_obj = yf.Ticker(ticker)

    info = ticker_obj.info
    result["company_info"] = {
        "name": info.get("longName") or info.get("shortName"),
        "ticker": ticker,
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "description": info.get("longBusinessSummary"),
        "current_price": info.get("currentPrice"),
        "market_cap": info.get("marketCap")
    }

    try:
        financials = fetch_yahoo_financials2(ticker)
        pnl = financials["pnl"]
        bs = financials["balance_sheet"]
        cf = financials["cashflow"]
        years = financials["years"] or ["Mar-2024"]

        result.update({
            "pnl": pnl,
            "balance_sheet": bs,
            "cashflow": cf,
            "quarters": {},  # if you need it
            "years": years,
            "info":info

        })
        print("✅ P&L:", result["pnl"].keys())
        print("✅ BS:", result["balance_sheet"].keys())
        print("✅ CF:", result["cashflow"].keys())
        print("✅ Years:", result["years"])
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def fetch_yahoo_financials2(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow

        # DEBUG prints
        print("📊 Raw financials shape:", financials.shape)
        print("📊 Raw balance sheet shape:", balance_sheet.shape)
        print("📊 Raw cash flow shape:", cashflow.shape)

        # If any of these are empty, print and raise
        if financials.empty or balance_sheet.empty or cashflow.empty:
            raise ValueError("One or more financial statements are empty from Yahoo.")

        # P&L mapping and order
        pnl_row_map = {
            "Sales": "Total Revenue",
            "EBITDA": "EBITDA",
            "EBIT": "EBIT",
            "Interest": "Interest Expense",
            "Net profit": "Net Income",
            "Tax":"Tax Provision",
            "Depreciation":"Reconciled Depreciation"
        }
        pnl_row_order = list(pnl_row_map.keys())

        # Balance Sheet mapping and order
        bs_row_map = {
            "Equity Share Capital": "Common Stock Equity",
            #"Reserves": "Other Equity Interest",
            "Borrowings": "Total Debt",
            "Investments": "Other Short Term Investments",
            "Cash & Bank": "Cash And Cash Equivalents",
            "Net Block" : "Net PPE",
            "Capital Work in Progress":"Construction In Progress",
            "No. of Equity Shares":"Ordinary Shares Number"

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
            missing_labels = []

            for label in row_order:
                yahoo_label = row_map.get(label)
                if yahoo_label and yahoo_label in df.index:
                    values = df.loc[yahoo_label].values
                    safe_values = []
                    for v in values:
                        try:
                            if isinstance(v, (list, tuple, np.ndarray)):
                                v = v[0] if len(v) > 0 else 0
                            safe_values.append(round(float(v) / 1e7, 2))
                        except Exception as e:
                            print(f"⚠️ Error processing value '{v}' for label '{label}': {e}")
                            safe_values.append(0)
                    parsed[label] = safe_values
                else:
                    missing_labels.append(label)

            if not parsed:
                print(f"⚠️ None of the expected labels were found. Missing: {missing_labels}")
                print("Available rows from Yahoo Finance:", list(df.index))

            return parsed, years


        pnl, pnl_years = clean_and_parse_df(financials, pnl_row_map, pnl_row_order)
        print("✅ Parsed P&L rows:", list(pnl.keys()))
        print("✅ Parsed P&L years:", pnl_years)

        bs, bs_years = clean_and_parse_df(balance_sheet, bs_row_map, bs_row_order)
        cf, cf_years = clean_and_parse_df(cashflow, cf_row_map, cf_row_order)

        # Choose years from the first non-empty set
        years = pnl_years or bs_years or cf_years or ["Mar-2024"]

        return {
            "pnl": pnl,
            "balance_sheet": bs,
            "cashflow": cf,
            "years": years
        }
    except Exception as e:
        print("❌ Error in fetch_yahoo_financials2:", e)
        raise