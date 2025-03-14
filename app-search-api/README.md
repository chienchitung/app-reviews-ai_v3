# App Store Search API

這是一個使用 FastAPI 建立的 API 服務，可以同時搜尋 Apple App Store 和 Google Play Store 上的應用程式資訊。

## 目錄
1. [功能特點](#功能特點)
2. [開始使用](#開始使用)
   - [系統需求](#系統需求)
   - [本地安裝](#本地安裝)
   - [Docker 安裝](#docker-安裝)
3. [API 文檔](#api-文檔)
   - [Swagger UI](#swagger-ui)
   - [ReDoc](#redoc)
4. [API 使用指南](#api-使用指南)
   - [端點說明](#端點說明)
   - [使用範例](#使用範例)
5. [部署指南](#部署指南)
6. [故障排除](#故障排除)

## 功能特點

- 支援同時搜尋 Apple App Store 和 Google Play Store
- 使用非同步處理提高搜尋效率
- RESTful API 設計
- 完整的 API 文檔（Swagger UI）
- 支援 CORS
- 錯誤處理機制

## 開始使用

### 系統需求

- Python 3.8+
- pip（Python 套件管理器）
- Docker 和 Docker Compose（如果使用 Docker）

### 本地安裝

1. 複製專案：
```bash
git clone <repository-url>
cd app-search-api
```

2. 安裝依賴套件：
```bash
pip install -r requirements.txt
```

3. 啟動服務器：
```bash
python -m uvicorn main:app --reload
```

### Docker 安裝

1. 建立並啟動容器：
```bash
docker-compose up --build
```

2. 在背景模式啟動：
```bash
docker-compose up -d
```

3. 停止服務：
```bash
docker-compose down
```

#### Docker 環境配置

- **環境變數**
  - `PYTHONDONTWRITEBYTECODE=1`：防止 Python 產生 .pyc 檔案
  - `PYTHONUNBUFFERED=1`：確保 Python 輸出直接傳送到終端機

- **資料卷掛載**
  - 本地 `.:/app`：將目前目錄映射到容器內的 /app 目錄

- **連接埠設定**
  - `8000`：主要 API 連接埠（映射到主機的 8000 連接埠）

#### Docker 常用指令

```bash
# 查看運行中的容器
docker ps

# 查看容器日誌
docker-compose logs -f search-api

# 進入容器
docker-compose exec search-api bash

# 重建容器
docker-compose up --build
```

## API 文檔

### Swagger UI
- 網址：http://localhost:8000/docs
- 特點：
  - 互動式 API 測試介面
  - 即時測試所有端點
  - 自動生成請求範例
  - 詳細的參數說明

### ReDoc
- 網址：http://localhost:8000/redoc
- 特點：
  - 優雅的文檔展示
  - 清晰的 API 結構
  - 適合開發者閱讀

## API 使用指南

### 端點說明

1. **根端點** (`GET /`)
   - 用途：檢查服務狀態
   - 回傳：歡迎訊息

2. **單一應用搜尋** (`GET /search/{search_term}`)
   - 用途：搜尋特定應用程式
   - 參數：search_term（路徑參數）

3. **多重應用搜尋** (`GET /search-multiple`)
   - 用途：同時搜尋多個應用程式
   - 參數：search_terms（查詢參數，可重複）

### 使用範例

#### Python 範例
```python
import requests

# 搜尋單一應用
response = requests.get("http://localhost:8000/search/ikea")
print(response.json())

# 搜尋多個應用
response = requests.get("http://localhost:8000/search-multiple", params={
    "search_terms": ["ikea", "nitori"]
})
print(response.json())
```

#### Curl 範例
```bash
# 基本搜尋
curl http://localhost:8000/search/netflix

# 中文關鍵字搜尋
curl http://localhost:8000/search/%E8%B3%BC%E7%89%A9

# 多重搜尋
curl "http://localhost:8000/search-multiple?search_terms=netflix&search_terms=youtube"

# 查看詳細回應
curl -v http://localhost:8000/search/netflix | json_pp

# 使用 API Key（Bearer Token 方式）
curl -H "Authorization: Bearer your_api_key_here" http://localhost:8000/search/netflix

# 使用 API Key（Query Parameter 方式）
curl "http://localhost:8000/search/netflix?api_key=your_api_key_here"

# 使用 API Key（Header 方式）
curl -H "X-API-Key: your_api_key_here" http://localhost:8000/search/netflix

# 同時使用 API Key 和其他參數
curl -H "Authorization: Bearer your_api_key_here" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     http://localhost:8000/search/netflix
```

#### 使用環境變數的範例
```bash
# 設定 API Key 環境變數
export API_KEY="your_api_key_here"

# 使用環境變數發送請求
curl -H "Authorization: Bearer $API_KEY" http://localhost:8000/search/netflix
```

## 部署指南

### Render 部署步驟

1. 在 Render 上建立新的 Web Service
2. 連接 GitHub 儲存庫
3. 設定部署參數：
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 故障排除

### 常見問題解決方案

1. 服務無法啟動
   ```bash
   docker-compose logs search-api
   ```

2. 需要重置環境
   ```bash
   docker-compose down
   docker-compose up --build
   ```

3. 效能問題檢查
   ```bash
   docker stats
   ```

### 回應狀態碼說明

- 200: 請求成功
- 422: 請求參數錯誤
- 500: 伺服器內部錯誤

### 回應格式範例

```json
{
  "results": [
    {
      "name": "應用名稱",
      "link": "應用商店連結",
      "platform": "商店平台",
      "search_term": "搜尋關鍵字",
      "found": true
    }
  ]
}
```