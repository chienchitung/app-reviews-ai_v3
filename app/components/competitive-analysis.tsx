'use client';

import { useState } from "react"
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
import { ChevronDown, ChevronUp, Star, Download, Filter, ArrowLeft, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for the charts
const sentimentData = [
  { name: "IKEA", positive: 65, neutral: 15, negative: 20 },
  { name: "宜得利", positive: 58, neutral: 20, negative: 22 },
  { name: "特力屋", positive: 52, neutral: 18, negative: 30 },
]

const uxComparisonData = [
  { name: "會員登入", IKEA: 85, 宜得利: 78, 特力屋: 65 },
  { name: "搜尋功能", IKEA: 90, 宜得利: 75, 特力屋: 60 },
  { name: "商品相關", IKEA: 82, 宜得利: 85, 特力屋: 75 },
  { name: "結帳付款", IKEA: 88, 宜得利: 70, 特力屋: 62 },
  { name: "客戶服務", IKEA: 75, 宜得利: 80, 特力屋: 70 },
  { name: "其他", IKEA: 80, 宜得利: 72, 特力屋: 68 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const appData = [
  {
    id: "ikea",
    name: "IKEA",
    logo: "/placeholder.svg?height=60&width=60",
    iosRating: 4.6,
    androidRating: 4.4,
    iosReviews: 1500,
    androidReviews: 1200,
    version: "2.1.0",
    lastUpdate: "2023-11-15",
    size: "45MB",
    appStoreUrl: "",
    playStoreUrl: "",
    positiveReviews: [
      "AR 模式讓用戶可以虛擬擺設家具。",
      "商品分類清晰，購物體驗流暢。",
      "促銷活動通知及時，不會錯過優惠。",
      "結帳流程簡單快速。",
      "商品搜尋功能強大，能快速找到需要的物品。",
    ],
    neutralReviews: [
      "App功能齊全，但有些功能不太容易找到。",
      "商品資訊詳細，但有時加載較慢。",
      "會員功能實用，但積分兌換選項有限。",
    ],
    negativeReviews: [
      "部分商品資訊更新不及時。",
      "App 有時會出現閃退情況。",
      "某些地區配送選項有限。",
      "客服回應速度較慢。",
    ],
    coreFeatures: [
      "商品瀏覽、搜尋、線上購買 (部分商品可宅配、部分限店取)",
      "掃描商品條碼 (查看庫存、詳細資訊)",
      "建立購物清單、我的最愛",
      "IKEA Family會員卡 (電子會員卡、消費紀錄、優惠券)",
      "分店資訊 (營業時間、地址、導航)",
      "線上型錄瀏覽",
      "居家佈置靈感 (文章、圖片)",
      "部分功能提供AR體驗（例如虛擬擺設家具）",
    ],
    specialCharacteristics: ["介面簡潔、視覺化強 (大量圖片)", "強調靈感啟發、佈置範例", "會員整合度高"],
    uxScores: {
      memberLogin: 85,
      searchFunction: 90,
      productRelated: 82,
      checkout: 88,
      customerService: 75,
      others: 80,
    },
  },
  {
    id: "nitori",
    name: "宜得利",
    logo: "/placeholder.svg?height=60&width=60",
    iosRating: 4.3,
    androidRating: 4.1,
    iosReviews: 800,
    androidReviews: 950,
    version: "1.8.5",
    lastUpdate: "2023-10-20",
    size: "38MB",
    appStoreUrl: "",
    playStoreUrl: "",
    positiveReviews: [
      "價格透明，促銷活動多。",
      "商品推薦準確，符合用戶需求。",
      "會員積分系統設計合理。",
      "商品照片高清，細節展示完整。",
    ],
    neutralReviews: [
      "App整體設計中規中矩，功能實用但不特別突出。",
      "商品種類豐富，但分類方式可以再優化。",
      "點數兌換系統實用，但兌換流程可以簡化。",
    ],
    negativeReviews: [
      "缺乏 AR 功能，無法虛擬擺設。",
      "支付流程稍顯複雜。",
      "App啟動速度較慢。",
      "商品評論功能不夠完善。",
      "無法保存多個收貨地址。",
    ],
    coreFeatures: [
      "商品瀏覽、搜尋、線上購買 (可宅配、店取)",
      "掃描商品條碼 (查看庫存、詳細資訊)",
      "建立購物清單",
      "會員點數查詢、兌換",
      "最新優惠、活動資訊",
      "分店資訊 (營業時間、地址、電話)",
      "線上型錄",
      "電子保固卡登入",
    ],
    specialCharacteristics: [
      "著重商品資訊、價格比較",
      "會員點數系統為主要誘因",
      "介面相對樸實、功能導向",
      "加入購物車可以直接選擇分店取貨",
    ],
    uxScores: {
      memberLogin: 78,
      searchFunction: 75,
      productRelated: 85,
      checkout: 70,
      customerService: 80,
      others: 72,
    },
  },
  {
    id: "trihouse",
    name: "特力屋",
    logo: "/placeholder.svg?height=60&width=60",
    iosRating: 4.1,
    androidRating: 3.9,
    iosReviews: 600,
    androidReviews: 700,
    version: "3.0.0",
    lastUpdate: "2023-09-05",
    size: "42MB",
    appStoreUrl: "",
    playStoreUrl: "",
    positiveReviews: [
      "提供專業的家裝建議與工具推薦。",
      "App 操作簡單，適合長輩使用。",
      "DIY教學內容豐富。",
      "門市資訊查詢方便。",
    ],
    neutralReviews: [
      "DIY教學內容有幫助，但更新頻率不高。",
      "會員功能基本齊全，但優惠活動較少。",
      "商品種類多元，但有時庫存顯示與實際不符。",
    ],
    negativeReviews: [
      "商品庫存資訊不準確。",
      "缺少個性化推薦功能。",
      "App偶爾會卡頓。",
      "商品分類不夠直觀。",
      "搜尋功能精準度不高。",
      "結帳過程步驟過多。",
    ],
    coreFeatures: [
      "商品瀏覽、搜尋、線上購買 (可宅配、店取)",
      "掃描商品條碼 (查看庫存、詳細資訊)",
      "會員卡 (電子會員卡、消費紀錄、點數查詢)",
      "分店資訊 (營業時間、地址、導航)",
      "最新優惠、活動資訊",
      "預約居家服務 (例如安裝、修繕)",
      "DIY教學內容 (文章、影片)",
      "好幫手裝修預約",
    ],
    specialCharacteristics: ["強調居家修繕、DIY 相關服務", "提供預約安裝、修繕等功能", "整合線上購物與實體服務"],
    uxScores: {
      memberLogin: 65,
      searchFunction: 60,
      productRelated: 75,
      checkout: 62,
      customerService: 70,
      others: 68,
    },
  },
]

interface CompetitiveAnalysisProps {
  onGoBack: () => void;
}

export default function CompetitiveAnalysis({ onGoBack }: CompetitiveAnalysisProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days")
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const toggleAppDetails = (appId: string) => {
    if (expandedApp === appId) {
      setExpandedApp(null)
    } else {
      setExpandedApp(appId)
    }
  }

  return (
    <div className="space-y-6">
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
            <Select defaultValue={selectedTimeframe} onValueChange={setSelectedTimeframe}>
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
            <Select defaultValue="report_type">
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="選擇下載內容" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="full_report">完整分析報告</SelectItem>
                <SelectItem value="raw_data">原始數據</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-white border-gray-200">
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
                            <span>評論數</span>
                            <span>
                              iOS: {app.iosReviews}, Android: {app.androidReviews}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>最後更新</span>
                            <span>{app.lastUpdate}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.specialCharacteristics.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline">
                              {feature}
                            </Badge>
                          ))}
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
                                <span className="text-sm font-medium">{app.uxScores.memberLogin}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.memberLogin}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">搜尋功能</span>
                                <span className="text-sm font-medium">{app.uxScores.searchFunction}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.searchFunction}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">商品相關</span>
                                <span className="text-sm font-medium">{app.uxScores.productRelated}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.productRelated}%` }} />
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
                                <span className="text-sm font-medium">{app.uxScores.customerService}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.customerService}%` }} />
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm">其他</span>
                                <span className="text-sm font-medium">{app.uxScores.others}%</span>
                              </div>
                              <div className="h-2 bg-gray-100">
                                <div className="h-full bg-black" style={{ width: `${app.uxScores.others}%` }} />
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
                  <CardTitle>用戶體驗評分比較</CardTitle>
                  <CardDescription>各App六大用戶體驗類別評分 (滿分100)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={uxComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="IKEA" fill="#0088FE" />
                        <Bar dataKey="宜得利" fill="#00C49F" />
                        <Bar dataKey="特力屋" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appData.map((app) => (
                  <Card key={`${app.id}-features`} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{app.name} 功能特點</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">核心功能</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.coreFeatures.map((feature, index) => (
                              <li key={index} className="text-sm">
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">特點</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.specialCharacteristics.map((feature, index) => (
                              <li key={index} className="text-sm">
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                              { subject: "會員登入", A: app.uxScores.memberLogin, fullMark: 100 },
                              { subject: "搜尋功能", A: app.uxScores.searchFunction, fullMark: 100 },
                              { subject: "商品相關", A: app.uxScores.productRelated, fullMark: 100 },
                              { subject: "結帳付款", A: app.uxScores.checkout, fullMark: 100 },
                              { subject: "客戶服務", A: app.uxScores.customerService, fullMark: 100 },
                              { subject: "其他", A: app.uxScores.others, fullMark: 100 },
                            ]}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar
                              name={app.name}
                              dataKey="A"
                              stroke={app.id === "ikea" ? "#0088FE" : app.id === "nitori" ? "#00C49F" : "#FFBB28"}
                              fill={app.id === "ikea" ? "#0088FE" : app.id === "nitori" ? "#00C49F" : "#FFBB28"}
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
                                    app.uxScores.memberLogin === Math.max(...appData.map((a) => a.uxScores.memberLogin))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.memberLogin}%
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
                                    app.uxScores.searchFunction ===
                                    Math.max(...appData.map((a) => a.uxScores.searchFunction))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.searchFunction}%
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
                                    app.uxScores.productRelated ===
                                    Math.max(...appData.map((a) => a.uxScores.productRelated))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.productRelated}%
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
                                    app.uxScores.customerService ===
                                    Math.max(...appData.map((a) => a.uxScores.customerService))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.customerService}%
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
                                    app.uxScores.others === Math.max(...appData.map((a) => a.uxScores.others))
                                      ? "text-green-600"
                                      : ""
                                  }`}
                                >
                                  {app.uxScores.others}%
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
                      <CardTitle>{app.name} 用戶體驗優勢</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">會員登入</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.id === "ikea" ? (
                              <>
                                <li className="text-sm">快速登入選項多元</li>
                                <li className="text-sm">會員資料管理直觀</li>
                              </>
                            ) : app.id === "nitori" ? (
                              <>
                                <li className="text-sm">會員積分一目了然</li>
                                <li className="text-sm">社群媒體登入整合良好</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">登入流程簡單</li>
                                <li className="text-sm">忘記密碼流程清晰</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">搜尋功能</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.id === "ikea" ? (
                              <>
                                <li className="text-sm">搜尋結果精準度高</li>
                                <li className="text-sm">支援語音搜尋</li>
                              </>
                            ) : app.id === "nitori" ? (
                              <>
                                <li className="text-sm">篩選選項豐富</li>
                                <li className="text-sm">搜尋歷史記錄功能</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">分類搜尋清晰</li>
                                <li className="text-sm">相關商品推薦</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">需要改進的地方</h4>
                          <ul className="list-disc pl-5 space-y-1 text-red-600">
                            {app.id === "ikea" ? (
                              <>
                                <li className="text-sm">客戶服務回應時間較長</li>
                                <li className="text-sm">部分商品資訊更新不及時</li>
                              </>
                            ) : app.id === "nitori" ? (
                              <>
                                <li className="text-sm">結帳流程步驟過多</li>
                                <li className="text-sm">App啟動速度較慢</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">搜尋功能精準度不高</li>
                                <li className="text-sm">會員登入偶爾出現錯誤</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appData.map((app) => (
                  <Card key={`${app.id}-reviews`}>
                    <CardHeader>
                      <CardTitle>{app.name} 評論分析</CardTitle>
                      <CardDescription>
                        正面評論: {app.positiveReviews.length} | 中性評論: {app.neutralReviews.length} | 負面評論:{" "}
                        {app.negativeReviews.length}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "正面", value: app.positiveReviews.length },
                                  { name: "中性", value: app.neutralReviews.length },
                                  { name: "負面", value: app.negativeReviews.length },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell fill="#4ade80" />
                                <Cell fill="#94a3b8" />
                                <Cell fill="#f87171" />
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">正面評論重點</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.positiveReviews.map((review, index) => (
                              <li key={index} className="text-sm">
                                {review}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-600 mb-2">中性評論重點</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.neutralReviews.map((review, index) => (
                              <li key={index} className="text-sm">
                                {review}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-red-600 mb-2">負面評論重點</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.negativeReviews.map((review, index) => (
                              <li key={index} className="text-sm">
                                {review}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>評論關鍵詞分析</CardTitle>
                  <CardDescription>用戶評論中最常提及的關鍵詞</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {appData.map((app) => (
                      <div key={`${app.id}-keywords`}>
                        <h4 className="font-medium mb-2">{app.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">使用體驗</Badge>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">價格</Badge>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">商品質量</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">配送</Badge>
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">閃退</Badge>
                          <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">介面</Badge>
                          <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">客服</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 