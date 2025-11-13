import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, CartActions } from '@/types/cart';
import { Product } from '@/types/product';
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
        // 使用更轻量的通知，不显示图标，更快消失
        toast.success(`${product.name} 已加入購物車`, {
          duration: 1500,
          icon: null, // 移除图标，减少视觉干扰
          style: {
            fontSize: '13px',
            padding: '10px 14px',
          },
        });
      },

      removeItem: (itemId: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== itemId),
        }));
        
        get().calculateTotals();
        
        // 移除商品时不显示toast，避免干扰操作
        // 用户可以通过购物车图标的变化来感知操作成功
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
        toast.success('購物車已清空', {
          duration: 2000,
        });
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


