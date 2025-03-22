'use client';

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { ChevronDown, ChevronUp, Star, Download, Filter, ArrowLeft, Copy, Check, ThumbsUp, ThumbsDown, Minus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchResult } from './types'
import { utils as xlsxUtils, write as xlsxWrite } from 'xlsx';

interface AppInfo {
  platform: string;
  app_name: string;
  category: string;
  developer: string;
  rating: string;
  rating_count: string;
  price: string;
  icon_url: string;
  version: string;
  update_date: string;
  ios_similar_app: string | null;
  similarity: string | null;
  reviews?: Review[];
}

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
  appStoreUrl: string;
  playStoreUrl: string;
  appInfo?: {
    ios?: AppInfo;
    android?: AppInfo;
  };
  features?: {
    core: string[];
    advantages: string[];
    improvements: string[];
  };
  reviews: {
    positive: Review[];
    neutral: Review[];
    negative: Review[];
  };
  uxScores: {
    memberlogin: number;
    search: number;
    product: number;
    checkout: number;
    service: number;
    other: number;
  };
  reviewStats: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywordFrequency: { keyword: string; count: number }[];
  reviewAnalysis?: {
    advantages: string[];
    improvements: string[];
    summary: string;
  };
  processedReviews: Review[];
  uxAnalysis?: {
    strengths: string[];
    improvements: string[];
    summary: string;
  };
}

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

interface ReviewData {
  app_id: string;
  reviews: Review[];
}

interface CompetitiveAnalysisProps {
  selectedApps?: SearchResult[];
  onGoBack: () => void;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

// 修改格式化評論數的函數
const formatReviewCount = (count: number): string => {
  if (count >= 100000) {
    return `${Math.floor(count / 10000)}萬`;
  } else if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}萬`;
  }
  return count.toLocaleString();
};

// 計算每個類別的評分 (0-100)
const calculateCategoryScore = (reviews: Review[], category: string): number => {
  const categoryReviews = reviews.filter(review => review.category.includes(category));
  if (categoryReviews.length === 0) return 0;

  const weightedScore = categoryReviews.reduce((acc: number, review: Review) => {
    const sentimentWeight = review.sentiment.includes('正面') ? 1 : 
                          review.sentiment.includes('負面') ? -1 : 0;
    const ratingWeight = (review.rating / 5) * 100;
    return acc + (sentimentWeight * ratingWeight);
  }, 0);

  const maxPossibleScore = categoryReviews.length * 100;
  const normalizedScore = ((weightedScore + maxPossibleScore) / (2 * maxPossibleScore)) * 100;
  return Math.round(normalizedScore);
};

// 計算情感分析統計
const calculateSentimentStats = (reviews: Review[]) => {
  const total = reviews.length;
  const positive = reviews.filter(r => r.sentiment.includes('正面')).length;
  const negative = reviews.filter(r => r.sentiment.includes('負面')).length;
  const neutral = total - positive - negative;

  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100)
  };
};

// 提取代表性評論
const extractRepresentativeReviews = (reviews: Review[], sentiment: string): Review[] => {
  return reviews
    .filter(r => r.sentiment.includes(sentiment))
    .sort((a: Review, b: Review) => b.rating - a.rating)
    .slice(0, 3);
};

// 計算關鍵詞頻率
const calculateKeywordFrequency = (reviews: Review[]): { keyword: string; count: number }[] => {
  const keywordCount: { [key: string]: number } = {};
  reviews.forEach(review => {
    review.keywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });
  });
  return Object.entries(keywordCount)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// 計算評論平均分數
const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((totalRating / reviews.length).toFixed(1));
};

const analyzeAppFeatures = async (app: AppData) => {
  try {
    const prompt = `分析以下應用程式的功能特點：

應用名稱：${app.name}
類別：${app.appInfo?.ios?.category || app.appInfo?.android?.category}
開發者：${app.appInfo?.ios?.developer || app.appInfo?.android?.developer}
評分：iOS ${app.iosRating}，Android ${app.androidRating}
評論數：iOS ${app.iosReviews}，Android ${app.androidReviews}
版本：${app.version}
最後更新：${app.lastUpdate}

請直接以 JSON 格式回覆，不要加入任何其他格式或說明文字：
{
  "core": [
    "列出3-5點主要功能",
    "每點描述不超過50字",
    "..."
  ],
  "advantages": [
    "列出2-3點競爭優勢",
    "每點描述不超過50字",
    "..."
  ],
  "improvements": [
    "列出2-3點待改進項目",
    "每點描述不超過50字",
    "..."
  ]}`;

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemini-2.0-flash-thinking-exp-01-21'
      }),
    });

    if (!response.ok) {
      throw new Error('分析請求失敗');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    let parsedResponse;
    try {
      // 清理回應內容，移除可能的 Markdown 格式
      const cleanResponse = data.response
        .replace(/\`\`\`json\n?/g, '')  // 移除 ```json
        .replace(/\`\`\`\n?/g, '')      // 移除 ```
        .trim();                         // 移除前後空白

      // 嘗試解析清理後的 JSON
      parsedResponse = JSON.parse(cleanResponse);
      
      // 驗證回應格式
      if (!parsedResponse.core || !Array.isArray(parsedResponse.core) || parsedResponse.core.length < 2 ||
          !parsedResponse.advantages || !Array.isArray(parsedResponse.advantages) || parsedResponse.advantages.length < 2 ||
          !parsedResponse.improvements || !Array.isArray(parsedResponse.improvements) || parsedResponse.improvements.length < 2) {
        throw new Error('回應格式不正確');
      }

      return {
        core: parsedResponse.core.slice(0, 5),
        advantages: parsedResponse.advantages.slice(0, 3),
        improvements: parsedResponse.improvements.slice(0, 3)
      };
    } catch (parseError) {
      console.error('解析 AI 回應時發生錯誤:', parseError);
      return {
        core: ['功能分析處理中...'],
        advantages: ['優勢分析處理中...'],
        improvements: ['改進建議處理中...']
      };
    }
  } catch (error) {
    console.error('分析應用程式功能時發生錯誤:', error);
    return {
      core: ['暫時無法取得功能資訊'],
      advantages: ['暫時無法取得優勢資訊'],
      improvements: ['暫時無法取得改進建議']
    };
  }
};

