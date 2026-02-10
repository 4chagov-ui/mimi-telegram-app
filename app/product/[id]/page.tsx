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
  const id = typeof params?.id === 'string' ? params.id : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data: unknown) => {
        const categories = Array.isArray(data) ? data : [];
        const all = categories.flatMap((c: { products?: Product[] }) => Array.isArray(c?.products) ? c.products : []);
        const p = all.find((pr: Product) => pr?.id === id) ?? null;
        setProduct(p);
        if (p && Array.isArray(p.variants) && p.variants.length === 1 && p.variants[0]?.id) {
          setSelectedVariantId(p.variants[0].id);
        }
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

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant = variants.find((v) => v?.id === selectedVariantId) ?? variants[0] ?? null;
  const canAdd = selectedVariant != null;

  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const safeItems = mounted && Array.isArray(items) ? items : [];
  const cartQty =
    selectedVariant
      ? (safeItems.find(
          (i) => i.productId === product.id && (i.variantId ?? '') === (selectedVariant.id ?? '')
        )?.qty ?? 0)
      : 0;

  const handleAdd = () => {
    if (!selectedVariant || !product) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name ?? '',
      variantName: selectedVariant.name ?? null,
      price: typeof selectedVariant.price === 'number' ? selectedVariant.price : 0,
      imageUrl: product.imageUrl && String(product.imageUrl).trim() ? product.imageUrl : undefined,
    });
    const newQty = cartQty + 1;
    showTelegramAlert(newQty > 1 ? `Добавлено в корзину (${newQty} шт.)` : 'Добавлено в корзину');
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-gray-200 bg-tg-bg/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.back()}
          className="tap-highlight -ml-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-tg-text active:opacity-80"
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-tg-text">{product.name ?? ''}</h1>
      </header>
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        {product.imageUrl && String(product.imageUrl).trim() ? (
          <Image
            src={product.imageUrl}
            alt={product.name ?? ''}
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
        <h2 className="text-xl font-bold text-tg-text">{product.name ?? ''}</h2>
        {product.description && (
          <p className="mt-2 text-sm text-tg-hint">{product.description}</p>
        )}
        <div className="mt-4">
          <p className="text-sm font-medium text-tg-text">Вариант</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const price = typeof v?.price === 'number' ? v.price : 0;
              return (
                <button
                  key={v?.id ?? `variant-${idx}`}
                  type="button"
                  onClick={() => setSelectedVariantId(v?.id ?? null)}
                  className={`tap-highlight min-h-[44px] rounded-lg border px-4 py-3 text-sm active:opacity-90 ${
                    selectedVariantId === v?.id
                      ? 'border-tg-button bg-tg-button text-tg-button-text'
                      : 'border-gray-300 bg-tg-bg text-tg-text'
                  }`}
                >
                  {v?.name ?? ''} — {formatMoney(price)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold text-tg-text">
            {selectedVariant && typeof selectedVariant.price === 'number'
              ? formatMoney(selectedVariant.price)
              : '—'}
          </span>
          <div className="flex flex-1 items-center justify-end gap-2">
            {cartQty > 0 && (
              <span className="text-sm text-tg-hint">В корзине: {cartQty}</span>
            )}
            {cartQty > 0 && selectedVariant && (
              <button
                type="button"
                onClick={() => updateQty(product.id, selectedVariant.id, 1)}
                className="tap-highlight flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-tg-button text-xl font-medium text-tg-button-text active:opacity-90"
                aria-label="Добавить ещё одну"
              >
                +
              </button>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd}
              className="tap-highlight min-h-[48px] rounded-xl bg-tg-button px-6 py-3 font-medium text-tg-button-text active:opacity-90 disabled:opacity-50"
            >
              {cartQty > 0 ? 'Добавить ещё' : 'Добавить в корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
