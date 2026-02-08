'use client';

type Category = { id: string; name: string };

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelect(c.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeId === c.id
              ? 'bg-tg-button text-tg-button-text'
              : 'bg-tg-secondary text-tg-text'
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
