# English NLP API

This is a FastAPI-based API for processing English text using Natural Language Processing (NLP) techniques. The API provides functionality for text tokenization, lemmatization, part-of-speech tagging, and keyword extraction using TF-IDF.

## Features

- Text tokenization
- Stopword removal
- Lemmatization
- Part-of-speech tagging
- Keyword extraction using TF-IDF

## Installation and Running

### Option 1: Using Docker (Recommended)

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run the API using Docker Compose:
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

### Option 2: Local Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the API server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API documentation (Swagger UI): `http://localhost:8000/docs`
- Alternative API documentation (ReDoc): `http://localhost:8000/redoc`

## API Endpoints

### 1. POST /api/v1/segment

Segment a single text into tokens, with lemmatization and POS tagging.

Request body:
```json
{
    "text": "The product quality is excellent but shipping was slow"
}
```

Response:
```json
{
    "tokens": ["product", "quality", "excellent", "shipping", "slow"],
    "lemmas": ["product", "quality", "excellent", "shipping", "slow"],
    "pos_tags": [["product", "NN"], ["quality", "NN"], ["excellent", "JJ"], ["shipping", "NN"], ["slow", "JJ"]]
}
```

### 2. POST /api/v1/keywords

Extract keywords from a single text using TF-IDF.

Request body:
```json
{
    "text": "The product quality is excellent but shipping was slow"
}
```

Response:
```json
{
    "keywords": ["product quality", "excellent", "shipping", "slow"],
    "scores": [0.5, 0.3, 0.2, 0.1]
}
```

### 3. POST /api/v1/batch-keywords

Extract keywords from multiple texts using TF-IDF.

Request body:
```json
{
    "texts": [
        "The product quality is excellent but shipping was slow",
        "Customer service needs improvement",
        "Great value for money, highly recommended!"
    ]
}
```

Response:
```json
{
    "keywords": ["product quality", "customer service", "value money", "shipping", "excellent"],
    "tfidf_matrix": [
        [0.5, 0.0, 0.0, 0.3, 0.2],
        [0.0, 0.6, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.5, 0.0, 0.0]
    ]
}
```

## Query Parameters

All keyword extraction endpoints (`/keywords` and `/batch-keywords`) support the following query parameter:

- `max_features` (optional): Maximum number of keywords to extract (default: 10)

## Error Handling

The API includes proper error handling and will return appropriate HTTP status codes and error messages when issues occur.

## Testing with Docker

To test the API using Docker:

1. Build and start the container:
```bash
docker-compose up --build
```

2. Test the API endpoints using curl or any HTTP client:
```bash
# Test segmentation
curl -X POST "http://localhost:8000/api/v1/segment" \
     -H "Content-Type: application/json" \
     -d '{"text": "The product quality is excellent"}'

# Test keyword extraction
curl -X POST "http://localhost:8000/api/v1/keywords" \
     -H "Content-Type: application/json" \
     -d '{"text": "The product quality is excellent"}'

# Test batch keyword extraction
curl -X POST "http://localhost:8000/api/v1/batch-keywords" \
     -H "Content-Type: application/json" \
     -d '{"texts": ["The product quality is excellent", "Customer service needs improvement"]}'
```

3. Stop the container:
```bash
docker-compose down
``` 