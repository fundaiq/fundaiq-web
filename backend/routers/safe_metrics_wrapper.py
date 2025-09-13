# routers/safe_metrics_wrapper.py

import math
from metrics.metrics_calculator import calculate_metrics as original_calculate_metrics

def safe_numeric(value):
    """Convert any value to a safe numeric value"""
    if value is None:
        return 0
    try:
        if isinstance(value, str):
            cleaned = str(value).replace(',', '').replace('$', '').replace('₹', '').strip()
            if cleaned == '' or cleaned == '-':
                return 0
            return float(cleaned)
        
        numeric = float(value)
        if math.isnan(numeric) or math.isinf(numeric):
            return 0
        return numeric
    except (ValueError, TypeError):
        return 0

def clean_financial_data(data):
    """Recursively clean financial data structure"""
    if isinstance(data, dict):
        return {k: clean_financial_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [safe_numeric(item) for item in data]
    else:
        return safe_numeric(data)

def safe_calculate_metrics(pnl, bs, cf, years, source="excel", yahoo_info=None):
    """
    Wrapper around calculate_metrics that handles None values gracefully
    """
    try:
        # Clean all input data
        pnl_clean = clean_financial_data(pnl) if pnl else {}
        bs_clean = clean_financial_data(bs) if bs else {}
        cf_clean = clean_financial_data(cf) if cf else {}
        years_clean = years if years else []
        
        # Ensure all financial statement items have the right number of years
        for table in [pnl_clean, bs_clean, cf_clean]:
            for key, values in table.items():
                if not isinstance(values, list):
                    values = [values] if values is not None else []
                
                # Pad or trim to match years length
                while len(values) < len(years_clean):
                    values.append(0)
                table[key] = values[:len(years_clean)]
        
        # Call original function with cleaned data
        calculated_metrics, assumptions = original_calculate_metrics(
            pnl_clean, bs_clean, cf_clean, years_clean, source=source, yahoo_info=yahoo_info
        )
        
        # Clean the results as well
        calculated_metrics = clean_financial_data(calculated_metrics)
        assumptions = clean_financial_data(assumptions)
        
        return calculated_metrics, assumptions
        
    except Exception as e:
        print(f"Error in safe_calculate_metrics: {e}")
        
        # Return basic fallback structure
        revenue_values = pnl_clean.get("Sales", pnl_clean.get("Revenue", [0] * len(years_clean)))
        net_profit_values = pnl_clean.get("Net profit", pnl_clean.get("Net Income", [0] * len(years_clean)))
        
        fallback_metrics = {
            "years": years_clean,
            "revenue": revenue_values,
            "net_profit": net_profit_values,
            "current_price": 0,
            "latest_revenue": safe_numeric(revenue_values[-1] if revenue_values else 0),
            "shares_outstanding": 1000000,
            "error": str(e)
        }
        
        fallback_assumptions = {
            "company_name": "Unknown Company",
            "revenue_growth_rate": 10.0,
            "terminal_growth_rate": 3.0,
            "discount_rate": 12.0,
            "forecast_years": 5,
            "base_year": years_clean[-1] if years_clean else 2023
        }
        
        return clean_financial_data(fallback_metrics), clean_financial_data(fallback_assumptions)