const CART_KEY = 'ayers_cart';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

function dispatchCartEvent() {
  window.dispatchEvent(new Event('cart-updated'));
}

const cartService = {
  getCart(): CartItem[] {
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    dispatchCartEvent();
  },

  addToCart(product: { productId: string; name: string; price: number; image: string }, quantity = 1): void {
    const items = cartService.getCart();
    const existing = items.find((item) => item.productId === product.productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ ...product, quantity });
    }

    cartService.saveCart(items);
  },

  updateCartItem(productId: string, quantity: number): void {
    const items = cartService.getCart();
    const item = items.find((i) => i.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      cartService.saveCart(items);
    }
  },

  removeFromCart(productId: string): void {
    const items = cartService.getCart().filter((i) => i.productId !== productId);
    cartService.saveCart(items);
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
    dispatchCartEvent();
  },

  getCartTotal(): number {
    return cartService.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getItemCount(): number {
    return cartService.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },
};

export default cartService;
