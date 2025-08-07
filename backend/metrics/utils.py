import numpy as np


def safe_divide(a, b):
    try:
        return a / b if b else 0
    except:
        return 0

def safe_last(arr):
    if isinstance(arr, list) and arr:
        return arr[-1]
    return None

def calculate_cagr(start_value, end_value, periods):
    try:
        if start_value is None or end_value is None or start_value <= 0 or periods <= 0:
            return 0
        return ((end_value / start_value) ** (1 / periods) - 1) * 100
    except:
        return 0

def make_json_safe(data):
    import numpy as np

    if isinstance(data, dict):
        return {k: make_json_safe(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [make_json_safe(i) for i in data]
    elif isinstance(data, (np.integer, int)):
        return int(data)
    elif isinstance(data, (np.floating, float)):
        if np.isnan(data) or np.isinf(data):
            return None  # ✅ Safely replace NaN and inf
        return float(data)
    return data
