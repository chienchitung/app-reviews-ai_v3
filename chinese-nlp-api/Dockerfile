# 使用官方 Python 運行時作為父鏡像
FROM python:3.9-slim

# 設置工作目錄
WORKDIR /app

# 複製所有文件
COPY . /app/

# 安裝依賴
RUN pip install --no-cache-dir -r requirements.txt

# 設置環境變量
ENV PORT=8000

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 