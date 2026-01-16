'use client';

import { useEffect } from 'react';
import { Package } from 'lucide-react';

export default function LogoutPage() {
  useEffect(() => {
    // ブラウザの認証情報をクリアするために、無効な認証情報でリクエストを送る
    const clearAuth = async () => {
      try {
        await fetch('/dashboard', {
          headers: {
            'Authorization': 'Basic ' + btoa('logout:logout')
          }
        });
      } catch (error) {
        // エラーは無視
      }
    };

    clearAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <Package className="mx-auto text-blue-600 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ログアウトしました
        </h1>
        <p className="text-gray-600 mb-6">
          StockYard Managerからログアウトしました。
        </p>
        <button
          onClick={handleLogin}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          再ログイン
        </button>
      </div>
    </div>
  );
}
