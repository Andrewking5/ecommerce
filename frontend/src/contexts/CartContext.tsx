import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import cartService, { type CartItem } from '../services/cartService';
import { trackAddToCart, trackRemoveFromCart } from '../lib/analytics';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: { productId: string; name: string; price: number; image: string }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => cartService.getCart());

  useEffect(() => {
    const handleCartUpdate = () => {
      setItems(cartService.getCart());
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const addToCart = useCallback(
    (product: { productId: string; name: string; price: number; image: string }, quantity = 1) => {
      cartService.addToCart(product, quantity);
      trackAddToCart({ id: product.productId, name: product.name, price: product.price }, quantity);
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (item) {
      trackRemoveFromCart({ id: item.productId, name: item.name, price: item.price }, item.quantity);
    }
    cartService.removeFromCart(productId);
  }, [items]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    cartService.updateCartItem(productId, quantity);
  }, []);

  const clearCart = useCallback(() => {
    cartService.clearCart();
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
