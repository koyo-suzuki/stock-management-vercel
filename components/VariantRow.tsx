'use client';

import { ProductVariant } from '@prisma/client';
import { useState } from 'react';
import { updateStock } from '@/lib/actions';
import toast from 'react-hot-toast';

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
          <select
            value={tokyoStock}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              setTokyoStock(newValue);
              handleStockUpdate('stockTokyo', newValue);
            }}
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white cursor-pointer"
            disabled={isSaving}
          >
            {Array.from({ length: 101 }, (_, i) => i).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </td>
      )}

      {(locationFilter === 'all' || locationFilter === 'osaka' || !locationFilter) && (
        <td className="px-4 py-3">
          <select
            value={osakaStock}
            onChange={(e) => {
              const newValue = parseInt(e.target.value);
              setOsakaStock(newValue);
              handleStockUpdate('stockOsaka', newValue);
            }}
            className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white cursor-pointer"
            disabled={isSaving}
          >
            {Array.from({ length: 101 }, (_, i) => i).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </td>
      )}
    </tr>
  );
}
