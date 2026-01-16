'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { createProduct } from '@/lib/actions';
import toast from 'react-hot-toast';

type Variant = {
  color: string;
  stockTokyo: number;
  stockOsaka: number;
  minStock: number;
};

export default function CreateProductModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [productName, setProductName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { color: '', stockTokyo: 0, stockOsaka: 0, minStock: 0 },
  ]);
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

    if (variants.some(v => !v.color.trim())) {
      toast.error('すべてのバリエーションにカラーを入力してください');
      return;
    }

    setIsSubmitting(true);

    const result = await createProduct({
      name: productName,
      imageUrl: imageUrl || undefined,
      variants,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('商品を作成しました');
      // Reset form
      setProductName('');
      setImageUrl('');
      setVariants([{ color: '', stockTokyo: 0, stockOsaka: 0, minStock: 0 }]);
      onClose();
    } else {
      toast.error(result.error || '商品の作成に失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">新規商品作成</h2>
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
                  商品名 *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
                  placeholder="例: コットンTシャツ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL（任意）
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 bg-white"
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  バリエーション追加
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            カラー *
                          </label>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={(e) => updateVariant(index, 'color', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                            placeholder="赤"
                            required
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
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                          />
                        </div>
                      </div>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors mt-6"
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
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '作成中...' : '商品を作成'}
          </button>
        </div>
      </div>
    </div>
  );
}
