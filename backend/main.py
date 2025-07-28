from fastapi import FastAPI 
from routers import dcf, sensitivity
from fastapi.middleware.cors import CORSMiddleware
from routers import upload  # assuming inside routers/upload.py
from routers import eps
from routers import yahoo_fetcher


app = FastAPI() 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://www.fundaiq.com",   # ✅ Production
        "https://fundaiq.com",       # ✅ Without www
        "https://fundaiq-web.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

@app.get("/") 
def read_root(): 
    return {"message": "Backend is working!"} 

app.include_router(upload.router, prefix="/api")    
app.include_router(dcf.router, prefix="/api")
app.include_router(sensitivity.router, prefix="/api")
app.include_router(eps.router, prefix="/api")
app.include_router(yahoo_fetcher.router,  prefix="/api")
