'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatMoney } from '@/lib/money';

type Variant = { id: string; name: string; price: number; weight: string | null };
type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  category: { id: string; name: string };
  variants: Variant[];
};

type Category = { id: string; name: string; sort: number };

function ProductsContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formVariants, setFormVariants] = useState<{ name: string; price: string; weight: string }[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantWeight, setNewVariantWeight] = useState('');

  const q = token ? `?token=${encodeURIComponent(token)}` : '';
  const qCat = categoryFilter ? `&categoryId=${encodeURIComponent(categoryFilter)}` : '';
  const headers: Record<string, string> = token ? { 'x-admin-token': token } : {};

  const fetchProducts = () => {
    fetch(`/api/admin/products${q}${qCat}`, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProducts)
      .catch(() => setError('Не удалось загрузить товары'));
  };

  const fetchCategories = () => {
    fetch(`/api/admin/categories${q}`, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setCategories)
      .catch(() => {});
  };

  useEffect(() => {
    if (!token) {
      setError('Добавьте в URL: ?token=YOUR_ADMIN_TOKEN');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCategories();
    fetchProducts();
    setLoading(false);
  }, [token, categoryFilter]);

  const openAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormDescription('');
    setFormImageUrl('');
    setFormCategoryId(categories[0]?.id ?? '');
    setFormActive(true);
    setFormVariants([{ name: '', price: '', weight: '' }]);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description ?? '');
    setFormImageUrl(p.imageUrl ?? '');
    setFormCategoryId(p.category.id);
    setFormActive(p.isActive);
    setFormVariants(
      p.variants.length
        ? p.variants.map((v) => ({ name: v.name, price: String(v.price / 100), weight: v.weight ?? '' }))
        : [{ name: '', price: '', weight: '' }]
    );
    setShowForm(true);
  };

  const addVariantRow = () => setFormVariants((prev) => [...prev, { name: '', price: '', weight: '' }]);
  const removeVariantRow = (i: number) =>
    setFormVariants((prev) => prev.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: 'name' | 'price' | 'weight', value: string) =>
    setFormVariants((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });

  const saveProduct = () => {
    if (!token || !formName.trim()) return;
    const variants = formVariants
      .filter((v) => v.name.trim())
      .map((v) => ({
        name: v.name.trim(),
        price: Math.round(parseFloat(v.price || '0') * 100),
        weight: v.weight.trim() || undefined,
      }));
    if (editingProduct) {
      fetch(`/api/admin/products/${editingProduct.id}${q}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim() || null,
          imageUrl: formImageUrl.trim() || null,
          categoryId: formCategoryId,
          isActive: formActive,
        }),
      })
        .then((r) => (r.ok ? (setShowForm(false), fetchProducts()) : Promise.reject()))
        .catch(() => setError('Не удалось сохранить'));
    } else {
      if (variants.length === 0) variants.push({ name: 'Порция', price: 0, weight: undefined });
      fetch(`/api/admin/products${q}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          categoryId: formCategoryId,
          name: formName.trim(),
          description: formDescription.trim() || null,
          imageUrl: formImageUrl.trim() || null,
          isActive: formActive,
          variants,
        }),
      })
        .then((r) => (r.ok ? (setShowForm(false), fetchProducts()) : Promise.reject()))
        .catch(() => setError('Не удалось добавить'));
    }
  };

  const deleteProduct = (id: string) => {
    if (!token || !confirm('Удалить товар?')) return;
    fetch(`/api/admin/products/${id}${q}`, { method: 'DELETE', headers })
      .then((r) => (r.ok ? fetchProducts() : Promise.reject()))
      .catch(() => setError('Не удалось удалить'));
  };

  if (!token) {
    return (
      <p className="text-gray-600">
        Добавьте в URL: /admin/menu/products?token=YOUR_ADMIN_TOKEN
      </p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Товары</h2>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="button" onClick={openAdd} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
          + Добавить товар
        </button>
      </div>

      {error && <p className="mb-2 text-red-600">{error}</p>}

      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow">
          <h3 className="mb-3 font-medium">{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600">Название</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded border px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Описание</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="w-full rounded border px-2 py-1" rows={2} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">URL картинки</label>
              <input type="text" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} className="w-full rounded border px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Категория</label>
              <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className="rounded border px-2 py-1">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />
              <span className="text-sm">Показывать в меню</span>
            </label>
            {editingProduct && (
              <div className="rounded border border-gray-200 bg-gray-50 p-2">
                <p className="mb-2 text-sm font-medium text-gray-700">Добавить вариант к товару</p>
                <div className="flex flex-wrap gap-2">
                  <input type="text" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} placeholder="Название" className="rounded border px-2 py-1 text-sm" />
                  <input type="text" value={newVariantPrice} onChange={(e) => setNewVariantPrice(e.target.value)} placeholder="Цена ₽" className="w-20 rounded border px-2 py-1 text-sm" />
                  <input type="text" value={newVariantWeight} onChange={(e) => setNewVariantWeight(e.target.value)} placeholder="Вес" className="w-20 rounded border px-2 py-1 text-sm" />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newVariantName.trim()) return;
                      fetch(`/api/admin/product-variants${q}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...headers },
                        body: JSON.stringify({
                          productId: editingProduct.id,
                          name: newVariantName.trim(),
                          price: Math.round(parseFloat(newVariantPrice || '0') * 100),
                          weight: newVariantWeight.trim() || undefined,
                        }),
                      })
                        .then((r) => r.ok ? fetch(`/api/admin/products/${editingProduct.id}${q}`, { headers }) : Promise.reject())
                        .then((r) => r.json())
                        .then((updated) => {
                          setNewVariantName('');
                          setNewVariantPrice('');
                          setNewVariantWeight('');
                          setEditingProduct(updated);
                          fetchProducts();
                        });
                    }}
                    className="rounded bg-gray-600 px-2 py-1 text-sm text-white"
                  >
                    Добавить вариант
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Текущие варианты: {editingProduct.variants.map((v) => v.name).join(', ')}</p>
              </div>
            )}
            {!editingProduct && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-gray-600">Варианты (цена в рублях)</label>
                  <button type="button" onClick={addVariantRow} className="text-sm text-blue-600">+ Вариант</button>
                </div>
                {formVariants.map((v, i) => (
                  <div key={i} className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => updateVariant(i, 'name', e.target.value)}
                      placeholder="Название"
                      className="flex-1 rounded border px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={v.price}
                      onChange={(e) => updateVariant(i, 'price', e.target.value)}
                      placeholder="Цена ₽"
                      className="w-24 rounded border px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={v.weight}
                      onChange={(e) => updateVariant(i, 'weight', e.target.value)}
                      placeholder="Вес"
                      className="w-24 rounded border px-2 py-1 text-sm"
                    />
                    <button type="button" onClick={() => removeVariantRow(i)} className="text-red-600 text-sm">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={saveProduct} className="rounded bg-green-600 px-4 py-2 text-white">
              Сохранить
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded border border-gray-300 px-4 py-2 text-gray-700">
              Отмена
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-500">Загрузка...</p>}
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <div>
              <span className="font-medium">{p.name}</span>
              <span className="ml-2 text-gray-500 text-sm">{p.category.name}</span>
              {!p.isActive && <span className="ml-2 text-amber-600 text-sm">скрыт</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                от {formatMoney(p.variants[0]?.price ?? 0)} · {p.variants.length} вар.
              </span>
              <button type="button" onClick={() => openEdit(p)} className="text-blue-600 text-sm">Изменить</button>
              <button type="button" onClick={() => deleteProduct(p.id)} className="text-red-600 text-sm">Удалить</button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && products.length === 0 && <p className="text-gray-500">Товаров нет</p>}
    </div>
  );
}

export default function AdminMenuProductsPage() {
  return (
    <Suspense fallback={<p>Загрузка...</p>}>
      <ProductsContent />
    </Suspense>
  );
}
