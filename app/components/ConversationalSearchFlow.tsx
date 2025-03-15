'use client';

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Send, Download, ArrowRight, User, Smartphone, CheckCircle, Copy, ArrowLeft, Check } from "lucide-react";
import CompetitiveAnalysis from "./competitive-analysis";

// Define the steps in the flow
type FlowStep = "search" | "url-scraping" | "scraping-progress" | "scraping-complete" | "analysis";

interface SearchResult {
  id: string;
  name: string;
  selected: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
  isLoading?: boolean;
  error?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MultiAppSearchResponse {
  results: {
    name: string;
    appStoreUrl?: string;
    playStoreUrl?: string;
    error?: string;
    link: string;
  }[];
}

const INITIAL_MESSAGE = {
  role: "assistant" as const,
  content: "您好！我可以幫您搜尋台灣相關的應用程式。請告訴我您想了解哪個應用程式的競爭對手呢？",
  timestamp: new Date(),
};

const SYSTEM_PROMPT = `你是一個專業的應用商店分析助手。請遵循以下規則：

1. 一般搜尋模式：
   - 當用戶提供明確的App名稱時，直接列出該領域前五名的台灣主要競爭對手名稱
   - 當用戶提供的App名稱不完整或不清楚時，請提供App Store和Google Play的搜尋連結，請用戶提供完整名稱

2. 新增應用程式模式：
   - 當用戶想要新增應用程式時，請詢問具體是哪個應用程式
   - 如果用戶提供的名稱不完整或不清楚，請詢問是否為某個特定的應用程式
   - 確認用戶提供的應用程式名稱後，列出完整的應用程式名稱供確認
   - 不要在這個模式下提供競爭對手名稱

3. 回應格式：
   - 一般模式下使用無序列表（-）列出名稱
   - 新增模式下直接列出完整應用程式名稱

4. 範例回應：
   一般模式：
   "- IKEA
   - Nitori
   - 特力屋"

   新增模式：
   用戶：我想新增Netflix
   助手：請問您要新增的是"Netflix"這個串流影音應用程式嗎？請回覆「是」來確認。

   用戶：我想新增IG
   助手：請問您要新增的是"Instagram"這個應用程式嗎？請回覆「是」來確認。
   
5. 用戶提供不明確名稱時：
   "請提供完整的應用程式名稱，您可以透過以下連結搜尋：
   App Store: <a href='https://apps.apple.com/tw/search' target='_blank' rel='noopener noreferrer'>點擊這裡搜尋</a>
   Google Play: <a href='https://play.google.com/store/search?hl=zh_TW' target='_blank' rel='noopener noreferrer'>點擊這裡搜尋<`;

export default function ConversationalSearchFlow() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<FlowStep>("search");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([INITIAL_MESSAGE]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedApps, setSelectedApps] = useState<SearchResult[]>([]);
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "searching" | "scraping" | "completed" | "error">("idle");
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: { appStore: boolean; playStore: boolean } }>({});
  const [apiCallInProgress, setApiCallInProgress] = useState(false);
  const [searchResultsHistory, setSearchResultsHistory] = useState<{ [key: string]: SearchResult[] }>({});
  const [currentSearchMessageIndex, setCurrentSearchMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to bottom only when new messages are added in the chat window
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [conversation]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 生成唯一ID的函數
  const generateUniqueId = (name: string) => {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const callGeminiAPI = async (userMessage: string) => {
    if (apiCallInProgress) {
      return null;
    }

    try {
      setApiCallInProgress(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...conversation, { role: 'user', content: userMessage }],
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // 解析回應中的應用程式名稱
      const appNames = data.response
        .split('\n')
        .filter((line: string) => line.match(/^[-\d\s]*[^-\n]+$/))
        .map((line: string) => line.replace(/^[-\d\s]*/, '').trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, '')) // 移除數字符號（如 "1. "）
        .filter((name: string) => name.length > 0);

      // 生成搜索結果但不立即顯示
      if (appNames.length > 0) {
        const results = appNames.map((name: string) => ({
          id: generateUniqueId(name),
          name: name,
          selected: false
        }));

        // 將新的搜索結果存入歷史記錄
        const newMessageIndex = conversation.length;
        setSearchResultsHistory(prev => ({
          ...prev,
          [newMessageIndex]: results
        }));
      }

      return data.response;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return '抱歉，我暫時無法處理您的請求。請稍後再試。';
    } finally {
      setApiCallInProgress(false);
    }
  };

  const formatMessageContent = (
    content: string,
    isAssistant: boolean,
    userQuery?: string,
    messageIndex?: number
  ) => {
    // Check if we're in custom app add mode
    const isCustomAppAddMode = content.includes("請告訴我您想要新增的應用程式名稱") || 
                              content.includes("請問您要新增的是") ||
                              content.includes("請問您要找的是") ||
                              content.includes("已將") ||
                              (messageIndex && messageIndex > 0 && conversation[messageIndex - 1]?.content.includes("請告訴我您想要新增的應用程式名稱"));

    // Check if the message contains search links
    const hasSearchLinks = content.includes('點擊這裡搜尋');
    
    // Extract app names from the message content only if it doesn't contain search links
    const appNames = !hasSearchLinks ? content.split('\n')
      .filter(line => line.match(/^[-\s]*([^-\n：。，、？！]+)$/))
      .map(line => line.replace(/^[-\s]*/, '').trim())
      .map(line => line.replace(/^\d+\.\s*/, '')) // 移除數字符號（如 "1. "）
      .filter(name => 
        name.length > 0 && 
        !name.includes("好的，我確認您要新增以下應用程式") &&
        !name.includes("請告訴我") &&
        !name.includes("請問您") &&
        !name.includes("已將")
      ) : [];
    
    const formattedContent = content.split('\n').map((line, lineIndex) => {
      // Check if line contains HTML link
      if (line.includes('<a')) {
        const styledLine = line.replace(
          /<a /g,
          '<a class="text-blue-600 hover:text-blue-800 hover:underline transition-colors" '
        );
        return (
          <p
            key={`link-${lineIndex}-${line.slice(0, 20)}`}
            className={line.startsWith('- ') ? 'ml-4' : ''}
            dangerouslySetInnerHTML={{ __html: styledLine }}
          />
        );
      }
      
      // Handle regular text lines
      return (
        <p
          key={`text-${lineIndex}-${line.slice(0, 20)}`}
          className={`
            ${line.startsWith('- ') ? 'ml-4' : ''}
            ${line.includes('**') ? 'font-semibold' : ''}
          `}
        >
          {line.replace(/\*\*/g, '')}
        </p>
      );
    });

    // Only show add button for assistant messages with app names and no search links
    // Don't show button for initial message, custom app add flow, or when in add mode
    if (isAssistant && appNames.length > 0 && !hasSearchLinks && 
        typeof messageIndex === 'number' && 
        messageIndex > 0 && 
        content !== INITIAL_MESSAGE.content &&
        !isCustomAppAddMode) {
      return (
        <>
          {formattedContent}
          <div className="mt-4">
            <Button
              onClick={() => addAppsToResults(appNames)}
              className="bg-black hover:bg-black/90 text-white flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              新增這些應用程式
            </Button>
          </div>
        </>
      );
    }

    return formattedContent;
  };

  const addAppsToResults = (appNames: string[]) => {
    // 創建新的應用程式對象，但排除已存在的
    const newApps = appNames
      .filter(name => !searchResults.some(existing => existing.name === name))
      .filter(name => name.trim().length > 0 && !name.includes("好的，我確認您要新增以下應用程式"))
      .map(name => ({
        id: generateUniqueId(name),
        name: name,
        selected: false
      }));

    if (newApps.length > 0) {
      setSearchResults(prev => [...prev, ...newApps]);
    }
  };

  const handleCustomAppAdd = async () => {
    const userMessage = {
      role: "user" as const,
      content: "我想新增應用程式來比較",
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    const aiResponse = {
      role: "assistant" as const,
      content: "請告訴我您想要新增的應用程式名稱，可以一次提供多個，我會幫您確認完整的應用程式名稱。",
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const handleAppNameConfirmation = async (userInput: string) => {
    const lastMessage = conversation[conversation.length - 1];
    
    // 如果上一條消息是請求提供應用程式名稱
    if (lastMessage.content === "請告訴我您想要新增的應用程式名稱，可以一次提供多個，我會幫您確認完整的應用程式名稱。") {
      // 首先使用 LLM 來解析和確認應用程式名稱
      const aiResponse = await callGeminiAPI(`用戶提供了以下輸入："${userInput}"
請幫我：
1. 判斷這是否包含應用程式名稱
2. 如果包含多個名稱，請分別列出
3. 對每個名稱進行標準化（例如：IG -> Instagram）
4. 確認是否為知名應用程式

回覆格式要求：
- 如果是單個應用程式，請回覆：「請問您要新增「應用程式名稱」這個應用程式嗎？請回覆「是」來確認。」
- 如果是多個應用程式，請回覆：「請分別確認您想新增的應用程式名稱：」，然後列出編號清單
- 如果不確定是應用程式，請詢問更多資訊
- 如果需要更明確的名稱，請提供建議選項`);

      if (aiResponse) {
        const assistantMessage = {
          role: "assistant" as const,
          content: aiResponse,
          timestamp: new Date(),
        };
        setConversation(prev => [...prev, assistantMessage]);
      }
      return;
    }

    // 處理用戶的確認回應
    if (userInput.toLowerCase() === "是" || userInput.toLowerCase() === "yes" || userInput.toLowerCase() === "對") {
      // 使用 LLM 來提取和確認應用程式名稱
      const aiResponse = await callGeminiAPI(`基於上一條消息："${lastMessage.content}"
請：
1. 提取其中提到的應用程式名稱
2. 確認這些是有效的應用程式
3. 生成確認消息
4. 如果提取到多個名稱，請使用頓號分隔
回覆格式：
如果成功提取到應用程式名稱，請直接回覆：「已確認要新增「應用程式名稱」這個應用程式。」
如果提取到多個名稱，請使用頓號分隔：「已確認要新增「應用程式1」、「應用程式2」這些應用程式。」`);

      if (aiResponse) {
        const assistantMessage = {
          role: "assistant" as const,
          content: aiResponse,
          timestamp: new Date(),
        };
        setConversation(prev => [...prev, assistantMessage]);
        return;
      }
    }

    // 如果用戶回答否或提供其他資訊
    const aiResponse = await callGeminiAPI(`用戶說：${userInput}
請根據用戶的回答：
1. 判斷是否提供了新的應用程式名稱
2. 如果是新的名稱，請確認是否為知名應用程式
3. 如果是否定回答，請詢問用戶想要新增哪個應用程式
4. 如果提供了更多資訊，請嘗試理解並確認具體的應用程式

請用對話方式回應，確保回答簡潔明確。
回覆格式應該類似：「請問您要新增的是「XX」這個應用程式嗎？」`);

    if (aiResponse) {
      const assistantMessage = {
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, assistantMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!query.trim() || apiCallInProgress) return;

    const userMessage = {
      role: "user" as const,
      content: query,
      timestamp: new Date(),
    };

    setConversation(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    // 檢查是否在新增應用程式的流程中
    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage && (
      lastMessage.content === "請告訴我您想要新增的應用程式名稱，可以一次提供多個，我會幫您確認完整的應用程式名稱。" ||
      lastMessage.content.includes("請確認這些是您要新增的應用程式嗎？")
    )) {
      await handleAppNameConfirmation(query);
    } else {
      // 正常的搜索流程
      const aiResponse = await callGeminiAPI(query);
      
      if (aiResponse) {
        const assistantMessage = {
          role: "assistant" as const,
          content: aiResponse,
          timestamp: new Date(),
        };

        setConversation(prev => [...prev, assistantMessage]);

        // 解析回應中的應用程式名稱
        const appNames = aiResponse
          .split('\n')
          .filter((line: string) => line.match(/^[-\d\s]*[^-\n]+$/))
          .map((line: string) => line.replace(/^[-\d\s]*/, '').trim())
          .map((line: string) => line.replace(/^\d+\.\s*/, '')) // 移除數字符號（如 "1. "）
          .filter((name: string) => name.length > 0);

        if (appNames.length > 0) {
          const results = appNames.map((name: string) => ({
            id: generateUniqueId(name),
            name: name,
            selected: false
          }));

          // 更新歷史記錄
          setSearchResultsHistory(prev => ({
            ...prev,
            [conversation.length]: results
          }));
        }
      }
    }
    
    setIsLoading(false);
  };

  const showSearchResults = (messageIndex: number) => {
    console.log('Showing search results for message index:', messageIndex);
    console.log('Current history:', searchResultsHistory);
    console.log('Current search message index:', currentSearchMessageIndex);
    console.log('Show results:', showResults);
    
    // 如果點擊的是當前顯示的結果，則隱藏結果
    if (currentSearchMessageIndex === messageIndex && showResults) {
      setShowResults(false);
      setCurrentSearchMessageIndex(null);
      return;
    }

    // 從歷史記錄中獲取結果
    const results = searchResultsHistory[messageIndex];
    if (results) {
      // 顯示新的結果，同步已選擇的應用程式狀態
      setSearchResults(results.map(app => ({
        ...app,
        // 檢查這個應用程式是否在全局選中列表中
        selected: selectedApps.some(selectedApp => selectedApp.name === app.name)
      })));
      setShowResults(true);
      setCurrentSearchMessageIndex(messageIndex);
    } else {
      // 如果沒有找到結果，從消息內容中解析
      const message = conversation[messageIndex];
      if (message && message.content) {
        const appNames = message.content
          .split('\n')
          .filter(line => line.match(/^[-\d\s]*[^-\n]+$/))
          .map(line => line.replace(/^[-\d\s]*/, '').trim())
          .map(line => line.replace(/^\d+\.\s*/, '')) // 移除數字符號（如 "1. "）
          .filter(name => name.length > 0);

        const newResults = appNames.map(name => ({
          id: generateUniqueId(name),
          name: name,
          // 檢查這個應用程式是否在全局選中列表中
          selected: selectedApps.some(selectedApp => selectedApp.name === name)
        }));

        // 更新歷史記錄
        setSearchResultsHistory(prev => ({
          ...prev,
          [messageIndex]: newResults
        }));

        setSearchResults(newResults);
        setShowResults(true);
        setCurrentSearchMessageIndex(messageIndex);
      }
    }
  };

  const toggleAppSelection = (appId: string) => {
    const app = searchResults.find(a => a.id === appId);
    if (!app) return;

    // 檢查是否已經選擇了三個不同的應用程式
    const uniqueSelectedApps = new Set(selectedApps.map(a => a.name));
    
    // 如果是取消選擇，或者還沒有選滿三個，就允許操作
    if (app.selected || uniqueSelectedApps.size < 3) {
      // 更新當前搜索結果的選擇狀態
      setSearchResults(prevResults =>
        prevResults.map(a => 
          a.id === appId ? { ...a, selected: !a.selected } : a
        )
      );

      // 更新選中的應用程式列表
      setSelectedApps(prevSelected => {
        if (app.selected) {
          // 如果是取消選擇，從列表中移除
          return prevSelected.filter(a => a.name !== app.name);
        } else {
          // 如果是新增選擇
          return [...prevSelected, { ...app, selected: true }];
        }
      });

      // 更新所有歷史記錄中的選擇狀態
      setSearchResultsHistory(prev => {
        const newHistory = { ...prev };
        // 遍歷所有歷史記錄，更新相同名稱應用程式的選擇狀態
        Object.keys(newHistory).forEach(key => {
          newHistory[key] = newHistory[key].map(historyApp => 
            historyApp.name === app.name 
              ? { ...historyApp, selected: !app.selected }
              : historyApp
          );
        });
        return newHistory;
      });
    }
  };

  const handleUrlInput = (appId: string, store: "appStore" | "playStore", url: string) => {
    setSearchResults(prevResults =>
      prevResults.map(app =>
        app.id === appId ? { ...app, [store === "appStore" ? "appStoreUrl" : "playStoreUrl"]: url } : app
      )
    );
    setSelectedApps(prevApps =>
      prevApps.map(app =>
        app.id === appId ? { ...app, [store === "appStore" ? "appStoreUrl" : "playStoreUrl"]: url } : app
      )
    );
  };

  const copyToClipboard = async (appId: string, store: "appStore" | "playStore", url: string) => {
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      // 更新特定按鈕的狀態
      setCopySuccess(prev => ({
        ...prev,
        [appId]: {
          ...prev[appId],
          [store]: true
        }
      }));
      
      // 1秒後重置狀態
      setTimeout(() => {
        setCopySuccess(prev => ({
          ...prev,
          [appId]: {
            ...prev[appId],
            [store]: false
          }
        }));
      }, 1000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const startScraping = () => {
    setCurrentStep("scraping-progress");
    setScrapingStatus("scraping");
    setScrapingProgress(0);

    const interval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScrapingStatus("completed");
          setCurrentStep("scraping-complete");
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const proceedToAnalysis = () => {
    setCurrentStep("analysis");
  };

  const goBack = () => {
    if (currentStep === "url-scraping") {
      setCurrentStep("search");
    } else if (currentStep === "scraping-progress" || currentStep === "scraping-complete") {
      setCurrentStep("url-scraping");
    } else if (currentStep === "analysis") {
      setCurrentStep("scraping-complete");
    }
  };

  const extractKeywords = (text: string): string[] => {
    // 移除特殊字符，保留中文、英文、數字
    const cleanText = text.toLowerCase()
      .replace(/[+]/g, ' ')  // 將加號替換為空格
      .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, ' '); // 只保留英文、數字、中文和空格

    // 分離英文和數字
    const englishAndNumbers = cleanText.match(/[a-z0-9]+/g) || [];
    
    // 分離中文字（按每個字分開）
    const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g) || [];
    
    // 組合中文詞（2-4個字的組合）
    const chinesePhrases: string[] = [];
    for (let i = 0; i < chineseChars.length; i++) {
      // 單字
      chinesePhrases.push(chineseChars[i]);
      
      // 雙字詞
      if (i + 1 < chineseChars.length) {
        chinesePhrases.push(chineseChars[i] + chineseChars[i + 1]);
      }
      
      // 三字詞
      if (i + 2 < chineseChars.length) {
        chinesePhrases.push(chineseChars[i] + chineseChars[i + 1] + chineseChars[i + 2]);
      }
    }

    // 合併所有關鍵字並去重
    const allKeywords = [...englishAndNumbers, ...chinesePhrases]
      .filter(k => k.length >= 2) // 過濾掉太短的關鍵字
      .filter(k => {
        // 過濾掉純數字
        const isOnlyNumbers = /^\d+$/.test(k);
        return !isOnlyNumbers;
      });

    return Array.from(new Set(allKeywords));
  };

  // 選擇主要關鍵字的邏輯也需要改進
  const selectPrimaryKeyword = (keywords: string[]): string => {
    // 如果有英文關鍵字，優先使用
    const englishKeyword = keywords.find(k => /^[a-z0-9]+$/.test(k));
    if (englishKeyword) {
      return englishKeyword;
    }

    // 否則使用最長的中文關鍵字
    const sortedByLength = [...keywords].sort((a, b) => b.length - a.length);
    return sortedByLength[0] || '';
  };

  const searchAppUrls = async (apps: SearchResult[]) => {
    try {
      setSelectedApps(prev => prev.map(app => ({
        ...app,
        isLoading: true,
        error: undefined
      })));

      // 處理每個應用的搜尋
      const results = await Promise.all(apps.map(async (app) => {
        try {
          // 基本關鍵字提取
          const extractBasicKeywords = (text: string): string[] => {
            const cleanText = text.toLowerCase()
              .replace(/[+]/g, ' ')
              .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, ' ');
            return cleanText.split(/\s+/).filter(k => k.length >= 2);
          };

          // 進階關鍵字提取
          const extractAdvancedKeywords = (text: string): string[] => {
            const cleanText = text.toLowerCase()
              .replace(/[+]/g, ' ')
              .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, ' ');

            // 分離英文和數字
            const englishAndNumbers = cleanText.match(/[a-z0-9]+/g) || [];
            
            // 分離中文字
            const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g) || [];
            
            // 組合中文詞
            const chinesePhrases: string[] = [];
            for (let i = 0; i < chineseChars.length; i++) {
              chinesePhrases.push(chineseChars[i]);
              if (i + 1 < chineseChars.length) {
                chinesePhrases.push(chineseChars[i] + chineseChars[i + 1]);
              }
              if (i + 2 < chineseChars.length) {
                chinesePhrases.push(chineseChars[i] + chineseChars[i + 1] + chineseChars[i + 2]);
              }
            }

            return Array.from(new Set([...englishAndNumbers, ...chinesePhrases]))
              .filter(k => k.length >= 2)
              .filter(k => !/^\d+$/.test(k));
          };

          // 選擇主要關鍵字
          const selectPrimaryKeyword = (keywords: string[]): string => {
            const englishKeyword = keywords.find(k => /^[a-z0-9]+$/.test(k));
            return englishKeyword || keywords.sort((a, b) => b.length - a.length)[0] || '';
          };

          // 計算匹配分數
          const calculateMatchScore = (result: any, keywords: string[]) => {
            if (!result?.name) return { score: 0, matchPercentage: 0 };
            
            const resultKeywords = extractAdvancedKeywords(result.name);
            let score = 0;
            const matchedKeywords = new Set<string>();
            
            keywords.forEach(searchKeyword => {
              resultKeywords.forEach(resultKeyword => {
                if (searchKeyword === resultKeyword) {
                  score += 2;
                  matchedKeywords.add(searchKeyword);
                } else if (resultKeyword.includes(searchKeyword) || searchKeyword.includes(resultKeyword)) {
                  score += 1;
                  matchedKeywords.add(searchKeyword);
                }
              });
            });

            const matchPercentage = (matchedKeywords.size / keywords.length) * 100;
            return { score, matchPercentage };
          };

          // 執行 API 搜尋
          const searchWithKeywords = async (keywords: string[], primaryKeyword: string) => {
            const params = new URLSearchParams();
            params.append('search_terms', primaryKeyword);

            const apiUrl = `${process.env.NEXT_PUBLIC_MULTI_APPS_SEARCH_API_URL}?${params.toString()}`;
            const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MULTI_APPS_SEARCH_API_KEY}`
              }
            });

            if (!response.ok) {
              throw new Error(`API 請求失敗: ${response.status}`);
            }

            const data: MultiAppSearchResponse = await response.json();

            // 安全檢查：確保 data.results 存在且是陣列
            if (!data?.results || !Array.isArray(data.results)) {
              throw new Error('API 回應格式錯誤');
            }

            const appStoreResults = data.results
              .filter(result => result?.link?.includes('apps.apple.com'))
              .map(result => ({
                result,
                ...calculateMatchScore(result, keywords)
              }))
              .sort((a, b) => b.score - a.score);

            const playStoreResults = data.results
              .filter(result => result?.link?.includes('play.google.com'))
              .map(result => ({
                result,
                ...calculateMatchScore(result, keywords)
              }))
              .sort((a, b) => b.score - a.score);

            return { appStoreResults, playStoreResults };
          };

          // 嘗試進階關鍵字搜尋
          const tryAdvancedSearch = async () => {
            const advancedKeywords = extractAdvancedKeywords(app.name);
            const advancedPrimaryKeyword = selectPrimaryKeyword(advancedKeywords);
            
            console.log('進階關鍵字搜尋:', {
              name: app.name,
              keywords: advancedKeywords,
              primary: advancedPrimaryKeyword
            });

            return await searchWithKeywords(advancedKeywords, advancedPrimaryKeyword);
          };

          // 先嘗試基本搜尋
          let searchResults;
          try {
            const basicKeywords = extractBasicKeywords(app.name);
            const basicPrimaryKeyword = selectPrimaryKeyword(basicKeywords);
            
            console.log('基本關鍵字搜尋:', {
              name: app.name,
              keywords: basicKeywords,
              primary: basicPrimaryKeyword
            });

            searchResults = await searchWithKeywords(basicKeywords, basicPrimaryKeyword);
          } catch (error) {
            console.log(`基本搜尋失敗，嘗試進階搜尋: ${error}`);
            searchResults = await tryAdvancedSearch();
          }

          const { appStoreResults, playStoreResults } = searchResults;

          // 設定匹配閾值
          const MATCH_THRESHOLD = 30;

          // 如果基本搜尋的匹配度不夠，嘗試進階搜尋
          if ((!appStoreResults[0] || appStoreResults[0].matchPercentage < MATCH_THRESHOLD) ||
              (!playStoreResults[0] || playStoreResults[0].matchPercentage < MATCH_THRESHOLD)) {
            console.log(`${app.name} 基本匹配失敗，嘗試進階搜尋`);
            searchResults = await tryAdvancedSearch();
          }

          const bestAppStoreMatch = searchResults.appStoreResults.length > 0 && 
            searchResults.appStoreResults[0].matchPercentage >= MATCH_THRESHOLD 
              ? searchResults.appStoreResults[0].result.link 
              : '';
              
          const bestPlayStoreMatch = searchResults.playStoreResults.length > 0 && 
            searchResults.playStoreResults[0].matchPercentage >= MATCH_THRESHOLD 
              ? searchResults.playStoreResults[0].result.link 
              : '';

          const noMatches = !bestAppStoreMatch && !bestPlayStoreMatch;
          
          return {
            ...app,
            appStoreUrl: bestAppStoreMatch,
            playStoreUrl: bestPlayStoreMatch,
            isLoading: false,
            error: noMatches ? '找不到相符的應用程式' : undefined
          };

        } catch (error) {
          console.error(`處理 ${app.name} 時發生錯誤:`, error);
          return {
            ...app,
            isLoading: false,
            error: error instanceof Error ? error.message : '搜尋 URL 時發生未知錯誤'
          };
        }
      }));

      setSelectedApps(results);

    } catch (error) {
      console.error('搜尋 URL 時發生錯誤:', error);
      setSelectedApps(prev => prev.map(app => ({
        ...app,
        isLoading: false,
        error: error instanceof Error ? error.message : '搜尋 URL 時發生未知錯誤'
      })));
    }
  };

  const handleStepChange = async (step: FlowStep) => {
    if (step === "url-scraping") {
      // 當切換到 URL 搜尋步驟時，自動開始搜尋
      await searchAppUrls(selectedApps);
    }
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "search":
        return (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>智能應用程式搜尋</CardTitle>
                <CardDescription>與AI助手對話，搜尋並分析相關應用程式</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 chat-messages-container">
                    {conversation.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                          {message.role === "assistant" && (
                            <div className="w-8 h-8">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
                                <path d="M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12v2a1 1 0 0 0 1 1H3v5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5a1 1 0 0 0 1-1v-1.938a1.006 1.006 0 0 0-.072-.455zM5 20V8h14l.001 3.996L19 12v2l.001.005.001 5.995H5z"/>
                                <ellipse cx="8.5" cy="12" rx="1.5" ry="2"/>
                                <ellipse cx="15.5" cy="12" rx="1.5" ry="2"/>
                                <path d="M8 16h8v2H8z"/>
                              </svg>
                            </div>
                          )}
                          <div className={`rounded-lg p-3 ${message.role === "user" ? "bg-black text-white" : "bg-gray-100"}`}>
                            {formatMessageContent(
                              message.content,
                              message.role === "assistant",
                              message.role === "assistant" && index > 0 ? conversation[index - 1].content : undefined,
                              message.role === "assistant" ? index : undefined
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%]">
                          <div className="w-8 h-8">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
                              <path d="M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12v2a1 1 0 0 0 1 1H3v5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5a1 1 0 0 0 1-1v-1.938a1.006 1.006 0 0 0-.072-.455zM5 20V8h14l.001 3.996L19 12v2l.001.005.001 5.995H5z"/>
                              <ellipse cx="8.5" cy="12" rx="1.5" ry="2"/>
                              <ellipse cx="15.5" cy="12" rx="1.5" ry="2"/>
                              <path d="M8 16h8v2H8z"/>
                            </svg>
                          </div>
                          <div className="rounded-lg p-3 bg-gray-100 flex items-center">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
                              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
                              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "600ms" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="輸入您的問題，例如：幫我找出類似IKEA的家具零售App"
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage} disabled={isLoading || !query.trim()} className="bg-black hover:bg-black/90 text-white">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="border-black text-black hover:bg-black/10 whitespace-nowrap"
                      onClick={handleCustomAppAdd}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      新增應用程式
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {Object.keys(searchResultsHistory).length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>搜尋結果</CardTitle>
                  <CardDescription>選擇要分析的應用程式 (最多3個) {new Set(selectedApps.map(app => app.name)).size}/3</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {searchResults.map((app) => (
                        <Card key={app.id} className={`overflow-hidden ${app.selected ? "border-primary" : ""}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center">
                              <CardTitle className="text-lg">{app.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardFooter>
                            <Button
                              variant={app.selected ? "default" : "outline"}
                              className={`w-full ${
                                app.selected 
                                  ? "bg-black hover:bg-black/90 text-white" 
                                  : new Set(selectedApps.map(a => a.name)).size >= 3 
                                    ? "border-gray-200 text-gray-400 hover:bg-transparent cursor-not-allowed"
                                    : "border-black text-black hover:bg-black/10"
                              }`}
                              onClick={() => toggleAppSelection(app.id)}
                              disabled={!app.selected && new Set(selectedApps.map(a => a.name)).size >= 3}
                            >
                              {app.selected ? "取消選擇" : "選擇"}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleStepChange("url-scraping")} disabled={selectedApps.length === 0} className="bg-black hover:bg-black/90 text-white">
                    自動查找應用商店連結
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}
          </>
        );

      case "url-scraping":
        return (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>應用商店連結自動查找</CardTitle>
                  <CardDescription>AI正在為您查找應用程式的商店連結</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回搜尋
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedApps.map((app) => (
                  <div key={`${app.id}-url`} className="border rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <h3 className="font-medium">{app.name}</h3>
                      {app.isLoading && (
                        <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {app.error && (
                        <span className="ml-2 text-sm text-red-500">{app.error}</span>
                      )}
                    </div>

                    <Tabs defaultValue="appstore" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                        <TabsTrigger value="appstore" className="data-[state=active]:bg-white">
                          App Store
                        </TabsTrigger>
                        <TabsTrigger value="playstore" className="data-[state=active]:bg-white">
                          Google Play
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="appstore" className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder={app.isLoading ? "正在查找App Store URL..." : "App Store URL"}
                            value={app.appStoreUrl || ""}
                            onChange={(e) => handleUrlInput(app.id, "appStore", e.target.value)}
                            className={app.appStoreUrl ? "border-green-500" : ""}
                            disabled={app.isLoading}
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(app.id, "appStore", app.appStoreUrl || "")}
                            className="border-black hover:bg-black/10"
                            disabled={!app.appStoreUrl || app.isLoading}
                          >
                            {copySuccess[app.id]?.appStore ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="playstore" className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="正在查找Google Play URL..."
                            value={app.playStoreUrl || ""}
                            onChange={(e) => handleUrlInput(app.id, "playStore", e.target.value)}
                            className={app.playStoreUrl ? "border-green-500" : ""}
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(app.id, "playStore", app.playStoreUrl || "")}
                            className="border-black hover:bg-black/10"
                            disabled={!app.playStoreUrl}
                          >
                            {copySuccess[app.id]?.playStore ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={startScraping} 
                disabled={selectedApps.some(app => !app.appStoreUrl || !app.playStoreUrl || app.isLoading)}
                className="bg-black hover:bg-black/90 text-white"
              >
                開始爬取應用數據
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );

      case "scraping-progress":
        return (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>應用數據爬取進度</CardTitle>
                  <CardDescription>正在從應用商店爬取詳細資料</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={goBack} disabled={true}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回連結設定
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={scrapingProgress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>已完成: {scrapingProgress}%</span>
                  <span>預計剩餘時間: {Math.ceil((100 - scrapingProgress) / 10) * 0.3} 分鐘</span>
                </div>

                <div className="space-y-2">
                  {selectedApps.map((app) => (
                    <div key={`${app.id}-progress`} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {scrapingProgress > 50 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        )}
                        <span>{app.name}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {scrapingProgress > 50 ? "資料爬取完成" : "正在爬取資料..."}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">爬取內容：</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={scrapingProgress > 20 ? "default" : "outline"} className={scrapingProgress > 20 ? "bg-black hover:bg-black/90 text-white" : ""}>基本資訊</Badge>
                      {scrapingProgress > 20 && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scrapingProgress > 40 ? "default" : "outline"} className={scrapingProgress > 40 ? "bg-black hover:bg-black/90 text-white" : ""}>用戶評論</Badge>
                      {scrapingProgress > 40 && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scrapingProgress > 60 ? "default" : "outline"} className={scrapingProgress > 60 ? "bg-black hover:bg-black/90 text-white" : ""}>功能列表</Badge>
                      {scrapingProgress > 60 && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scrapingProgress > 80 ? "default" : "outline"} className={scrapingProgress > 80 ? "bg-black hover:bg-black/90 text-white" : ""}>更新歷史</Badge>
                      {scrapingProgress > 80 && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "scraping-complete":
        return (
          <>
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>資料爬取完成</AlertTitle>
              <AlertDescription>已成功爬取 {selectedApps.length} 個應用程式的資料，可以進行競品分析。</AlertDescription>
            </Alert>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>爬取資料摘要</CardTitle>
                    <CardDescription>已收集的應用程式資料概覽</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回連結設定
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedApps.map((app) => (
                    <Card key={`${app.id}-summary`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>狀態:</span>
                            <span className="font-medium">已完成分析</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={proceedToAnalysis} className="bg-black hover:bg-black/90 text-white">
                  進行競品分析
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </>
        );

      case "analysis":
        return (
          <>
            <CompetitiveAnalysis onGoBack={() => setCurrentStep("scraping-complete")} />
          </>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 pt-20 max-w-7xl">
      {["search", "url-scraping", "scraping-progress", "scraping-complete"].includes(currentStep) && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "search" ? "bg-black text-white" : "bg-gray-100 text-gray-500"
              }`}>1</div>
              <span className={`ml-2 ${currentStep === "search" ? "font-medium text-black" : "text-gray-500"}`}>搜尋</span>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "url-scraping" ? "bg-black text-white" : "bg-gray-100 text-gray-500"
              }`}>2</div>
              <span className={`ml-2 ${currentStep === "url-scraping" ? "font-medium text-black" : "text-gray-500"}`}>連結查找</span>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "scraping-progress" || currentStep === "scraping-complete"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500"
              }`}>3</div>
              <span className={`ml-2 ${
                currentStep === "scraping-progress" || currentStep === "scraping-complete" ? "font-medium text-black" : "text-gray-500"
              }`}>資料爬取</span>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === "analysis" ? "bg-black text-white" : "bg-gray-100 text-gray-500"
              }`}>4</div>
              <span className={`ml-2 ${currentStep === "analysis" ? "font-medium text-black" : "text-gray-500"}`}>競品分析</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 mt-2 rounded-full overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-300"
              style={{
                width:
                  currentStep === "search"
                    ? "25%"
                    : currentStep === "url-scraping"
                      ? "50%"
                      : currentStep === "scraping-progress" || currentStep === "scraping-complete"
                        ? "75%"
                        : "100%",
              }}
            />
          </div>
        </div>
      )}

      {renderStep()}
    </div>
  );
} 