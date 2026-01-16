'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Download, MapPin } from 'lucide-react';
import CreateProductModal from './CreateProductModal';
import ProductList from './ProductList';
import { exportToCSV } from '@/lib/actions';
import toast from 'react-hot-toast';

export default function DashboardContent({
  searchQuery,
  locationFilter,
}: {
  searchQuery?: string;
  locationFilter?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery || '');
  const [activeLocation, setActiveLocation] = useState(locationFilter || 'all');
  const [isExporting, setIsExporting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleLocationChange = (location: string) => {
    setActiveLocation(location);
    const params = new URLSearchParams(searchParams.toString());
    if (location !== 'all') {
      params.set('location', location);
    } else {
      params.delete('location');
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    const result = await exportToCSV();
    setIsExporting(false);

    if (result.success && result.csv) {
      // Create blob and download
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV exported successfully');
    } else {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="商品を検索..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={20} />
            <span className="hidden sm:inline">CSV出力</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 md:flex-initial justify-center"
          >
            <Plus size={20} />
            商品を追加
          </button>
        </div>
      </div>

      {/* Location Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => handleLocationChange('all')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeLocation === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          全ロケーション
        </button>
        <button
          onClick={() => handleLocationChange('tokyo')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeLocation === 'tokyo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin size={18} />
          東京
        </button>
        <button
          onClick={() => handleLocationChange('osaka')}
          className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
            activeLocation === 'osaka'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin size={18} />
          大阪
        </button>
      </div>

      {/* Product List */}
      <ProductList searchQuery={searchValue} locationFilter={activeLocation} refreshTrigger={refreshTrigger} />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductCreated={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}
