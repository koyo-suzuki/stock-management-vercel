import DashboardContent from '@/components/DashboardContent';
import { getUserRole } from '@/lib/auth';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { search?: string; location?: string };
}) {
  const userRole = await getUserRole();

  return (
    <DashboardContent
      searchQuery={searchParams.search}
      locationFilter={searchParams.location}
      userRole={userRole}
    />
  );
}
