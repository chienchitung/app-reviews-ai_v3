from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Tuple
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import os

app = FastAPI(
    title="English NLP API",
    description="API for processing English text with NLP techniques",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生產環境中應該限制來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

class BatchTextInput(BaseModel):
    texts: List[str]

class SegmentResponse(BaseModel):
    tokens: List[str]
    lemmas: List[str]
    pos_tags: List[tuple[str, str]]

class KeywordsResponse(BaseModel):
    keywords: List[str]
    scores: List[float]

class BatchKeywordsResponse(BaseModel):
    keywords: List[str]
    tfidf_matrix: List[List[float]]

@app.on_event("startup")
async def startup_event():
    try:
        nltk.download('punkt')
        nltk.download('stopwords')
        nltk.download('averaged_perceptron_tagger')
        nltk.download('wordnet')
        nltk.download('omw-1.4')
    except Exception as e:
        print(f"Error downloading NLTK resources: {e}")

def process_single_text(text: str) -> Dict[str, Any]:
    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()

    # Tokenization
    tokens = word_tokenize(text)

    # Basic cleaning: remove stopwords and non-alphabetic tokens
    filtered_tokens = [
        token.lower()
        for token in tokens
        if token.lower() not in stop_words and token.isalpha()
    ]

    # Lemmatization
    lemmas = [lemmatizer.lemmatize(token) for token in filtered_tokens]

    # POS tagging
    pos_tags = nltk.pos_tag(filtered_tokens)

    return {
        'tokens': filtered_tokens,
        'lemmas': lemmas,
        'pos_tags': pos_tags
    }

def extract_keywords_tfidf(texts: List[str] | str, max_features: int = 10):
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        stop_words='english',
        ngram_range=(1, 2)
    )
    
    # Handle single text vs multiple texts
    if isinstance(texts, str):
        texts = [texts]
    
    tfidf_matrix = vectorizer.fit_transform(texts)
    feature_names = vectorizer.get_feature_names_out()
    
    # Get the TF-IDF scores
    scores = tfidf_matrix.toarray()[0] if len(texts) == 1 else tfidf_matrix.toarray()
    
    return feature_names, scores

@app.post("/api/v1/segment", response_model=SegmentResponse)
async def segment_text(input_data: TextInput):
    """
    Segment a single text into tokens, with lemmatization and POS tagging.
    """
    try:
        result = process_single_text(input_data.text)
        return SegmentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/keywords", response_model=KeywordsResponse)
async def extract_keywords(input_data: TextInput, max_features: int = 10):
    """
    Extract keywords from a single text using TF-IDF.
    """
    try:
        keywords, scores = extract_keywords_tfidf(input_data.text, max_features)
        return KeywordsResponse(
            keywords=keywords.tolist(),
            scores=scores.tolist()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/batch-keywords", response_model=BatchKeywordsResponse)
async def batch_extract_keywords(input_data: BatchTextInput, max_features: int = 10):
    """
    Extract keywords from multiple texts using TF-IDF.
    """
    try:
        keywords, tfidf_matrix = extract_keywords_tfidf(input_data.texts, max_features)
        return BatchKeywordsResponse(
            keywords=keywords.tolist(),
            tfidf_matrix=tfidf_matrix.tolist()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 