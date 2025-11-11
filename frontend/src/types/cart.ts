import { Product } from './product';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: () => Promise<void>;
}


