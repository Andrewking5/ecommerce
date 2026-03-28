import { describe, it, expect, beforeEach, vi } from 'vitest';

// Unmock analytics for this test file - we want to test the actual module
vi.unmock('@/src/lib/analytics');

describe('analytics', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    delete (window as any).gtag;
    delete (window as any).dataLayer;
    vi.resetModules();
  });

  it('trackPageView is a no-op when gtag is not loaded', async () => {
    const { trackPageView } = await import('@/src/lib/analytics');
    expect(() => trackPageView('/test', 'Test Page')).not.toThrow();
  });

  it('trackAddToCart is a no-op when gtag is not loaded', async () => {
    const { trackAddToCart } = await import('@/src/lib/analytics');
    expect(() => trackAddToCart({ id: '1', name: 'Guitar', price: 1000 }, 1)).not.toThrow();
  });

  it('trackPurchase deduplicates by orderId via sessionStorage', async () => {
    const mockGtag = vi.fn();
    window.gtag = mockGtag;

    const { trackPurchase } = await import('@/src/lib/analytics');

    trackPurchase('order-123', 50000, 4000, 0, [{ id: '1', name: 'Guitar', price: 50000 }]);
    trackPurchase('order-123', 50000, 4000, 0, [{ id: '1', name: 'Guitar', price: 50000 }]);

    const purchaseCalls = mockGtag.mock.calls.filter(
      (call: unknown[]) => call[1] === 'purchase'
    );
    expect(purchaseCalls).toHaveLength(1);
  });

  it('initGA does not load when consent is not accepted', async () => {
    localStorage.setItem('cookie_consent', 'declined');
    const { initGA } = await import('@/src/lib/analytics');
    initGA();
    expect(window.gtag).toBeUndefined();
  });
});
