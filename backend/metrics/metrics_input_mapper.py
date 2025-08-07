
def safe_divide(numerator, denominator):
    try:
        return float(numerator) / float(denominator) if denominator not in (0, None) else 0.0
    except:
        return 0.0

def safe_last(lst):
    return lst[-1] if lst and len(lst) else 0

def extract_inputs(pnl, bs, cf, years, source="excel", yahoo_info=None):
    def get_values(table, label):
        return table.get(label, [0] * len(years))[:len(years)]

    ttm_pe = yahoo_info.get("trailingPE") if yahoo_info else None
    peg_ratio = yahoo_info.get("pegRatio") if yahoo_info else None
    div_yield = round((yahoo_info.get("dividendYield") or 0) * 100, 2) if yahoo_info else None
    book_value = yahoo_info.get("bookValue") if yahoo_info else None
    high_52w = yahoo_info.get("fiftyTwoWeekHigh") if yahoo_info else None
    low_52w = yahoo_info.get("fiftyTwoWeekLow") if yahoo_info else None
    market_cap = yahoo_info.get("marketCap") if yahoo_info else None
    ttm_pb = yahoo_info.get("priceToBook") if yahoo_info else None
    roe_yahoo = round((yahoo_info.get("returnOnEquity") or 0) * 100, 2) if yahoo_info else None

    revenue = get_values(pnl, "Sales")
    latest_revenue = revenue[-1] if revenue else 0

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
    reserves = get_values(bs, "Reserves")
    equity_capital = get_values(bs, "Equity Share Capital")
    debt = get_values(bs, "Borrowings")
    cash = get_values(bs, "Cash & Bank")
    investments = get_values(bs, "Investments")
    capex = get_values(bs, "Capital Work in Progress")
    net_block = get_values(bs, "Net Block")[:len(revenue)]
    tax_values = get_values(pnl, "Tax")
    shares = get_values(bs, "No. of Equity Shares")
    if shares and shares[-1] == 0 and len(shares) > 1:
        shares[-1] = shares[-2]

    return {
        "years": years,
        "source": source,
        "yahoo_info": yahoo_info,
        "get_values": get_values,
        "safe_divide": safe_divide,
        "safe_last": safe_last,
        "revenue": revenue,
        "latest_revenue": latest_revenue,
        "raw_material_cost": raw_material_cost,
        "change_in_inventory": change_in_inventory,
        "power_fule": power_fule,
        "other_mfr_exp": other_mfr_exp,
        "emp_cost": emp_cost,
        "selling_admin": selling_admin,
        "other_exp": other_exp,
        "other_income": other_income,
        "net_profit": net_profit,
        "interest": interest,
        "depreciation": depreciation,
        "reserves": reserves,
        "equity_capital": equity_capital,
        "debt": debt,
        "cash": cash,
        "investments": investments,
        "capex": capex,
        "net_block": net_block,
        "tax_values": tax_values,
        "shares": shares,
        "ttm_pe": ttm_pe,
        "peg_ratio": peg_ratio,
        "div_yield": div_yield,
        "book_value": book_value,
        "high_52w": high_52w,
        "low_52w": low_52w,
        "market_cap": market_cap,
        "ttm_pb": ttm_pb,
        "roe_yahoo": roe_yahoo
    }
