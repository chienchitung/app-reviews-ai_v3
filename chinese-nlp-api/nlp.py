from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jieba
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Optional
import re

router = APIRouter()

# 數據模型
class TextRequest(BaseModel):
    text: str
    top_n: Optional[int] = 5

class TextListRequest(BaseModel):
    texts: List[str]
    top_n: Optional[int] = 5

class KeywordResponse(BaseModel):
    keywords: List[str]
    word_scores: List[dict]

# 停用詞列表（可以根據需要擴充）
STOPWORDS = set(['的', '了', '和', '是', '就', '都', '而', '及', '與', '著',
                '或', '一個', '沒有', '我們', '你們', '他們', '她們', '有些',
                '也', '就是', '但是', '可以', '這個', '那個', '這些', '那些'])

def clean_text(text: str) -> str:
    """清理文本，移除特殊字符和多餘的空格"""
    # 移除 URL
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    # 移除特殊字符和數字
    text = re.sub(r'[^\u4e00-\u9fff]+', ' ', text)
    # 移除多餘的空格
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_keywords(text: str, top_n: int = 5) -> KeywordResponse:
    """從文本中提取關鍵詞"""
    # 清理文本
    cleaned_text = clean_text(text)
    if not cleaned_text:
        raise HTTPException(status_code=400, detail="Text is empty after cleaning")

    # 使用 jieba 進行分詞
    words = list(jieba.cut(cleaned_text))
    words = [w for w in words if w not in STOPWORDS and len(w) > 1]
    
    if not words:
        return KeywordResponse(keywords=[], word_scores=[])

    # 為當前文本創建新的 TF-IDF 向量器
    tfidf_vectorizer = TfidfVectorizer(
        max_features=1000,
        token_pattern=r"(?u)\b\w+\b"
    )

    # 使用當前文本訓練向量器
    word_str = " ".join(words)
    tfidf_vectorizer.fit([word_str])
    tfidf_vector = tfidf_vectorizer.transform([word_str])
    
    # 獲取特徵名稱和分數
    feature_names = tfidf_vectorizer.get_feature_names_out()
    scores = tfidf_vector.toarray()[0]
    
    # 將詞語和分數配對並排序
    word_scores = [
        {"word": word, "score": float(score)}
        for word, score in zip(feature_names, scores)
        if score > 0
    ]
    word_scores.sort(key=lambda x: x["score"], reverse=True)
    
    # 選取前 top_n 個關鍵詞
    top_keywords = [item["word"] for item in word_scores[:top_n]]
    
    return KeywordResponse(
        keywords=top_keywords,
        word_scores=word_scores[:top_n]
    )

@router.post("/segment", response_model=List[str])
async def segment_text(request: TextRequest):
    """對文本進行分詞"""
    try:
        # 清理文本
        cleaned_text = clean_text(request.text)
        if not cleaned_text:
            raise HTTPException(status_code=400, detail="Text is empty after cleaning")
        
        # 使用 jieba 進行分詞
        words = list(jieba.cut(cleaned_text))
        # 過濾停用詞和單字詞
        words = [w for w in words if w not in STOPWORDS and len(w) > 1]
        
        return words
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/keywords", response_model=KeywordResponse)
async def extract_text_keywords(request: TextRequest):
    """從文本中提取關鍵詞"""
    try:
        return extract_keywords(request.text, request.top_n)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-keywords", response_model=List[KeywordResponse])
async def batch_extract_keywords(request: TextListRequest):
    """批量處理多個文本並提取關鍵詞"""
    try:
        results = []
        for text in request.texts:
            result = extract_keywords(text, request.top_n)
            results.append(result)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 