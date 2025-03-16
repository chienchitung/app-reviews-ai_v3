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
import { SearchResult } from './types'

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
  size: string;
  appStoreUrl: string;
  playStoreUrl: string;
  positiveReviews: string[];
  neutralReviews: string[];
  negativeReviews: string[];
  uxScores: {
    memberlogin: number;
    search: number;
    product: number;
    checkout: number;
    service: number;
    other: number;
  };
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

export default function CompetitiveAnalysis({ selectedApps = [], onGoBack }: CompetitiveAnalysisProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30days")
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const toggleAppDetails = (appId: string) => {
    if (expandedApp === appId) {
      setExpandedApp(null)
    } else {
      setExpandedApp(appId)
    }
  }

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

  const appData: AppData[] = selectedApps.map(app => ({
    id: app.id,
    name: app.name,
    logo: app.appInfo?.ios?.icon_url || app.appInfo?.android?.icon_url || '',
    iosRating: parseFloat(app.appInfo?.ios?.rating || '0'),
    androidRating: parseFloat(app.appInfo?.android?.rating || '0'),
    iosReviews: parseInt(app.appInfo?.ios?.rating_count.replace(/,/g, '') || '0'),
    androidReviews: parseInt(app.appInfo?.android?.rating_count.replace(/,/g, '') || '0'),
    version: app.appInfo?.ios?.version || app.appInfo?.android?.version || 'N/A',
    lastUpdate: app.appInfo?.ios?.update_date || app.appInfo?.android?.update_date || 'N/A',
    size: 'N/A',
    appStoreUrl: app.appStoreUrl || '',
    playStoreUrl: app.playStoreUrl || '',
    positiveReviews: [],
    neutralReviews: [],
    negativeReviews: [],
    uxScores: {
      memberlogin: 80,
      search: 75,
      product: 85,
      checkout: 90,
      service: 70,
      other: 80
    }
  }));

  // 計算情感分析數據
  const sentimentData = appData.map(app => ({
    name: app.name,
    positive: 65, // 暫時使用固定值，後續需要從評論 API 獲取
    neutral: 20,
    negative: 15
  }));

  // 計算用戶體驗比較數據
  const uxComparisonData = [
    { name: "會員登入" },
    { name: "搜尋功能" },
    { name: "商品相關" },
    { name: "結帳付款" },
    { name: "客戶服務" },
    { name: "其他" }
  ].map(item => {
    const result: any = { name: item.name };
    appData.forEach(app => {
      const key = item.name.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof app.uxScores;
      result[app.name] = app.uxScores[key];
    });
    return result;
  });

  // 生成圖表顏色映射
  const appColorMap = Object.fromEntries(
    appData.map((app, index) => [app.name, COLORS[index % COLORS.length]])
  );

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
                              iOS: {formatReviewCount(app.iosReviews)}, Android: {formatReviewCount(app.androidReviews)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>最後更新</span>
                            <span>{app.lastUpdate}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.uxScores.other === Math.max(...appData.map((a) => a.uxScores.other)) ? (
                            <Badge variant="destructive">其他</Badge>
                          ) : (
                            <Badge variant="outline">其他</Badge>
                          )}
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
                        {appData.map((app, index) => (
                          <Bar key={app.id} dataKey={app.name} fill={COLORS[index % COLORS.length]} />
                        ))}
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
                            {app.uxScores.other === Math.max(...appData.map((a) => a.uxScores.other)) ? (
                              <>
                                <li className="text-sm">其他</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">其他</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">需要改進的地方</h4>
                          <ul className="list-disc pl-5 space-y-1 text-red-600">
                            {app.uxScores.other === Math.max(...appData.map((a) => a.uxScores.other)) ? (
                              <>
                                <li className="text-sm">其他</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">其他</li>
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
                      <CardTitle>{app.name} 用戶體驗優勢</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">會員登入</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.uxScores.memberlogin === Math.max(...appData.map((a) => a.uxScores.memberlogin)) ? (
                              <>
                                <li className="text-sm">會員登入</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">會員登入</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">搜尋功能</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {app.uxScores.search === Math.max(...appData.map((a) => a.uxScores.search)) ? (
                              <>
                                <li className="text-sm">搜尋功能</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">搜尋功能</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">需要改進的地方</h4>
                          <ul className="list-disc pl-5 space-y-1 text-red-600">
                            {app.uxScores.other === Math.max(...appData.map((a) => a.uxScores.other)) ? (
                              <>
                                <li className="text-sm">其他</li>
                              </>
                            ) : (
                              <>
                                <li className="text-sm">其他</li>
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
                        正面評論: {app.uxScores.memberlogin} | 中性評論: {app.uxScores.search} | 負面評論:{" "}
                        {app.uxScores.other}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "正面", value: app.uxScores.memberlogin },
                                  { name: "中性", value: app.uxScores.search },
                                  { name: "負面", value: app.uxScores.other },
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