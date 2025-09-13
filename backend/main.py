# backend/main.py
from __future__ import annotations

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import (
    dcf,
    sensitivity,
    upload,
    eps,
    yahoo_fetcher,
    
)

app = FastAPI(title="FundaIQ API")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fundaiq")

# ----- CORS -----
# Keep a tight allowlist for known front-end origins, plus a LAN regex for dev.
KNOWN_ORIGINS = {
    settings.FRONTEND_ORIGIN,
    settings.FRONTEND_BASE_URL,
    "https://fundaiq.com",
    "https://www.fundaiq.com",
    "https://fundaiq-web.vercel.app",
    "http://localhost:3000",
}
# Remove any Nones
ALLOWED_ORIGINS = [o for o in KNOWN_ORIGINS if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"http://192\.168\.\d{1,3}\.\d{1,3}:\d{2,5}",
    allow_credentials=False,  # Changed to False since no authentication needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Health / Root -----
@app.get("/")
def read_root():
    return {"message": "Backend is working!"}

@app.get("/api/health")
def health():
    return {"ok": True}

# ----- Routers -----
app.include_router(upload.router, prefix="/api")
app.include_router(dcf.router, prefix="/api")
app.include_router(sensitivity.router, prefix="/api")
app.include_router(eps.router, prefix="/api")
app.include_router(yahoo_fetcher.router, prefix="/api")
