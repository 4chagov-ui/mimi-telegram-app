'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AdminMenuRedirect() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    const q = token ? `?token=${encodeURIComponent(token)}` : '';
    window.location.href = `/admin/menu/categories${q}`;
  }, [token]);

  return <div className="text-gray-500">Перенаправление...</div>;
}

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Загрузка...</div>}>
      <AdminMenuRedirect />
    </Suspense>
  );
}
