from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from scraper import AppSearchManager
import asyncio

app = FastAPI(
    title="App Search API",
    description="搜尋 App Store 和 Google Play Store 的應用程式資訊",
    version="1.0.0"
)

# 設定 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "歡迎使用 App Search API"}

@app.get("/search/{search_term}")
async def search_app(search_term: str):
    try:
        manager = AppSearchManager()
        results = await manager.search_all_platforms([search_term])
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search-multiple")
async def search_multiple_apps(search_terms: List[str] = Query(...)):
    try:
        manager = AppSearchManager()
        results = await manager.search_all_platforms(search_terms)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 