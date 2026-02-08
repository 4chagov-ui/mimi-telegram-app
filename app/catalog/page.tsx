'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import { CategoryTabs } from '@/components/catalog/CategoryTabs';
import { ProductCard } from '@/components/catalog/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';

type Variant = { id: string; name: string; price: number };
type Product = {
  id: string;
  name: string;
  imageUrl: string | null;
  variants: Variant[];
};
type Category = { id: string; name: string; sort: number; products: Product[] };

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const deliveryType = useCartStore((s) => s.deliveryType);
  const setDeliveryType = useCartStore((s) => s.setDeliveryType);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then(setCategories)
      .catch(() => setError('Не удалось загрузить меню'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categories.length && !activeCategoryId) setActiveCategoryId(categories[0].id);
  }, [categories, activeCategoryId]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const products = activeCategory?.products ?? [];
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-tg-bg/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-tg-text">МИМИ</h1>
          <Link
            href="/cart"
            className="relative rounded-full bg-tg-secondary p-2 text-tg-text"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-tg-button text-xs text-tg-button-text">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
        <div className="flex gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={() => setDeliveryType('DELIVERY')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              deliveryType === 'DELIVERY'
                ? 'bg-tg-button text-tg-button-text'
                : 'bg-tg-secondary text-tg-text'
            }`}
          >
            Доставка
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType('PICKUP')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${
              deliveryType === 'PICKUP'
                ? 'bg-tg-button text-tg-button-text'
                : 'bg-tg-secondary text-tg-text'
            }`}
          >
            Самовывоз
          </button>
        </div>
        <div className="px-4">
          <CategoryTabs
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            activeId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />
        </div>
      </header>

      <main className="px-4 py-4">
        {loading && (
          <div className="flex justify-center py-12">
            <span className="text-tg-hint">Загрузка...</span>
          </div>
        )}
        {error && (
          <EmptyState
            title="Ошибка"
            description={error}
            children={
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-tg-button px-4 py-2 text-sm text-tg-button-text"
              >
                Обновить
              </button>
            }
          />
        )}
        {!loading && !error && products.length === 0 && (
          <EmptyState title="В этой категории пока ничего нет" />
        )}
        {!loading && !error && products.length > 0 && (
          <div className="space-y-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                imageUrl={p.imageUrl}
                variants={p.variants}
                onAdd={(productId, variantId, name, variantName, price, imageUrl) =>
                  addItem({
                    productId,
                    variantId,
                    name,
                    variantName,
                    price,
                    imageUrl,
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
