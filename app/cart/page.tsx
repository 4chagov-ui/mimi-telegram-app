'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/money';
import { useCartStore } from '@/store/cart-store';
import { EmptyState } from '@/components/ui/EmptyState';
export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const comment = useCartStore((s) => s.comment);
  const cutlery = useCartStore((s) => s.cutlery);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const setComment = useCartStore((s) => s.setComment);
  const setCutlery = useCartStore((s) => s.setCutlery);
  const setAppliedPromo = useCartStore((s) => s.setAppliedPromo);
  const updateQty = useCartStore((s) => s.updateQty);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotalCents = getSubtotal();
  const effectiveDiscount =
    appliedPromo === 'FIRST10' && subtotalCents >= 100000
      ? Math.round((subtotalCents * 10) / 100)
      : appliedPromo
        ? discount
        : 0;
  const totalCents = Math.max(0, subtotalCents - effectiveDiscount);

  useEffect(() => {
    if (appliedPromo === 'FIRST10' && subtotalCents >= 100000) {
      setDiscount(Math.round((subtotalCents * 10) / 100));
    }
  }, [appliedPromo, subtotalCents]);

  const displayTotal = Math.max(0, subtotalCents - effectiveDiscount);
  useEffect(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    const main = tg?.MainButton;
    if (!main) return;
    if (items.length === 0) {
      main.hide();
      return;
    }
    main.setText(`Оформить • ${formatMoney(displayTotal)}`);
    main.show();
    const handler = () => router.push('/checkout');
    main.onClick(handler);
    return () => {
      main.offClick(handler);
      main.hide();
    };
  }, [items.length, displayTotal, router]);

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError(null);
    try {
      const res = await fetch('/api/promocode/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotalCents }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setAppliedPromo(data.code);
        setPromoError(null);
      } else {
        setPromoError(data.error ?? 'Промокод не действует');
        setDiscount(0);
        setAppliedPromo(null);
      }
    } catch {
      setPromoError('Ошибка проверки промокода');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8">
        <h1 className="text-xl font-bold text-tg-text">Корзина</h1>
        <EmptyState
          title="Корзина пуста"
          description="Добавьте блюда из каталога"
          children={
            <Link
              href="/catalog"
              className="tap-highlight min-h-[44px] inline-flex items-center rounded-lg bg-tg-button px-4 py-3 text-tg-button-text active:opacity-90"
            >
              В каталог
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-tg-bg px-4 py-3">
        <h1 className="text-xl font-bold text-tg-text">Корзина</h1>
      </header>
      <main className="px-4 py-4">
        <div className="space-y-3">
          {items.map((i) => (
            <div
              key={`${i.productId}:${i.variantId ?? ''}`}
              className="flex items-center gap-3 rounded-xl bg-tg-secondary p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-tg-text">
                  {i.name}
                  {i.variantName ? ` (${i.variantName})` : ''}
                </p>
                <p className="text-sm text-tg-hint">{formatMoney(i.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQty(i.productId, i.variantId, -1)}
                  className="tap-highlight flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gray-300 text-lg font-medium text-tg-text active:opacity-90"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center font-medium">{i.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(i.productId, i.variantId, 1)}
                  className="tap-highlight flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-tg-button text-lg font-medium text-tg-button-text active:opacity-90"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-tg-text">
            Комментарий к заказу
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Пожелания, аллергии..."
            className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-sm text-tg-text placeholder:text-tg-hint"
            rows={2}
          />
        </div>

        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={cutlery}
            onChange={(e) => setCutlery(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-tg-text">Приборы</span>
        </label>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder="Промокод"
            className="flex-1 rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-sm text-tg-text"
          />
          <button
            type="button"
            onClick={applyPromo}
            className="tap-highlight min-h-[44px] rounded-lg bg-tg-secondary px-4 py-3 text-sm font-medium text-tg-text active:opacity-90"
          >
            Применить
          </button>
        </div>
        {appliedPromo && (
          <p className="mt-1 text-sm text-green-600">
            Промокод {appliedPromo} применён (−{formatMoney(effectiveDiscount)})
          </p>
        )}
        {promoError && (
          <p className="mt-1 text-sm text-red-600">{promoError}</p>
        )}

        <div className="mt-6 space-y-1 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-tg-hint">Подытог</span>
            <span className="text-tg-text">{formatMoney(subtotalCents)}</span>
          </div>
          {effectiveDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-tg-hint">Скидка</span>
              <span className="text-green-600">−{formatMoney(effectiveDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold text-tg-text">
            <span>Итого</span>
            <span>{formatMoney(totalCents)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/checkout')}
          className="mt-6 w-full rounded-xl bg-tg-button py-3 font-medium text-tg-button-text"
        >
          Оформить заказ • {formatMoney(displayTotal)}
        </button>
      </main>
    </div>
  );
}
