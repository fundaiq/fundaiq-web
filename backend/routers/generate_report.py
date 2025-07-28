from routers.upload_parser import parse_excel
from routers.yahoo_fetcher import fetch_yahoo_profile  # calling route directly
from utils.metrics_calculator import calculate_metrics

def generate_report(source: str, payload) -> dict:
    if source == "excel":
        parsed = parse_excel(payload)
    elif source == "yahoo":
        # simulate calling the same logic as fetch_yahoo_profile route
        ticker = payload.get("ticker")
        parsed = fetch_yahoo_profile(ticker).body
    else:
        raise ValueError("Unsupported source type")

    return parsed  # already in unified format from both sides
