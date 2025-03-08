export interface Feedback {
  date: string;
  content: string;
  rating: number;
  device: string;
  category: string;
  sentiment: string;
  keywords: string[];
}

export interface Keyword {
  word: string;
  count: number;
}

export interface AnalysisResult {
  feedbacks: Feedback[];
  keywords: Keyword[];
  summary: {
    totalCount: number;
    positiveRatio: number;
    neutralRatio: number;
    negativeRatio: number;
    averageRating: number;
  };
} 