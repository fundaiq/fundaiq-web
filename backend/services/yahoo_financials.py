# import yfinance as yf
# import pandas as pd
# import numpy as np
# from fastapi import HTTPException
# from collections import OrderedDict

# def fetch_yahoo_financials(ticker):
#     result = {}
#     ticker_obj = yf.Ticker(ticker)

#     info = ticker_obj.info
#     result["company_info"] = {
#         "name": info.get("longName") or info.get("shortName"),
#         "ticker": ticker,
#         "sector": info.get("sector"),
#         "industry": info.get("industry"),
#         "description": info.get("longBusinessSummary"),
#         "current_price": info.get("currentPrice"),
#         "market_cap": info.get("marketCap")
#     }

#     try:
#         financials = fetch_yahoo_financials2(ticker)
#         pnl = financials["pnl"]
#         bs = financials["balance_sheet"]
#         cf = financials["cashflow"]
#         years = financials["years"] or ["Mar-2024"]

#         pnl, balance, cashflow, _ccy_meta = normalize_statements_to_inr_if_india(
#             ticker_str=ticker,
#             ticker_obj=ticker_obj,
#             pnl=pnl,
#             balance=bs,
#             cashflow=cf,
#             explicit_currency=None,   # keep None unless you already detect financialCurrency elsewhere
#         )

#         result.update({
#             "pnl": pnl,
#             "balance_sheet": bs,
#             "cashflow": cf,
#             "quarters": {},  # if you need it
#             "years": years,
#             "info":info,
#             "reporting_currency": _ccy_meta.get("reporting_currency"),
#             "original_currency": _ccy_meta.get("original_currency")

#         })
        
        
#         return result

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# def fetch_yahoo_financials2(ticker: str):
#     try:
#         stock = yf.Ticker(ticker)
#         financials = stock.financials
#         balance_sheet = stock.balance_sheet
#         cashflow = stock.cashflow

#         # If any of these are empty, print and raise
#         if financials.empty or balance_sheet.empty or cashflow.empty:
#             raise ValueError("One or more financial statements are empty from Yahoo.")

#         # P&L mapping and order
#         pnl_row_map = {
#             "Sales": "Total Revenue",
#             "EBITDA": "EBITDA",
#             "EBIT": "EBIT",
#             "Interest": "Interest Expense",
#             "Net profit": "Net Income",
#             "Tax":"Tax Provision",
#             "Depreciation":"Reconciled Depreciation"
#         }
#         pnl_row_order = list(pnl_row_map.keys())

#         # Balance Sheet mapping and order
#         bs_row_map = {
#             "Equity Share Capital": "Common Stock Equity",
#             #"Reserves": "Other Equity Interest",
#             "Borrowings": "Total Debt",
#             "Investments": "Other Short Term Investments",
#             "Cash & Bank": "Cash And Cash Equivalents",
#             "Net Block" : "Net PPE",
#             "Capital Work in Progress":"Construction In Progress",
#             "No. of Equity Shares":"Ordinary Shares Number"

#         }
#         bs_row_order = list(bs_row_map.keys())

#         # Cash Flow mapping and order
#         cf_row_map = {
#             "Cash from Operating Activity": "Operating Cash Flow",
#             "Cash from Investing Activity": "Investing Cash Flow",
#             "Cash from Financing Activity": "Financing Cash Flow",
#             "Net Cash Flow": "Changes In Cash"
#         }
#         cf_row_order = list(cf_row_map.keys())

#         def clean_and_parse_df(df: pd.DataFrame, row_map: dict, row_order: list) -> (OrderedDict, list):
#             from collections import OrderedDict

#             parsed = OrderedDict()
#             if df.empty:
#                 return parsed, []

#             df = df.fillna(0).astype(float)
#             df = df[df.columns[::-1]]  # reverse column order (oldest → newest)

#             # Remove columns where all rows are 0 or NaN
#             df = df.loc[:, df.apply(lambda col: not all(v == 0 or pd.isna(v) for v in col))]

#             # ✅ Limit to last 4 columns
#             df = df.iloc[:, -4:]

#             if df.empty:
#                 return parsed, []

#             df.columns = df.columns.strftime("Mar-%Y")
#             years = df.columns.tolist()
#             missing_labels = []

#             for label in row_order:
#                 yahoo_label = row_map.get(label)
#                 if yahoo_label and yahoo_label in df.index:
#                     values = df.loc[yahoo_label].values
#                     safe_values = []
#                     for v in values:
#                         try:
#                             if isinstance(v, (list, tuple, np.ndarray)):
#                                 v = v[0] if len(v) > 0 else 0
#                             safe_values.append(round(float(v) / 1e7, 2))
#                         except Exception as e:
#                             print(f"⚠️ Error processing value '{v}' for label '{label}': {e}")
#                             safe_values.append(0)
#                     parsed[label] = safe_values
#                 else:
#                     missing_labels.append(label)

