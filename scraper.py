#!/usr/bin/env python
# -*- coding: utf-8 -*-

# 匯入所需套件
import sys
import io
import pandas as pd
import numpy as np
from google_play_scraper import reviews_all
import re
import emoji
import os
from datetime import datetime
import pytz
import time
from apple_app_reviews_scraper import get_token, fetch_reviews
from tqdm import tqdm
from urllib.parse import urlparse, parse_qs
from langdetect import detect, LangDetectException
import json
import csv

# 設定標準輸出編碼為 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 定義 User-Agents
user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
]

def detect_language(text):
    """檢測文本語言"""
    if not text or not isinstance(text, str):
        return 'unknown'
    
    text = emoji.replace_emoji(text, replace='')
    
    # 檢查是否包含中文字符
    if re.search(r'[\u4e00-\u9fff]', text):
        return 'zh'
    
    try:
        # 使用 langdetect 檢測語言
        lang = detect(text)
        return 'en' if lang == 'en' else 'unknown'
    except LangDetectException:
        return 'unknown'

def fetch_ios_reviews(app_infos):
    """爬取 iOS 評論"""
    ios_reviews = {app: [] for app in app_infos}
    
    for app in tqdm(app_infos, desc="爬取 iOS 評論"):
        country, app_name, app_id = app_infos[app]
        all_reviews = []
        offset = '1'
        MAX_REVIEWS = 100000
        
        # 獲取 token
        token = get_token(country, app_name, app_id, user_agents)
        if not token:
            print(f"無法獲取 {app} 的 token，跳過此應用")
            continue

        while (offset is not None) and (int(offset) <= MAX_REVIEWS):
            reviews, offset, response_code = fetch_reviews(
                country=country,
                app_name=app_name,
                user_agents=user_agents,
                app_id=app_id,
                token=token,
                offset=offset
            )
            all_reviews.extend(reviews)

        ios_reviews[app].extend(all_reviews)

    return ios_reviews

def fetch_android_reviews(android_id):
    """爬取 Android 評論"""
    reviews_zh = reviews_all(android_id, sleep_milliseconds=0, lang='zh_TW', country='tw')
    reviews_en = reviews_all(android_id, sleep_milliseconds=0, lang='en', country='tw')

    # 使用 tqdm 來顯示 Android 評論的進度
    all_reviews = []
    for review in tqdm(reviews_zh + reviews_en, desc="Fetching Android reviews"):
        all_reviews.append(review)

    return all_reviews

def prepare_ios_df(ios_reviews):
    """處理 iOS 評論資料"""
    ios_df = pd.DataFrame()
    for key, reviews in ios_reviews.items():
        app_df = pd.json_normalize(reviews)
        app_df['app'] = key
        ios_df = pd.concat([ios_df, app_df], axis=0).reset_index(drop=True)

    # 清理欄位名稱
    ios_df.columns = [re.sub(r'^attributes\.', '', x) for x in ios_df.columns]
    ios_df.columns = [re.sub(r'\.', '_', x).lower() for x in ios_df.columns]
    ios_df.rename(columns={'developerresponse_body': 'developerResponse'}, inplace=True)

    # 如果 'developerResponse' 欄位不存在，則新增並填入空值
    if 'developerResponse' not in ios_df.columns:
        ios_df['developerResponse'] = ""

    # 格式化日期
    ios_df['date'] = pd.to_datetime(ios_df['date']).dt.strftime('%Y-%m-%d')
    ios_df['key'] = ios_df['date'] + '_' + ios_df['username']
    ios_df = ios_df.sort_values(by='date', ascending=False).reset_index(drop=True)
    ios_df['platform'] = 'iOS'
    ios_df['language'] = ios_df['review'].apply(detect_language)

    # 選擇並返回需要的欄位
    return ios_df[['key', 'date', 'username', 'review', 'rating', 'platform', 'developerResponse', 'language']]

