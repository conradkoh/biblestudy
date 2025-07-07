import { useConvexAuth } from 'convex/react';

/**
 * For offline support, we want to still show some screens where possible
 */
export function usePresentLoginScreen() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (!isLoading && !isAuthenticated) {
    return true;
  }

  return false;
}
