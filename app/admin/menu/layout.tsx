'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function MenuNav() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const q = token ? `?token=${encodeURIComponent(token)}` : '';

  return (
    <nav className="mb-6 flex gap-4 border-b border-gray-200 pb-4">
      <Link href={`/admin/orders${q}`} className="text-gray-600 hover:text-gray-900">
        Заказы
      </Link>
      <Link href={`/admin/menu/categories${q}`} className="text-gray-600 hover:text-gray-900">
        Категории
      </Link>
      <Link href={`/admin/menu/products${q}`} className="text-gray-600 hover:text-gray-900">
        Товары
      </Link>
    </nav>
  );
}

export default function MenuAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold text-gray-900">Админка меню</h1>
      <Suspense fallback={<div className="mb-6 h-8" />}>
        <MenuNav />
      </Suspense>
      {children}
    </div>
  );
}
