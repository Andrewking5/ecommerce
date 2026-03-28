import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import wishlistService, { type WishlistItem } from '../services/wishlistService';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistIds: Set<string>;
  isLoading: boolean;
  toggle: (productId: string) => Promise<'added' | 'removed'>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      if (res.success) {
        setWishlistItems(res.data);
        setWishlistIds(new Set(res.data.map((item) => item.productId)));
      }
    } catch {
      // Silently fail - wishlist is non-critical
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggle = useCallback(
    async (productId: string): Promise<'added' | 'removed'> => {
      // Optimistic update
      const wasInWishlist = wishlistIds.has(productId);
      const newIds = new Set(wishlistIds);

      if (wasInWishlist) {
        newIds.delete(productId);
      } else {
        newIds.add(productId);
      }
      setWishlistIds(newIds);

      try {
        const res = await wishlistService.toggle(productId);
        // Refresh full list to get product details
        await fetchWishlist();
        return res.action;
      } catch {
        // Revert optimistic update
        setWishlistIds(wishlistIds);
        throw new Error('Failed to update wishlist');
      }
    },
    [wishlistIds, fetchWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        isLoading,
        toggle,
        isInWishlist,
        wishlistCount: wishlistIds.size,
        refresh: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
