# Chinese NLP API

## 目錄 📑
- [簡介](#簡介-)
- [功能特點](#功能特點-)
- [快速開始](#快速開始-)
- [API 文檔](#api-文檔-)
- [使用範例](#使用範例-)
- [開發指南](#開發指南-)
- [故障排除](#故障排除-)
- [生產環境部署](#生產環境部署-)
- [安全性考慮](#安全性考慮-)

## 簡介 🌟
中文自然語言處理 API 服務，基於 FastAPI 框架開發，提供高效的中文文本分析功能。本服務支援 RESTful API 設計，並提供完整的 Docker 容器化支援。

## 功能特點 🚀
- ✨ 中文分詞（基於 jieba）
  - 智能分詞
  - 自動過濾停用詞
  - 支援自定義詞典
- 🔍 關鍵詞提取
  - 基於 TF-IDF 算法
  - 可自定義返回關鍵詞數量
  - 包含關鍵詞權重分數
- 📦 批量處理能力
  - 支援多文本並行處理
  - 自動錯誤處理
- 🌐 API 特性
  - RESTful API 設計
  - JSON 格式數據交換
  - CORS 支援
  - 完整的 API 文檔
- 🛡️ 文本處理
  - 自動清理特殊字符
  - URL 移除
  - 多餘空格處理

## 快速開始 ⚡

### 使用 Docker（推薦）
```bash
# 使用 docker-compose 啟動服務
docker-compose up -d

# 查看服務狀態
docker-compose ps
```

### 手動安裝
1. **環境要求**
   - Python 3.9+
   - pip 套件管理器

2. **安裝步驟**
```bash
# 克隆專案
git clone [your-repository-url]
cd chinese-nlp-api

# 安裝依賴
pip install -r requirements.txt

# 啟動服務
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API 文檔 📚

服務啟動後，可通過以下地址查看完整 API 文檔：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### API 端點

#### 1. 健康檢查
- **GET** `/`
  - 返回 API 服務狀態和文檔鏈接

#### 2. 文本分詞
- **POST** `/api/v1/segment`
  - 將中文文本分割成有意義的詞語單位

#### 3. 關鍵詞提取
- **POST** `/api/v1/keywords`
  - 從單一文本中提取關鍵詞

#### 4. 批量關鍵詞提取
- **POST** `/api/v1/batch-keywords`
  - 同時處理多個文本並提取關鍵詞

## 使用範例 💡

### 文本分詞
```bash
curl -X POST "http://localhost:8000/api/v1/segment" \
     -H "Content-Type: application/json" \
     -d '{"text": "今天天氣真好，我想去公園散步"}'
```

### 關鍵詞提取
```bash
curl -X POST "http://localhost:8000/api/v1/keywords" \
     -H "Content-Type: application/json" \
     -d '{
           "text": "台北是一個美麗的城市，這裡有許多美食和景點",
           "top_n": 5
         }'
```

### 批量關鍵詞提取
```bash
curl -X POST "http://localhost:8000/api/v1/batch-keywords" \
     -H "Content-Type: application/json" \
     -d '{
           "texts": [
             "台北是一個美麗的城市，這裡有許多美食",
             "今天天氣很好，我去公園散步"
           ],
           "top_n": 3
         }'
```

## 開發指南 💻

### 本地開發
```bash
# 啟動開發模式（自動重載）
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 測試
```bash
# 運行單元測試
python -m pytest tests/

# 運行覆蓋率測試
pytest --cov=app tests/
```

### 代碼風格
```bash
# 運行 flake8 檢查
flake8 .

# 運行 black 格式化
black .
```

## 故障排除 🔧

### 常見問題

1. **ModuleNotFoundError**
```bash
# 解決方案
pip install -r requirements.txt
```

2. **端口被占用**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

3. **Docker 相關問題**
```bash
# 檢查容器日誌
docker-compose logs

# 重建容器
docker-compose up -d --build
```

## 生產環境部署 🚀

### Docker 部署
```bash
# 構建映像
docker build -t chinese-nlp-api .

# 運行容器
docker run -d -p 8000:8000 chinese-nlp-api
```

## 安全性考慮 🔒

1. **API 安全**
   - 在生產環境中實施適當的認證機制
   - 限制請求頻率
   - 設置適當的 CORS 策略

2. **數據安全**
   - 輸入驗證和清理
   - 敏感數據處理
   - 日誌記錄最佳實踐

3. **系統安全**
   - 定期更新依賴包
   - 使用安全的 Docker 基礎鏡像
   - 實施監控和告警機制
