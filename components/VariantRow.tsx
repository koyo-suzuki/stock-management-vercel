'use client';

import { ProductVariant } from '@prisma/client';
import { useState } from 'react';
import { updateStock } from '@/lib/actions';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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

  const totalStock = tokyoStock + osakaStock;
  const isLowStock = totalStock < variant.minStock;

  const handleStockUpdate = async (field: 'stockTokyo' | 'stockOsaka', value: number) => {
    if (value < 0) return;

    // Optimistic update
    if (field === 'stockTokyo') {
      setTokyoStock(value);
    } else {
      setOsakaStock(value);
    }

    setIsSaving(true);

    const result = await updateStock({
      variantId: variant.id,
      field,
      value,
    });

    setIsSaving(false);

    if (!result.success) {
      // Revert on error
      if (field === 'stockTokyo') {
        setTokyoStock(variant.stockTokyo);
      } else {
        setOsakaStock(variant.stockOsaka);
      }
      toast.error('在庫の更新に失敗しました');
    }
  };

  return (
    <tr className={`${isLowStock ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}>
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
          <input
            type="number"
            min="0"
            value={tokyoStock}
            onChange={(e) => setTokyoStock(parseInt(e.target.value) || 0)}
            onBlur={(e) => handleStockUpdate('stockTokyo', parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            disabled={isSaving}
          />
        </td>
      )}

      {(locationFilter === 'all' || locationFilter === 'osaka' || !locationFilter) && (
        <td className="px-4 py-3">
          <input
            type="number"
            min="0"
            value={osakaStock}
            onChange={(e) => setOsakaStock(parseInt(e.target.value) || 0)}
            onBlur={(e) => handleStockUpdate('stockOsaka', parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
            disabled={isSaving}
          />
        </td>
      )}

      <td className="px-4 py-3">
        <span className="font-semibold text-gray-900">{totalStock}</span>
      </td>

      <td className="px-4 py-3">
        <span className="text-gray-600">{variant.minStock}</span>
      </td>

      <td className="px-4 py-3">
        {isLowStock ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={18} />
            <span className="text-sm font-semibold">在庫少</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={18} />
            <span className="text-sm">良好</span>
          </div>
        )}
      </td>
    </tr>
  );
}
