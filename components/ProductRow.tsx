'use client';

import { Product, ProductVariant } from '@prisma/client';
import Image from 'next/image';
import { Trash2, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { useState } from 'react';
import { deleteProduct } from '@/lib/actions';
import toast from 'react-hot-toast';
import VariantRow from './VariantRow';
import EditProductModal from './EditProductModal';
import { UserRole } from '@/lib/auth';

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export default function ProductRow({
  product,
  locationFilter,
  onProductDeleted,
  userRole = 'guest',
}: {
  product: ProductWithVariants;
  locationFilter?: string;
  onProductDeleted?: () => void;
  userRole?: UserRole;
}) {
  const isAdmin = userRole === 'admin';
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`「${product.name}」とすべてのバリエーションを削除してもよろしいですか？`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteProduct(product.id);

    if (result.success) {
      toast.success('商品を削除しました');
      if (onProductDeleted) {
        onProductDeleted();
      }
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

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="商品を編集"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="商品を削除"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Variants Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  カラー
                </th>
                {(locationFilter === 'all' || locationFilter === 'tokyo' || !locationFilter) && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    東京在庫
                  </th>
                )}
                {(locationFilter === 'all' || locationFilter === 'osaka' || !locationFilter) && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    大阪在庫
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.variants.map((variant) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  locationFilter={locationFilter}
                  userRole={userRole}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={product}
          onProductUpdated={onProductDeleted}
        />
      )}
    </div>
  );
}
