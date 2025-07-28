def calculate_metrics(pnl, bs, cf, years):
    assumptions = {}
    metrics = {}

    try:
        # Safely get last value from a row, return 0 if missing or invalid
        def safe_last(row):
            try:
                return float(row[-1]) if row else 0
            except (ValueError, IndexError, TypeError):
                return 0

        # P&L values
        revenue = safe_last(pnl.get("Sales", []))
        net_profit = safe_last(pnl.get("Net profit", []))
        ebit = safe_last(pnl.get("Operating Profit", []))
        depreciation = safe_last(pnl.get("Depreciation", []))
        tax = safe_last(pnl.get("Tax", []))
        pbt = safe_last(pnl.get("Profit before tax", []))
        interest = safe_last(pnl.get("Interest", []))

        # Balance Sheet values
        equity_cap = safe_last(bs.get("Equity Share Capital", []))
        reserves = safe_last(bs.get("Reserves", []))
        borrowings = safe_last(bs.get("Borrowings", []))
        cash = safe_last(bs.get("Cash & Bank", []))
        investments = safe_last(bs.get("Investments", []))

        total_equity = equity_cap + reserves
        net_debt = borrowings - (cash + investments)

        # Assumptions
        assumptions["ebit_margin"] = round((ebit / revenue) * 100, 2) if revenue else 15
        assumptions["depreciation_pct"] = round((depreciation / revenue) * 100, 2) if revenue else 4
        assumptions["capex_pct"] = 5
        assumptions["wc_change_pct"] = 2
        assumptions["tax_rate"] = round((tax / pbt) * 100, 2) if pbt else 25
        assumptions["interest_exp"] = interest
        assumptions["interest_pct"] = round((interest / borrowings) * 100, 2) if borrowings else 0

        # Metrics
        metrics["roce"] = round((ebit / (total_equity + borrowings)) * 100, 2) \
            if (total_equity + borrowings) else None
        metrics["net_profit_margin"] = round((net_profit / revenue) * 100, 2) if revenue else None
        metrics["debt_to_equity"] = round(borrowings / total_equity, 2) if total_equity else None
        metrics["interest_coverage"] = round(ebit / interest, 2) if interest else None

    except Exception as e:
        import traceback
        print("⚠️ Error in metrics calculation:", e)
        traceback.print_exc()

    return metrics, assumptions


def make_json_safe(data):
    import numpy as np
    import json

    def safe_convert(obj):
        if isinstance(obj, (np.int64, np.float64, np.float32)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return obj

    return json.loads(json.dumps(data, default=safe_convert))
