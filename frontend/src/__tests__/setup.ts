import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { changeLanguage: vi.fn(), language: 'en' },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock analytics to prevent side effects in tests
vi.mock('@/src/lib/analytics', () => ({
  initGA: vi.fn(),
  trackPageView: vi.fn(),
  trackViewItem: vi.fn(),
  trackAddToCart: vi.fn(),
  trackRemoveFromCart: vi.fn(),
  trackBeginCheckout: vi.fn(),
  trackAddShippingInfo: vi.fn(),
  trackAddPaymentInfo: vi.fn(),
  trackPurchase: vi.fn(),
}));

// Mock window.dispatchEvent for cart events
vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
