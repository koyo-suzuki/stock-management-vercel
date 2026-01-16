'use client';

import { useEffect, useState } from 'react';
import { getProducts } from '@/lib/actions';
import ProductRow from './ProductRow';
import { Package } from 'lucide-react';
import { Product, ProductVariant } from '@prisma/client';

type ProductWithVariants = Product & {
  variants: ProductVariant[];
};

export default function ProductList({
  searchQuery,
  locationFilter
}: {
  searchQuery?: string;
  locationFilter?: string;
}) {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data as ProductWithVariants[]);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Package className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">商品が見つかりません</h3>
        <p className="text-gray-500">
          {searchQuery ? '検索条件を変更してみてください' : '最初の商品を追加して始めましょう'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredProducts.map((product) => (
        <ProductRow key={product.id} product={product} locationFilter={locationFilter} />
      ))}
    </div>
  );
}
