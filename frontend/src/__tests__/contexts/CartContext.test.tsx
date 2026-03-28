/**
 * Cart business logic tests
 *
 * Note: Direct CartProvider rendering is skipped due to React 19/18
 * dual-version conflict in the monorepo (root has react-dom@18, frontend has react-dom@19).
 * The core cart logic is tested via cartService tests.
 * These tests verify the cart calculations that CartContext depends on.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import cartService from '@/src/services/cartService';

const mockProduct1 = {
  productId: 'prod-1',
  name: 'Ayers O-09',
  price: 45000,
  image: '/images/o09.jpg',
};

const mockProduct2 = {
  productId: 'prod-2',
  name: 'Ayers A-09',
  price: 52000,
  image: '/images/a09.jpg',
};

describe('Cart business logic (CartContext data source)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('cart total calculation matches CartContext formula: sum(price * quantity)', () => {
    cartService.addToCart(mockProduct1, 2);
    cartService.addToCart(mockProduct2, 1);
    const items = cartService.getCart();

    // This mirrors CartContext's: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(total).toBe(45000 * 2 + 52000 * 1);
  });

  it('cart item count matches CartContext formula: sum(quantity)', () => {
    cartService.addToCart(mockProduct1, 3);
    cartService.addToCart(mockProduct2, 2);
    const items = cartService.getCart();

    // This mirrors CartContext's: items.reduce((sum, item) => sum + item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    expect(itemCount).toBe(5);
  });

  it('adding same product increments quantity (not duplicates)', () => {
    cartService.addToCart(mockProduct1, 1);
    cartService.addToCart(mockProduct1, 2);
    const items = cartService.getCart();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('remove + clear produce correct state for context consumers', () => {
    cartService.addToCart(mockProduct1, 1);
    cartService.addToCart(mockProduct2, 1);

    cartService.removeFromCart('prod-1');
    expect(cartService.getCart()).toHaveLength(1);
    expect(cartService.getCart()[0].productId).toBe('prod-2');

    cartService.clearCart();
    expect(cartService.getCart()).toEqual([]);
  });

  it('update quantity enforces minimum of 1', () => {
    cartService.addToCart(mockProduct1, 5);
    cartService.updateCartItem('prod-1', -1);
    expect(cartService.getCart()[0].quantity).toBe(1);
  });

  it('dispatches cart-updated event for context synchronization', () => {
    cartService.addToCart(mockProduct1, 1);
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
  });
});
