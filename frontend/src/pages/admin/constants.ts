export const ESPRESSO = '#2a1f14';
export const ESPRESSO_DARK = '#1e160d';
export const CARD_BG = '#251c12';

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'admin.orders.pending', PROCESSING: 'admin.orders.processing', SHIPPED: 'admin.orders.shipped',
  DELIVERED: 'admin.orders.delivered', CANCELLED: 'admin.orders.cancelled',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PROCESSING: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-indigo-500/10 text-indigo-500',
  DELIVERED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

export const CHART_PALETTE = [
  '#c5a059', '#818cf8', '#34d399', '#f472b6', '#facc15',
  '#60a5fa', '#fb923c', '#a78bfa', '#94a3b8',
] as const;

export type Tab = 'dashboard' | 'orders' | 'products' | 'categories' | 'inventory' | 'customers' | 'banners' | 'reviews' | 'coupons' | 'events';

export type SidebarItem =
  | { id: Tab; icon: React.ReactNode; labelKey: string; children?: never }
  | { id: string; icon: React.ReactNode; labelKey: string; children: { id: Tab; labelKey: string }[] };
