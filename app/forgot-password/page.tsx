'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 這裡模擬發送重設密碼郵件
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 返回按鈕 */}
      <div className="p-4">
        <Link 
          href="/login" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('forgotPassword.backToLogin') as string}
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[400px] space-y-8">
          {/* 標題區 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('forgotPassword.title') as string}
            </h1>
            <p className="text-gray-600">
              {!isSubmitted 
                ? t('forgotPassword.subtitle') as string
                : t('forgotPassword.success') as string}
            </p>
          </div>

          {!isSubmitted ? (
            // 表單區
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forgotPassword.email.placeholder') as string}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('forgotPassword.loading') as string}
                  </>
                ) : t('forgotPassword.button') as string}
              </button>
            </form>
          ) : (
            // 成功訊息
            <div className="space-y-6">
              <div className="bg-green-50 text-green-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {t('forgotPassword.emailSent', { email }) as string}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>{t('forgotPassword.noEmail') as string}</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#0066FF] hover:underline font-medium"
                >
                  {t('forgotPassword.resend') as string}
                </button>
              </div>
            </div>
          )}

          {/* 提示訊息 */}
          <div className="text-center text-sm text-gray-600">
            {t('forgotPassword.rememberPassword') as string}
            <Link 
              href="/login" 
              className="text-[#0066FF] hover:underline ml-1 font-medium"
            >
              {t('forgotPassword.backToLoginLink') as string}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 