#             if not parsed:
#                 print(f"⚠️ None of the expected labels were found. Missing: {missing_labels}")
#                 print("Available rows from Yahoo Finance:", list(df.index))

#             return parsed, years


#         pnl, pnl_years = clean_and_parse_df(financials, pnl_row_map, pnl_row_order)
        

#         bs, bs_years = clean_and_parse_df(balance_sheet, bs_row_map, bs_row_order)
#         cf, cf_years = clean_and_parse_df(cashflow, cf_row_map, cf_row_order)

#         # Choose years from the first non-empty set
#         years = pnl_years or bs_years or cf_years or ["Mar-2024"]

#         return {
#             "pnl": pnl,
#             "balance_sheet": bs,
#             "cashflow": cf,
#             "years": years
#         }
#     except Exception as e:
#         print("❌ Error in fetch_yahoo_financials2:", e)
#         raise


# # --- SAFE ADDITIONS: India ticker detection + guarded normalize call ---

# def is_india_equity_ticker(ticker_str: str, ticker_obj=None) -> bool:
#     """
#     True only for NSE/BSE equities: *.NS or *.BO (case-insensitive).
#     Keeps logic conservative to avoid surprises.
#     """
#     if not ticker_str:
#         return False
#     s = ticker_str.strip().upper()
#     if s.endswith(".NS") or s.endswith(".BO"):
#         return True

#     # Optional ultra-safe fallback using Yahoo metadata (never required):
#     try:
#         info = getattr(ticker_obj, "info", {}) or {}
#         exch = (info.get("exchange") or "").upper()
#         # Common values seen for India: "NSE", "BSE", sometimes "NATIONAL STOCK EXCHANGE OF INDIA"
#         if exch in {"NSE", "BSE"} or "INDIA" in exch:
#             return True
#     except Exception:
#         pass

#     return False


# def normalize_statements_to_inr_if_india(
#     ticker_str: str,
#     ticker_obj,
#     pnl,
#     balance,
#     cashflow,
#     explicit_currency: str | None = None,
# ):
#     """
#     Run INR normalization only when ticker is *.NS / *.BO.
#     Otherwise return dataframes unchanged. Non-breaking.
#     """
#     if not is_india_equity_ticker(ticker_str, ticker_obj):
#         # No changes for non-India tickers
#         meta = {"reporting_currency": None, "original_currency": None}
#         return pnl, balance, cashflow, meta

#     # Reuse your existing normalize_statements_to_inr(...) helper
#     return normalize_statements_to_inr(
#         ticker_obj, pnl, balance, cashflow, explicit_currency=explicit_currency
#     )


import yfinance as yf
import pandas as pd
import numpy as np
from fastapi import HTTPException
from collections import OrderedDict

# =========================
# Public API
# =========================

