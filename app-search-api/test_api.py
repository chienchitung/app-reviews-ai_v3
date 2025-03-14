import asyncio
import aiohttp
import json
from urllib.parse import urlencode

async def test_api():
    async with aiohttp.ClientSession() as session:
        # 測試根端點
        print("測試根端點 (/)")
        async with session.get('http://localhost:8000/') as response:
            print(f"狀態碼: {response.status}")
            print(f"回應: {await response.text()}\n")

        # 測試單一搜尋
        print("測試單一搜尋 (/search/ikea)")
        async with session.get('http://localhost:8000/search/ikea') as response:
            print(f"狀態碼: {response.status}")
            result = await response.text()
            print(f"回應: {json.dumps(json.loads(result), indent=2, ensure_ascii=False)}\n")

        # 測試多重搜尋
        print("測試多重搜尋 (/search-multiple)")
        query_params = urlencode([('search_terms', 'ikea'), ('search_terms', 'nitori')], doseq=True)
        url = f'http://localhost:8000/search-multiple?{query_params}'
        async with session.get(url) as response:
            print(f"狀態碼: {response.status}")
            result = await response.text()
            print(f"回應: {json.dumps(json.loads(result), indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    asyncio.run(test_api()) 