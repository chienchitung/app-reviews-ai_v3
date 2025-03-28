# AppReviews AI Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Key Features](#key-features)
4. [Technical Stack](#technical-stack)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)
7. [Implementation Details](#implementation-details)
8. [Score Calculation Methods](#score-calculation-methods)

## System Overview

AppReviews AI is a comprehensive platform designed for analyzing mobile application reviews and performing competitive analysis. The system leverages advanced AI technologies to provide insights from app store reviews, helping businesses understand user sentiment, track competitors, and make data-driven decisions.

## Architecture Components

### 1. User Interface
- **Pages**
  - Data Scraping Interface
  - Review Analysis Dashboard
  - Competitor Analysis Module
- **Interactive Components**
  - AI Chatbot Assistant
  - Data Visualization Charts
  - Filter Controls

### 2. App Reviews Scraper
- **App Store Scraper**
  - iOS App Store data collection
  - Metadata extraction
  - Review aggregation
- **Google Play Store Scraper**
  - Android app data collection
  - Review extraction
  - Rating statistics

### 3. Data Annotation and Tokenization
- **Foundation Models**
  - BERT-base-chinese-finetuned-sentiment model
  - BERT-base-chinese-finetuned-multi-classification model
- **NLP Package**
  - Jieba for Chinese text segmentation
  - NLTK for text processing

### 4. Reporting
- **Analysis Components**
  - Sentiment Analysis
  - Word Cloud Generation
  - Review Categorization
  - AI Summary Generation

## Key Features

### 1. Intelligent Review Analysis
- Multi-language support for review processing
- Sentiment classification (positive, neutral, negative)
- Category-based review sorting
- Keyword extraction and frequency analysis

### 2. Competitive Analysis
- Cross-platform app comparison
- Feature comparison matrix
- UX scoring system
- Market positioning analysis

### 3. AI-Powered Insights
- Smart app search capabilities
- Automated insight generation
- Customizable analysis parameters
- Interactive data visualization

## Technical Stack

### Frontend
- Next.js 15.0.2
- React 18.0.0
- Tailwind CSS
- Recharts for data visualization
- Radix UI components

### AI/ML Components
- Google Gemini API for natural language processing
- HuggingFace models for sentiment analysis
- Custom BERT models for Chinese text classification

### Data Processing
- Node.js for backend processing
- Custom scraping modules
- TF-IDF based keyword extraction
- Multi-threaded data processing

## Data Flow

1. **Data Collection**
   - User initiates app search
   - System scrapes app store data
   - Reviews are collected and stored

2. **Processing Pipeline**
   - Text preprocessing and cleaning
   - Sentiment analysis
   - Category classification
   - Keyword extraction

3. **Analysis Generation**
   - Feature comparison
   - UX score calculation
   - Competitive positioning
   - Report generation

## API Integration

### 1. Google Gemini API
- Used for: Natural language understanding and generation
- Implementation: Direct API calls with authentication
- Purpose: Chatbot responses and analysis generation

### 2. HuggingFace Models
- Used for: Sentiment analysis and classification
- Endpoint: Custom deployed models
- Integration: REST API calls

### 3. Custom APIs
- Review scraping endpoints
- Data processing services
- Report generation API

## Implementation Details

### 1. Review Processing
```typescript
interface Review {
  date: string;
  username: string;
  review: string;
  rating: number;
  platform: string;
  developerResponse?: string;
  language: string;
  app_id: string;
  sentiment: string[];
  category: string[];
  keywords: string[];
}
```

### 2. Analysis Components
```typescript
interface AppData {
  id: string;
  name: string;
  logo: string;
  iosRating: number;
  androidRating: number;
  iosReviews: number;
  androidReviews: number;
  version: string;
  lastUpdate: string;
  features?: {
    core: string[];
    advantages: string[];
    improvements: string[];
  };
  uxScores: {
    memberlogin: number;
    search: number;
    product: number;
    checkout: number;
    service: number;
    other: number;
  };
}
```

### 3. Internationalization
The system supports multiple languages with a comprehensive translation system for both interface elements and analysis results. Translation keys are organized by functional areas and maintained in a centralized context.

## Score Calculation Methods

### 1. User Experience Score Calculation
The system employs a multi-dimensional scoring mechanism to evaluate the user experience of applications, including the following aspects:

#### 1.1 Base Score Weight Distribution
```typescript
const UX_WEIGHTS = {
  memberlogin: 0.15,  // Member login experience
  search: 0.20,       // Search functionality
  product: 0.25,      // Product-related
  checkout: 0.20,     // Checkout process
  service: 0.15,      // Customer service
  other: 0.05         // Other features
};
```

#### 1.2 Feature Completeness Score Calculation
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

### 2. User Satisfaction Score Calculation

#### 2.1 Rating Conversion
- Converting App Store and Google Play ratings (1-5) to percentage
```typescript
const avgRating = (iosRating + androidRating) / 2;
const ratingScore = (avgRating / 5) * 100;
```

#### 2.2 Comprehensive Satisfaction Calculation
- Combines ratings and positive review ratio
- Weight distribution: Positive reviews 60%, average rating 40%
```typescript
const satisfactionScore = Math.min(100, Math.max(0, Math.round(
  positivePercentage * 0.6 + ratingScore * 0.4
)));
```

### 3. Category Score Calculation
Each review category score is calculated through the following steps:

```typescript
const calculateCategoryScore = (reviews: Review[], category: string) => {
  // Filter reviews for the specific category
  const categoryReviews = reviews.filter(r => r.category.includes(category));
  
  if (categoryReviews.length === 0) return 0;
  
  // Calculate weighted score
  const weightedScore = categoryReviews.reduce((sum, review) => {
    // Sentiment weights: positive +1, neutral +0, negative -1
    const sentimentWeight = 
      review.sentiment.includes('positive') ? 1 :
      review.sentiment.includes('negative') ? -1 : 0;
    
    return sum + (review.rating * (1 + sentimentWeight * 0.2));
  }, 0);
  
  // Normalize to 0-100 scale
  return Math.round((weightedScore / categoryReviews.length) * 20);
};
```

### 4. Market Competitiveness Score
Based on a comprehensive evaluation of user satisfaction and feature completeness, the system uses a two-dimensional matrix for market positioning analysis:

```typescript
interface CompetitivenessScore {
  satisfaction_score: number;   // User satisfaction (0-100)
  completeness_score: number;   // Feature completeness (0-100)
  market_position: string;      // Market position description
}

const calculateMarketPosition = (
  satisfactionScore: number,
  completenessScore: number
): string => {
  // Median score for user satisfaction and feature completeness
  const MEDIAN_SCORE = 50;

  // Determine market position based on quadrant
  if (satisfactionScore >= MEDIAN_SCORE && completenessScore < MEDIAN_SCORE) {
    return 'Potential';  // High satisfaction, low completeness
  } else if (satisfactionScore >= MEDIAN_SCORE && completenessScore >= MEDIAN_SCORE) {
    return 'Leader';     // High satisfaction, high completeness
  } else if (satisfactionScore < MEDIAN_SCORE && completenessScore < MEDIAN_SCORE) {
    return 'Needs Improvement';  // Low satisfaction, low completeness
  } else {
    return 'Mature';     // Low satisfaction, high completeness
  }
};
```

Market Positioning Matrix Description:
- **Potential**: High user satisfaction but relatively incomplete features, indicating good development potential
- **Leader**: High user satisfaction and complete features, representing market leadership
- **Needs Improvement**: Both user satisfaction and feature completeness need enhancement
- **Mature**: Complete features but lower user satisfaction, requiring optimization of existing functionality

---

*Note: This documentation is maintained by the AppReviews AI development team. For updates or contributions, please follow the standard pull request process.* 