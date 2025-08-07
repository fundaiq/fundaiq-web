
# eps_calculator.py
def project_eps(
    base_revenue: float,
    projection_years: int,
    revenue_growth: float,
    ebit_margin: float,
    interest_exp_pct: float,
    tax_rate: float,
    shares_outstanding: float,
    current_price: float,
    base_year: str  # may arrive as str or int
):
    # ✅ Normalize base_year
    import re

    if isinstance(base_year, str):
        match = re.search(r"(20\\d{2})", base_year)
        base_year_int = int(match.group(1)) if match else 2024
    else:
        base_year_int = int(base_year)

    results = []
    revenue = base_revenue
    eps_list = []
    revenue_list = []
    net_profit_list = []

    # ✅ Time 0 Row
    print("✅ base_revenue :", base_revenue)
    print("✅ ebit_margin :", ebit_margin)
    print("✅ interest_exp_pct :", interest_exp_pct)
    print("✅ tax_rate :", tax_rate)
    

    ebit_0 = base_revenue * ebit_margin / 100
    interest_0 = ebit_0*interest_exp_pct/100 
    ebt_0 = ebit_0 - interest_0 
    tax_0 = ebt_0 * tax_rate / 100
    net_profit_0 = ebt_0 - tax_0
    eps_0 = net_profit_0 / shares_outstanding if shares_outstanding else 0
    print("✅ ebit_0 :", ebit_0)
    print("✅ ebt_0 :", ebt_0)
    print("✅ tax_0 :", tax_0)
    print("✅ net_profit_0 :", net_profit_0)
    print("✅ eps_0 :", eps_0)
    pe_0 = current_price / eps_0 if eps_0 else None
    print("✅ pe_0 :", pe_0)
    results.append({
        "year": f"FY{base_year_int + 1}"  ,
        "revenue": round(base_revenue, 2),
        "ebit": round(ebit_0, 2),
        "interest": round(interest_0, 2),
        "tax": round(tax_0, 2),
        "net_profit": round(net_profit_0, 2),
        "eps": round(eps_0, 2),
        "pe": round(pe_0, 2) if pe_0 else None
    })

    # ✅ Projection Rows
    for i in range(1, projection_years + 1):
        revenue *= (1 + revenue_growth / 100)
        ebit = revenue * (ebit_margin / 100)
        interest_exp = ebit * (interest_exp_pct/100)
        ebt = ebit - interest_exp
        tax = ebt * (tax_rate / 100)
        net_profit = ebt - tax
        eps = net_profit / shares_outstanding if shares_outstanding else 0
        pe = current_price / eps if eps > 0 else None
        if i == 3 :
            eps_fair_value = round(max(eps,0) * 20,2)
        else:
            eps_fair_value = 0
        
        year_label = f"FY{base_year_int + i + 1}"
        results.append({
            "year": year_label,
            "revenue": round(revenue, 2),
            "ebit": round(ebit, 2),
            "interest": round(interest_exp, 2),
            "tax": round(tax, 2),
            "net_profit": round(net_profit, 2),
            "eps": round(eps, 2),
            "pe": round(pe, 2) if pe else None
        })

        eps_list.append(eps)
        revenue_list.append(revenue)
        net_profit_list.append(net_profit)

    start_eps = eps_list[0]
    end_eps = eps_list[-1]
    eps_cagr = ((end_eps / start_eps) ** (1 / (projection_years - 1)) - 1) * 100 if start_eps > 0 else 0

    # ✅ Sensitivity Table A: EPS
    growth_scenarios = [round(revenue_growth + i * 4,1) for i in range(-2, 3)]
    margin_scenarios = [round(ebit_margin+ i * 4,1) for i in range(-2, 3)]

    eps_sensitivity = []

    for margin in margin_scenarios:
        row = []
        for growth in growth_scenarios:
            rev = base_revenue
            for _ in range(projection_years):
                rev *= (1 + growth / 100)
            ebit = rev * (margin / 100)
            interest_exp = ebit * (interest_exp_pct/100)
            ebt = ebit - interest_exp
            tax = ebt * (tax_rate / 100)
            net_profit = ebt - tax
            eps = net_profit / shares_outstanding if shares_outstanding else 0
            row.append(round(eps, 2))
        eps_sensitivity.append(row)

    # ✅ Sensitivity Table B: Price = EPS × PE
    eps_values = [round(eps_0 + i * 5 ,1) for i in range(-3, 4)]
    pe_bands = [round(pe_0 + i * 5 ,1) for i in range(-2, 3)]
    price_sensitivity = []

    for eps in eps_values:
        row = []
        for pe in pe_bands:
            price = max(eps * pe,0)
            row.append(round(price, 2))
        price_sensitivity.append(row)

    return {
        "eps_fair_value" : eps_fair_value,
        "projection_table": results,
        "eps_cagr": round(eps_cagr, 2),
        "eps_chart": {
            "years": [f"FY{str(base_year_int + i + 1)[-2:]}" for i in range(projection_years)],
            "eps": [round(e, 2) for e in eps_list],
            "revenue": [round(r, 2) for r in revenue_list],
            "net_profit": [round(n, 2) for n in net_profit_list]
        },
        "sensitivity_eps": {
            "growth_options": growth_scenarios,
            "margin_options": margin_scenarios,
            "matrix": eps_sensitivity
        },
        "sensitivity_price": {
            "eps_options": eps_values,
            "pe_options": pe_bands,
            "matrix": price_sensitivity
        }
    }
