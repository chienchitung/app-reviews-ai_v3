import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    # Test 1: Segment endpoint
    print("\nTesting segment endpoint...")
    segment_response = requests.post(
        f"{base_url}/api/v1/segment",
        json={"text": "The product quality is excellent"}
    )
    print("Segment Response:", json.dumps(segment_response.json(), indent=2))

    # Test 2: Keywords endpoint
    print("\nTesting keywords endpoint...")
    keywords_response = requests.post(
        f"{base_url}/api/v1/keywords",
        json={"text": "The product quality is excellent"}
    )
    print("Keywords Response:", json.dumps(keywords_response.json(), indent=2))

    # Test 3: Batch keywords endpoint
    print("\nTesting batch-keywords endpoint...")
    batch_response = requests.post(
        f"{base_url}/api/v1/batch-keywords",
        json={
            "texts": [
                "The product quality is excellent",
                "Customer service needs improvement"
            ]
        }
    )
    print("Batch Keywords Response:", json.dumps(batch_response.json(), indent=2))

if __name__ == "__main__":
    try:
        test_api()
        print("\nAll tests completed successfully!")
    except Exception as e:
        print(f"\nError during testing: {e}") 