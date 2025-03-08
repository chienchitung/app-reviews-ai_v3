import random
import requests
import re
import time
from tqdm import tqdm

def get_token(country: str, app_name: str, app_id: str, user_agents: list):
    """
    獲取 Apple Store API 的 token
    """
    response = requests.get(
        f'https://apps.apple.com/{country}/app/{app_name}/id{app_id}',
        headers={'User-Agent': random.choice(user_agents)}
    )

    if response.status_code != 200:
        print(f"GET request failed. Response: {response.status_code} {response.reason}")
        return None

    tags = response.text.splitlines()
    token = None
    for tag in tags:
        if re.match(r"<meta.+web-experience-app/config/environment", tag):
            token = re.search(r"token%22%3A%22(.+?)%22", tag).group(1)
            break

    if not token:
        print("無法找到 token")
        return None

    return token

def fetch_reviews(country: str, app_name: str, app_id: str, user_agents: list, token: str, offset: str = '1'):
    """
    獲取 App Store 評論
    """
    landing_url = f'https://apps.apple.com/{country}/app/{app_name}/id{app_id}'
    request_url = f'https://amp-api.apps.apple.com/v1/catalog/{country}/apps/{app_id}/reviews'

    headers = {
        'Accept': 'application/json',
        'Authorization': f'bearer {token}',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://apps.apple.com',
        'Referer': landing_url,
        'User-Agent': random.choice(user_agents)
    }

    params = (
        ('l', 'zh-TW'),  # 設定為繁體中文
        ('offset', str(offset)),
        ('limit', '20'),
        ('platform', 'web'),
        ('additionalPlatforms', 'appletv,ipad,iphone,mac')
    )

    retry_count = 0
    MAX_RETRIES = 5
    BASE_DELAY_SECS = 10
    result = {'data': [], 'next': None}
    reviews = []

    while retry_count < MAX_RETRIES:
        response = requests.get(request_url, headers=headers, params=params)

        if response.status_code == 200:
            result = response.json()
            reviews = result['data']
            if len(reviews) < 20:
                print(f"獲取到 {len(reviews)} 則評論，少於預期的 20 則")
            break

        elif response.status_code != 200:
            print(f"請求失敗. 回應: {response.status_code} {response.reason}")

            if response.status_code == 429:  # 達到請求限制
                retry_count += 1
                backoff_time = BASE_DELAY_SECS * retry_count
                print(f"達到請求限制! 重試 ({retry_count}/{MAX_RETRIES}) 等待 {backoff_time} 秒...")
                
                with tqdm(total=backoff_time, unit="sec", ncols=50) as pbar:
                    for _ in range(backoff_time):
                        time.sleep(1)
                        pbar.update(1)
                continue

            elif response.status_code == 404:
                print(f"{response.status_code} {response.reason}. 沒有更多評論了")
                break

    # 獲取下一頁的 offset
    offset = None
    if 'next' in result and result['next'] is not None:
        offset = re.search(r"^.+offset=([0-9]+).*$", result['next']).group(1)
        print(f"下一頁 offset: {offset}")

    # 為每則評論添加額外資訊
    for rev in reviews:
        rev['offset'] = offset
        rev['n_batch'] = len(reviews)
        rev['app_id'] = app_id

    # 預設延遲以降低請求頻率
    time.sleep(0.5)
    return reviews, offset, response.status_code