'use client';

import { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import { getStockHistory } from '@/lib/actions';
import { StockHistory, ProductVariant, Product } from '@prisma/client';

type StockHistoryWithRelations = StockHistory & {
  variant: ProductVariant & {
    product: Product;
  };
};

export default function StockHistoryModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<StockHistoryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getStockHistory(100);
    setHistory(data as StockHistoryWithRelations[]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  const getLocationLabel = (field: string) => {
    return field === 'stockTokyo' ? '東京' : '大阪';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">在庫変更履歴</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">まだ履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => {
                const change = item.newValue - item.oldValue;
                const isIncrease = change > 0;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.variant.product.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            {item.variant.color}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                            {getLocationLabel(item.field)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">{item.oldValue}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-gray-900">{item.newValue}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isIncrease
                                ? 'bg-green-100 text-green-700'
                                : change < 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isIncrease ? '+' : ''}{change}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
