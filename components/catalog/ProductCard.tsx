'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/money';

type Variant = { id: string; name: string; price: number };

type ProductCardProps = {
  id: string;
  name: string;
  imageUrl: string | null;
  variants: Variant[];
  onAdd?: (productId: string, variantId: string | null, name: string, variantName: string | null, price: number, imageUrl?: string) => void;
};

export function ProductCard({ id, name, imageUrl, variants: rawVariants }: ProductCardProps) {
  const router = useRouter();
  const variants = Array.isArray(rawVariants) ? rawVariants : [];
  const prices = variants.map((v) => (typeof v?.price === 'number' ? v.price : 0));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  return (
    <div className="flex gap-3 rounded-xl bg-tg-secondary p-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200">
        {imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-gray-400">
            🍱
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${id}`} className="font-medium text-tg-text line-clamp-2">
          {name}
        </Link>
        <p className="mt-0.5 text-sm text-tg-hint">
          от {formatMoney(minPrice)}
        </p>
        <button
          type="button"
          onClick={() => router.push(`/product/${id}`)}
          className="tap-highlight mt-2 min-h-[44px] min-w-[44px] rounded-lg bg-tg-button px-4 py-3 text-sm font-medium text-tg-button-text active:opacity-90"
        >
          Выбрать
        </button>
      </div>
    </div>
  );
}
