def safe_divide(numerator, denominator):
    try:
        return float(numerator) / float(denominator) if denominator not in (0, None) else 0.0
    except:
        return 0.0

def safe_last(lst):
    return lst[-1] if lst and len(lst) else 0

def safe_get_values(table, label, default_len=10):
    """
    Safely get values from table with better error handling
    """
    if not table or label not in table:
        print(f"⚠️ [Backend Metric Calculator] Warning: '{label}' not found in data")
        return [0] * default_len
    
    values = table[label][:default_len] if isinstance(table[label], list) else [0] * default_len
    
    # Clean the values - convert 'NaT', None, and non-numeric values to 0
    cleaned_values = []
    for val in values:
        if val == 'NaT' or val is None or val == '' or str(val).lower() == 'nan':
            cleaned_values.append(0)
        else:
            try:
                cleaned_values.append(float(val))
            except:
                cleaned_values.append(0)
    
    print(f"ℹ️ [Backend Metric Calculator] {label} (cleaned): {cleaned_values}")
    return cleaned_values

def calculate_metrics(pnl, bs, cf, qtr_results, years, qtrs, meta, source="excel", yahoo_info=None,):
    print(f"ℹ️ [Backend Metric Calculator] Calculation Starts !!!!!!!!!!!")

    def get_values(table, label):
        return safe_get_values(table, label, len(years))
    
    def sum_last_4(lst):
        if not lst:
            return 0
        # Filter out non-numeric values before summing
        numeric_values = [x for x in lst if isinstance(x, (int, float)) and x != 0]
        if len(numeric_values) < 4:
            return sum(numeric_values)  # Sum all elements if less than 4
        return sum(numeric_values[-4:])

    def calculate_growth(series):
        result = []
        for prev, curr in zip(series[:-1], series[1:]):
            if prev == 0 or prev is None:
                result.append(0.0)
            elif (prev < 0 < curr) or (prev > 0 > curr):
                # Sign change: calculate as improvement/deterioration from baseline
                growth = ((curr - prev) / abs(prev)) * 100
                result.append(round(growth, 2))
            else:
                # Same sign: normal percentage calculation
                growth = ((curr / prev) - 1) * 100
                result.append(round(growth, 2))
        return result

    #************* Get Meta Data ******************************************    
    
    market_cap = float(meta.get("Market Capitalization", 0))
    print(f"ℹ️ [Backend Metric Calculator] market_cap : {market_cap} ")

    current_price = float(meta.get("Current Price", 0))
    print(f"ℹ️ [Backend Metric Calculator] current_price : {current_price} ")
    
    #************* Get P&L Data ******************************************    
    
    revenue = get_values(pnl, "Sales")
    latest_revenue = revenue[-1] if revenue else 0
    print(f"ℹ️ [Backend Metric Calculator] latest_revenue : {latest_revenue} ")

    raw_material_cost = get_values(pnl, "Raw Material Cost")
    change_in_inventory = get_values(pnl, "Change in Inventory")
    power_fule = get_values(pnl, "Power and Fuel")
    other_mfr_exp = get_values(pnl, "Other Mfr. Exp")
    emp_cost = get_values(pnl, "Employee Cost")
    selling_admin = get_values(pnl, "Selling and admin")
    other_exp = get_values(pnl, "Other Expenses")
    other_income = get_values(pnl, "Other Income")[:len(revenue)]
    net_profit = get_values(pnl, "Net profit")
    interest = get_values(pnl, "Interest")
    depreciation = get_values(pnl, "Depreciation")
    div_amount = get_values(pnl, "Dividend Amount")
    tax_values = get_values(pnl, "Tax")

    #************* Get Balancesheet Data ******************************************    
    
    reserves = get_values(bs, "Reserves")
    equity_capital = get_values(bs, "Equity Share Capital")
    debt = get_values(bs, "Borrowings")
    cash = get_values(bs, "Cash & Bank")
    investments = get_values(bs, "Investments")
    capex = get_values(bs, "Capital Work in Progress")
    net_block = get_values(bs, "Net Block")[:len(revenue)]
    
    shares = get_values(bs, "No. of Equity Shares")
    shares = [round(safe_divide(share, 10000000), 2) for share in shares]
    print(f"ℹ️ [Backend Metric Calculator] shares : {shares} ")
    if shares and shares[-1] == 0 and len(shares) > 1:
        shares[-1] = shares[-2]

    #************* Minimum length of chart series ******************************************    
    
    min_len = min(len(revenue), len(net_profit), len(depreciation))
    print(f"ℹ️ [Backend Metric Calculator] min_len : {min_len} ")
    
    #************* Get Quarterly Data ******************************************    
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] ttm Calculation Starts !!!!!!!!!!!")
    
    # Debug: Print available columns in qtr_results
    if qtr_results:
        print(f"ℹ️ [Backend Metric Calculator] Available quarterly columns: {list(qtr_results.keys())}")
    else:
        print(f"⚠️ [Backend Metric Calculator] qtr_results is empty or None")
    
    # Try different possible column names for quarterly data
    possible_sales_names = ["Sales", "Revenue", "Total Revenue", "Quarterly Sales"]
    possible_expenses_names = ["Expenses", "Total Expenses", "Operating Expenses"]
    possible_np_names = ["Net profit", "Net Profit", "Net Income", "PAT"]
    possible_op_names = ["Operating Profit", "EBITDA", "Operating Income"]
    
    def find_column(table, possible_names, default_len=10):
        for name in possible_names:
            if table and name in table:
                return safe_get_values(table, name, default_len)
        print(f"⚠️ [Backend Metric Calculator] No matching column found for {possible_names}")
        return [0] * default_len
    
    q_sales = find_column(qtr_results, possible_sales_names, len(qtrs))
    q_expenses = find_column(qtr_results, possible_expenses_names, len(qtrs))  
    q_np = find_column(qtr_results, possible_np_names, len(qtrs))
    q_op = find_column(qtr_results, possible_op_names, len(qtrs))
    
    # If quarterly data is still empty, fall back to annual data divided by 4
    if sum(q_sales) == 0 and revenue:
        print("ℹ️ [Backend Metric Calculator] Falling back to annual data for TTM calculations")
        q_sales = [r/4 for r in revenue[-4:]] if len(revenue) >= 4 else revenue + [0] * (4 - len(revenue))
        q_np = [n/4 for n in net_profit[-4:]] if len(net_profit) >= 4 else net_profit + [0] * (4 - len(net_profit))
        
        # Calculate approximate quarterly operating profit
        if source == "excel":
            ebitda = [round(r - rmc + cii - pf - ome - ec - sa - oe,2) for r, rmc, cii, pf, ome, ec, sa, oe in zip(
                revenue[-4:], raw_material_cost[-4:], change_in_inventory[-4:], power_fule[-4:], 
                other_mfr_exp[-4:], emp_cost[-4:], selling_admin[-4:], other_exp[-4:])]
            q_op = [e/4 for e in ebitda] if ebitda else [0] * 4
        else:
            q_op = [0] * 4
    
    q_other_income = get_values(qtr_results, "Other Income") if qtr_results else [0] * len(qtrs)
    q_depreciation = get_values(qtr_results, "Depreciation") if qtr_results else [0] * len(qtrs)
    q_interest = get_values(qtr_results, "Interest") if qtr_results else [0] * len(qtrs) 
    q_pbt = get_values(qtr_results, "Profit before tax") if qtr_results else [0] * len(qtrs)
    q_tax = get_values(qtr_results, "Tax") if qtr_results else [0] * len(qtrs)
    
    q_ebit = [round(e + oi - d,2) for e, oi, d in zip(q_op, q_other_income, q_depreciation)]
    print(f"ℹ️ [Backend Metric Calculator] q_ebit : {q_ebit} ")
    
    #********** Get Chart Series ***************************************
    
    #Past Growth
     
    net_debt = [round(d-c-i,2) for d, c,i in zip(debt, cash, investments)]
    print(f"ℹ️ [Backend Metric Calculator] net_debt : {net_debt} ")
    
    cash_and_investments =[round(c+i,2) for c,i in zip( cash, investments)]
    
    if source == "excel":
        ebitda = [round(r - rmc + cii - pf - ome - ec - sa - oe,2) for r, rmc, cii, pf, ome, ec, sa, oe in zip(
        revenue, raw_material_cost, change_in_inventory, power_fule, other_mfr_exp, emp_cost, selling_admin, other_exp[:min_len])]
        print(f"ℹ️ [Backend Metric Calculator] ebitda : {ebitda} ")

        ebit = [round(e + oi - d,2) for e, oi, d in zip(ebitda, other_income, depreciation)]
        print(f"ℹ️ [Backend Metric Calculator] ebit : {ebit} ")
        
        equity = [round(e + r,2) for e, r in zip(equity_capital, reserves)]
        print(f"ℹ️ [Backend Metric Calculator] equity : {equity} ")
    
    revenue_growth = calculate_growth(revenue)
    print(f"ℹ️ [Backend Metric Calculator] revenue_growth : {revenue_growth} ")

    ebitda_growth = calculate_growth(ebitda)
    print(f"ℹ️ [Backend Metric Calculator] ebitda_growth : {ebitda_growth} ")

    net_profit_growth = calculate_growth(net_profit)
    print(f"ℹ️ [Backend Metric Calculator] net_profit_growth : {net_profit_growth} ")

    
    ebitda_margin = [round(safe_divide(e, r) * 100,2) for e, r in zip(ebitda, revenue[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] ebitda_margin : {ebitda_margin} ")

    net_profit_margin = [round(safe_divide(n, r) * 100,2) for n, r in zip(net_profit[:min_len], revenue[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] net_profit_margin : {net_profit_margin} ")
    
    roce = [round(safe_divide(e, (eq + d)) * 100,2) for e, eq, d in zip(ebit, equity[:min_len], debt[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] roce : {roce} ")

    roe = [round(safe_divide(n, eq) * 100,2) for n, eq in zip(net_profit[:min_len], equity[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] roe : {roe} ")

    interest_coverage = [round(safe_divide(e, i),2) for e, i in zip(ebit, interest[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] interest_coverage : {interest_coverage} ")

    debt_to_equity = [round(safe_divide(d, eq),2) for d, eq in zip(debt[:min_len], equity[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] debt_to_equity : {debt_to_equity} ")
    
    book_values = [round(safe_divide(e, s),2) for e, s in zip(equity, shares)]
    print(f"ℹ️ [Backend Metric Calculator] book_value : {book_values} ")

    div_amount_per_share = [round(safe_divide(d, s),2) for d, s in zip(div_amount, shares)]
    
    net_asset_values = [round((nb-nd),2) for nb, nd in zip(net_block, net_debt)]

    net_asset_values_per_share = [round(safe_divide(nav, s),2) for nav, s in zip(net_asset_values, shares)]

    #*********** Get latest values what ever is required ***********************************

    div_amount_last = safe_last(div_amount_per_share)
    print(f"ℹ️ [Backend Metric Calculator] div_amount_last : {div_amount_last} ")

    latest_net_debt =round(net_debt[-1],2) if net_debt else 0
    print(f"ℹ️ [Backend Metric Calculator] latest_net_debt : {latest_net_debt} ")

    eps_values = [safe_divide(n, e) for n, e in zip(net_profit, shares)]
    eps_cagr_3y = calculate_cagr(eps_values)
    eps = safe_last(eps_values)
    pe = safe_divide(current_price, eps)
    peg_ratio = safe_divide(pe, safe_last(revenue_growth)) if revenue_growth else 0
    
    tax_rate = round(safe_divide(safe_last(tax_values), safe_last(ebit)) * 100,2) if ebit else 0
    capex_pct = round(safe_divide(safe_last(capex), safe_last(revenue)) * 100,2) if capex and revenue else 2.0
    revenue_cagr_3y = calculate_cagr(revenue)
    interest_exp_pct = safe_divide(safe_last(interest), safe_last(ebit)) * 100 if ebit else 0
    
    ev = round(market_cap + latest_net_debt, 2)
    price_to_sales = round(safe_divide(market_cap, latest_revenue), 2)
    
    # Free cash flow calculation
    fcf = [round(n + d - c,2) for n, d, c in zip(net_profit[:min_len], depreciation[:min_len], capex[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] fcf : {fcf} ")

    fcf_margin = [round(safe_divide(f, r) * 100,2) for f, r in zip(fcf, revenue[:min_len])]
    print(f"ℹ️ [Backend Metric Calculator] fcf_margin : {fcf_margin} ")

    
    #******************* Analyse Quarterly Data **********************
    q_sales_growth = calculate_growth(q_sales)
    print(f"ℹ️ [Backend Metric Calculator] q_sales_growth : {q_sales_growth} ")

    q_ebitda_margin = [round(safe_divide(e, r) * 100,2) for e, r in zip(q_op, q_sales)]

    q_net_profit_growth = calculate_growth(q_np)
    print(f"ℹ️ [Backend Metric Calculator] q_net_profit_growth : {q_net_profit_growth} ")

    #****************Calculate TTM Numbers**************************** 
    ttm_sales = round(sum_last_4(q_sales),2)
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] ttm_sales : {ttm_sales}" )
    
    ttm_op = round(sum_last_4(q_op),2)
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] ttm_op : {ttm_op}" )
    
    ttm_np = round(sum_last_4(q_np),2)
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] ttm_np : {ttm_np}" )

    ttm_ebit = round(sum_last_4(q_ebit),2)
    print(f"ℹ️ [Backend Metric Calculator] ttm_ebit : {ttm_ebit} ")
    
    ttm_roce  = round(safe_divide(ttm_ebit, (safe_last(equity) + safe_last(debt))) * 100,2)
    print(f"ℹ️ [Backend Metric Calculator] ttm_roce : {ttm_roce} ")
    
    ttm_roe = round(safe_divide(ttm_np, safe_last(equity)) * 100,2)
    print(f"ℹ️ [Backend Metric Calculator] ttm_roe : {ttm_roe} ")
    
    ttm_interest= round(sum_last_4(q_interest),2)
    ttm_interest_coverage = round(safe_divide(ttm_ebit, ttm_interest),2)
    print(f"ℹ️ [Backend Metric Calculator] ttm_interest_coverage : {ttm_interest_coverage} ")
    
    ttm_interest_exp_pct = round(safe_divide(ttm_interest, ttm_ebit) * 100,2) if ttm_ebit else 0

    price_to_sales = round(safe_divide(market_cap, ttm_sales), 2)
    ev_to_ebit = round(safe_divide(ev, ttm_ebit), 2)
    ev_to_ebitda = round(safe_divide(ev, ttm_op), 2)

    print(f"ℹ️ [Backend Metric Calculator] ttm Calculation End !!!!!!!!!!!")    
    
    ttm_eps = round(safe_divide(ttm_np, shares[-1]),2)
    

    revenue_with_ttm = revenue + [ttm_sales]
    ebitda_with_ttm = ebitda + [ttm_op]
    net_profit_with_ttm  = net_profit + [ttm_np]
    years_with_ttm = years +["TTM"] 

    ttm_pe = round(safe_divide(market_cap, ttm_np),2)
    
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] revenue_with_ttm : {revenue_with_ttm}" )
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] ebitda_with_ttm : {ebitda_with_ttm}" )
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] net_profit_with_ttm : {net_profit_with_ttm}" )
    print(f"ℹ️ [Backend Metric Calculator - ttm calc] years_with_ttm : {years_with_ttm}" )

    print(f"ℹ️ [Backend Metric Calculator] Calculation Ends !!!!!!!!!!!")

    # Additional calculations for missing variables
    book_value = safe_last(book_values)
    ttm_pb = round(safe_divide(current_price, safe_last(book_values)), 2)
    net_asset_values_per_share_last = safe_last(net_asset_values_per_share)
    div_yield = round(safe_divide(div_amount_last, current_price) * 100, 2) if current_price else 0

    calculated_metrics = {
        "revenue": revenue,
        "revenue_with_ttm" : revenue_with_ttm,
        "current_price": current_price,
        "net_profit": net_profit,
        "net_profit_with_ttm" : net_profit_with_ttm,
        "ebit": ebit,
        "ebitda": ebitda,
        "ebitda_with_ttm": ebitda_with_ttm,
        "net_block": net_block,
        "cwip": capex,
        "equity": equity,
        "net_debt": net_debt,
        "cash_and_bank": cash_and_investments,
        "revenue_growth": revenue_growth,
        "ebitda_growth": ebitda_growth,
        "net_profit_growth": net_profit_growth,
        "ebitda_margin": ebitda_margin,
        "net_profit_margin": net_profit_margin,
        "ttm_roce": ttm_roce,
        "ttm_roe": ttm_roe,
        "roce": roce,
        "roe": roe,
        "interest_coverage": interest_coverage,
        "ttm_interest_coverage": ttm_interest_coverage,
        "debt_to_equity": debt_to_equity,
        "fcf": fcf,
        "fcf_margin": fcf_margin,
        "tax_rate": tax_rate,
        "wacc": 12.0,
        "terminal_growth_rate": 3.0,
        "years": years,
        "years_with_ttm": years_with_ttm,
        "ttm_pe": ttm_pe,
        "market_cap": market_cap,
        "ttm_pb": ttm_pb if ttm_pb is not None else 0,
        "book_value": round(book_value, 2) if book_value is not None else 0,
        "net_asset_values_per_share": net_asset_values_per_share if net_asset_values_per_share is not None else 0,
        "net_asset_values_per_share_last": net_asset_values_per_share_last if net_asset_values_per_share_last is not None else 0,
        "peg_ratio": round(peg_ratio, 2) if peg_ratio is not None else 0,
        "revenue_cagr_3y": round(revenue_cagr_3y,2),
        "eps_cagr_3y": round(eps_cagr_3y, 2) if eps_cagr_3y is not None else 0, 
        "div_amount": div_amount,
        "div_amount_per_share": div_amount_per_share,
        "div_amount_last": round(div_amount_last,2),
        "div_yield": round(div_yield, 2) if div_yield is not None else 0,
        "price_to_sales":price_to_sales,
        "latest_revenue": ttm_sales,
        "ev":ev,
        "ev_to_ebit":ev_to_ebit,
        "ev_to_ebitda":ev_to_ebitda,
        "latest_net_debt": latest_net_debt,
        "ebit_margin": round(safe_divide(ttm_ebit, ttm_sales) * 100, 2) if ttm_ebit and ttm_sales else 0,
        "depreciation_pct": round(safe_divide(safe_last(depreciation), safe_last(revenue)) * 100, 2) if depreciation and revenue else 0,
        "wc_change_pct": 2,
        "interest_pct": 13.0,
        "interest_exp": ttm_interest,
        "interest_exp_pct": ttm_interest_exp_pct,
        "base_year": safe_last(years),
        "wacc": 13,
        "growth_x": 12,
        "growth_y": 9,
        "period_x": 5,
        "period_y": 15,
        "growth_terminal": 3,
        "capex_pct": capex_pct if capex_pct else 0,
        "shares_outstanding": shares[-1],
        "qtrs": qtrs,
        "q_sales" : q_sales,
        "q_op" : q_op,
        "q_np":q_np,
        "q_sales_growth": q_sales_growth,
        "q_net_profit_growth": q_net_profit_growth,
        "q_ebitda_margin": q_ebitda_margin        
    }
    
    return calculated_metrics,


def calculate_cagr(values):
    try:
        if len(values) >= 4 and values[-4] > 0:
            return round(((values[-1] / values[-4]) ** (1/3) - 1) * 100, 2)
        else:
            return 0.0
    except:
        return 0.0


def make_json_safe(data):
    import numpy as np
    import pandas as pd
    import math
    import json

    def safe_convert(obj):
        if isinstance(obj, (np.int64, np.int32)):
            return int(obj)
        if isinstance(obj, (np.float64, np.float32, float)):
            if math.isnan(obj) or math.isinf(obj):
                return 0
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (set, tuple)):
            return list(obj)
        if isinstance(obj, (pd.Timestamp, pd.Timedelta)):
            return str(obj)
        return str(obj)

    try:
        return json.loads(json.dumps(data, default=safe_convert))
    except Exception as e:
        print("⚠️ JSON serialization error:", e)
        raise