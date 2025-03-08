#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import sys
import json
import os

def parse_store_urls(apple_url: str = None, google_url: str = None):
    """解析商店 URL 並提取必要資訊"""
    result = {
        'ios_info': None,
        'android_id': None,
        'error': None
    }
    
    try:
        if apple_url:
            # 解析 Apple Store URL
            pattern = r'apps\.apple\.com/(\w+)/app/([^/]+)/id(\d+)'
            match = re.search(pattern, apple_url)
            if match:
                country_code = match.group(1)    # 'tw'
                app_name_raw = match.group(2)    # 'ikea台灣'
                app_id = match.group(3)          # '1631350301'
                
                # 從 Google Play URL 提取英文名稱
                app_name = 'ikea'  # 預設值
                if google_url and 'id=' in google_url:
                    android_package = google_url.split('id=')[1].split('&')[0]
                    package_parts = android_package.split('.')
                    for part in package_parts:
                        if part not in ['tw', 'com', 'android', 'app', 'mobile']:
                            app_name = part
                            break
                
                result['ios_info'] = {
                    app_name: (country_code, app_name, app_id)
                }
        
        if google_url:
            # 解析 Google Play URL
            if 'id=' in google_url:
                result['android_id'] = google_url.split('id=')[1].split('&')[0]
            
    except Exception as e:
        result['error'] = str(e)
    
    return result

if __name__ == '__main__':
    try:
        # 設定環境變數以處理中文編碼
        os.environ['PYTHONIOENCODING'] = 'utf-8'
        
        # 從命令列參數獲取 URL
        apple_url = sys.argv[1] if len(sys.argv) > 1 else None
        google_url = sys.argv[2] if len(sys.argv) > 2 else None
        
        # 解析 URL
        result = parse_store_urls(apple_url, google_url)
        
        # 將結果轉換為 JSON 並輸出到檔案
        output_path = os.path.join(os.path.dirname(__file__), 'parse_result.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        # 讀取並輸出結果
        with open(output_path, 'r', encoding='utf-8') as f:
            print(f.read())
            
    except Exception as e:
        error_result = {'error': str(e)}
        print(json.dumps(error_result, ensure_ascii=False)) 