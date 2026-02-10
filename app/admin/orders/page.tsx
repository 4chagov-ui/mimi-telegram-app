'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatMoney } from '@/lib/money';

const STATUSES = ['NEW', 'PENDING_PAYMENT', 'COOKING', 'DELIVERY', 'DONE', 'CANCELED'] as const;
const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый',
  PENDING_PAYMENT: 'Ожидает оплаты',
  COOKING: 'Готовится',
  DELIVERY: 'Доставка',
  DONE: 'Выполнен',
  CANCELED: 'Отменён',
};

type OrderItem = {
  id: string;
  nameSnapshot: string;
  variantSnapshot: string | null;
  priceSnapshot: number;
  qty: number;
};

type Order = {
  id: string;
  number: number;
  status: string;
  deliveryType: string;
  customerName: string;
  phone: string;
  addressJson: string | null;
  comment: string | null;
  cutlery: boolean;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  desiredTime: string | null;
  createdAt: string;
  items: OrderItem[];
};

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = () => {
    if (!token) {
      setError('Укажите token в URL: /admin/orders?token=YOUR_ADMIN_TOKEN');
      setLoading(false);
      return;
    }
    setError(null);
    const url = statusFilter
      ? `/api/admin/orders?token=${encodeURIComponent(token)}&status=${statusFilter}`
      : `/api/admin/orders?token=${encodeURIComponent(token)}`;
    fetch(url)
      .then((r) => {
        if (r.status === 401) throw new Error('Неверный токен');
        return r.json();
      })
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, statusFilter]);

  const updateStatus = (orderId: string, status: string) => {
    fetch(`/api/admin/orders/${orderId}/status?token=${encodeURIComponent(token)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((r) => (r.ok ? fetchOrders() : Promise.reject()))
      .catch(() => setError('Не удалось обновить статус'));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-xl font-bold">Админка заказов</h1>
        <p className="mt-4 text-gray-600">
          Добавьте в URL параметр token: /admin/orders?token=YOUR_ADMIN_TOKEN
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Заказы МИМИ</h1>
        <a href={`/admin/menu/categories?token=${encodeURIComponent(token)}`} className="text-blue-600 text-sm">
          Админка меню →
        </a>
      </div>
      <div className="mt-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Все статусы</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Обновить
        </button>
      </div>
      {error && (
        <div className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && <p className="mt-4 text-gray-500">Загрузка...</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="mt-4 text-gray-500">Заказов нет</p>
      )}
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-gray-900">№{order.number}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {order.deliveryType === 'DELIVERY' ? 'Доставка' : 'Самовывоз'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString('ru')}
                </span>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  order.status === 'DONE'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'CANCELED'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-amber-100 text-amber-800'
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700">
              {order.customerName} • {order.phone}
            </p>
            {order.addressJson && (
              <p className="mt-0.5 text-sm text-gray-500">
                Адрес: {(() => {
                  try {
                    const a = JSON.parse(order.addressJson as string) as Record<string, string>;
                    return [a.street, a.building, a.apartment].filter(Boolean).join(', ');
                  } catch {
                    return order.addressJson;
                  }
                })()}
              </p>
            )}
            <p className="mt-0.5 text-sm font-medium text-gray-800">
              Итого: {formatMoney(order.total)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(order.id, s)}
                  disabled={order.status === s}
                  className={`rounded px-2 py-1 text-xs ${
                    order.status === s
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="mt-2 text-sm text-blue-600"
            >
              {expandedId === order.id ? 'Скрыть состав' : 'Показать состав'}
            </button>
            {expandedId === order.id && (
              <ul className="mt-2 border-t border-gray-100 pt-2 text-sm text-gray-600">
                {order.items.map((i) => (
                  <li key={i.id}>
                    {i.nameSnapshot}
                    {i.variantSnapshot ? ` (${i.variantSnapshot})` : ''} × {i.qty} —{' '}
                    {formatMoney(i.priceSnapshot * i.qty)}
                  </li>
                ))}
                {order.discount > 0 && (
                  <li>Скидка: −{formatMoney(order.discount)}</li>
                )}
                {order.comment && (
                  <li className="text-gray-500">Комментарий: {order.comment}</li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4">Загрузка...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
