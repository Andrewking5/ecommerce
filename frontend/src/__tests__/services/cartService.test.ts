import { describe, it, expect, beforeEach } from 'vitest';
import cartService from '@/src/services/cartService';

const mockProduct = {
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

describe('cartService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getCart', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(cartService.getCart()).toEqual([]);
    });

    it('returns parsed items from localStorage', () => {
      const items = [{ ...mockProduct, quantity: 2 }];
      localStorage.setItem('ayers_cart', JSON.stringify(items));
      expect(cartService.getCart()).toEqual(items);
    });

    it('returns empty array for invalid JSON', () => {
      localStorage.setItem('ayers_cart', 'invalid-json');
      expect(cartService.getCart()).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('adds a new product to empty cart', () => {
      cartService.addToCart(mockProduct, 1);
      const cart = cartService.getCart();
      expect(cart).toHaveLength(1);
      expect(cart[0]).toMatchObject({ productId: 'prod-1', quantity: 1 });
    });

    it('increments quantity for existing product', () => {
      cartService.addToCart(mockProduct, 1);
      cartService.addToCart(mockProduct, 2);
      const cart = cartService.getCart();
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(3);
    });

    it('adds different products separately', () => {
      cartService.addToCart(mockProduct, 1);
      cartService.addToCart(mockProduct2, 1);
      expect(cartService.getCart()).toHaveLength(2);
    });

    it('dispatches cart-updated event', () => {
      cartService.addToCart(mockProduct, 1);
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('updateCartItem', () => {
    it('updates quantity for existing item', () => {
      cartService.addToCart(mockProduct, 1);
      cartService.updateCartItem('prod-1', 5);
      expect(cartService.getCart()[0].quantity).toBe(5);
    });

    it('enforces minimum quantity of 1', () => {
      cartService.addToCart(mockProduct, 3);
      cartService.updateCartItem('prod-1', 0);
      expect(cartService.getCart()[0].quantity).toBe(1);
    });

    it('does nothing for non-existent product', () => {
      cartService.addToCart(mockProduct, 1);
      cartService.updateCartItem('non-existent', 5);
      expect(cartService.getCart()).toHaveLength(1);
      expect(cartService.getCart()[0].quantity).toBe(1);
    });
  });

  describe('removeFromCart', () => {
    it('removes the correct product', () => {
      cartService.addToCart(mockProduct, 1);
      cartService.addToCart(mockProduct2, 1);
      cartService.removeFromCart('prod-1');
      const cart = cartService.getCart();
      expect(cart).toHaveLength(1);
      expect(cart[0].productId).toBe('prod-2');
    });
  });

  describe('clearCart', () => {
    it('removes all items', () => {
      cartService.addToCart(mockProduct, 1);
      cartService.addToCart(mockProduct2, 1);
      cartService.clearCart();
      expect(cartService.getCart()).toEqual([]);
    });
  });

  describe('getCartTotal', () => {
    it('returns 0 for empty cart', () => {
      expect(cartService.getCartTotal()).toBe(0);
    });

    it('calculates correct total', () => {
      cartService.addToCart(mockProduct, 2);  // 45000 * 2 = 90000
      cartService.addToCart(mockProduct2, 1); // 52000 * 1 = 52000
      expect(cartService.getCartTotal()).toBe(142000);
    });
  });

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(cartService.getItemCount()).toBe(0);
    });

    it('sums quantities correctly', () => {
      cartService.addToCart(mockProduct, 2);
      cartService.addToCart(mockProduct2, 3);
      expect(cartService.getItemCount()).toBe(5);
    });
  });
});
