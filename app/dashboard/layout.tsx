import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { LogOut, Package } from 'lucide-react';
import { handleSignOut } from '@/lib/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  StockYard Manager
                </h1>
                <p className="text-sm text-gray-600">v3.1 - Inventory Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-semibold">{session.user.username}</span>
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
