import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/src/lib/analytics';

/**
 * Track GA4 page views on route changes.
 * Strips the /:lang prefix for cleaner analytics paths.
 */
export function usePageViewTracking() {
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split('/');
    // Remove the lang segment (e.g., /zh-TW/collections → /collections)
    const cleanPath = '/' + parts.slice(2).join('/');
    trackPageView(cleanPath, document.title);
  }, [location.pathname]);
}
