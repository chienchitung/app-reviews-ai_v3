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
  developer: string;
  icon: string;
  category: string;
  rating: number;
  appStoreUrl: string;
  playStoreUrl: string;
  selected: boolean;
}

export default function ConversationalSearchFlow() {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<FlowStep>("search");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>>([
    {
      role: "assistant",
      content: "您好！我可以幫您搜尋和分析家具零售相關的應用程式。請告訴我您想了解哪些App或市場？",
      timestamp: new Date(),
    },
  ]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    {
      id: "ikea",
      name: "IKEA",
      developer: "IKEA Systems B.V.",
      icon: "/placeholder.svg?height=60&width=60",
      category: "購物",
      rating: 4.6,
      appStoreUrl: "",
      playStoreUrl: "",
      selected: false,
    },
    {
      id: "nitori",
      name: "宜得利家居 Nitori",
      developer: "Nitori Co., Ltd.",
      icon: "/placeholder.svg?height=60&width=60",
      category: "購物",
      rating: 4.3,
      appStoreUrl: "",
      playStoreUrl: "",
      selected: false,
    },
    {
      id: "trihouse",
      name: "特力屋 TeLiWu",
      developer: "Test Rite International Co., Ltd.",
      icon: "/placeholder.svg?height=60&width=60",
      category: "購物",
      rating: 4.1,
      appStoreUrl: "",
      playStoreUrl: "",
      selected: false,
    },
  ]);
  const [selectedApps, setSelectedApps] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<"idle" | "searching" | "scraping" | "completed" | "error">("idle");
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: { appStore: boolean; playStore: boolean } }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = () => {
    if (!query.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: query,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    setTimeout(() => {
      let aiResponse;
      let showSearchResults = false;

      if (query.toLowerCase().includes("ikea") || query.toLowerCase().includes("家具")) {
        aiResponse = "我找到了幾個與IKEA類似的家具零售應用程式。這些是台灣市場上最受歡迎的家具零售App：";
        showSearchResults = true;
      } else if (query.toLowerCase().includes("比較") || query.toLowerCase().includes("功能")) {
        aiResponse = "要比較這些應用程式的功能，我需要先確定您想分析哪些App。請從搜尋結果中選擇您想比較的應用程式，或者告訴我具體的App名稱。";
      } else {
        aiResponse = "您想了解哪些家具零售相關的應用程式？例如，您可以詢問「幫我找出類似IKEA的家具零售App」或「比較台灣市場上主要的家具App功能」。";
      }

      const assistantMessage = {
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setShowResults(showSearchResults);
    }, 1500);
  };

  const toggleAppSelection = (appId: string) => {
    const updatedResults = searchResults.map(app => 
      app.id === appId ? { ...app, selected: !app.selected } : app
    );
    setSearchResults(updatedResults);
    setSelectedApps(updatedResults.filter(app => app.selected));
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
      
      // 2秒後重置狀態
      setTimeout(() => {
        setCopySuccess(prev => ({
          ...prev,
          [appId]: {
            ...prev[appId],
            [store]: false
          }
        }));
      }, 2000);
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
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
                            {message.content}
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
                </div>
              </CardContent>
            </Card>

            {showResults && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>搜尋結果</CardTitle>
                  <CardDescription>選擇要分析的應用程式 (最多3個)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {searchResults.map((app) => (
                      <Card key={app.id} className={`overflow-hidden ${app.selected ? "border-primary" : ""}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-4">
                            <img
                              src={app.icon}
                              alt={`${app.name} Logo`}
                              className="w-12 h-12 rounded-lg"
                            />
                            <div>
                              <CardTitle className="text-lg">{app.name}</CardTitle>
                              <CardDescription>{app.developer}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm mb-4">
                            <span>{app.category}</span>
                            <span>評分: {app.rating}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant={app.selected ? "default" : "outline"}
                            className={`w-full ${app.selected ? "bg-black hover:bg-black/90 text-white" : "border-black text-black hover:bg-black/10"}`}
                            onClick={() => toggleAppSelection(app.id)}
                          >
                            {app.selected ? "已選擇" : "選擇"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => setCurrentStep("url-scraping")} disabled={selectedApps.length === 0} className="bg-black hover:bg-black/90 text-white">
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
                  <CardDescription>AI已為您找到以下應用程式的商店連結</CardDescription>
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
                    <div className="flex items-center gap-3 mb-4">
                      <img src={app.icon} alt={`${app.name} Logo`} className="w-8 h-8 rounded-lg" />
                      <h3 className="font-medium">{app.name}</h3>
                    </div>

                    <Tabs defaultValue="appstore" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                        <TabsTrigger value="appstore" className="data-[state=active]:bg-white">App Store</TabsTrigger>
                        <TabsTrigger value="playstore" className="data-[state=active]:bg-white">Google Play</TabsTrigger>
                      </TabsList>

                      <TabsContent value="appstore" className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="正在查找App Store URL..."
                            value={app.appStoreUrl}
                            onChange={(e) => handleUrlInput(app.id, "appStore", e.target.value)}
                            className={app.appStoreUrl ? "border-green-500" : ""}
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(app.id, "appStore", app.appStoreUrl)}
                            className="border-black hover:bg-black/10"
                            disabled={!app.appStoreUrl}
                          >
                            {copySuccess[app.id]?.appStore ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Smartphone className="h-4 w-4" />
                          <span>{app.appStoreUrl ? "已找到App Store連結" : "正在查找App Store連結..."}</span>
                        </div>
                      </TabsContent>

                      <TabsContent value="playstore" className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="正在查找Google Play URL..."
                            value={app.playStoreUrl}
                            onChange={(e) => handleUrlInput(app.id, "playStore", e.target.value)}
                            className={app.playStoreUrl ? "border-green-500" : ""}
                          />
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(app.id, "playStore", app.playStoreUrl)}
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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Smartphone className="h-4 w-4" />
                          <span>{app.playStoreUrl ? "已找到Google Play連結" : "正在查找Google Play連結..."}</span>
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
                disabled={selectedApps.some(app => !app.appStoreUrl || !app.playStoreUrl)}
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
                        <div className="flex items-center gap-3">
                          <img src={app.icon} alt={`${app.name} Logo`} className="w-8 h-8 rounded-lg" />
                          <CardTitle className="text-lg">{app.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>評論數量:</span>
                            <span className="font-medium">2,500+</span>
                          </div>
                          <div className="flex justify-between">
                            <span>評分:</span>
                            <span className="font-medium">{app.rating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>最後更新:</span>
                            <span className="font-medium">2023-11-15</span>
                          </div>
                          <div className="flex justify-between">
                            <span>版本:</span>
                            <span className="font-medium">2.1.0</span>
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

  const getTitle = (step: FlowStep): string => {
    return step === "analysis" ? "競品分析結果" : "競品分析前置模組";
  };

  const showActionButtons = (step: FlowStep): boolean => {
    return ["search", "url-scraping", "scraping-progress", "scraping-complete"].includes(step);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{getTitle(currentStep)}</h1>
        {showActionButtons(currentStep) && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {showActionButtons(currentStep) && (
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