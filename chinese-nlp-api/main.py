from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nlp import router as nlp_router

app = FastAPI(
    title="Chinese NLP API",
    description="API for Chinese text processing including word segmentation and keyword extraction",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生產環境中應該設置具體的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(nlp_router, prefix="/api/v1", tags=["nlp"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Chinese NLP API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 