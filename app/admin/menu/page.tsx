'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminMenuPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    const q = token ? `?token=${encodeURIComponent(token)}` : '';
    window.location.href = `/admin/menu/categories${q}`;
  }, [token]);

  return <div className="text-gray-500">Перенаправление...</div>;
}
