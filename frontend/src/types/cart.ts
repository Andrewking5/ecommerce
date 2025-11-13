import { Product } from './product';
import { ProductVariant } from './variant';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string; // 变体ID（可选）
  quantity: number;
  product?: Product;
  variant?: ProductVariant; // 变体信息
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number, variantId?: string, variant?: any) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
  syncWithServer: () => Promise<void>;
}


