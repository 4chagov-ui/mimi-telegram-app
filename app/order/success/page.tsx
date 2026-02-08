'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const number = searchParams.get('number') ?? '—';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 text-6xl">✅</div>
        <h1 className="text-2xl font-bold text-tg-text">Заказ №{number} принят</h1>
        <p className="mt-2 text-tg-hint">
          Мы свяжемся с вами для уточнения деталей. Ожидайте звонок или сообщение.
        </p>
        <Link
          href="/catalog"
          className="mt-8 inline-block rounded-xl bg-tg-button px-6 py-3 font-medium text-tg-button-text"
        >
          Вернуться в каталог
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Загрузка...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