const analyzeReviews = async (app: AppData) => {
  try {
    // 準備所有評論數據
    const allReviews = app.processedReviews;
    
    if (!allReviews || allReviews.length === 0) {
      return {
        advantages: ['尚無評論資料可供分析'],
        improvements: ['尚無評論資料可供分析'],
        summary: '目前尚無足夠的評論資料進行分析。'
      };
    }

    const positiveReviews = allReviews.filter(r => r.sentiment.includes('正面'));
    const negativeReviews = allReviews.filter(r => r.sentiment.includes('負面'));

    const prompt = `分析以下應用程式 ${app.name} 的所有用戶評論：

評分統計：
- 總評分：${app.iosRating || app.androidRating}
- 總評論數：${allReviews.length}
- 正面評論數：${positiveReviews.length}
- 負面評論數：${negativeReviews.length}

所有評論內容：
${allReviews.map(review => `- 評分：${review.rating}，評論：${review.review}`).join('\n')}

請根據以上所有評論進行深入分析，並以 JSON 格式回覆以下內容：
{
  "advantages": [
    "列出3-5點主要優勢，每點不超過50字",
    "每點根據用戶實際評論內容歸納",
    "重點突出用戶最認可的功能或特點"
  ],
  "improvements": [
    "列出3-5點具體待改進項目，每點不超過50字",
    "每點必須基於用戶實際反饋",
    "優先列出影響用戶體驗的關鍵問題"
  ],
  "summary": "整體分析摘要，總結用戶反饋的核心觀點，並提供具體的改進方向建議。長度200字。"
}`;

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemini-2.0-flash'
      }),
    });

    if (!response.ok) {
      throw new Error('分析請求失敗');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    let parsedResponse;
    try {
      const cleanResponse = data.response
        .replace(/\`\`\`json\n?/g, '')
        .replace(/\`\`\`\n?/g, '')
        .trim();

      parsedResponse = JSON.parse(cleanResponse);
      
      if (!parsedResponse.advantages || !parsedResponse.improvements || !parsedResponse.summary) {
        throw new Error('分析結果格式不完整');
      }

      return {
        advantages: parsedResponse.advantages,
        improvements: parsedResponse.improvements,
        summary: parsedResponse.summary
      };
    } catch (parseError) {
      console.error('解析 AI 回應時發生錯誤:', parseError);
      throw new Error('無法解析分析結果');
    }
  } catch (error) {
    console.error('分析評論時發生錯誤:', error);
    return {
      advantages: ['暫時無法取得分析結果'],
      improvements: ['暫時無法取得分析結果'],
      summary: '暫時無法取得分析結果，請稍後再試。'
    };
  }
};

// 新增用戶體驗分析函數
const analyzeUserExperience = async (app: AppData) => {
  try {
    const prompt = `分析以下應用程式的用戶體驗數據：

應用名稱：${app.name}
用戶體驗評分：
- 會員登入: ${app.uxScores.memberlogin}%
- 搜尋功能: ${app.uxScores.search}%
- 商品相關: ${app.uxScores.product}%
- 結帳付款: ${app.uxScores.checkout}%
- 客戶服務: ${app.uxScores.service}%
- 其他功能: ${app.uxScores.other}%

請根據以上數據，分析該應用程式的用戶體驗優勢與待改進項目。直接以 JSON 格式回覆，不要加入任何其他格式或說明文字：
{
  "strengths": [
    "列出2-3點主要優勢",
    "每點不超過30字",
    "根據評分較高的項目分析"
  ],
  "improvements": [
    "列出2-3點待改進項目",
    "每點不超過30字",
    "根據評分較低的項目分析"
  ],
  "summary": "整體用戶體驗摘要，不超過100字"
}`;

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemini-2.0-flash'
      }),
    });

    if (!response.ok) {
      throw new Error('分析請求失敗');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    let parsedResponse;
    try {
      const cleanResponse = data.response
        .replace(/\`\`\`json\n?/g, '')
        .replace(/\`\`\`\n?/g, '')
        .trim();

      parsedResponse = JSON.parse(cleanResponse);
      
      return {
        strengths: parsedResponse.strengths || [],
        improvements: parsedResponse.improvements || [],
        summary: parsedResponse.summary || '暫無分析摘要'
      };
    } catch (parseError) {
      console.error('解析 AI 回應時發生錯誤:', parseError);
      return {
        strengths: ['暫無優勢分析'],
        improvements: ['暫無改進建議'],
        summary: '暫無分析摘要'
      };
    }
  } catch (error) {
    console.error('分析用戶體驗時發生錯誤:', error);
    return {
      strengths: ['暫無優勢分析'],
      improvements: ['暫無改進建議'],
      summary: '暫無分析摘要'
    };
  }
};

const generatePPTContent = async (appData: AppData[]) => {
  try {
    // Format the date in zh-TW locale
    const currentDate = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Prepare the data for Gemini API
    const formattedData = appData.map(app => ({
      name: app.name,
      logo: app.logo,
      ratings: {
        ios: app.iosRating.toFixed(1),
        android: app.androidRating.toFixed(1)
      },
      reviews: {
        count: app.processedReviews.length,
        stats: {
          positive: app.reviewStats.positive,
          negative: app.reviewStats.negative
        },
        analysis: {
          advantages: app.reviewAnalysis?.advantages || [],
          improvements: app.reviewAnalysis?.improvements || [],
          summary: app.reviewAnalysis?.summary || ''
        }
      },
      features: app.features || {
        core: [],
        advantages: [],
        improvements: []
      },
      uxScores: {
        memberlogin: app.uxScores.memberlogin,
        search: app.uxScores.search,
        product: app.uxScores.product,
        checkout: app.uxScores.checkout,
        service: app.uxScores.service,
        other: app.uxScores.other
      },
      uxAnalysis: app.uxAnalysis || {
        strengths: [],
        improvements: [],
        summary: ''
      }
    }));

    const prompt = `分析以下應用程式的競品分析數據，並生成一份完整的簡報內容：

應用程式資料：
${JSON.stringify(formattedData, null, 2)}

請生成一份結構完整的簡報內容，包含以下章節：
1. 概述
2. 功能比較
3. 用戶體驗分析
4. 評論分析
5. 總結

每個章節需包含：
- 關鍵發現
- 數據支持
- 具體建議

請以 JSON 格式回覆，格式如下：
{
  "title": "競品分析報告",
  "date": "${currentDate}",
  "summary": {
    "dataSupport": [
      "請列出3-4個最關鍵的數據指標及其影響"
    ],
    "keyFindings": [
      "各應用在功能與技術方面的差異化優勢",
      "用戶體驗評分的主要差距",
      "用戶反饋的核心痛點"
    ],
    "recommendations": [
      "最優先需要改進的功能領域",
      "提升用戶體驗的關鍵行動項目",
      "長期競爭力提升建議"
    ]
  },
  "apps": [
    {
      "name": "應用名稱",
      "logo": "應用程式圖標URL",
      "ratings": {
        "ios": "iOS 評分",
        "android": "Android 評分"
      },
      "reviews": {
        "count": "評論總數",
        "stats": {
          "positive": "正面評價百分比",
          "negative": "負面評價百分比"
        },
        "analysis": {
          "advantages": ["優勢1", "優勢2", "優勢3"],
          "improvements": ["改進1", "改進2", "改進3"],
          "summary": "整體評論分析摘要"
        }
      },
      "features": {
        "core": ["核心功能1", "核心功能2", "核心功能3"],
        "advantages": ["競爭優勢1", "競爭優勢2"],
        "improvements": ["待改進1", "待改進2"]
      },
      "uxScores": {
        "memberlogin": "會員登入評分",
        "search": "搜尋功能評分",
        "product": "商品相關評分",
        "checkout": "結帳付款評分",
        "service": "客戶服務評分"
      },
      "uxAnalysis": {
        "strengths": ["優勢1", "優勢2", "優勢3"],
        "improvements": ["改進1", "改進2", "改進3"],
        "summary": "用戶體驗分析摘要"
      }
    }
  ]
}`;

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gemini-2.0-flash'
      }),
    });

    if (!response.ok) {
      throw new Error(`生成簡報內容失敗: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Gemini API 錯誤: ${data.error}`);
    }

    try {
      const cleanResponse = data.response
        .replace(/\`\`\`json\n?/g, '')
        .replace(/\`\`\`\n?/g, '')
        .trim();

      const parsedData = JSON.parse(cleanResponse);
      
      // Validate the parsed data structure
      if (!parsedData.title || !parsedData.date || !Array.isArray(parsedData.apps)) {
        throw new Error('無效的簡報數據格式');
      }

      return parsedData;
    } catch (parseError) {
      console.error('解析 Gemini 回應時發生錯誤:', parseError);
      throw new Error('無法解析 AI 生成的內容');
    }
  } catch (error) {
    console.error('生成簡報內容時發生錯誤:', error);
    throw error;
  }
};

export default function CompetitiveAnalysis({ selectedApps = [], onGoBack }: CompetitiveAnalysisProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days")
  const [selectedDownloadType, setSelectedDownloadType] = useState("full_report")
  const [expandedApp, setExpandedApp] = useState<string | null>(null)
  const [appData, setAppData] = useState<AppData[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reviewFilters, setReviewFilters] = useState({
    sentiment: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    timeframe: '30days'
  });
  const [expandedReviews, setExpandedReviews] = useState<{ [key: string]: boolean }>({});
  const [showAnalysisSummary, setShowAnalysisSummary] = useState<string | null>(null);
  const [isPPTGenerating, setIsPPTGenerating] = useState(false);
  const [pptProgress, setPPTProgress] = useState({ phase: '', progress: 0 });
  const [error, setError] = useState<string | null>(null);

  const toggleAppDetails = (appId: string) => {
    if (expandedApp === appId) {
      setExpandedApp(null)
    } else {
      setExpandedApp(appId)
    }
  }

  const toggleReviewExpand = (reviewId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Add new function to filter reviews by date
  const filterReviewsByDate = (reviews: Review[], timeframe: string) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch(timeframe) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return reviews;
    }
    
    return reviews.filter(review => new Date(review.date) >= cutoffDate);
  };

  // Update download function
  const handleDownload = async () => {
    if (selectedDownloadType === 'raw_data') {
      try {
        setError(null);
        // Prepare data for Excel
        const excelData = appData.map(app => {
          const filteredReviews = filterReviewsByDate(app.processedReviews, selectedTimeframe);
          return filteredReviews.map(review => ({
            '應用程式': app.name,
            '日期': review.date,
            '評分': review.rating,
            '平台': review.platform,
            '評論內容': review.review,
            '情感分析': review.sentiment.join(', '),
            '分類': review.category.join(', ')
          }));
        }).flat();

        // Create workbook and worksheet
        const worksheet = xlsxUtils.json_to_sheet(excelData);
        const workbook = xlsxUtils.book_new();
        xlsxUtils.book_append_sheet(workbook, worksheet, '評論數據');

        // Auto-size columns
        type RowType = typeof excelData[0];
        const maxWidths: { [key in keyof RowType]: number } = {} as { [key in keyof RowType]: number };
        
        excelData.forEach(row => {
          (Object.keys(row) as Array<keyof RowType>).forEach(key => {
            const cellValue = row[key] ? String(row[key]) : '';
            maxWidths[key] = Math.max(maxWidths[key] || 0, cellValue.length);
          });
        });

        worksheet['!cols'] = (Object.keys(excelData[0]) as Array<keyof RowType>).map(key => ({
          wch: Math.min(Math.max(maxWidths[key], key.length), 50)
        }));

        // Generate Excel file
        const excelBuffer = xlsxWrite(workbook, { 
          bookType: 'xlsx', 
          type: 'array',
          cellStyles: true
        });

        // Create and trigger download
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `app_reviews_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('匯出 Excel 時發生錯誤:', error);
        setError('匯出 Excel 檔案時發生錯誤，請稍後再試。');
      }
    } else if (selectedDownloadType === 'full_report') {
      try {
        setError(null);
        setIsPPTGenerating(true);
        setPPTProgress({ phase: '分析競品數據', progress: 10 });

        if (!appData || appData.length === 0) {
          throw new Error('沒有可用的應用程式數據');
        }

        // Generate enriched content using Gemini
        const pptData = await generatePPTContent(appData);
        
        setPPTProgress({ phase: '生成簡報大綱', progress: 30 });
        
        // Get and validate PPT generator API URL
        let apiUrl = process.env.NEXT_PUBLIC_PPT_GENERATOR_API_URL;
        if (!apiUrl) {
          throw new Error('PPT Generator API URL 未設定，請檢查環境配置');
        }

        // Ensure HTTPS is used and log the URLs
        console.log('Original API URL:', apiUrl);
        let secureApiUrl = apiUrl;
        if (!secureApiUrl.startsWith('https://')) {
          secureApiUrl = secureApiUrl.replace(/^http:\/\//, 'https://');
        }
        secureApiUrl = secureApiUrl.replace(/\/$/, '');
        console.log('Secure API URL:', secureApiUrl);

        const generateUrl = `${secureApiUrl}/generate-ppt`;
        console.log('Generate URL:', generateUrl);

        // Create FormData and append the JSON file
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(pptData)], { type: 'application/json' });
        formData.append('input_file', jsonBlob, 'data.json');

        // Add API key and CORS headers
        const headers: HeadersInit = {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        };
        
        const apiKey = process.env.NEXT_PUBLIC_PPT_GENERATOR_API_KEY;
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        console.log('Sending request to:', generateUrl);
        
        try {
          const response = await fetch(generateUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            headers,
            credentials: 'omit'
          }).catch(error => {
            console.error('Fetch error:', error);
            throw new Error(`API 請求失敗: ${error.message}`);
          });

          setPPTProgress({ phase: '設計簡報版面', progress: 60 });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`PPT 生成失敗: ${response.statusText || '伺服器錯誤'}`);
          }

          const responseData = await response.json();
          console.log('API Response:', responseData);

          if (!responseData.file_path) {
            throw new Error('未收到 PPT 文件的路徑');
          }

          setPPTProgress({ phase: '下載簡報檔案', progress: 90 });

          // Download the PPT file using HTTPS
          const downloadUrl = `${secureApiUrl}/download/${responseData.file_path}`;
          console.log('Download URL:', downloadUrl);
          
          const pptResponse = await fetch(downloadUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': '*',
              ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
            },
          }).catch(error => {
            console.error('Download error:', error);
            throw new Error(`下載檔案失敗: ${error.message}`);
          });

          if (!pptResponse.ok) {
            const errorText = await pptResponse.text();
            console.error('Download Error Response:', errorText);
            throw new Error('下載 PPT 檔案失敗');
          }

          const blob = await pptResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `競品分析報告_${new Date().toISOString().split('T')[0]}.pptx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setPPTProgress({ phase: '下載完成', progress: 100 });
        } catch (apiError) {
          console.error('API 請求或下載過程中發生錯誤:', apiError);
          throw new Error(apiError instanceof Error ? apiError.message : '與伺服器通訊時發生錯誤，請稍後再試');
        }
      } catch (error) {
        console.error('生成 PPT 時發生錯誤:', error);
        setError(error instanceof Error ? error.message : '生成 PPT 時發生錯誤，請稍後再試。');
      } finally {
        setTimeout(() => {
          setIsPPTGenerating(false);
          setPPTProgress({ phase: '', progress: 0 });
        }, 1000);
      }
    }
  };

  // Update getFilteredReviews function
  const getFilteredReviews = (reviews: Review[], filters: typeof reviewFilters) => {
    return filterReviewsByDate(reviews, filters.timeframe)
      .filter(review => {
        if (filters.sentiment === 'all') return true;
        if (filters.sentiment === 'positive') return review.sentiment.includes('正面');
        if (filters.sentiment === 'negative') return review.sentiment.includes('負面');
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        }
        if (filters.sortBy === 'rating') {
          return filters.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
        }
        return 0;
      });
  };

  // Update useEffect to sync timeframe
  useEffect(() => {
    setReviewFilters(prev => ({
      ...prev,
      timeframe: selectedTimeframe
    }));
  }, [selectedTimeframe]);

  useEffect(() => {
    const initializeData = async () => {
      setIsAnalyzing(true);
      try {
        const initializedData = await Promise.all(
          selectedApps.map(async (app) => {
            // 計算評論相關的數據
            const iosReviews = app.appInfo?.ios?.reviews || [];
            const androidReviews = app.appInfo?.android?.reviews || [];
            const allReviews = [...iosReviews, ...androidReviews];

            // 計算各類別評分
            const uxScores = {
              memberlogin: calculateCategoryScore(allReviews, '會員登入'),
              search: calculateCategoryScore(allReviews, '搜尋功能'),
              product: calculateCategoryScore(allReviews, '商品相關'),
              checkout: calculateCategoryScore(allReviews, '結帳付款'),
              service: calculateCategoryScore(allReviews, '客戶服務'),
              other: calculateCategoryScore(allReviews, '其他')
            };

            // 計算情感分析統計
            const reviewStats = calculateSentimentStats(allReviews);

            // 提取代表性評論
            const reviews = {
              positive: extractRepresentativeReviews(allReviews, '正面'),
              neutral: extractRepresentativeReviews(allReviews, '中性'),
              negative: extractRepresentativeReviews(allReviews, '負面')
            };

            // 計算關鍵詞頻率
            const keywordFrequency = calculateKeywordFrequency(allReviews);

            const baseData = {
              id: app.id,
              name: app.name,
              logo: app.appInfo?.ios?.icon_url || app.appInfo?.android?.icon_url || '',
              iosRating: parseFloat(app.appInfo?.ios?.rating || '0'),
              androidRating: parseFloat(app.appInfo?.android?.rating || '0'),
              iosReviews: parseInt(app.appInfo?.ios?.rating_count.replace(/,/g, '') || '0'),
              androidReviews: parseInt(app.appInfo?.android?.rating_count.replace(/,/g, '') || '0'),
              version: app.appInfo?.ios?.version || app.appInfo?.android?.version || 'N/A',
              lastUpdate: app.appInfo?.ios?.update_date || app.appInfo?.android?.update_date || 'N/A',
              appStoreUrl: app.appStoreUrl || '',
              playStoreUrl: app.playStoreUrl || '',
              appInfo: app.appInfo,
              reviews,
              uxScores,
              reviewStats,
              keywordFrequency,
              processedReviews: allReviews
            };

            // 使用 Gemini 分析功能特點
            const features = await analyzeAppFeatures(baseData);

            // 使用 Gemini 分析評論
            const reviewAnalysis = await analyzeReviews(baseData);

            // 使用 Gemini 分析用戶體驗
            const uxAnalysis = await analyzeUserExperience(baseData);
            
            return {
              ...baseData,
              features,
              reviewAnalysis,
              uxAnalysis
            };
          })
        );

        setAppData(initializedData);
      } catch (error) {
        console.error('初始化資料時發生錯誤:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    if (selectedApps.length > 0) {
      initializeData();
    }
  }, [selectedApps]);

  if (!selectedApps || selectedApps.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">競爭對手分析</h1>
          <button
            onClick={onGoBack}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            返回爬取資料
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-500">尚未選擇任何應用程式進行分析</p>
          <button
            onClick={onGoBack}
            className="mt-4 mx-auto block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回選擇應用程式
          </button>
        </div>
      </div>
    );
  }

  // 計算情感分析數據
  const sentimentData = appData.map(app => ({
    name: app.name,
    positive: app.reviewStats.positive,
    neutral: app.reviewStats.neutral,
    negative: app.reviewStats.negative
  }));

  // 計算用戶體驗比較數據
  const uxComparisonData = [
    { name: "會員登入", key: "memberlogin" },
    { name: "搜尋功能", key: "search" },
    { name: "商品相關", key: "product" },
    { name: "結帳付款", key: "checkout" },
    { name: "客戶服務", key: "service" },
    { name: "其他", key: "other" }
  ].map(item => {
    const result: any = { name: item.name };
    appData.forEach(app => {
      result[app.name] = app.uxScores[item.key as keyof typeof app.uxScores];
    });
    return result;
  });

  // 生成圖表顏色映射
  const appColorMap = Object.fromEntries(
    appData.map((app, index) => [app.name, COLORS[index % COLORS.length]])
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">正在進行競品分析</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>分析進度</span>
                  <span>請稍候...</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300 animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                正在處理評論數據並生成分析報告，這可能需要一些時間...
              </p>
            </div>
          </div>
        </div>
      )}

      {isPPTGenerating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">正在生成簡報</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{pptProgress.phase}</span>
                  <span>{pptProgress.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${pptProgress.progress}%` }} 
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                正在生成專業的競品分析簡報，請稍候...
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>競爭對手分析</CardTitle>
              <CardDescription>比較各競爭對手的產品功能、用戶體驗和評論分析。</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onGoBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回爬取資料
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end items-center mb-6 gap-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="選擇時間範圍" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="7days">過去7天</SelectItem>
                <SelectItem value="30days">過去30天</SelectItem>
                <SelectItem value="90days">過去90天</SelectItem>
                <SelectItem value="1year">過去1年</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDownloadType} onValueChange={setSelectedDownloadType}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="選擇下載內容" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="full_report">完整分析報告</SelectItem>
                <SelectItem value="raw_data">原始數據</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-white border-gray-200" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">總覽</TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-white">功能比較</TabsTrigger>
              <TabsTrigger value="ux" className="data-[state=active]:bg-white">用戶體驗</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white">評論分析</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {appData.map((app) => (
                  <Card key={app.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <img
                          src={app.logo}
                          alt={`${app.name} Logo`}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div>
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                          <CardDescription>版本 {app.version}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">iOS: {app.iosRating}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium">Android: {app.androidRating}</span>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>評分則數</span>
                            <span>
                              iOS: {formatReviewCount(app.iosReviews)}, Android: {formatReviewCount(app.androidReviews)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>最後更新</span>
                            <span>{app.lastUpdate}</span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          className="w-full flex items-center justify-center"
                          onClick={() => toggleAppDetails(app.id)}
                        >
                          {expandedApp === app.id ? (
                            <>
                              收起詳情 <ChevronUp className="ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              查看詳情 <ChevronDown className="ml-1 h-4 w-4" />
                            </>
                          )}
                        </Button>

                        {expandedApp === app.id && (
                          <div className="pt-2 border-t">
                            <h4 className="font-medium mb-2">用戶體驗評分</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">會員登入</span>
                                <span className="text-sm font-medium">{app.uxScores.memberlogin}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.memberlogin}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">搜尋功能</span>
                                <span className="text-sm font-medium">{app.uxScores.search}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.search}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">商品相關</span>
                                <span className="text-sm font-medium">{app.uxScores.product}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.product}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">結帳付款</span>
                                <span className="text-sm font-medium">{app.uxScores.checkout}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.checkout}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">客戶服務</span>
                                <span className="text-sm font-medium">{app.uxScores.service}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.service}%` }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>評論情緒分析</CardTitle>
                  <CardDescription>各App正面、中性與負面評論比例</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sentimentData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar dataKey="positive" stackId="a" fill="#4ade80" name="正面評論" />
                        <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="中性評論" />
                        <Bar dataKey="negative" stackId="a" fill="#f87171" name="負面評論" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>功能比較分析</CardTitle>
                  <CardDescription>AI 分析各應用程式的主要功能特點與優劣勢</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {appData.map((app) => (
                      <Card key={`${app.id}-features`} className="overflow-hidden">
                        <CardHeader className="border-b bg-gray-50">
                          <div className="flex items-start gap-4">
                            <img 
                              src={app.appInfo?.ios?.icon_url || app.appInfo?.android?.icon_url} 
                              alt={app.name} 
                              className="w-12 h-12 rounded-lg"
                            />
                            <div>
                              <CardTitle className="text-lg">{app.name}</CardTitle>
                              <CardDescription>{app.appInfo?.ios?.category || app.appInfo?.android?.category}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                                  <path d="M5 3v4"/>
                                  <path d="M19 17v4"/>
                                  <path d="M3 5h4"/>
                                  <path d="M17 19h4"/>
                                </svg>
                                核心功能
                              </h4>
                              <div className="space-y-2">
                                {app.features?.core?.map((feature, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                                  <path d="M8 11h8"/>
                                  <path d="M12 15V7"/>
                                </svg>
                                競爭優勢
                              </h4>
                              <div className="space-y-2">
                                {app.features?.advantages?.map((advantage, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                    </svg>
                                    <span className="text-sm">{advantage}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                待改進項目
                              </h4>
                              <div className="space-y-2">
                                {app.features?.improvements?.map((improvement, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                    </svg>
                                    <span className="text-sm">{improvement}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ux" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>用戶體驗雷達圖</CardTitle>
                  <CardDescription>各App六大用戶體驗類別評分比較</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appData.map((app) => (
                      <div key={`${app.id}-radar`} className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={[
                              { subject: "會員登入", A: app.uxScores.memberlogin, fullMark: 100 },
                              { subject: "搜尋功能", A: app.uxScores.search, fullMark: 100 },
                              { subject: "商品相關", A: app.uxScores.product, fullMark: 100 },
                              { subject: "結帳付款", A: app.uxScores.checkout, fullMark: 100 },
                              { subject: "客戶服務", A: app.uxScores.service, fullMark: 100 },
                              { subject: "其他", A: app.uxScores.other, fullMark: 100 },
                            ]}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                              name={app.name}
                              dataKey="A"
                              stroke={appColorMap[app.name]}
                              fill={appColorMap[app.name]}
                              fillOpacity={0.6}
                            />
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>用戶體驗詳細評分</CardTitle>
                  <CardDescription>各App六大用戶體驗類別的詳細評分與比較</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">類別</th>
                          {appData.map((app) => (
                            <th key={`${app.id}-header`} className="text-center p-2">
                              {app.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">會員登入</td>
                          {appData.map((app) => (
                            <td key={`${app.id}-login`} className="text-center p-2">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-medium ${
                                    app.uxScores.memberlogin === Math.max(...appData.map((a) => a.uxScores.memberlogin))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.memberlogin}%
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">搜尋功能</td>
                          {appData.map((app) => (
                            <td key={`${app.id}-search`} className="text-center p-2">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-medium ${
                                    app.uxScores.search ===
                                    Math.max(...appData.map((a) => a.uxScores.search))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.search}%
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">商品相關</td>
                          {appData.map((app) => (
                            <td key={`${app.id}-product`} className="text-center p-2">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-medium ${
                                    app.uxScores.product ===
                                    Math.max(...appData.map((a) => a.uxScores.product))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.product}%
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">結帳付款</td>
                          {appData.map((app) => (
                            <td key={`${app.id}-checkout`} className="text-center p-2">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-medium ${
                                    app.uxScores.checkout === Math.max(...appData.map((a) => a.uxScores.checkout))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.checkout}%
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">客戶服務</td>
                          {appData.map((app) => (
                            <td key={`${app.id}-service`} className="text-center p-2">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-medium ${
                                    app.uxScores.service ===
                                    Math.max(...appData.map((a) => a.uxScores.service))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.service}%
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="p-2 font-medium">其他</td>
                          {appData.map((app) => (
                            <td key={`${app.id}-others`} className="text-center p-2">
                              <div className="flex items-center justify-center">
                                <span
                                  className={`font-medium ${
                                    app.uxScores.other === Math.max(...appData.map((a) => a.uxScores.other))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.other}%
                                </span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appData.map((app) => (
                  <Card key={`${app.id}-ux-details`}>
                    <CardHeader>
                      <CardTitle>{app.name} 用戶體驗分析</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                              <path d="M8 11h8"/>
                              <path d="M12 15V7"/>
                            </svg>
                            主要優勢
                          </h4>
                          <ul className="space-y-2">
                            {app.uxAnalysis?.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            待改進項目
                          </h4>
                          <ul className="space-y-2">
                            {app.uxAnalysis?.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                <span className="text-sm">{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <h4 className="text-base font-medium text-slate-800 mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                            整體分析摘要
                          </h4>
                          <div className="text-sm text-slate-700 space-y-2">
                            <p>{app.uxAnalysis?.summary}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appData.map((currentApp) => (
                  <Card key={`${currentApp.id}-reviews`} className="overflow-hidden">
                    <CardHeader className="border-b bg-gray-50">
                      <div className="flex items-center gap-4">
                        <img 
                          src={currentApp.logo} 
                          alt={currentApp.name} 
                          className="w-12 h-12 rounded-lg shadow-sm"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{currentApp.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {calculateAverageRating(currentApp.processedReviews)}
                            </div>
                            <span className="text-gray-300">|</span>
                            <span>評論 {currentApp.processedReviews.length}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-8">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Select
                              value={reviewFilters.sentiment}
                              onValueChange={(value) => setReviewFilters(prev => ({ ...prev, sentiment: value }))}
                            >
                              <SelectTrigger className="w-[140px] bg-white">
                                <SelectValue placeholder="情感篩選" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="all">全部評論</SelectItem>
                                <SelectItem value="positive">正面評論</SelectItem>
                                <SelectItem value="negative">負面評論</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Select
                              value={reviewFilters.sortBy}
                              onValueChange={(value) => setReviewFilters(prev => ({ ...prev, sortBy: value }))}
                            >
                              <SelectTrigger className="w-[140px] bg-white">
                                <SelectValue placeholder="排序方式" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="date">依日期</SelectItem>
                                <SelectItem value="rating">依評分</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-white"
                              onClick={() => setReviewFilters(prev => ({
                                ...prev,
                                sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
                              }))}
                            >
                              {reviewFilters.sortOrder === 'desc' ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          {/* 評論列表 */}
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {getFilteredReviews(currentApp.processedReviews, reviewFilters).map((review: Review, index: number) => (
                                  <div 
                                    key={index} 
                                    className={`bg-white rounded-lg p-3 shadow-sm transition-all duration-200 ${
                                      review.sentiment.includes('正面') ? 'hover:border-emerald-200' : 
                                      review.sentiment.includes('負面') ? 'hover:border-rose-200' : 
                                      'hover:border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-3 w-3 ${
                                                i < review.rating
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "fill-gray-200 text-gray-200"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-xs text-gray-500 md:text-sm">
                                          {new Date(review.date).toLocaleDateString('zh-TW')}
                                        </span>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className={`
                                          ${review.sentiment.includes('正面') 
                                            ? 'text-emerald-600 border-emerald-200 bg-emerald-50' 
                                            : review.sentiment.includes('負面')
                                            ? 'text-rose-600 border-rose-200 bg-rose-50'
                                            : 'text-gray-600 border-gray-200 bg-gray-50'
                                          }
                                        `}
                                      >
                                        {review.platform}
                                      </Badge>
                                    </div>
                                    <div className="relative">
                                      <p className={`text-sm md:text-base text-gray-700 ${
                                        expandedReviews[`${currentApp.id}-${index}`] ? '' : 'line-clamp-3'
                                      } transition-all duration-200`}>
                                        {review.review}
                                      </p>
                                      <button 
                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 focus:outline-none"
                                        onClick={() => toggleReviewExpand(`${currentApp.id}-${index}`)}
                                      >
                                        {expandedReviews[`${currentApp.id}-${index}`] ? '收起' : '展開全文'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 評論統計和分析 */}
                          <div className="space-y-4">
                            <div className="p-4 bg-white rounded-lg border">
                              <h5 className="text-base font-medium mb-4">評論統計</h5>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>正面評價</span>
                                    <span>{currentApp.reviewStats.positive}%</span>
                                  </div>
                                  <Progress value={currentApp.reviewStats.positive} className="bg-gray-100" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>負面評價</span>
                                    <span>{currentApp.reviewStats.negative}%</span>
                                  </div>
                                  <Progress value={currentApp.reviewStats.negative} className="bg-gray-100" />
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-white rounded-lg border">
                              <h5 className="text-base font-medium mb-4">熱門關鍵詞</h5>
                              <div className="flex flex-wrap gap-2">
                                {currentApp.keywordFrequency.map((item: { keyword: string; count: number }, index: number) => (
                                  <Badge 
                                    key={index}
                                    variant="secondary"
                                    className={`
                                      ${index === 0 ? 'bg-sky-100 text-sky-800 hover:bg-sky-200' : 
                                        index === 1 ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                                        index === 2 ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                        'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                                    `}
                                  >
                                    {item.keyword} ({item.count})
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <Button 
                              className="w-full" 
                              variant="outline"
                              onClick={() => setShowAnalysisSummary(currentApp.id)}
                            >
                              查看完整評論分析
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showAnalysisSummary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 divide-y divide-gray-100">
            {appData.map((app) => {
              if (app.id === showAnalysisSummary) {
                return (
                  <div key={app.id}>
                    <div className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={app.logo} alt={app.name} className="w-10 h-10 rounded-lg" />
                          <div>
                            <h3 className="text-xl font-semibold">{app.name}</h3>
                            <p className="text-sm text-gray-500">評論分析摘要</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAnalysisSummary(null)}
                          className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-gradient-to-b from-gray-50 to-white">
                      <div className="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                          <path d="M8 11h8"/>
                          <path d="M12 15V7"/>
                        </svg>
                        <h4 className="font-medium text-lg">主要優勢</h4>
                      </div>
                      <div className="space-y-3 ml-6">
                        {app.reviewAnalysis?.advantages.map((advantage: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 group">
                            <div className="mt-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                            </div>
                            <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">{advantage}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <h4 className="font-medium text-lg">待改進項目</h4>
                      </div>
                      <div className="space-y-3 ml-6">
                        {app.reviewAnalysis?.improvements.map((improvement: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 group">
                            <div className="mt-1.5">
                              <div className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                            </div>
                            <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">{improvement}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                      <div className="flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                        </svg>
                        <h4 className="font-medium text-lg">整體評論摘要</h4>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{app.reviewAnalysis?.summary}</p>
                      </div>
                    </div>

                    <div className="p-6 flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowAnalysisSummary(null)}>
                        關閉
                      </Button>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  )
} 