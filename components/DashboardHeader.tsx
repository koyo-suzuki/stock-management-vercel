'use client';

import { Package, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/auth';

export default function DashboardHeader({ userRole }: { userRole: UserRole }) {
  const router = useRouter();

  const handleLogout = () => {
    // Basic認証をクリアするために、間違った認証情報で401を発生させる
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa('invalid:invalid')
      }
    }).then(() => {
      // ブラウザの認証情報をクリア
      window.location.href = '/logout';
    }).catch(() => {
      // エラーが発生してもログアウトページに遷移
      window.location.href = '/logout';
    });
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                StockYard Manager
              </h1>
              <p className="text-sm text-gray-600">
                v3.2 - Inventory Management System
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {userRole === 'admin' ? '管理者' : 'ゲスト'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            title="ログアウト"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  );
}
