import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
// 使用 require 方式導入
const { parse } = require('csv-parse/sync');
import type { AnalysisResult } from '@/types/feedback';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    let data: any[] = [];

    try {
      if (file.name.endsWith('.csv')) {
        // 改進 CSV 編碼處理
        const encodings = ['utf-8', 'big5'];
        let content = '';
        let parseError = null;

        for (const encoding of encodings) {
          try {
            const decoder = new TextDecoder(encoding);
            content = decoder.decode(buffer);
            
            // 嘗試解析 CSV，添加更多的解析選項
            data = parse(content, {
              columns: true,
              skip_empty_lines: true,
              trim: true,
              delimiter: ',',
              relaxColumnCount: true,
              relaxQuotes: true,
              skipRecordsWithError: true,
              comment: '#', // 忽略註釋行
              quote: '"', // 指定引號字符
              escape: '\\' // 指定轉義字符
            });

            // 檢查是否成功解析到資料並打印調試信息
            if (data && data.length > 0) {
              const columns = Object.keys(data[0]);
              console.log('=== CSV 解析結果 ===');
              console.log('使用編碼:', encoding);
              console.log('解析到的欄位:', columns);
              console.log('第一筆資料:', data[0]);
              
              // 檢查欄位名稱是否包含特殊字符或 BOM
              const cleanColumns = columns.map(col => {
                // 移除可能的 BOM 和特殊字符
                return col.replace(/^\uFEFF/, '').trim();
              });
              
              // 更新資料的欄位名稱
              data = data.map(row => {
                const newRow: any = {};
                Object.entries(row).forEach(([key, value]) => {
                  const cleanKey = key.replace(/^\uFEFF/, '').trim();
                  newRow[cleanKey] = value;
                });
                return newRow;
              });

              // 再次確認清理後的欄位
              console.log('清理後的欄位:', Object.keys(data[0]));
              
              // 檢查是否有評論相關欄位
              const hasCommentField = Object.keys(data[0]).some(col => {
                const colLower = col.toLowerCase();
                return colLower.includes('評論') || 
                       colLower.includes('內容') || 
                       colLower.includes('content') || 
                       colLower.includes('comment') || 
                       colLower.includes('feedback') || 
                       colLower.includes('意見') || 
                       colLower.includes('建議');
              });

              if (hasCommentField) {
                break; // 找到有效的資料，跳出循環
              } else {
                console.log('未找到評論相關欄位，繼續嘗試其他編碼');
              }
            }
          } catch (e) {
            parseError = e;
            console.error(`使用 ${encoding} 解析失敗:`, e);
            continue;
          }
        }

        if (!data || data.length === 0) {
          console.error('CSV 解析失敗，所有嘗試都失敗了');
          throw new Error('無法解析 CSV 文件或檔案為空');
        }

      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // 改進 Excel 日期處理
        const workbook = XLSX.read(buffer, {
          type: 'array',
          cellDates: true
        });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 獲取原始數據
        data = XLSX.utils.sheet_to_json(firstSheet, { 
          raw: true,
          defval: ''
        });

        // 處理 Excel 日期格式
        data = data.map(row => {
          const newRow = { ...row };
          Object.entries(row).forEach(([key, value]) => {
            // 檢查是否為日期欄位
            if (key.toLowerCase().includes('日期') || 
                key.toLowerCase().includes('date') || 
                key.toLowerCase().includes('time')) {
              if (value) {
                let dateStr = '';
                if (value instanceof Date) {
                  // 如果是日期對象
                  dateStr = formatDate(value);
                } else if (typeof value === 'number') {
                  // 如果是 Excel 序列號
                  const date = XLSX.SSF.parse_date_code(value);
                  dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                } else if (typeof value === 'string') {
                  // 如果是字符串，嘗試解析
                  try {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      dateStr = formatDate(date);
                    } else {
                      dateStr = value; // 保持原始值
                    }
                  } catch {
                    dateStr = value; // 保持原始值
                  }
                }
                newRow[key] = dateStr;
              }
            }
          });
          return newRow;
        });
      } else {
        return NextResponse.json(
          { error: '不支援的文件格式' },
          { status: 400 }
        );
      }

      // 檢查數據是否為空
      if (!data || data.length === 0) {
        throw new Error('文件中沒有數據');
      }

      // 在 normalizedData 映射之前，添加欄位檢查
      if (data && data.length > 0) {
        console.log('=== 欄位匹配檢查 ===');
        const firstRow = data[0];
        const columns = Object.keys(firstRow);
        
        // 檢查並打印所有可能的評論欄位
        const possibleCommentFields = columns.filter(col => {
          const colLower = col.toLowerCase();
          return colLower.includes('評論') || 
                 colLower.includes('內容') || 
                 colLower.includes('content') || 
                 colLower.includes('comment') || 
                 colLower.includes('feedback') || 
                 colLower.includes('意見') || 
                 colLower.includes('建議');
        });
        
        console.log('可能的評論欄位:', possibleCommentFields);
        console.log('所有可用欄位:', columns);
      }

      // 標準化欄位名稱
      const normalizedData = data.map((row, index) => {
        // 如果是第一行，打印欄位名稱以便調試
        if (index === 0) {
          console.log('檔案欄位:', Object.keys(row));
        }

        // 建立一個函數來尋找符合關鍵字的欄位值
        const findColumn = (terms: string[]) => {
          const foundKey = Object.keys(row).find(key => 
            terms.some(term => key.toLowerCase().includes(term.toLowerCase()))
          );
          return foundKey ? row[foundKey] : null;
        };

        // 公司處理
        const companyTerms = ['公司', 'company', 'brand', '品牌', 'app', '應用程式'];
        const company = findColumn(companyTerms) || '未知';

        // 內容處理（必要欄位）
        const contentTerms = [
          '評論內容', '內容', 'content', 'comment', 
          'feedback', '評論', '意見', '建議'
        ];
        const content = findColumn(contentTerms);
        if (!content && index === 0) {
          console.log('找不到評論內容欄位，可用欄位:', Object.keys(row));
          console.log('嘗試匹配的關鍵字:', contentTerms);
          throw new Error(`找不到評論內容欄位，請確保檔案包含以下其中一個欄位: ${contentTerms.join(', ')}`);
        }

        // 評分處理（必要欄位）
        const ratingTerms = [
          '用戶評分', '評分', 'rating', 'score', 
          '分數', '星級', 'stars', 'star'
        ];
        const ratingValue = findColumn(ratingTerms);
        if (!ratingValue && index === 0) {
          console.log('找不到評分欄位，可用欄位:', Object.keys(row));
          console.log('嘗試匹配的關鍵字:', ratingTerms);
          throw new Error(`找不到評分欄位，請確保檔案包含以下其中一個欄位: ${ratingTerms.join(', ')}`);
        }

        // 日期處理
        const dateTerms = ['日期', 'date', 'time', '時間', '建立日期', '評論日期'];
        const dateValue = findColumn(dateTerms);
        let formattedDate = dateValue;

        if (dateValue) {
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              formattedDate = formatDate(date);
            }
          } catch (e) {
            console.warn('無法解析日期:', dateValue);
            formattedDate = dateValue; // 保持原始值
          }
        } else {
          formattedDate = formatDate(new Date()); // 使用當前日期
        }

        // 裝置處理
        const deviceTerms = ['裝置', 'device', 'platform', '平台', '系統'];
        const device = findColumn(deviceTerms) || '未知';

        // 分類處理
        const categoryTerms = ['分類', 'category', 'type', '類型'];
        const categoryValue = findColumn(categoryTerms);
        const categories = categoryValue 
          ? categoryValue.split(/[,，]/).map((c: string) => c.trim()).filter(Boolean)
          : ['一般'];

        // 關鍵詞處理
        const keywordTerms = ['關鍵詞', 'keywords', 'tags', '標籤', '關鍵字'];
        const keywordsValue = findColumn(keywordTerms);
        const keywords = keywordsValue 
          ? keywordsValue.split(/[,，]/).map((k: string) => k.trim()).filter(Boolean)
          : [];

        // 情感處理
        const sentimentTerms = ['情感', 'sentiment', '情緒'];
        const sentiment = findColumn(sentimentTerms) || '中性';

        return {
          id: `review-${index}`,
          company: company,
          date: formattedDate,
          content: content,
          rating: parseFloat(ratingValue) || 0,
          device: device,
          category: categories.join(', '),
          sentiment: sentiment,
          keywords: keywords
        };
      });

      // 計算關鍵詞出現頻率
      const keywordCounts = normalizedData.reduce((acc, row) => {
        row.keywords.forEach((keyword: string) => {
          acc[keyword] = (acc[keyword] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      // 轉換為所需的關鍵詞格式
      const keywordsList = Object.entries(keywordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count);

      // 生成分析結果
      const analysisResult: AnalysisResult = {
        feedbacks: normalizedData,
        keywords: keywordsList,
        summary: {
          totalCount: normalizedData.length,
          averageRating: calculateAverageRating(normalizedData),
          positiveRatio: calculateSentimentRatio(normalizedData, '正面'),
          neutralRatio: calculateSentimentRatio(normalizedData, '中性'),
          negativeRatio: calculateSentimentRatio(normalizedData, '負面')
        }
      };

      return NextResponse.json({
        success: true,
        data: analysisResult
      });

    } catch (parseError: any) {
      console.error('解析文件錯誤:', parseError);
      return NextResponse.json(
        { error: `解析文件失敗: ${parseError.message}` },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('分析過程出錯:', error);
    return NextResponse.json(
      { error: error.message || '處理文件時發生錯誤' },
      { status: 500 }
    );
  }
}

// 統一的日期格式化函數
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 計算平均評分
function calculateAverageRating(feedbacks: any[]): number {
  return feedbacks.reduce((acc, row) => acc + row.rating, 0) / feedbacks.length;
}

// 計算情感比例
function calculateSentimentRatio(feedbacks: any[], sentiment: string): number {
  return feedbacks.filter(row => row.sentiment.includes(sentiment)).length / feedbacks.length;
} 