import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { search?: string; location?: string };
}) {
  return (
    <DashboardContent
      searchQuery={searchParams.search}
      locationFilter={searchParams.location}
    />
  );
}
