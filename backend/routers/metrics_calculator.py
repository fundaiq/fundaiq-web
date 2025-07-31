def safe_divide(numerator, denominator):
    try:
        return float(numerator) / float(denominator) if denominator not in (0, None) else 0.0
    except:
        return 0.0

def safe_last(lst):
    return lst[-1] if lst and len(lst) else 0

def calculate_metrics(pnl, bs, cf, years, source="excel"):
    def get_values(table, label):
        return table.get(label, [0] * len(years))[:len(years)]

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
    
        
    cash_and_investments = [(c or 0) + (i or 0) for c, i in zip(cash, investments)]
    net_debt = [round(d-c,2) for d, c in zip(debt, cash_and_investments)]
    latest_net_debt =round(net_debt[-1],2) if net_debt else 0
    min_len = min(len(revenue), len(net_profit), len(depreciation))

    if source == "excel":
        ebitda = [r - rmc + cii - pf - ome - ec - sa - oe for r, rmc, cii, pf, ome, ec, sa, oe in zip(
        revenue, raw_material_cost, change_in_inventory, power_fule, other_mfr_exp, emp_cost, selling_admin, other_exp[:min_len])]
        ebit = [e - d for e, oi, d in zip(ebitda, other_income, depreciation)]
        equity = [e + r for e, r in zip(equity_capital, reserves)]
    else:
        ebitda = get_values(pnl, "EBITDA")
        ebit = get_values(pnl, "EBIT") 
        equity = equity_capital


    ebitda_margin = [safe_divide(e, r) * 100 for e, r in zip(ebitda, revenue[:min_len])]

    net_profit_margin = [safe_divide(n, r) * 100 for n, r in zip(net_profit[:min_len], revenue[:min_len])]

    roce = [safe_divide(e, (eq + d)) * 100 for e, eq, d in zip(ebit, equity[:min_len], debt[:min_len])]
    
    roe = [safe_divide(n, eq) * 100 for n, eq in zip(net_profit[:min_len], equity[:min_len])]
    interest_coverage = [safe_divide(e, i) for e, i in zip(ebit, interest[:min_len])]
    debt_to_equity = [safe_divide(d, eq) for d, eq in zip(debt[:min_len], equity[:min_len])]
    fcf = [safe_divide(n + d - c, 1) for n, d, c in zip(net_profit[:min_len], depreciation[:min_len], capex[:min_len])]
    fcf_margin = [safe_divide(f, r) * 100 for f, r in zip(fcf, revenue[:min_len])]

    def calculate_growth(series):
        return [
            round(((curr / prev) - 1) * 100, 2) if prev not in (0, None) else 0.0
            for prev, curr in zip(series[:-1], series[1:])
        ]

    revenue_growth = calculate_growth(revenue)
    ebitda_growth = calculate_growth(ebitda)
    net_profit_growth = calculate_growth(net_profit)

    
    tax_rate = safe_divide(safe_last(tax_values), safe_last(ebit)) * 100 if ebit else 0
    capex_pct = safe_divide(safe_last(capex), safe_last(revenue)) * 100 if capex and revenue else 2.0
    revenue_cagr_3y = calculate_cagr(revenue)
    interest_exp_pct = safe_last(interest)/safe_last(ebit)*100 if ebit else 0

    calculated_metrics = {
        "revenue": revenue,
        "net_profit": net_profit,
        "ebit": ebit,
        "ebitda": ebitda,
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
        "roce": roce,
        "roe": roe,
        "interest_coverage": interest_coverage,
        "debt_to_equity": debt_to_equity,
        "fcf": fcf,
        "fcf_margin": fcf_margin,
        "tax_rate": tax_rate,
        "wacc": 12.0,
        "terminal_growth_rate": 5.0,
        "years": years
    }

    assumptions = {
        "latest_revenue": latest_revenue,
        "latest_net_debt": latest_net_debt,
        "ebit_margin": round(safe_divide(safe_last(ebit), safe_last(revenue)) * 100, 2) if ebit and revenue else 0,
        "depreciation_pct": round(safe_divide(safe_last(depreciation), safe_last(revenue)) * 100, 2) if depreciation and revenue else 0,
        "tax_rate": round(tax_rate, 2),
        "capex_pct": round(capex_pct, 2),
        "wc_change_pct": 2.0,
        "interest_pct": 11.0,
        "revenue_growth": revenue_cagr_3y,
        "interest_exp": safe_last(interest),
        "interest_exp_pct": round(interest_exp_pct,2),
        "base_year": safe_last(years),
        "wacc": 11,
        "growth_x": 15,
        "growth_y": 10,
        "period_x": 5,
        "period_y": 15,
        "growth_terminal": 2
    }

    return calculated_metrics, assumptions


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
        print("❌ JSON serialization error:", e)
        raise
