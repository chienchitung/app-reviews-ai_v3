import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APP評論分析平台',
  description: '整合 Apple Store 與 Google Play 的評論數據，提供深入的用戶反饋分析',
  keywords: 'APP評論, 數據分析, 用戶反饋, Apple Store, Google Play',
  authors: [{ name: 'APP評論分析平台團隊' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://app-reviews-ai-v2.vercel.app',
    title: 'APP評論分析平台',
    description: '整合 Apple Store 與 Google Play 的評論數據，提供深入的用戶反饋分析',
    siteName: 'APP評論分析平台'
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}; 