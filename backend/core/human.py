# core/human.py
import os
import httpx

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET", "")
APP_ENV = os.getenv("APP_ENV", "dev")

async def verify_turnstile(token: str | None, remote_ip: str | None = None) -> bool:
    
    # In dev, if no secret is set, allow (so you can keep moving)
    if APP_ENV == "dev" and not TURNSTILE_SECRET:
        
        return True
    
    if not token:
        
        return False

    url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    data = {"secret": TURNSTILE_SECRET, "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.post(url, data=data)
            result = r.json()
            success = r.status_code == 200 and result.get("success") is True
            return success
    except Exception as e:
        return False