def fetch_yahoo_financials(ticker: str):
    """
    Top-level fetch used by your API.
    - Pulls company info
    - Calls fetch_yahoo_financials2() which:
        * fetches Yahoo statements
        * (conditionally) normalizes to INR for .NS / .BO
        * parses into OrderedDicts scaled to crores
        * returns years and optional currency meta
    - Returns a dict matching your existing shape, plus optional currency meta.
    """
    result = {}
    ticker_obj = yf.Ticker(ticker)

    info = ticker_obj.info or {}
    result["company_info"] = {
        "name": info.get("longName") or info.get("shortName"),
        "ticker": ticker,
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "description": info.get("longBusinessSummary"),
        "current_price": info.get("currentPrice"),
        "market_cap": info.get("marketCap"),
    }

    try:
        financials = fetch_yahoo_financials2(ticker)

        # Use parsed dicts (already normalized if .NS/.BO)
        result.update({
            "pnl": financials["pnl"],
            "balance_sheet": financials["balance_sheet"],
            "cashflow": financials["cashflow"],
            "quarters": {},  # unchanged placeholder
            "years": financials["years"],
            "info": info,
            # Optional meta for UI/debug
            "reporting_currency": financials.get("reporting_currency"),
            "original_currency": financials.get("original_currency"),
        })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def fetch_yahoo_financials2(ticker: str):
    """
    Fetch raw Yahoo statements, normalize to INR only for .NS/.BO,
    then parse into OrderedDicts with rows in a fixed order and values scaled to crores.
    """
    try:
        stock = yf.Ticker(ticker)

        # Raw Yahoo DataFrames (columns are dates)
        financials = stock.financials
        balance_sheet = stock.balance_sheet
        cashflow = stock.cashflow

        if financials is None or balance_sheet is None or cashflow is None:
            raise ValueError("One or more financial statements are None from Yahoo.")
        if financials.empty or balance_sheet.empty or cashflow.empty:
            raise ValueError("One or more financial statements are empty from Yahoo.")

        # --- Normalize to INR ONLY for .NS / .BO (before parsing/scaling) ---
        ccy_meta = {"reporting_currency": None, "original_currency": None}
        if is_india_equity_ticker(ticker, stock):
            financials, balance_sheet, cashflow, ccy_meta = normalize_statements_to_inr(
                stock, financials, balance_sheet, cashflow, explicit_currency=None
            )
        else:
            # If not India ticker, preserve original currency for debug (optional)
            orig = _detect_financial_currency_from_info(stock, fallback=None)
            ccy_meta = {"reporting_currency": None, "original_currency": (orig or None)}

        # -------------------------------
        # Mapping & Parsing (unchanged)
        # -------------------------------

        # P&L mapping and order
        pnl_row_map = {
            "Sales": "Total Revenue",
            "EBITDA": "EBITDA",
            "EBIT": "EBIT",
            "Interest": "Interest Expense",
            "Net profit": "Net Income",
            "Tax": "Tax Provision",
            "Depreciation": "Reconciled Depreciation",
        }
        pnl_row_order = list(pnl_row_map.keys())

        # Balance Sheet mapping and order
        bs_row_map = {
            "Equity Share Capital": "Common Stock Equity",
            # "Reserves": "Other Equity Interest",  # keep commented as in your code
            "Borrowings": "Total Debt",
            "Investments": "Other Short Term Investments",
            "Cash & Bank": "Cash And Cash Equivalents",
            "Net Block": "Net PPE",
            "Capital Work in Progress": "Construction In Progress",
            "No. of Equity Shares": "Ordinary Shares Number",
        }
        bs_row_order = list(bs_row_map.keys())

        # Cash Flow mapping and order
        cf_row_map = {
            "Cash from Operating Activity": "Operating Cash Flow",
            "Cash from Investing Activity": "Investing Cash Flow",
            "Cash from Financing Activity": "Financing Cash Flow",
            "Net Cash Flow": "Changes In Cash",
        }
        cf_row_order = list(cf_row_map.keys())

        def clean_and_parse_df(df: pd.DataFrame, row_map: dict, row_order: list) -> (OrderedDict, list):
            parsed = OrderedDict()
            if df is None or df.empty:
                return parsed, []

            # Fill and ensure numeric where possible
            df = df.fillna(0)

            # Yahoo frames are usually "items x periods" -> columns are dates; reverse oldest→newest
            try:
                df = df[df.columns[::-1]]
            except Exception:
                pass  # if columns can’t be reversed, keep as is

            # Drop all-zero or all-NaN columns
            df = df.loc[:, df.apply(lambda col: not all((v == 0) or pd.isna(v) for v in col))]

            # Keep last 4 periods
            if df.shape[1] > 4:
                df = df.iloc[:, -4:]

            if df.empty:
                return parsed, []

            # Format years as "Mar-YYYY" from column dates (best-effort)
            try:
                df.columns = pd.to_datetime(df.columns).strftime("Mar-%Y")
            except Exception:
                # Fallback: leave original labels
                pass

            years = list(df.columns)

            missing_labels = []
            for label in row_order:
                yahoo_label = row_map.get(label)
                if yahoo_label and (yahoo_label in df.index):
                    values = df.loc[yahoo_label].values
                    safe_values = []
                    for v in values:
                        try:
                            if isinstance(v, (list, tuple, np.ndarray)):
                                v = v[0] if len(v) > 0 else 0
                            # Scale to crores (1e7)
                            safe_values.append(round(float(v) / 1e7, 2))
                        except Exception:
                            safe_values.append(0)
                    parsed[label] = safe_values
                else:
                    missing_labels.append(label)

            if not parsed:
                # Debug info only; avoid raising to keep flow safe
                print(f"⚠️ None of the expected labels were found. Missing: {missing_labels}")
                print("Available rows from Yahoo Finance:", list(df.index))

            return parsed, years

        pnl, pnl_years = clean_and_parse_df(financials, pnl_row_map, pnl_row_order)
        bs, bs_years = clean_and_parse_df(balance_sheet, bs_row_map, bs_row_order)
        cf, cf_years = clean_and_parse_df(cashflow, cf_row_map, cf_row_order)

        # Choose years from first non-empty
        years = pnl_years or bs_years or cf_years or ["Mar-2024"]

        return {
            "pnl": pnl,
            "balance_sheet": bs,
            "cashflow": cf,
            "years": years,
            # Meta bubbled up (optional)
            "reporting_currency": ccy_meta.get("reporting_currency"),
            "original_currency": ccy_meta.get("original_currency"),
        }

    except Exception as e:
        print("❌ Error in fetch_yahoo_financials2:", e)
        raise


