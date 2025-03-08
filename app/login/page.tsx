'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 這裡處理登入邏輯
      // 假設登入成功
      localStorage.setItem('isLoggedIn', 'true');
      alert(t('login.success'));
      router.push('/scraper');
    } catch (error) {
      console.error('登入失敗:', error);
      alert(t('login.error'));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 返回按鈕 */}
      <div className="p-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('login.backToHome')}
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[400px] space-y-8">
          {/* 標題區 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('login.welcome')}
            </h1>
            <p className="text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          {/* 表單區 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.email.placeholder') as string}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password.placeholder') as string}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]/20"
                />
                <span className="ml-2 text-gray-600">{t('login.rememberMe')}</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[#0066FF] hover:underline"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium rounded-lg transition-colors duration-200"
            >
              {t('login.button')}
            </button>
          </form>

          {/* 分隔線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('login.or')}</span>
            </div>
          </div>

          {/* 其他登入選項 */}
          <div className="space-y-4">
            <button
              type="button"
              className="w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-700 font-medium">{t('login.google')}</span>
            </button>

            <button
              type="button"
              className="w-full py-3 px-4 bg-black hover:bg-gray-900 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.49.5.09.682-.218.682-.486 0-.236-.009-.866-.013-1.695-2.782.603-3.369-1.338-3.369-1.338-.454-1.152-1.11-1.459-1.11-1.459-.908-.619.069-.605.069-.605 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.115 2.504.337 1.909-1.291 2.747-1.022 2.747-1.022.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .27.18.583.688.485C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span className="font-medium">{t('login.github')}</span>
            </button>
          </div>

          {/* 註冊提示 */}
          <p className="text-center text-gray-600">
            {t('login.noAccount')}
            <Link 
              href="/signup" 
              className="text-[#0066FF] hover:underline ml-1"
            >
              {t('login.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 