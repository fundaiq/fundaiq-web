import numpy as np

def make_json_safe(data):
    if isinstance(data, dict):
        return {k: make_json_safe(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [make_json_safe(i) for i in data]
    elif isinstance(data, (np.integer, int)):
        return int(data)
    elif isinstance(data, (np.floating, float)):
        if np.isnan(data) or np.isinf(data):
            return None  # ✅ replace NaN, inf, -inf
        return float(data)
    return data
