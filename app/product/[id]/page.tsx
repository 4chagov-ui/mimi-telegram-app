'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatMoney } from '@/lib/money';
import { useCartStore } from '@/store/cart-store';
import { EmptyState } from '@/components/ui/EmptyState';
import { showTelegramAlert } from '@/lib/telegram';

type Variant = { id: string; name: string; price: number; weight: string | null };
type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  variants: Variant[];
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((categories: { products: Product[] }[]) => {
        const all = categories.flatMap((c) => c.products);
        const p = all.find((pr) => pr.id === id);
        setProduct(p ?? null);
        if (p?.variants?.length === 1) setSelectedVariantId(p.variants[0].id);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.show();
      const handler = () => router.back();
      window.Telegram.WebApp.BackButton.onClick(handler);
      return () => {
        window.Telegram?.WebApp?.BackButton?.hide();
      };
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-tg-hint">Загрузка...</span>
      </div>
    );
  }
  if (!product) {
    return (
      <EmptyState
        title="Товар не найден"
        children={
          <Link href="/catalog" className="text-tg-link">
            В каталог
          </Link>
        }
      />
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const canAdd = selectedVariant != null;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      imageUrl: product.imageUrl ?? undefined,
    });
    showTelegramAlert('Добавлено в корзину');
    router.push('/catalog');
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-gray-300">
            🍱
          </div>
        )}
      </div>
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-tg-text">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-sm text-tg-hint">{product.description}</p>
        )}
        <div className="mt-4">
          <p className="text-sm font-medium text-tg-text">Вариант</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`tap-highlight min-h-[44px] rounded-lg border px-4 py-3 text-sm active:opacity-90 ${
                  selectedVariantId === v.id
                    ? 'border-tg-button bg-tg-button text-tg-button-text'
                    : 'border-gray-300 bg-tg-bg text-tg-text'
                }`}
              >
                {v.name} — {formatMoney(v.price)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="text-lg font-semibold text-tg-text">
            {selectedVariant ? formatMoney(selectedVariant.price) : '—'}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="tap-highlight min-h-[48px] rounded-xl bg-tg-button px-6 py-3 font-medium text-tg-button-text active:opacity-90 disabled:opacity-50"
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
}
