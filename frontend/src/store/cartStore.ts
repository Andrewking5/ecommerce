import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, CartState, CartActions } from '@/types/cart';
import toast from 'react-hot-toast';

interface CartStore extends CartState, CartActions {}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      total: 0,
      itemCount: 0,

      // Actions
      addItem: (product: Product, quantity: number = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.id);
        
        if (existingItem) {
          // 更新現有商品數量
          set(state => ({
            items: state.items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }));
        } else {
          // 新增商品到購物車
          set(state => ({
            items: [...state.items, {
              id: `${product.id}-${Date.now()}`, // 生成唯一 ID
              userId: '', // 將在登入後更新
              productId: product.id,
              product,
              quantity,
            }],
          }));
        }
        
        get().calculateTotals();
        toast.success(`${product.name} added to cart`);
      },

      removeItem: (itemId: string) => {
        const { items } = get();
        const item = items.find(item => item.id === itemId);
        
        set(state => ({
          items: state.items.filter(item => item.id !== itemId),
        }));
        
        get().calculateTotals();
        
        if (item?.product) {
          toast.success(`${item.product.name} removed from cart`);
        }
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
        
        get().calculateTotals();
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
        toast.success('Cart cleared');
      },

      calculateTotals: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => {
          const price = item.product?.price || 0;
          return sum + (price * item.quantity);
        }, 0);
        
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        
        set({ total, itemCount });
      },

      syncWithServer: async () => {
        // 在實際應用中，這裡會與後端同步購物車
        // 目前只是本地儲存
        console.log('Cart synced with server');
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);


