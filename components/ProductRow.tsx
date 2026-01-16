'use client';

import { Product, ProductVariant } from '@prisma/client';
import Image from 'next/image';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { deleteProduct } from '@/lib/actions';
import toast from 'react-hot-toast';
import VariantRow from './VariantRow';

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export default function ProductRow({
  product,
  locationFilter
}: {
  product: ProductWithVariants;
  locationFilter?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`「${product.name}」とすべてのバリエーションを削除してもよろしいですか？`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteProduct(product.id);

    if (result.success) {
      toast.success('商品を削除しました');
    } else {
      toast.error('商品の削除に失敗しました');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Product Header */}
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <Image
              src={product.imageUrl || '/no-image.png'}
              alt={product.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/no-image.png';
              }}
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.variants.length} バリエーション</p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="Delete product"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Variants Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Color
                </th>
                {(locationFilter === 'all' || locationFilter === 'tokyo' || !locationFilter) && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tokyo Stock
                  </th>
                )}
                {(locationFilter === 'all' || locationFilter === 'osaka' || !locationFilter) && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Osaka Stock
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.variants.map((variant) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  locationFilter={locationFilter}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
