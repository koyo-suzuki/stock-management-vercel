import DashboardHeader from '@/components/DashboardHeader';
import { getUserRole } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userRole = await getUserRole();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userRole={userRole} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
