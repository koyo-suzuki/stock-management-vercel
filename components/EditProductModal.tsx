'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { updateProduct } from '@/lib/actions';
import toast from 'react-hot-toast';
import { Product, ProductVariant } from '@prisma/client';

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

type Variant = {
  id?: string;
  color: string;
  stockTokyo: number;
  stockOsaka: number;
  minStock: number;
};

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithVariants;
  onProductUpdated?: () => void;
}) {
  const [productName, setProductName] = useState(product.name);
  const [imageUrl, setImageUrl] = useState(product.imageUrl || '');
  const [variants, setVariants] = useState<Variant[]>(
    product.variants.map(v => ({
      id: v.id,
      color: v.color,
      stockTokyo: v.stockTokyo,
      stockOsaka: v.stockOsaka,
      minStock: v.minStock,
    }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const addVariant = () => {
    setVariants([...variants, { color: '', stockTokyo: 0, stockOsaka: 0, minStock: 0 }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error('商品名を入力してください');
      return;
    }

    const filledVariants = variants.filter(v => v.color.trim());

    if (filledVariants.length === 0) {
      toast.error('少なくとも1つのバリエーションが必要です');
      return;
    }

    setIsSubmitting(true);

    const result = await updateProduct({
      productId: product.id,
      name: productName,
      imageUrl: imageUrl || undefined,
      variants: filledVariants,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('商品を更新しました');
      onClose();
      if (onProductUpdated) {
        onProductUpdated();
      }
    } else {
      toast.error(result.error || '商品の更新に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">商品を編集</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Product Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">商品情報</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="例: Tシャツ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">カラーバリエーション</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus size={16} />
                  バリエーション追加
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            カラー <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                            placeholder="例: 赤"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            東京在庫
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stockTokyo}
                            onChange={(e) => updateVariant(index, 'stockTokyo', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            大阪在庫
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stockOsaka}
                            onChange={(e) => updateVariant(index, 'stockOsaka', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            最小在庫
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.minStock}
                            onChange={(e) => updateVariant(index, 'minStock', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors mt-5"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '更新中...' : '商品を更新'}
          </button>
        </div>
      </div>
    </div>
  );
}