# =========================
# India detection + normalization (helpers)
# =========================

def is_india_equity_ticker(ticker_str: str, ticker_obj=None) -> bool:
    """
    True only for NSE/BSE equities: *.NS or *.BO (case-insensitive).
    Conservative logic to avoid surprises.
    """
    if not ticker_str:
        return False
    s = ticker_str.strip().upper()
    if s.endswith(".NS") or s.endswith(".BO"):
        return True

    # Optional safety: confirm via Yahoo metadata
    try:
        info = getattr(ticker_obj, "info", {}) or {}
        exch = (info.get("exchange") or "").upper()
        if exch in {"NSE", "BSE"} or "INDIA" in exch:
            return True
    except Exception:
        pass

    return False


def _detect_financial_currency_from_info(ticker_obj, fallback: str | None = None) -> str | None:
    try:
        info = getattr(ticker_obj, "info", {}) or {}
        ccy = (info.get("financialCurrency") or "").upper().strip() or None
        return ccy or fallback
    except Exception:
        return fallback


def _fx_series_to_inr(base_ccy: str | None, period_index: pd.Index) -> pd.Series:
    """
    Returns a per-period FX multiplier to convert base_ccy -> INR
    indexed to the statement's period index. Falls back to 1.0 on error.
    """
    if base_ccy is None:
        return pd.Series(1.0, index=period_index)

    ccy = base_ccy.upper()
    if ccy in ("INR", "INR-"):
        return pd.Series(1.0, index=period_index)

    scale = 1.0
    if ccy == "GBX":  # pence to GBP then to INR
        ccy = "GBP"
        scale = 0.01

    pair = f"{ccy}INR=X"
    try:
        # Cover a window around statement dates
        idx = pd.to_datetime(period_index)
        start = (idx.min() - pd.Timedelta(days=7)).date().isoformat()
        end = (idx.max() + pd.Timedelta(days=7)).date().isoformat()

        fx = yf.download(pair, start=start, end=end, progress=False)["Adj Close"]
        if fx.empty:
            return pd.Series(1.0, index=period_index)

        fx = fx.sort_index().ffill()
        out = []
        for dt in idx:
            if dt in fx.index:
                out.append(float(fx.loc[dt]))
            else:
                prev = fx.loc[:dt]
                out.append(float(prev.iloc[-1]) if len(prev) else float(fx.iloc[0]))
        return pd.Series(out, index=period_index, dtype="float64") * scale

    except Exception:
        # Fail-safe: no conversion rather than break pipeline
        return pd.Series(1.0, index=period_index)


def _convert_statement_df_to_inr(df: pd.DataFrame | None, base_ccy: str | None) -> pd.DataFrame | None:
    """
    Convert a Yahoo statement DataFrame to INR using period-end FX.
    Safe no-op if df is None/empty or columns aren't datelike.
    """
    if df is None or df.empty:
        return df

    # Ensure columns are date-like; if not, quietly no-op
    try:
        cols = pd.to_datetime(df.columns)
    except Exception:
        return df

    fx = _fx_series_to_inr(base_ccy, cols)
    conv = df.copy()
    for i, col in enumerate(conv.columns):
        conv[col] = pd.to_numeric(conv[col], errors="coerce") * float(fx.iloc[i])

    # Mark attrs without changing schema
    if hasattr(conv, "attrs"):
        conv.attrs["reporting_currency_original"] = base_ccy or "INR"
        conv.attrs["reporting_currency"] = "INR"

    return conv


def normalize_statements_to_inr(
    ticker_obj,
    pnl_df: pd.DataFrame,
    bs_df: pd.DataFrame,
    cf_df: pd.DataFrame,
    explicit_currency: str | None = None,
):
    """
    Normalize all three statement DataFrames to INR using detected financialCurrency
    (or explicit_currency if provided). Returns converted DFs and meta dict.
    """
    fin_ccy = (explicit_currency or "").upper().strip() or None
    if fin_ccy is None:
        fin_ccy = _detect_financial_currency_from_info(ticker_obj, fallback=None)

    pnl_inr = _convert_statement_df_to_inr(pnl_df, fin_ccy)
    bs_inr = _convert_statement_df_to_inr(bs_df, fin_ccy)
    cf_inr = _convert_statement_df_to_inr(cf_df, fin_ccy)

    meta = {
        "reporting_currency": "INR",
        "original_currency": (fin_ccy or "INR").upper(),
    }
    return pnl_inr, bs_inr, cf_inr, meta
