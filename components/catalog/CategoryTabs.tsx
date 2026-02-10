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
          className={`tap-highlight shrink-0 rounded-full px-4 py-3 text-sm font-medium transition-colors min-h-[44px] active:opacity-90 ${
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
