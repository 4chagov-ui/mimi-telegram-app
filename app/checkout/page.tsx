'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { checkoutSchema, type CheckoutPayload, type AddressPayload } from '@/lib/validations';
import { formatMoney } from '@/lib/money';
import { showTelegramAlert } from '@/lib/telegram';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const deliveryType = useCartStore((s) => s.deliveryType);
  const comment = useCartStore((s) => s.comment);
  const cutlery = useCartStore((s) => s.cutlery);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [doorcode, setDoorcode] = useState('');
  const [orderComment, setOrderComment] = useState(comment);
  const [asap, setAsap] = useState(true);
  const [desiredTime, setDesiredTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotalCents = getSubtotal();
  const discountCents =
    appliedPromo === 'FIRST10' && subtotalCents >= 100000
      ? Math.round((subtotalCents * 10) / 100)
      : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/catalog');
    }
  }, [items, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const address: AddressPayload | undefined =
      deliveryType === 'DELIVERY'
        ? { street, building, apartment: apartment || undefined, entrance: entrance || undefined, floor: floor || undefined, doorcode: doorcode || undefined }
        : undefined;
    if (deliveryType === 'DELIVERY' && (!street.trim() || !building.trim())) {
      setError('Укажите улицу и дом');
      return;
    }
    const payload: CheckoutPayload = {
      deliveryType,
      customerName: name.trim(),
      phone: phone.trim().replace(/\D/g, ''),
      address,
      comment: orderComment.trim() || undefined,
      cutlery,
      desiredTime: asap ? undefined : desiredTime.trim() || undefined,
      promoCode: appliedPromo ?? undefined,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        nameSnapshot: i.name,
        variantSnapshot: i.variantName,
        priceSnapshot: i.price,
        qty: i.qty,
      })),
      subtotal: subtotalCents,
      discount: discountCents,
      total: totalCents,
    };
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      setError(first ?? 'Проверьте поля');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Ошибка создания заказа');
        return;
      }
      clearCart();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      router.push(`/order/success?id=${data.orderId}&number=${data.number}`);
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen pb-8">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-tg-bg px-4 py-3">
        <h1 className="text-xl font-bold text-tg-text">Оформление заказа</h1>
      </header>
      <form onSubmit={handleSubmit} className="px-4 py-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tg-text">Имя *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
              placeholder="Иван"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-tg-text">Телефон *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
              placeholder="+7 999 123-45-67"
            />
          </div>
          {deliveryType === 'DELIVERY' && (
            <>
              <div>
                <label className="block text-sm font-medium text-tg-text">Улица, дом *</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className="flex-1 rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
                    placeholder="Улица"
                  />
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    required
                    className="w-20 rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
                    placeholder="Дом"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-tg-hint">Квартира</label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
                  placeholder="Кв."
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm text-tg-hint">Подъезд</label>
                  <input
                    type="text"
                    value={entrance}
                    onChange={(e) => setEntrance(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
                  />
                </div>
                <div>
                  <label className="block text-sm text-tg-hint">Этаж</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
                  />
                </div>
                <div>
                  <label className="block text-sm text-tg-hint">Домофон</label>
                  <input
                    type="text"
                    value={doorcode}
                    onChange={(e) => setDoorcode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
                  />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-tg-text">Комментарий к заказу</label>
            <textarea
              value={orderComment}
              onChange={(e) => setOrderComment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
              rows={2}
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-tg-text">Время доставки</p>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="time"
                  checked={asap}
                  onChange={() => setAsap(true)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Как можно скорее</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="time"
                  checked={!asap}
                  onChange={() => setAsap(false)}
                  className="h-4 w-4"
                />
                <span className="text-sm">К определённому времени</span>
              </label>
            </div>
            {!asap && (
              <input
                type="text"
                value={desiredTime}
                onChange={(e) => setDesiredTime(e.target.value)}
                placeholder="Например: 14:00"
                className="mt-2 w-full rounded-lg border border-gray-300 bg-tg-bg px-3 py-2 text-tg-text"
              />
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-lg font-semibold text-tg-text">
            Итого: {formatMoney(totalCents)}
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="tap-highlight mt-6 min-h-[48px] w-full rounded-xl bg-tg-button py-3 font-medium text-tg-button-text active:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Отправка...' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  );
}
