# English NLP API

A FastAPI-based API for processing English text using Natural Language Processing (NLP) techniques.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
  - [Docker Installation](#docker-installation)
  - [Local Installation](#local-installation)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
  - [Text Segmentation](#text-segmentation)
  - [Keyword Extraction](#keyword-extraction)
  - [Batch Keyword Extraction](#batch-keyword-extraction)
- [Configuration](#configuration)
- [Testing](#testing)

## Features

- Text tokenization
- Stopword removal
- Lemmatization
- Part-of-speech tagging
- Keyword extraction using TF-IDF

## Getting Started

### Docker Installation (Recommended)

1. Prerequisites:
   - Docker
   - Docker Compose

2. Setup and Run:
   ```bash
   # Clone the repository
   # Build and start the container
   docker-compose up --build
   ```

   The API will be available at `http://localhost:8000`

### Local Installation

1. Create a virtual environment:
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

Access the API documentation through:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Text Segmentation

**Endpoint:** `POST /api/v1/segment`

Segments text into tokens with lemmatization and POS tagging.

```json
// Request
{
    "text": "The product quality is excellent but shipping was slow"
}

// Response
{
    "tokens": ["product", "quality", "excellent", "shipping", "slow"],
    "lemmas": ["product", "quality", "excellent", "shipping", "slow"],
    "pos_tags": [["product", "NN"], ["quality", "NN"], ["excellent", "JJ"], ["shipping", "NN"], ["slow", "JJ"]]
}
```

### Keyword Extraction

**Endpoint:** `POST /api/v1/keywords`

Extracts keywords from a single text using TF-IDF.

```json
// Request
{
    "text": "The product quality is excellent but shipping was slow"
}

// Response
{
    "keywords": ["product quality", "excellent", "shipping", "slow"],
    "scores": [0.5, 0.3, 0.2, 0.1]
}
```

### Batch Keyword Extraction

**Endpoint:** `POST /api/v1/batch-keywords`

Extracts keywords from multiple texts using TF-IDF.

```json
// Request
{
    "texts": [
        "The product quality is excellent but shipping was slow",
        "Customer service needs improvement",
        "Great value for money, highly recommended!"
    ]
}

// Response
{
    "keywords": ["product quality", "customer service", "value money", "shipping", "excellent"],
    "tfidf_matrix": [
        [0.5, 0.0, 0.0, 0.3, 0.2],
        [0.0, 0.6, 0.0, 0.0, 0.0],
        [0.0, 0.0, 0.5, 0.0, 0.0]
    ]
}
```

## Configuration

Query Parameters available for keyword extraction endpoints:
- `max_features` (optional): Maximum number of keywords to extract (default: 10)

## Testing

To test the API using Docker:

1. Start the services:
   ```bash
   docker-compose up --build
   ```

2. Example test commands:
   ```bash
   # Test segmentation
   curl -X POST "http://localhost:8000/api/v1/segment" \
        -H "Content-Type: application/json" \
        -d '{"text": "The product quality is excellent"}'

   # Test keyword extraction
   curl -X POST "http://localhost:8000/api/v1/keywords" \
        -H "Content-Type: application/json" \
        -d '{"text": "The product quality is excellent"}'
   ```

3. Stop the services:
   ```bash
   docker-compose down
   ``` 