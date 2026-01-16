'use client';

import { ProductVariant } from '@prisma/client';
import { useState } from 'react';
import { updateStock } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';

export default function VariantRow({
  variant,
  locationFilter
}: {
  variant: ProductVariant;
  locationFilter?: string;
}) {
  // Optimistic UI state
  const [tokyoStock, setTokyoStock] = useState(variant.stockTokyo);
  const [osakaStock, setOsakaStock] = useState(variant.stockOsaka);
  const [isSaving, setIsSaving] = useState(false);

  // Pending changes
  const [pendingTokyoStock, setPendingTokyoStock] = useState<number | null>(null);
  const [pendingOsakaStock, setPendingOsakaStock] = useState<number | null>(null);

  const handleConfirm = async (field: 'stockTokyo' | 'stockOsaka') => {
    const value = field === 'stockTokyo' ? pendingTokyoStock : pendingOsakaStock;
    if (value === null) return;

    setIsSaving(true);

    const result = await updateStock({
      variantId: variant.id,
      field,
      value,
    });

    setIsSaving(false);

    if (result.success) {
      if (field === 'stockTokyo') {
        setTokyoStock(value);
        setPendingTokyoStock(null);
      } else {
        setOsakaStock(value);
        setPendingOsakaStock(null);
      }
      toast.success('在庫を更新しました');
    } else {
      toast.error('在庫の更新に失敗しました');
    }
  };

  const handleCancel = (field: 'stockTokyo' | 'stockOsaka') => {
    if (field === 'stockTokyo') {
      setPendingTokyoStock(null);
    } else {
      setPendingOsakaStock(null);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: variant.color.toLowerCase() }}
            title={variant.color}
          />
          <span className="font-medium text-gray-900">{variant.color}</span>
        </div>
      </td>

      {(locationFilter === 'all' || locationFilter === 'tokyo' || !locationFilter) && (
        <td className="px-4 py-3">
          <div className="relative">
            <select
              value={pendingTokyoStock !== null ? pendingTokyoStock : tokyoStock}
              onChange={(e) => setPendingTokyoStock(parseInt(e.target.value))}
              className="w-20 px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white cursor-pointer text-sm"
              disabled={isSaving}
            >
              {Array.from({ length: 101 }, (_, i) => i).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            {pendingTokyoStock !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => handleCancel('stockTokyo')}>
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">在庫数の変更</h3>
                  <p className="text-sm text-gray-700 mb-6">
                    <span className="font-medium">{tokyoStock}</span> → <span className="font-medium text-blue-600">{pendingTokyoStock}</span> に変更しますか？
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCancel('stockTokyo')}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleConfirm('stockTokyo')}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {isSaving ? '更新中...' : '確定'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </td>
      )}

      {(locationFilter === 'all' || locationFilter === 'osaka' || !locationFilter) && (
        <td className="px-4 py-3">
          <div className="relative">
            <select
              value={pendingOsakaStock !== null ? pendingOsakaStock : osakaStock}
              onChange={(e) => setPendingOsakaStock(parseInt(e.target.value))}
              className="w-20 px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white cursor-pointer text-sm"
              disabled={isSaving}
            >
              {Array.from({ length: 101 }, (_, i) => i).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            {pendingOsakaStock !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => handleCancel('stockOsaka')}>
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">在庫数の変更</h3>
                  <p className="text-sm text-gray-700 mb-6">
                    <span className="font-medium">{osakaStock}</span> → <span className="font-medium text-blue-600">{pendingOsakaStock}</span> に変更しますか？
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCancel('stockOsaka')}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleConfirm('stockOsaka')}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {isSaving ? '更新中...' : '確定'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
