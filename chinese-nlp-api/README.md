# Chinese NLP API

這是一個基於 FastAPI 的中文自然語言處理 API 服務，提供中文分詞和關鍵詞提取功能。

## 功能特點

- 中文分詞（使用 jieba）
- 關鍵詞提取（使用 TF-IDF）
- 批量處理支持
- RESTful API 接口
- Docker 支持

## API 文檔

啟動服務後，可以訪問以下地址查看 API 文檔：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 環境要求

- Python 3.9+ (已在 Python 3.13.2 上測試通過)
- FastAPI
- jieba
- scikit-learn
- pandas
- uvicorn
- pydantic
- python-multipart

## 安裝步驟

### 1. Python 環境設置

1. 首先確保你已安裝 Python：
   - 訪問 [Python 官網](https://www.python.org/downloads/)
   - 下載並安裝最新版本的 Python
   - **重要：** 安裝時請勾選 "Add Python to PATH" 選項

2. 驗證 Python 安裝：
   ```bash
   python --version
   ```
   應該顯示類似 "Python 3.13.2" 的版本信息

### 2. 安裝依賴套件

在命令提示字元（CMD）中執行以下步驟：

1. 切換到專案目錄：
   ```bash
   cd "你的專案路徑\chinese-nlp-api"
   ```

2. 安裝所需套件：
   ```bash
   python -m pip install fastapi uvicorn jieba scikit-learn pandas pydantic python-multipart
   ```

### 3. 啟動服務

1. 在專案目錄中執行：
   ```bash
   python -m uvicorn main:app --reload
   ```

2. 如果成功，你會看到類似這樣的輸出：
   ```
   INFO:     Will watch for changes in these directories: ['...']
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process [...] using StatReload
   ```

## 使用指南

### 訪問 API 文檔

1. 在瀏覽器中打開：http://localhost:8000/docs
2. 你會看到 Swagger UI 介面，列出所有可用的 API 端點

### API 端點使用說明

#### 1. 文本分詞 `/api/v1/segment`
- 功能：將中文文本切分成單詞
- 使用方法：
  1. 在 Swagger UI 中找到 `/api/v1/segment` 端點
  2. 點擊 "Try it out"
  3. 輸入測試文本：
     ```json
     {
       "text": "今天天氣真好，我想去公園散步"
     }
     ```
  4. 點擊 "Execute"

#### 2. 關鍵詞提取 `/api/v1/keywords`
- 功能：從文本中提取重要的關鍵詞
- 使用方法：
  ```json
  {
    "text": "台北是一個美麗的城市，這裡有許多美食和景點",
    "top_n": 5
  }
  ```

#### 3. 批量關鍵詞提取 `/api/v1/batch-keywords`
- 功能：同時處理多個文本
- 使用方法：
  ```json
  {
    "texts": [
      "台北是一個美麗的城市，這裡有許多美食",
      "今天天氣很好，我去公園散步"
    ],
    "top_n": 3
  }
  ```

## 常見問題排解

### 1. ModuleNotFoundError: No module named 'sklearn'
解決方案：執行
```bash
python -m pip install scikit-learn
```

### 2. PowerShell 中的命令執行問題
如果在 PowerShell 中遇到命令執行問題，建議：
- 使用命令提示字元（CMD）替代
- 或在檔案總管中導航到專案目錄，在地址欄輸入 `cmd` 來開啟命令提示字元

### 3. 路徑包含空格的問題
如果專案路徑包含空格，請使用引號：
```bash
cd "C:\Your Path\With Spaces\chinese-nlp-api"
```

## 注意事項

1. 在生產環境中，請確保適當配置 CORS 和安全設置
2. 對於大規模文本處理，建議使用批量處理接口
3. 可以根據需要調整停用詞列表和 TF-IDF 參數

## Docker 部署（可選）

1. 構建鏡像：
```bash
docker build -t chinese-nlp-api .
```

2. 運行容器：
```bash
docker run -d -p 8000:8000 chinese-nlp-api
``` 