# 使用 Python 3.11 作為基礎映像
FROM python:3.11-slim

# 安裝必要的系統套件
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    xvfb \
    curl \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 安裝 Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /app

# 複製並安裝 Python 依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# 設定環境變數
ENV PYTHONUNBUFFERED=1
ENV DISPLAY=:99
ENV CHROME_BIN=/usr/bin/google-chrome
ENV SELENIUM_DRIVER_CHROME_OPTIONS="--no-sandbox --disable-dev-shm-usage --disable-gpu --headless --remote-debugging-port=9222 --disable-software-rasterizer --user-agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'"

# 建立啟動虛擬顯示器的腳本
RUN echo '#!/bin/bash\n\
    if [ ! -e /tmp/.X99-lock ]; then\n\
        Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset & \n\
        while [ ! -e /tmp/.X99-lock ]; do\n\
            sleep 0.1\n\
        done\n\
    fi' > /usr/local/bin/start-xvfb.sh \
    && chmod +x /usr/local/bin/start-xvfb.sh

# 開放連接埠
EXPOSE 8000

# 設定健康檢查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 啟動應用程式，啟動時啟用虛擬顯示器
CMD ["/bin/bash", "-c", "/usr/local/bin/start-xvfb.sh && uvicorn main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 75"]