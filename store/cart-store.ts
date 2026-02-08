import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeliveryType = 'DELIVERY' | 'PICKUP';

export type CartItem = {
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  qty: number;
  imageUrl?: string;
};

type CartState = {
  deliveryType: DeliveryType;
  items: CartItem[];
  comment: string;
  cutlery: boolean;
  appliedPromo: string | null;
  setDeliveryType: (t: DeliveryType) => void;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  updateQty: (productId: string, variantId: string | null, delta: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setComment: (s: string) => void;
  setCutlery: (v: boolean) => void;
  setAppliedPromo: (code: string | null) => void;
  getSubtotal: () => number;
  clearCart: () => void;
};

const initialState = {
  deliveryType: 'DELIVERY' as DeliveryType,
  items: [],
  comment: '',
  cutlery: false,
  appliedPromo: null as string | null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setDeliveryType: (deliveryType) => set({ deliveryType }),
      addItem: (item) =>
        set((state) => {
          const key = `${item.productId}:${item.variantId ?? ''}`;
          const existing = state.items.find(
            (i) => i.productId === item.productId && (i.variantId ?? '') === (item.variantId ?? '')
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }),
      updateQty: (productId, variantId, delta) =>
        set((state) => {
          const items = state.items.map((i) => {
            if (i.productId !== productId || (i.variantId ?? '') !== (variantId ?? '')) return i;
            const qty = Math.max(0, i.qty + delta);
            return { ...i, qty };
          });
          return { items: items.filter((i) => i.qty > 0) };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (i.variantId ?? '') === (variantId ?? ''))
          ),
        })),
      setComment: (comment) => set({ comment }),
      setCutlery: (cutlery) => set({ cutlery }),
      setAppliedPromo: (appliedPromo) => set({ appliedPromo }),
      getSubtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      clearCart: () =>
        set({
          items: [],
          comment: '',
          cutlery: false,
          appliedPromo: null,
        }),
    }),
    { name: 'mimi-cart', partialize: (s) => ({ ...s }) }
  )
);
