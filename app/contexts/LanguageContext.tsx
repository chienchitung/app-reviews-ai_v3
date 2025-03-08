'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'zh' | 'en';

type TranslationValue = string | string[];

interface Translations {
  [key: string]: {
    [key: string]: TranslationValue;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => TranslationValue;
}

const translations: Translations = {
  zh: {
    // 導航欄
    'nav.features': '功能',
    'nav.pricing': '定價',
    'nav.learningCenter': '學習中心',
    'nav.login': '登入',
    'nav.startFree': '免費開始',
    'nav.menu': '功能選單',
    
    // 功能下拉選單
    'features.reviewAnalysis': '評論分析',
    'features.reviewAnalysis.desc': '深入分析用戶評論數據',
    'features.dataScraping': '資料爬取',
    'features.dataScraping.desc': '自動化爬取應用商店評論',

    // 篩選器
    'filter.dateRange': '時間範圍',
    'filter.devices': '裝置',
    'filter.ratings': '星等',
    'filter.sentiment': '情感',
    'filter.categories': '分類',
    'filter.reset': '重置篩選',
    'filter.selectDateRange': '選擇日期範圍',
    'filter.thisMonth': '本月',
    'filter.lastMonth': '上個月',
    'filter.last7days': '最近 7 天',
    'filter.last14days': '最近 14 天',
    'filter.last30days': '最近 30 天',
    'filter.last3Months': '最近 3 個月',
    'filter.selectedCompanies': '已選擇 {count} 個應用程式',
    'filter.selectCompany': '選擇應用程式',
    'filter.companies': '應用程式',
    
    // 篩選器選項
    'filter.rating.1': '1 星',
    'filter.rating.2': '2 星',
    'filter.rating.3': '3 星',
    'filter.rating.4': '4 星',
    'filter.rating.5': '5 星',
    'filter.sentiment.positive': '正面',
    'filter.sentiment.neutral': '中性',
    'filter.sentiment.negative': '負面',
    
    // 登入頁面
    'login.backToHome': '返回首頁',
    'login.welcome': '歡迎回來',
    'login.subtitle': '登入您的 AppReviews AI 帳號',
    'login.email.placeholder': '電子郵件',
    'login.password.placeholder': '密碼',
    'login.rememberMe': '記住我',
    'login.forgotPassword': '忘記密碼？',
    'login.button': '登入',
    'login.or': '或',
    'login.google': '使用 Google 帳號登入',
    'login.github': '使用 GitHub 帳號登入',
    'login.noAccount': '還沒有帳號？',
    'login.signup': '立即註冊',
    'login.success': '登入成功！',
    'login.error': '登入失敗，請檢查您的帳號密碼',
    
    // 忘記密碼頁面
    'forgotPassword.backToLogin': '返回登入',
    'forgotPassword.title': '重設密碼',
    'forgotPassword.subtitle': '請輸入您的電子郵件，我們將發送重設密碼的連結給您',
    'forgotPassword.success': '重設密碼的連結已發送至您的信箱',
    'forgotPassword.email.placeholder': '電子郵件',
    'forgotPassword.loading': '處理中...',
    'forgotPassword.button': '發送重設連結',
    'forgotPassword.emailSent': '我們已發送重設密碼的連結至 {email}',
    'forgotPassword.noEmail': '沒收到郵件？',
    'forgotPassword.resend': '重新發送',
    'forgotPassword.rememberPassword': '記起密碼了？',
    'forgotPassword.backToLoginLink': '返回登入',
    
    // 註冊頁面
    'signup.backToHome': '返回首頁',
    'signup.title': '建立帳號',
    'signup.subtitle': '開始使用 AppReviews AI 的所有功能',
    'signup.name.placeholder': '姓名',
    'signup.email.placeholder': '電子郵件',
    'signup.password.placeholder': '密碼',
    'signup.confirmPassword.placeholder': '確認密碼',
    'signup.terms.agree': '我同意',
    'signup.terms.link': '服務條款',
    'signup.privacy.and': '和',
    'signup.privacy.link': '隱私政策',
    'signup.button': '註冊',
    'signup.or': '或',
    'signup.google': '使用 Google 帳號註冊',
    'signup.github': '使用 GitHub 帳號註冊',
    'signup.hasAccount': '已經有帳號了？',
    'signup.login': '立即登入',
    'signup.success': '註冊成功！請登入您的帳號',
    'signup.error': '註冊失敗，請稍後再試',
    
    // 分析頁面
    'analysis.title': '使用說明',
    'analysis.preview': '分析結果預覽',
    'analysis.viewTable': '查看資料表',
    'analysis.filter': '數據篩選',
    'analysis.resetFilter': '重置篩選',
    'analysis.uploadTitle': '上傳檔案',
    'analysis.uploadDesc': '1. 上傳包含用戶評論的CSV或Excel檔案（僅支援.csv、.xlsx、.xls格式）',
    'analysis.uploadDragText': '拖放CSV或Excel檔案到此處，或點擊選擇檔案',
    'analysis.fileRequirement': '2. 檔案第一列應為欄位標題，至少需包含一個評論內容欄位',
    'analysis.autoAnalysis': '3. 系統將自動分析評論內容，生成以下分析結果：',
    'analysis.features': [
      '評分類與情感傾向',
      '關鍵詞提取與統計',
      '文字雲視覺化',
      '整體情感分布分析'
    ],
    'analysis.generateReport': '4. 分析完成後可生成詳細洞察報告',
    'analysis.startButton': '開始分析',
    'analysis.processing': '分析中...',

    // 分析圖表
    'analysis.charts.monthlyTrend': '每月評論數量趨勢 (按裝置分)',
    'analysis.charts.ratingDistribution': '評分分布 (按裝置分)',
    'analysis.charts.totalReviews': '總評論數',
    'analysis.sentiment.positive': '正面',
    'analysis.sentiment.neutral': '中性',
    'analysis.sentiment.negative': '負面',
    'analysis.reviews': '則',
    'analysis.times': '次',
    'analysis.sentiment': '情感分析',
    'analysis.categories': '分類統計',
    'analysis.keywords': '關鍵詞統計 (前20名)',
    'analysis.ratingDetails': '評分分布詳情',
    'analysis.wordCloud': '文字雲分布',
    
    // 分析摘要相關
    'analysis.summary.title': '分析摘要',
    'analysis.summary.totalReviews': '篩選後評論數',
    'analysis.summary.positiveRatio': '正面評價比例',
    'analysis.summary.neutralRatio': '中性評價比例',
    'analysis.summary.negativeRatio': '負評價比例',
    'analysis.summary.averageRating': '平均用戶評分',
    
    // 爬蟲頁面
    'scraper.title': '應用程式評論爬取',
    'scraper.inputAppName': '搜尋應用程式',
    'scraper.searchResults': '應用程式名稱',
    'scraper.noResults': '未找到相關應用程式',
    'scraper.confirmApp': '請確認這是您要爬取評論的應用程式',
    'scraper.appStoreLink': 'Apple Store URL',
    'scraper.playStoreLink': 'Google Play Store URL',
    'scraper.appStorePlaceholder': '輸入 Apple Store 應用程式網址',
    'scraper.playStorePlaceholder': '輸入 Google Play Store 應用程式網址',
    'scraper.startScraping': '開始爬取',
    'scraper.processing': '正在爬取',
    'scraper.reviewData': '評論資料',
    'scraper.reviewCount': '筆',
    'scraper.hideTable': '隱藏資料表',
    'scraper.showTable': '展開資料表',
    
    // 頁尾
    'footer.about': '關於平台',
    'footer.aboutDesc': 'AppReviews AI提供完整的評論爬取和分析服務，幫助開發者更好地理解用戶需求和反饋。',
    'footer.quickLinks': '快速連結',
    'footer.contact': '聯絡我們',
    'footer.email': 'Email: support@appreviewsai.com',
    'footer.phone': '電話: (02) 1234-5678',
    'footer.rights': '© {year} AppReviews AI. All rights reserved.',
    
    // 按鈕和通用文字
    'button.submit': '提交',
    'button.cancel': '取消',
    'button.confirm': '確認',
    'button.upload': '上傳',
    'button.download': '下載',
    'button.search': '搜尋',
    'button.next': '下一步',
    'button.back': '返回',
    'or': '或',
    
    // 首頁
    'home.hero.title': 'AppReviews AI',
    'home.hero.subtitle': '整合 Apple Store 與 Google Play 的評論數據，提供深入的用戶反饋分析',
    'home.features.title': '平台特色',
    'home.features.autoScraping.title': '自動化爬取',
    'home.features.autoScraping.desc': '一鍵爬取 Apple Store 和 Google Play 商店的評論，無需手動收集',
    'home.features.aiAnalysis.title': 'AI 智能分析',
    'home.features.aiAnalysis.desc': '運用先進的 AI 技術進行情感分析、關鍵詞提取和分類',
    'home.features.visualization.title': '視覺化報表',
    'home.features.visualization.desc': '直觀的圖表展示，包括趨勢分析、情感分布、文字雲等',
    'home.howItWorks.title': '使用流程',
    'home.howItWorks.step1.title': '輸入應用程式名稱',
    'home.howItWorks.step1.desc': '輸入應用程式名稱，系統將自動搜尋並顯示 App Store 和 Google Play 的連結',
    'home.howItWorks.step2.title': '自動爬取評論',
    'home.howItWorks.step2.desc': '系統自動爬取並整理評論數據，支援批量處理',
    'home.howItWorks.step3.title': '查看分析結果',
    'home.howItWorks.step3.desc': '在評論分析頁面查看完整的數據分析報告和視覺化圖表',
    'home.cta.title': '準備好開始使用了嗎？',
    'home.cta.subtitle': '立即體驗AppReviews AI',
    'home.cta.button': '開始使用',
    
    // 定價頁面
    'pricing.title': '選擇適合您的方案',
    'pricing.subtitle': '無論您是個人用戶還是企業用戶，我們都有適合您的解決方案',
    'pricing.plan.free.name': '基本版',
    'pricing.plan.free.price': '免費',
    'pricing.plan.free.description': '適合個人使用者',
    'pricing.plan.free.features': [
      '每月分析 100 則評論',
      '基礎情感分析',
      '關鍵字分析',
      '基礎數據導出'
    ],
    'pricing.plan.pro.name': '專業版',
    'pricing.plan.pro.price': 'NT$ 499',
    'pricing.plan.pro.description': '適合小型企業',
    'pricing.plan.pro.features': [
      '每月分析 1,000 則評論',
      '進階情感分析',
      '完整關鍵字分析',
      '評論趨勢分析',
      '優先技術支援',
      'API 存取權限'
    ],
    'pricing.plan.enterprise.name': '企業版',
    'pricing.plan.enterprise.price': '聯繫銷售',
    'pricing.plan.enterprise.description': '適合大型企業',
    'pricing.plan.enterprise.features': [
      '無限評論分析',
      '客製化分析模型',
      '專屬客戶經理',
      '24/7 技術支援',
      '完整 API 整合',
      '優先功能更新'
    ],
    // 定價卡片
    'pricing.card.popular': '熱門方案',
    'pricing.card.features': '包含功能',
    'pricing.card.perMonth': '/月',
    'pricing.card.button.free': '立即開始',
    'pricing.card.button.pro': '選擇方案',
    'pricing.card.button.enterprise': '聯繫我們',
    
    // 學習中心
    'learn.title': '學習中心',
    'learn.analysis.title': '評論分析使用指南',
    'learn.analysis.section1.title': '1. 開始使用評論分析',
    'learn.analysis.section1.steps': [
      '進入評論分析頁面',
      '上傳評論的原始資料',
      '點擊「開始分析」'
    ],
    'learn.analysis.section2.title': '2. 解讀分析結果',
    'learn.analysis.section2.steps': [
      '查看情感分析圖表，了解用戶評價趨勢',
      '透過關鍵字雲了解用戶評論的主題',
      '分析評分分布，掌握用戶滿意度',
      '查看詳細的評論內容分類',
      '查看生成洞察分析報告'
    ],
    'learn.scraper.title': '資料爬取教學',
    'learn.scraper.section1.title': '1. 設定爬取任務',
    'learn.scraper.section1.steps': [
      '輸入目標應用程式的名稱',
      '確認應用程式的名稱是否正確',
      '點擊「開始爬取」，等待爬取完成'
    ],
    'learn.scraper.section2.title': '2. 查看爬取結果',
    'learn.scraper.section2.steps': [
      '在儀表板查看爬取進度',
      '下載評論數據（Excel格式）'
    ],
    'learn.images.analysis.dashboard': '評論分析儀表板',
    'learn.images.analysis.results': '分析結果展示',
    'learn.images.scraper.setup': '爬取任務設定',
    'learn.images.scraper.results': '爬取結果管理',

    // 服務條款頁面
    'terms.title': '服務條款',
    'terms.backToSignup': '返回註冊',
    'terms.section1.title': '1. 服務範圍',
    'terms.section1.description': 'AppReviews AI 提供以下服務：',
    'terms.section1.item1': 'App 評分析與洞察',
    'terms.section1.item2': '自動化評論回覆建議',
    'terms.section1.item3': '評論情緒分析',
    'terms.section1.item4': '競品分析報告',

    'terms.section2.title': '2. 使用規範',
    'terms.section2.description': '用戶在使用本服務時需遵守：',
    'terms.section2.item1': '不得進行任何非法或未經授權的行為',
    'terms.section2.item2': '不得干擾或破壞服務的正常運作',
    'terms.section2.item3': '不得侵犯他人的智慧財產權',
    'terms.section2.item4': '不得濫用系統資源或進行惡意操作',

    'terms.section3.title': '3. 付費方案',
    'terms.section3.description': '關於付費服務的規定：',
    'terms.section3.item1': '費用依據選擇的方案收取',
    'terms.section3.item2': '可選擇月付或年付方案',
    'terms.section3.item3': '升級或降級方案將按比例計費',
    'terms.section3.item4': '取消訂閱後將服務至週期結束',

    'terms.section4.title': '4. 智慧財產權',
    'terms.section4.description': '關於平台內容的權利歸屬：',
    'terms.section4.item1': '平台介面和功能的著作權歸屬本公司',
    'terms.section4.item2': '用戶上傳的內容權利歸屬用戶',
    'terms.section4.item3': '分析報告的使用權歸屬付費用戶',
    'terms.section4.item4': '禁止未經授權轉載或散布平台內容',

    'terms.section5.title': '5. 免責聲明',
    'terms.section5.description': '本服務不承擔以下責任：',
    'terms.section5.item1': '因不可抗力導致的服務中斷',
    'terms.section5.item2': '用戶因使用建議造成的損失',
    'terms.section5.item3': '第三方服務的可用性問題',
    'terms.section5.item4': '用戶間的糾紛或損失',

    'terms.section6.title': '6. 條款修改',
    'terms.section6.description': '關於服務條款的更新：',
    'terms.section6.item1': '本公司保留修改條款的權利',
    'terms.section6.item2': '重大更新將通過郵件通知',
    'terms.section6.item3': '繼續使用服務視為同意新條款',
    'terms.section6.item4': '不同意新條款可終止使用服務',

    // 隱私政策頁面
    'privacy.title': '隱私政策',
    'privacy.backToSignup': '返回註冊',
    'privacy.section1.title': '1. 資料收集',
    'privacy.section1.description': '我們收集的個人資料包括但不限於：',
    'privacy.section1.item1': '基本資料（姓名、電子郵件）',
    'privacy.section1.item2': '使用數據（登入時間、功能使用記錄）',
    'privacy.section1.item3': '裝置資訊（IP 位址、瀏覽器類型）',
    'privacy.section1.item4': '付款資訊（信用卡後四碼、交易記錄）',

    'privacy.section2.title': '2. 資料使用',
    'privacy.section2.description': '我們使用收集的資料用於：',
    'privacy.section2.item1': '提供和改進服務',
    'privacy.section2.item2': '個人化用戶體驗',
    'privacy.section2.item3': '發送服務通知和更新',
    'privacy.section2.item4': '防止濫用和詐騙',

    'privacy.section3.title': '3. 資料保護',
    'privacy.section3.description': '我們採取以下措施保護您的資料：',
    'privacy.section3.item1': '使用加密技術傳輸和儲存資料',
    'privacy.section3.item2': '定期進行安全審查',
    'privacy.section3.item3': '限制員工訪問權限',
    'privacy.section3.item4': '遵守資料保護法規',

    'privacy.section4.title': '4. Cookie 使用',
    'privacy.section4.description': '我們使用 Cookie 和類似技術來：',
    'privacy.section4.item1': '記住您的登入狀態',
    'privacy.section4.item2': '分析使用模式',
    'privacy.section4.item3': '提供個人化體驗',
    'privacy.section4.item4': '改善服務效能',

    'privacy.section5.title': '5. 第三方服務',
    'privacy.section5.description': '我們可能使用第三方服務來：',
    'privacy.section5.item1': '處理付款',
    'privacy.section5.item2': '分析用數據',
    'privacy.section5.item3': '提供客戶支援',
    'privacy.section5.item4': '發送電子郵件通知',

    'privacy.section6.title': '6. 用戶權利',
    'privacy.section6.description': '您擁有以下權利：',
    'privacy.section6.item1': '查看和更正個人資料',
    'privacy.section6.item2': '要求刪除帳戶',
    'privacy.section6.item3': '選擇退出電子郵件通知',
    'privacy.section6.item4': '提出隱私相關問題',

    // 付款頁面
    'checkout.title': '付款資訊',
    'checkout.cardHolder': '持卡人姓名',
    'checkout.cardHolder.placeholder': '請輸入持卡人姓名',
    'checkout.cardNumber': '信用卡號碼',
    'checkout.cardNumber.placeholder': '1234 5678 9012 3456',
    'checkout.expiry': '有效期限',
    'checkout.expiry.placeholder': 'MM/YY',
    'checkout.cvc': 'CVC/CVV',
    'checkout.cvc.placeholder': '信用卡末三碼',
    'checkout.button': '確認付款 {price}',
    'checkout.processing': '處理中...',
    'checkout.error.invalidCard': '請輸入16位數信用卡號碼',
    'checkout.error.paymentFailed': '付款失敗，請稍後再試',
    
    // 付款成功頁面
    'payment.success.title': '付款成功！',
    'payment.success.subtitle': '感謝您訂閱我們的專業版服務',
    'payment.success.description': '您現在可以使用所有進階功能',
    'payment.success.emailNotice': '訂閱確認信已發送至您的信箱',
    'payment.success.button': '返回首頁開始使用',
    
    // 企業方案諮詢頁面
    'enterprise.title': '企業方案諮詢',
    'enterprise.subtitle': '讓我們為您的企業打造最適合的解決方案',
    'enterprise.form.companyName': '公司名稱',
    'enterprise.form.companyName.placeholder': '請輸入公司名稱',
    'enterprise.form.contactPerson': '聯絡人姓名',
    'enterprise.form.contactPerson.placeholder': '請輸入聯絡人姓名',
    'enterprise.form.email': '電子郵件',
    'enterprise.form.email.placeholder': '請輸入電子郵件',
    'enterprise.form.phone': '聯絡電話',
    'enterprise.form.phone.placeholder': '請輸入聯絡電話',
    'enterprise.form.message': '需求說明',
    'enterprise.form.message.placeholder': '請描述您的需求...',
    'enterprise.form.submit': '提交諮詢',
    'enterprise.form.submitting': '提交中...',
    'enterprise.error.submitFailed': '提交失敗，請稍後再試',
    'enterprise.features.title': '企業方案特色',
    'enterprise.features.support.title': '專屬客戶經理',
    'enterprise.features.support.description': '一對一專服務，快速回應您的需求',
    'enterprise.features.customization.title': '客製化解決方案',
    'enterprise.features.customization.description': '根據您的業務需求打造專屬分析模型',
    'enterprise.features.technical.title': '24/7 技術支援',
    'enterprise.features.technical.description': '全天候技術團隊支援，確保服務穩定運行',
    'enterprise.features.contact.title': '聯絡方式',
    
    // 企業方案諮詢成功頁面
    'enterprise.success.title': '表單提交成功！',
    'enterprise.success.response': '預計 1-3 個工作天內與您聯繫',
    'enterprise.success.process.title': '後續流程：',
    'enterprise.success.process.step1': '1. 我們的企業顧問將仔細評估您的需求',
    'enterprise.success.process.step2': '2. 安排線上或實體會議討論詳細合作方案',
    'enterprise.success.process.step3': '3. 提供客製化報價與解決方案',
    'enterprise.success.urgent': '如有緊急需求，歡迎直接聯繫：',
    'enterprise.success.button': '返回首頁',

    // 資料表格相關
    'table.company': '應用程式',
    'table.date': '日期',
    'table.username': '用戶名稱',
    'table.review': '評論內容',
    'table.rating': '評分',
    'table.platform': '平台',
    'table.developerResponse': '開發者回覆',
    'table.language': '語言',
    'table.device': '裝置',
    'table.category': '分類',
    'table.sentiment': '情感',
    'table.keywords': '關鍵詞',
    
    // 分頁相關
    'pagination.showing': '顯示第',
    'pagination.to': '到',
    'pagination.of': '筆，共',
    'pagination.entries': '筆資料',
    'pagination.previous': '上一頁',
    'pagination.next': '下一頁',
    'pagination.info': '第 {current} 頁，共 {total} 頁',
    
    // 日期選擇器
    'filter.startDate': '開始日期',
    'filter.endDate': '結束日期',
    'filter.date.year': '年',
    'filter.date.month': '月',
    'filter.date.day': '日',
    'to': '至',
    
    // 評分分布詳情表格
    'analysis.table.rating': '評分',
    'analysis.table.reviewCount': '評論數',
    'analysis.table.percentage': '佔比',
    'analysis.table.total': '總計',
    
    // AI 洞察分析
    'analysis.generateInsights': '生成洞察分析',
    'analysis.generatingInsights': '生成分析中...',
    'analysis.insightsTitle': 'AI 洞察分析結果',
  },
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.learningCenter': 'Learning Center',
    'nav.login': 'Login',
    'nav.startFree': 'Start Free',
    'nav.menu': 'Menu',
    
    // Features Dropdown
    'features.reviewAnalysis': 'Review Analysis',
    'features.reviewAnalysis.desc': 'Deep analysis of user review data',
    'features.dataScraping': 'Data Scraping',
    'features.dataScraping.desc': 'Automated app store review scraping',

    // Filters
    'filter.dateRange': 'Date Range',
    'filter.devices': 'Devices',
    'filter.ratings': 'Ratings',
    'filter.sentiment': 'Sentiment',
    'filter.categories': 'Categories',
    'filter.reset': 'Reset Filters',
    'filter.selectDateRange': 'Select Date Range',
    'filter.thisMonth': 'This Month',
    'filter.lastMonth': 'Last Month',
    'filter.last7days': 'Last 7 Days',
    'filter.last14days': 'Last 14 Days',
    'filter.last30days': 'Last 30 Days',
    'filter.last3Months': 'Last 3 Months',
    'filter.selectedCompanies': '{count} apps selected',
    'filter.selectCompany': 'Select Application',
    'filter.companies': 'Applications',
    // Filter Options
    'filter.rating.1': '1 Star',
    'filter.rating.2': '2 Stars',
    'filter.rating.3': '3 Stars',
    'filter.rating.4': '4 Stars',
    'filter.rating.5': '5 Stars',
    'filter.sentiment.positive': 'Positive',
    'filter.sentiment.neutral': 'Neutral',
    'filter.sentiment.negative': 'Negative',
    
    // Login Page
    'login.backToHome': 'Back to Home',
    'login.welcome': 'Welcome Back',
    'login.subtitle': 'Sign in to your AppReviews AI account',
    'login.email.placeholder': 'Email',
    'login.password.placeholder': 'Password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.button': 'Sign In',
    'login.or': 'or',
    'login.google': 'Sign in with Google',
    'login.github': 'Sign in with GitHub',
    'login.noAccount': 'Don\'t have an account?',
    'login.signup': 'Sign up now',
    'login.success': 'Login successful!',
    'login.error': 'Login failed, please check your credentials',
    
    // Forgot Password Page
    'forgotPassword.backToLogin': 'Back to Login',
    'forgotPassword.title': 'Reset Password',
    'forgotPassword.subtitle': 'Enter your email and we will send you a password reset link',
    'forgotPassword.success': 'Password reset link has been sent to your email',
    'forgotPassword.email.placeholder': 'Email',
    'forgotPassword.loading': 'Processing...',
    'forgotPassword.button': 'Send Reset Link',
    'forgotPassword.emailSent': 'We have sent a password reset link to {email}',
    'forgotPassword.noEmail': 'Did not receive the email?',
    'forgotPassword.resend': 'Resend',
    'forgotPassword.rememberPassword': 'Remember your password?',
    'forgotPassword.backToLoginLink': 'Back to Login',
    
    // Signup Page
    'signup.backToHome': 'Back to Home',
    'signup.title': 'Create Account',
    'signup.subtitle': 'Start using all features of AppReviews AI',
    'signup.name.placeholder': 'Name',
    'signup.email.placeholder': 'Email',
    'signup.password.placeholder': 'Password',
    'signup.confirmPassword.placeholder': 'Confirm Password',
    'signup.terms.agree': 'I agree to the',
    'signup.terms.link': 'Terms of Service',
    'signup.privacy.and': 'and',
    'signup.privacy.link': 'Privacy Policy',
    'signup.button': 'Sign Up',
    'signup.or': 'or',
    'signup.google': 'Sign up with Google',
    'signup.github': 'Sign up with GitHub',
    'signup.hasAccount': 'Already have an account?',
    'signup.login': 'Sign in now',
    'signup.success': 'Registration successful! Please sign in to your account',
    'signup.error': 'Registration failed, please try again later',
    
    // Analysis Page
    'analysis.title': 'Instructions',
    'analysis.preview': 'Analysis Results Preview',
    'analysis.viewTable': 'View Data Table',
    'analysis.filter': 'Data Filter',
    'analysis.resetFilter': 'Reset Filters',
    'analysis.uploadTitle': 'Upload File',
    'analysis.uploadDesc': '1. Upload CSV or Excel file containing user reviews (supports .csv, .xlsx, .xls)',
    'analysis.uploadDragText': 'Drag and drop CSV or Excel file here, or click to select',
    'analysis.fileRequirement': '2. First row should be column headers, must include at least one review content column',
    'analysis.autoAnalysis': '3. The system will automatically analyze review content and generate the following results:',
    'analysis.features': [
      'Review Classification and Sentiment Analysis',
      'Keyword Extraction and Statistics',
      'Word Cloud Visualization',
      'Overall Sentiment Distribution Analysis'
    ],
    'analysis.generateReport': '4. Generate detailed insight report after analysis',
    'analysis.startButton': 'Start Analysis',
    'analysis.processing': 'Analyzing...',
    
    // Analysis Summary
    'analysis.summary.title': 'Analysis Summary',
    'analysis.summary.totalReviews': 'Filtered Reviews',
    'analysis.summary.positiveRatio': 'Positive Reviews',
    'analysis.summary.neutralRatio': 'Neutral Reviews',
    'analysis.summary.negativeRatio': 'Negative Reviews',
    'analysis.summary.averageRating': 'Average Rating',

    // Analysis Charts
    'analysis.charts.monthlyTrend': 'Monthly Review Trend (By Device)',
    'analysis.charts.ratingDistribution': 'Rating Distribution (By Device)',
    'analysis.charts.totalReviews': 'Total Reviews',
    'analysis.sentiment.positive': 'Positive',
    'analysis.sentiment.neutral': 'Neutral',
    'analysis.sentiment.negative': 'Negative',
    'analysis.reviews': 'reviews',
    'analysis.times': 'times',
    'analysis.sentiment': 'Sentiment Analysis',
    'analysis.categories': 'Category Statistics',
    'analysis.keywords': 'Top 20 Keywords',
    'analysis.ratingDetails': 'Rating Distribution Details',
    'analysis.wordCloud': 'Word Cloud Distribution',
    
    // Scraper Page
    'scraper.title': 'App Review Scraper',
    'scraper.inputAppName': 'Search for app',
    'scraper.searchResults': 'App Name',
    'scraper.noResults': 'No app found',
    'scraper.confirmApp': 'Please confirm this is the app you want to scrape reviews from',
    'scraper.appStoreLink': 'Apple Store URL',
    'scraper.playStoreLink': 'Google Play Store URL',
    'scraper.appStorePlaceholder': 'Enter Apple Store app URL',
    'scraper.playStorePlaceholder': 'Enter Google Play Store app URL',
    'scraper.startScraping': 'Start Scraping',
    'scraper.processing': 'Processing',
    'scraper.reviewData': 'Review Data',
    'scraper.reviewCount': 'items',
    'scraper.hideTable': 'Hide Table',
    'scraper.showTable': 'Show Table',
    
    // Footer
    'footer.about': 'About Platform',
    'footer.aboutDesc': 'AppReviews AI provides comprehensive review scraping and analysis services to help developers better understand user needs and feedback.',
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.email': 'Email: support@appreviewsai.com',
    'footer.phone': 'Phone: (02) 1234-5678',
    'footer.rights': '© {year} AppReviews AI. All rights reserved.',
    
    // Buttons and Common Text
    'button.submit': 'Submit',
    'button.cancel': 'Cancel',
    'button.confirm': 'Confirm',
    'button.upload': 'Upload',
    'button.download': 'Download',
    'button.search': 'Search',
    'button.next': 'Next',
    'button.back': 'Back',
    'or': 'or',
    
    // Home Page
    'home.hero.title': 'AppReviews AI',
    'home.hero.subtitle': 'Integrate and analyze user reviews from Apple Store and Google Play with deep insights',
    'home.features.title': 'Features',
    'home.features.autoScraping.title': 'Automated Scraping',
    'home.features.autoScraping.desc': 'One-click scraping of reviews from Apple Store and Google Play, no manual collection needed',
    'home.features.aiAnalysis.title': 'AI Analysis',
    'home.features.aiAnalysis.desc': 'Advanced AI technology for sentiment analysis, keyword extraction, and classification',
    'home.features.visualization.title': 'Visual Reports',
    'home.features.visualization.desc': 'Intuitive charts including trend analysis, sentiment distribution, and word clouds',
    'home.howItWorks.title': 'How It Works',
    'home.howItWorks.step1.title': 'Enter App Name',
    'home.howItWorks.step1.desc': 'Enter the app name and the system will automatically search and display links for App Store and Google Play',
    'home.howItWorks.step2.title': 'Auto Scraping',
    'home.howItWorks.step2.desc': 'System automatically scrapes and organizes review data, supporting batch processing',
    'home.howItWorks.step3.title': 'View Analysis',
    'home.howItWorks.step3.desc': 'Check the complete data analysis report and visualization charts on the analysis page',
    'home.cta.title': 'Ready to Get Started?',
    'home.cta.subtitle': 'Experience AppReviews AI Now',
    'home.cta.button': 'Get Started',
    
    // Pricing Page
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Whether you are an individual user or an enterprise, we have a solution for you',
    'pricing.plan.free.name': 'Basic',
    'pricing.plan.free.price': 'Free',
    'pricing.plan.free.description': 'Perfect for individuals',
    'pricing.plan.free.features': [
      '100 reviews analysis per month',
      'Basic sentiment analysis',
      'Keyword analysis',
      'Basic data export'
    ],
    'pricing.plan.pro.name': 'Professional',
    'pricing.plan.pro.price': 'NT$ 499',
    'pricing.plan.pro.description': 'Perfect for small businesses',
    'pricing.plan.pro.features': [
      '1,000 reviews analysis per month',
      'Advanced sentiment analysis',
      'Complete keyword analysis',
      'Review trend analysis',
      'Priority technical support',
      'API access'
    ],
    'pricing.plan.enterprise.name': 'Enterprise',
    'pricing.plan.enterprise.price': 'Contact Sales',
    'pricing.plan.enterprise.description': 'Perfect for large enterprises',
    'pricing.plan.enterprise.features': [
      'Unlimited review analysis',
      'Custom analysis models',
      'Dedicated account manager',
      '24/7 technical support',
      'Full API integration',
      'Priority feature updates'
    ],
    // 定價卡片
    'pricing.card.popular': 'Popular',
    'pricing.card.features': 'Features Included',
    'pricing.card.perMonth': '/month',
    'pricing.card.button.free': 'Get Started',
    'pricing.card.button.pro': 'Choose Plan',
    'pricing.card.button.enterprise': 'Contact Us',
    
    // Learning Center
    'learn.title': 'Learning Center',
    'learn.analysis.title': 'Review Analysis Guide',
    'learn.analysis.section1.title': '1. Getting Started with Review Analysis',
    'learn.analysis.section1.steps': [
      'Go to the Review Analysis page',
      'Upload the original review data',
      'Click "Start Analysis"'
    ],
    'learn.analysis.section2.title': '2. Interpreting Analysis Results',
    'learn.analysis.section2.steps': [
      'Check sentiment analysis charts to understand user rating trends',
      'Understand review topics through keyword clouds',
      'Analyze rating distribution to gauge user satisfaction',
      'View detailed review content categorization',
      'Check generated insight analysis report'
    ],
    'learn.scraper.title': 'Data Scraping Tutorial',
    'learn.scraper.section1.title': '1. Setting Up Scraping Task',
    'learn.scraper.section1.steps': [
      'Enter the target application name',
      'Confirm the application name is correct',
      'Click "Start Scraping" and wait for completion'
    ],
    'learn.scraper.section2.title': '2. Viewing Scraping Results',
    'learn.scraper.section2.steps': [
      'Check scraping progress in the dashboard',
      'Download review data (Excel format)'
    ],
    'learn.images.analysis.dashboard': 'Review Analysis Dashboard',
    'learn.images.analysis.results': 'Analysis Results Display',
    'learn.images.scraper.setup': 'Scraping Task Setup',
    'learn.images.scraper.results': 'Scraping Results Management',

    // Terms of Service Page
    'terms.title': 'Terms of Service',
    'terms.backToSignup': 'Return to Signup',
    'terms.section1.title': '1. Service Scope',
    'terms.section1.description': 'AppReviews AI provides the following services:',
    'terms.section1.item1': 'App review analysis and insights',
    'terms.section1.item2': 'Automated review reply suggestions',
    'terms.section1.item3': 'Sentiment analysis',
    'terms.section1.item4': 'Competitor analysis reports',

    'terms.section2.title': '2. Usage Rules',
    'terms.section2.description': 'Users must comply with the following rules when using this service:',
    'terms.section2.item1': 'No illegal or unauthorized actions',
    'terms.section2.item2': 'No interference or disruption of service operation',
    'terms.section2.item3': 'No infringement of intellectual property rights',
    'terms.section2.item4': 'No misuse of system resources or malicious operations',

    'terms.section3.title': '3. Payment Plans',
    'terms.section3.description': 'Rules regarding payment services:',
    'terms.section3.item1': 'Fees are based on the selected plan',
    'terms.section3.item2': 'Monthly or annual payment options are available',
    'terms.section3.item3': 'Upgrade or downgrade plans will be billed proportionally',
    'terms.section3.item4': 'Services will continue until the end of the billing cycle',

    'terms.section4.title': '4. Intellectual Property Rights',
    'terms.section4.description': 'Regarding the ownership of platform content:',
    'terms.section4.item1': 'The copyright of platform interfaces and functions belongs to our company',
    'terms.section4.item2': 'The content uploaded by users belongs to the users',
    'terms.section4.item3': 'The usage rights of analysis reports belong to paid users',
    'terms.section4.item4': 'No unauthorized reprinting or distribution of platform content',

    'terms.section5.title': '5. Disclaimer',
    'terms.section5.description': 'This service does not assume the following responsibilities:',
    'terms.section5.item1': 'Service interruptions due to force majeure',
    'terms.section5.item2': 'Losses caused by users following advice',
    'terms.section5.item3': 'Issues with third-party services',
    'terms.section5.item4': 'Disputes or losses between users',

    'terms.section6.title': '6. Terms Modification',
    'terms.section6.description': 'Regarding updates to the terms of service:',
    'terms.section6.item1': 'Our company reserves the right to modify the terms',
    'terms.section6.item2': 'Major updates will be notified via email',
    'terms.section6.item3': 'Continuing to use the service constitutes agreement to the new terms',
    'terms.section6.item4': 'Discontinuing the service if you do not agree to the new terms',

    // Privacy Policy Page
    'privacy.title': 'Privacy Policy',
    'privacy.backToSignup': 'Return to Signup',
    'privacy.section1.title': '1. Data Collection',
    'privacy.section1.description': 'The personal data we collect include but are not limited to:',
    'privacy.section1.item1': 'Basic information (name, email)',
    'privacy.section1.item2': 'Usage data (login time, feature usage records)',
    'privacy.section1.item3': 'Device information (IP address, browser type)',
    'privacy.section1.item4': 'Payment information (last four digits of credit card, transaction records)',

    'privacy.section2.title': '2. Data Usage',
    'privacy.section2.description': 'We use the collected data for:',
    'privacy.section2.item1': 'Providing and improving services',
    'privacy.section2.item2': 'Personalized user experience',
    'privacy.section2.item3': 'Sending service notifications and updates',
    'privacy.section2.item4': 'Preventing misuse and fraud',

    'privacy.section3.title': '3. Data Protection',
    'privacy.section3.description': 'We take the following measures to protect your data:',
    'privacy.section3.item1': 'Using encryption technology for data transmission and storage',
    'privacy.section3.item2': 'Conducting regular security reviews',
    'privacy.section3.item3': 'Restricting employee access permissions',
    'privacy.section3.item4': 'Complying with data protection laws',

    'privacy.section4.title': '4. Cookie Usage',
    'privacy.section4.description': 'We use cookies and similar technologies to:',
    'privacy.section4.item1': 'Remember your login status',
    'privacy.section4.item2': 'Analyzing usage patterns',
    'privacy.section4.item3': 'Providing personalized experiences',
    'privacy.section4.item4': 'Improving service performance',

    'privacy.section5.title': '5. Third-Party Services',
    'privacy.section5.description': 'We may use third-party services to:',
    'privacy.section5.item1': 'Processing payments',
    'privacy.section5.item2': 'Analyzing usage data',
    'privacy.section5.item3': 'Providing customer support',
    'privacy.section5.item4': 'Sending email notifications',

    'privacy.section6.title': '6. User Rights',
    'privacy.section6.description': 'You have the following rights:',
    'privacy.section6.item1': 'Viewing and correcting personal data',
    'privacy.section6.item2': 'Requesting account deletion',
    'privacy.section6.item3': 'Choosing to opt out of email notifications',
    'privacy.section6.item4': 'Raising privacy-related issues',

    // Checkout Page
    'checkout.title': 'Payment Information',
    'checkout.cardHolder': 'Cardholder Name',
    'checkout.cardHolder.placeholder': 'Enter cardholder name',
    'checkout.cardNumber': 'Card Number',
    'checkout.cardNumber.placeholder': '1234 5678 9012 3456',
    'checkout.expiry': 'Expiry Date',
    'checkout.expiry.placeholder': 'MM/YY',
    'checkout.cvc': 'CVC/CVV',
    'checkout.cvc.placeholder': 'Security code',
    'checkout.button': 'Pay {price}',
    'checkout.processing': 'Processing...',
    'checkout.error.invalidCard': 'Please enter a valid 16-digit card number',
    'checkout.error.paymentFailed': 'Payment failed, please try again later',
    
    // Payment Success Page
    'payment.success.title': 'Payment Successful!',
    'payment.success.subtitle': 'Thank you for subscribing to our Professional plan',
    'payment.success.description': 'You now have access to all premium features',
    'payment.success.emailNotice': 'A confirmation email has been sent to your inbox',
    'payment.success.button': 'Back to Home',
    
    // Enterprise Page
    'enterprise.title': 'Enterprise Solutions',
    'enterprise.subtitle': 'Let us create the perfect solution for your business',
    'enterprise.form.companyName': 'Company Name',
    'enterprise.form.companyName.placeholder': 'Enter company name',
    'enterprise.form.contactPerson': 'Contact Person',
    'enterprise.form.contactPerson.placeholder': 'Enter contact person name',
    'enterprise.form.email': 'Email',
    'enterprise.form.email.placeholder': 'Enter email address',
    'enterprise.form.phone': 'Phone',
    'enterprise.form.phone.placeholder': 'Enter phone number',
    'enterprise.form.message': 'Message',
    'enterprise.form.message.placeholder': 'Describe your requirements...',
    'enterprise.form.submit': 'Submit Inquiry',
    'enterprise.form.submitting': 'Submitting...',
    'enterprise.error.submitFailed': 'Submission failed, please try again later',
    'enterprise.features.title': 'Enterprise Features',
    'enterprise.features.support.title': 'Dedicated Account Manager',
    'enterprise.features.support.description': 'One-on-one dedicated service, quick response to your needs',
    'enterprise.features.customization.title': 'Custom Solutions',
    'enterprise.features.customization.description': 'Tailored analysis models based on your business needs',
    'enterprise.features.technical.title': '24/7 Technical Support',
    'enterprise.features.technical.description': 'Round-the-clock technical team support for stable service',
    'enterprise.features.contact.title': 'Contact Information',
    
    // Enterprise Success Page
    'enterprise.success.title': 'Form Submitted Successfully!',
    'enterprise.success.response': 'We will contact you within 1-3 business days',
    'enterprise.success.process.title': 'Next Steps:',
    'enterprise.success.process.step1': '1. Our enterprise consultant will carefully evaluate your needs',
    'enterprise.success.process.step2': '2. Schedule online or in-person meeting to discuss detailed solutions',
    'enterprise.success.process.step3': '3. Provide customized quotation and solutions',
    'enterprise.success.urgent': 'For urgent inquiries, please contact us directly:',
    'enterprise.success.button': 'Back to Home',

    // Table
    'table.company': 'App Name',
    'table.date': 'Date',
    'table.username': 'Username',
    'table.review': 'Review',
    'table.rating': 'Rating',
    'table.platform': 'Platform',
    'table.developerResponse': 'Developer Response',
    'table.language': 'Language',
    'table.device': 'Device',
    'table.category': 'Category',
    'table.sentiment': 'Sentiment',
    'table.keywords': 'Keywords',
    
    // Pagination
    'pagination.showing': 'Showing',
    'pagination.to': 'to',
    'pagination.of': 'of',
    'pagination.entries': 'entries',
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.info': 'Page {current} of {total}',
    
    // Date Picker
    'filter.startDate': 'Start Date',
    'filter.endDate': 'End Date',
    'filter.date.year': 'Year',
    'filter.date.month': 'Month',
    'filter.date.day': 'Day',
    'to': 'to',
    
    // Rating Distribution Table
    'analysis.table.rating': 'Rating',
    'analysis.table.reviewCount': 'Reviews',
    'analysis.table.percentage': 'Percentage',
    'analysis.table.total': 'Total',
    
    // AI Insights
    'analysis.generateInsights': 'Generate Insights',
    'analysis.generatingInsights': 'Generating Insights...',
    'analysis.insightsTitle': 'AI Insights Analysis Results',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string, variables?: Record<string, string>): TranslationValue => {
    const translation = translations[language]?.[key];
    if (!translation) return key;

    if (Array.isArray(translation)) {
      return translation;
    }

    if (variables && typeof translation === 'string') {
      return Object.entries(variables).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, value),
        translation
      );
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}