def prepare_android_df(all_reviews):
    """處理 Android 評論資料"""
    if not all_reviews:
        return pd.DataFrame(columns=['key', 'date', 'username', 'review', 'rating', 'platform', 'developerResponse', 'language'])
    
    android_df = pd.DataFrame(all_reviews)
    
    # 重命名欄位
    android_df.rename(columns={
        'at': 'date',
        'userName': 'username',
        'content': 'review',
        'score': 'rating',
        'replyContent': 'developerResponse'
    }, inplace=True)

    android_df['date'] = pd.to_datetime(android_df['date']).dt.strftime('%Y-%m-%d')
    android_df['key'] = android_df['date'] + '_' + android_df['username']
    android_df['platform'] = 'Android'
    
    # 修正語言檢測的 lambda 表達式，加上缺少的括號和 else 部分
    android_df['language'] = android_df['review'].apply(
        lambda x: 'zh' if x and any('\u4e00' <= char <= '\u9fff' for char in str(x)) else 'en'
    )

    return android_df[['key', 'date', 'username', 'review', 'rating', 'platform', 'developerResponse', 'language']]

def combine_reviews(ios_df, android_df):
    """合併 iOS 和 Android 評論"""
    combined_df = pd.concat([ios_df, android_df], ignore_index=True)
    
    # 將 date 轉換為字串格式
    combined_df['date'] = pd.to_datetime(combined_df['date']).dt.strftime('%Y-%m-%d')
    
    combined_df = combined_df.sort_values(by='date', ascending=False).reset_index(drop=True)
    
    # 確保所有數據都是 JSON 可序列化的
    result_data = []
    for _, row in combined_df.iterrows():
        result_data.append({
            'date': row['date'],
            'username': str(row['username']),
            'review': str(row['review']),
            'rating': float(row['rating']),
            'platform': str(row['platform']),
            'developerResponse': str(row['developerResponse']) if pd.notna(row['developerResponse']) else '',
            'language': str(row['language'])
        })
    
    return result_data

# 日誌信息輸出到 stderr
def log_info(message):
    sys.stderr.write(f"INFO: {message}\n")
    sys.stderr.flush()

# 進度信息輸出到 stderr
def log_progress(message):
    sys.stderr.write(f"PROGRESS: {message}\n")
    sys.stderr.flush()

# 最終結果輸出到 stdout
def output_results(data):
    result = {
        "success": True,
        "data": data
    }
    print(json.dumps(result, ensure_ascii=False))
    sys.stdout.flush()

if __name__ == '__main__':
    try:
        print("開始執行程式...", file=sys.stderr)
        # 檢查必要的參數
        if len(sys.argv) < 3:
            print(json.dumps({
                "error": "缺少必要的 URL 參數",
                "details": "需要提供 Apple Store 和 Google Play 的 URL"
            }), file=sys.stderr)
            sys.exit(1)

        apple_url = sys.argv[1]
        google_url = sys.argv[2]
        
        # URL 驗證
        if not apple_url and not google_url:
            print(json.dumps({
                "error": "無效的 URL",
                "details": "至少需要提供一個有效的 URL"
            }), file=sys.stderr)
            sys.exit(1)

        print("開始解析 URL...")
        
        # 解析 URL
        ios_info = {}
        android_id = None
        
        if apple_url:
            try:
                pattern = r'apps\.apple\.com/(\w+)/app/([^/]+)/id(\d+)'
                match = re.search(pattern, apple_url)
                if match:
                    country_code = match.group(1)    # 'tw'
                    app_name = 'ikea'                # 使用固定名稱
                    app_id = match.group(3)          # '1631350301'
                    ios_info = {
                        app_name: (country_code, app_name, app_id)
                    }
            except Exception as e:
                print(f"解析 Apple Store URL 時發生錯誤: {str(e)}")
        
        if google_url:
            try:
                if 'id=' in google_url:
                    android_id = google_url.split('id=')[1].split('&')[0]
            except Exception as e:
                print(f"解析 Google Play URL 時發生錯誤: {str(e)}")

        # 爬取評論
        ios_df = pd.DataFrame()
        android_df = pd.DataFrame()

        if ios_info:
            print("準備處理 iOS 評論...", file=sys.stderr)
            ios_reviews = fetch_ios_reviews(ios_info)
            print("開始執行 prepare_ios_df...", file=sys.stderr)
            ios_df = prepare_ios_df(ios_reviews)

        if android_id:
            android_reviews = fetch_android_reviews(android_id)
            android_df = prepare_android_df(android_reviews)

        # 合併評論並直接輸出 JSON
        combined_data = combine_reviews(ios_df, android_df)
        print(json.dumps({
            "success": True,
            "data": combined_data,
            "rows": len(combined_data)
        }))

    except Exception as e:
        print(json.dumps({
            "error": "執行錯誤",
            "details": str(e)
        }), file=sys.stderr)
        sys.exit(1)