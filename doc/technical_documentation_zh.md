# AppReviews AI 技術文件

## 目錄
1. [系統概述](#系統概述)
2. [架構組件](#架構組件)
3. [主要功能](#主要功能)
4. [技術堆疊](#技術堆疊)
5. [數據流程](#數據流程)
6. [API整合](#api整合)
7. [實現細節](#實現細節)
8. [評分計算方法](#評分計算方法)

## 系統概述

AppReviews AI 是一個全面的移動應用程序評論分析和競品分析平台。系統運用先進的人工智能技術，從應用商店評論中提取洞察，幫助企業了解用戶情感、追蹤競爭對手，並做出數據驅動的決策。

## 架構組件

### 1. 用戶界面
- **頁面**
  - 數據抓取界面
  - 評論分析儀表板
  - 競品分析模塊
- **交互組件**
  - AI聊天機器人助手
  - 數據可視化圖表
  - 篩選控制器

### 2. 應用評論抓取器
- **App Store抓取器**
  - iOS App Store數據採集
  - 元數據提取
  - 評論聚合
- **Google Play Store抓取器**
  - Android應用數據採集
  - 評論提取
  - 評分統計

### 3. 數據標註和分詞
- **基礎模型**
  - BERT-base-chinese-finetuned-sentiment模型
  - BERT-base-chinese-finetuned-multi-classification模型
- **NLP套件**
  - 結巴中文分詞
  - NLTK文本處理

### 4. 報告生成
- **分析組件**
  - 情感分析
  - 詞雲生成
  - 評論分類
  - AI摘要生成

## 主要功能

### 1. 智能評論分析
- 多語言評論處理支持
- 情感分類（正面、中性、負面）
- 基於類別的評論排序
- 關鍵詞提取和頻率分析

### 2. 競品分析
- 跨平台應用比較
- 功能比較矩陣
- 用戶體驗評分系統
- 市場定位分析

### 3. AI驅動的洞察
- 智能應用搜索能力
- 自動化洞察生成
- 可自定義分析參數
- 互動式數據可視化

## 技術堆疊

### 前端
- Next.js 15.0.2
- React 18.0.0
- Tailwind CSS
- Recharts數據可視化
- Radix UI組件

### AI/ML組件
- Google Gemini API自然語言處理
- HuggingFace情感分析模型
- 自定義BERT中文文本分類模型

### 數據處理
- Node.js後端處理
- 自定義抓取模塊
- TF-IDF關鍵詞提取
- 多線程數據處理

## 數據流程

1. **數據採集**
   - 用戶發起應用搜索
   - 系統抓取應用商店數據
   - 收集並存儲評論

2. **處理管道**
   - 文本預處理和清理
   - 情感分析
   - 類別分類
   - 關鍵詞提取

3. **分析生成**
   - 功能比較
   - 用戶體驗評分計算
   - 競爭定位
   - 報告生成

## API整合

### 1. Google Gemini API
- 用途：自然語言理解和生成
- 實現：直接API調用與認證
- 目的：聊天機器人回應和分析生成

### 2. HuggingFace模型
- 用途：情感分析和分類
- 端點：自定義部署模型
- 整合：REST API調用

### 3. 自定義API
- 評論抓取端點
- 數據處理服務
- 報告生成API

## 實現細節

### 1. 評論處理
```typescript
interface Review {
  date: string;            // 評論日期
  username: string;        // 用戶名
  review: string;         // 評論內容
  rating: number;         // 評分
  platform: string;       // 平台
  developerResponse?: string;  // 開發者回覆
  language: string;       // 語言
  app_id: string;        // 應用ID
  sentiment: string[];    // 情感標籤
  category: string[];     // 類別標籤
  keywords: string[];     // 關鍵詞
}
```

### 2. 分析組件
```typescript
interface AppData {
  id: string;             // 應用ID
  name: string;           // 應用名稱
  logo: string;           // 應用圖標
  iosRating: number;      // iOS評分
  androidRating: number;  // Android評分
  iosReviews: number;     // iOS評論數
  androidReviews: number; // Android評論數
  version: string;        // 版本
  lastUpdate: string;     // 最後更新時間
  features?: {
    core: string[];       // 核心功能
    advantages: string[]; // 優勢
    improvements: string[]; // 待改進項目
  };
  uxScores: {
    memberlogin: number;  // 會員登入評分
    search: number;       // 搜索功能評分
    product: number;      // 商品相關評分
    checkout: number;     // 結帳評分
    service: number;      // 客服評分
    other: number;        // 其他評分
  };
}
```

### 3. 國際化
系統支持多語言，具有完整的界面元素和分析結果翻譯系統。翻譯鍵按功能區域組織，並在集中式上下文中維護。

## 評分計算方法

### 1. 用戶體驗評分計算
系統使用多維度評分機制來評估應用的用戶體驗，主要包含以下幾個方面：

#### 1.1 基礎評分權重分配
```typescript
const UX_WEIGHTS = {
  memberlogin: 0.15,  // 會員登入體驗
  search: 0.20,       // 搜索功能
  product: 0.25,      // 商品相關
  checkout: 0.20,     // 結帳流程
  service: 0.15,      // 客戶服務
  other: 0.05         // 其他功能
};
```

#### 1.2 功能完整性評分計算
```typescript
const completenessScore = Math.round(
  (uxScores.memberlogin * UX_WEIGHTS.memberlogin) +
  (uxScores.search * UX_WEIGHTS.search) +
  (uxScores.product * UX_WEIGHTS.product) +
  (uxScores.checkout * UX_WEIGHTS.checkout) +
  (uxScores.service * UX_WEIGHTS.service) +
  (uxScores.other * UX_WEIGHTS.other)
);
```

簡化數學公式表示為：
UX得分 = (會員登入分數 × 0.15) + (搜索功能分數 × 0.20) + (商品相關分數 × 0.25) + (結帳流程分數 × 0.20) + (客戶服務分數 × 0.15) + (其他功能分數 × 0.05)

**計算範例**：
如果某應用的各維度評分為：
- 會員登入：85分
- 搜索功能：78分
- 商品相關：92分
- 結帳流程：80分
- 客戶服務：75分
- 其他功能：70分

則完整性評分計算為：
UX得分 = (85 × 0.15) + (78 × 0.20) + (92 × 0.25) + (80 × 0.20) + (75 × 0.15) + (70 × 0.05)
UX得分 = 12.75 + 15.6 + 23 + 16 + 11.25 + 3.5 = 82.1 ≈ 82

### 2. 用戶滿意度評分計算

#### 2.1 評分轉換
- 將App Store和Google Play的評分（1-5分）轉換為百分比
```typescript
const avgRating = (iosRating + androidRating) / 2;
const ratingScore = (avgRating / 5) * 100;
```

簡化數學公式表示為：
評分得分 = ((iOS評分 + Android評分) / 2) × (100 / 5)

#### 2.2 綜合滿意度計算
- 結合評分和正面評價比例
- 權重分配：正面評價佔60%，平均評分佔40%
```typescript
const satisfactionScore = Math.min(100, Math.max(0, Math.round(
  positivePercentage * 0.6 + ratingScore * 0.4
)));
```

簡化數學公式表示為：
滿意度評分 = 正面評價百分比 × 0.6 + 評分得分 × 0.4
(結果限制在0-100的範圍內)

**計算範例**：
假設某應用在iOS上的評分為4.2，Android上的評分為3.8，正面評價佔比為75%：

平均評分轉換為百分比：
評分得分 = ((4.2 + 3.8) / 2) × (100 / 5) = (4.0 × 100) / 5 = 80

綜合滿意度計算：
滿意度評分 = 75 × 0.6 + 80 × 0.4 = 45 + 32 = 77

### 3. 類別評分計算
每個評論類別的評分通過以下步驟計算：

```typescript
const calculateCategoryScore = (reviews: Review[], category: string) => {
  // 篩選該類別的評論
  const categoryReviews = reviews.filter(r => r.category.includes(category));
  
  if (categoryReviews.length === 0) return 0;
  
  // 計算加權評分
  const weightedScore = categoryReviews.reduce((sum, review) => {
    // 評分權重：正面+1，中性+0，負面-1
    const sentimentWeight = 
      review.sentiment.includes('正面') ? 1 :
      review.sentiment.includes('負面') ? -1 : 0;
    
    return sum + (review.rating * (1 + sentimentWeight * 0.2));
  }, 0);
  
  // 歸一化到0-100分
  return Math.round((weightedScore / categoryReviews.length) * 20);
};
```

簡化數學公式表示為：
類別評分 = (所有評論評分調整後的總和 / 評論數量) × 20

其中每條評論的調整評分為：
調整評分 = 原始評分 × (1 + 情感權重 × 0.2)
- 情感權重：正面+1，中性0，負面-1

**計算範例**：
假設「搜索功能」類別有3條評論：
1. 評分：4分，情感：正面（權重+1）
2. 評分：3分，情感：中性（權重0）
3. 評分：2分，情感：負面（權重-1）

計算調整後的評分總和：
評分1調整後 = 4 × (1 + 1 × 0.2) = 4 × 1.2 = 4.8
評分2調整後 = 3 × (1 + 0 × 0.2) = 3 × 1 = 3
評分3調整後 = 2 × (1 + (-1) × 0.2) = 2 × 0.8 = 1.6
調整後評分總和 = 4.8 + 3 + 1.6 = 9.4

計算類別評分：
類別評分 = (9.4 / 3) × 20 = 3.13 × 20 = 62.67 ≈ 63

### 4. 市場競爭力評分
基於用戶滿意度和功能完整性的綜合評估，系統使用二維矩陣進行市場定位分析：

```typescript
interface CompetitivenessScore {
  satisfaction_score: number;   // 用戶滿意度 (0-100)
  completeness_score: number;   // 功能完整性 (0-100)
  market_position: string;      // 市場定位描述
}

const calculateMarketPosition = (
  satisfactionScore: number,
  completenessScore: number
): string => {
  // 用戶滿意度和功能完整性的中位數
  const MEDIAN_SCORE = 50;

  // 根據象限定位確定市場位置
  if (satisfactionScore >= MEDIAN_SCORE && completenessScore < MEDIAN_SCORE) {
    return '潛力型';  // 高滿意度，低完整性
  } else if (satisfactionScore >= MEDIAN_SCORE && completenessScore >= MEDIAN_SCORE) {
    return '領導型';  // 高滿意度，高完整性
  } else if (satisfactionScore < MEDIAN_SCORE && completenessScore < MEDIAN_SCORE) {
    return '待改進';  // 低滿意度，低完整性
  } else {
    return '成熟型';  // 低滿意度，高完整性
  }
};
```

市場定位計算方式：
- 比較用戶滿意度(S)與中位數50
- 比較功能完整性(C)與中位數50
- 根據兩個比較結果確定市場象限

**計算範例**：
假設某應用用戶滿意度評分為75分，功能完整性評分為45分：
- 滿意度評分(S) = 75，大於中位數50
- 完整性評分(C) = 45，小於中位數50

根據判斷條件：(S >= 50 且 C < 50)，該應用屬於「潛力型」（高滿意度，低完整性）。

市場定位矩陣說明：
- **潛力型**：用戶滿意度高但功能相對不完整，表示產品具有良好的發展潛力
- **領導型**：用戶滿意度高且功能完整，為市場領導地位
- **待改進**：用戶滿意度和功能完整度均需提升
- **成熟型**：功能完整但用戶滿意度較低，需要優化現有功能

---

*注：本文檔由AppReviews AI開發團隊維護。如需更新或貢獻，請遵循標準拉取請求流程。* 