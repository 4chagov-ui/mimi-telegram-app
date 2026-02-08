'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Category = { id: string; name: string; sort: number; _count?: { products: number } };

function CategoriesContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSort, setEditSort] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSort, setAddSort] = useState(0);

  const q = token ? `?token=${encodeURIComponent(token)}` : '';
  const headers = token ? { 'x-admin-token': token } : {};

  const fetchCategories = () => {
    if (!token) {
      setError('Добавьте в URL: ?token=YOUR_ADMIN_TOKEN');
      setLoading(false);
      return;
    }
    fetch(`/api/admin/categories${q}`, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Ошибка'))))
      .then(setCategories)
      .catch(() => setError('Не удалось загрузить'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const saveEdit = () => {
    if (!editingId || !token) return;
    fetch(`/api/admin/categories/${editingId}${q}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ name: editName, sort: editSort }),
    })
      .then((r) => (r.ok ? (setEditingId(null), fetchCategories()) : Promise.reject()))
      .catch(() => setError('Не удалось сохранить'));
  };

  const submitAdd = () => {
    if (!token || !addName.trim()) return;
    fetch(`/api/admin/categories${q}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ name: addName.trim(), sort: addSort }),
    })
      .then((r) => (r.ok ? (setShowAdd(false), setAddName(''), setAddSort(0), fetchCategories()) : Promise.reject()))
      .catch(() => setError('Не удалось добавить'));
  };

  const deleteCat = (id: string) => {
    if (!token || !confirm('Удалить категорию? Товары в ней тоже удалятся.')) return;
    fetch(`/api/admin/categories/${id}${q}`, { method: 'DELETE', headers })
      .then((r) => (r.ok ? fetchCategories() : Promise.reject()))
      .catch(() => setError('Не удалось удалить'));
  };

  if (!token) {
    return (
      <p className="text-gray-600">
        Добавьте в URL параметр token: /admin/menu/categories?token=YOUR_ADMIN_TOKEN
      </p>
    );
  }

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Категории</h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white"
        >
          + Добавить категорию
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Название"
            className="rounded border border-gray-300 px-2 py-1"
          />
          <input
            type="number"
            value={addSort}
            onChange={(e) => setAddSort(Number(e.target.value))}
            placeholder="Порядок"
            className="w-20 rounded border border-gray-300 px-2 py-1"
          />
          <button type="button" onClick={submitAdd} className="rounded bg-green-600 px-3 py-1 text-white">
            Сохранить
          </button>
          <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500">
            Отмена
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            {editingId === c.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mr-2 flex-1 rounded border px-2 py-1"
                />
                <input
                  type="number"
                  value={editSort}
                  onChange={(e) => setEditSort(Number(e.target.value))}
                  className="mr-2 w-16 rounded border px-2 py-1"
                />
                <button type="button" onClick={saveEdit} className="mr-2 rounded bg-blue-600 px-2 py-1 text-white text-sm">
                  OK
                </button>
                <button type="button" onClick={() => setEditingId(null)} className="text-gray-500 text-sm">
                  Отмена
                </button>
              </>
            ) : (
              <>
                <span className="font-medium">{c.name}</span>
                <span className="text-gray-500 text-sm">порядок: {c.sort}</span>
                {c._count != null && <span className="text-gray-400 text-sm">товаров: {c._count.products}</span>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditingId(c.id); setEditName(c.name); setEditSort(c.sort); }} className="text-blue-600 text-sm">
                    Изменить
                  </button>
                  <button type="button" onClick={() => deleteCat(c.id)} className="text-red-600 text-sm">
                    Удалить
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminMenuCategoriesPage() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <CategoriesContent />
    </Suspense>
  );
}
