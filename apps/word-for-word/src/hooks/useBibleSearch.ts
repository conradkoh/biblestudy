import { useCallback, useRef, useMemo } from 'react';
import type {
  SearchQuery,
  SearchContext,
  SearchResult,
  SearchResultItem,
} from '@/src/types/search';
import { SearchStrategyType } from '@/src/types/search';
import { executeSearchWithFallback } from '@/src/utils/search/search-composer';
import { useBibleStore } from '@/src/stores/bible-store';
import { useSearchStore } from '@/src/stores/search-store';
import type { BibleCursor } from '@common/utils/bible-data-utils';
import { useSettingsStore } from '@/src/stores/settings-store';

export interface UseBibleSearchState {
  searchQuery: string;
  searchResults: SearchResultItem[];
  isLoading: boolean;
  selectedStrategy: SearchStrategyType;
  totalCount: number;
  hasMore: boolean;
  error: string | null;
  lastQuery: SearchQuery | null;
  isInitialLoading: boolean;
}

export interface UseBibleSearchActions {
  performSearch: (
    query: string,
    strategy: SearchStrategyType,
    limit: number,
  ) => Promise<void>;
  clearResults: () => void;
  clearAll: () => void;
  setStrategy: (strategy: SearchStrategyType) => void;
  loadMore: () => Promise<void>;
  setQuery: (query: string) => void;
}

export function useBibleSearch(currentCursor?: BibleCursor) {
  const bibleStore = useBibleStore();
  const searchStore = useSearchStore();
  const settingsStore = useSettingsStore();

  // Refs for pagination
  const isSearching = useRef(false);

  // Create memoized search context
  const searchContext = useMemo(
    (): SearchContext => ({
      bibleStore,
      currentCursor,
    }),
    [bibleStore, currentCursor],
  );

  // Perform search
  const performSearch = useCallback(
    async (query: string, strategy: SearchStrategyType, limit: number) => {
      const searchText = query ?? searchStore.searchQuery;
      const searchStrategy = strategy ?? settingsStore.searchStrategy;

      if (!searchText.trim()) {
        searchStore.setSearchResults([]);
        searchStore.setTotalCount(0);
        searchStore.setHasMore(false);
        searchStore.setError(null);
        searchStore.setLastQuery(null);
        searchStore.setIsInitialLoading(true);
        return;
      }

      if (isSearching.current) {
        return; // Prevent concurrent searches
      }

      isSearching.current = true;
      searchStore.setIsLoading(true);
      searchStore.setIsInitialLoading(true); // This is an initial search
      searchStore.setError(null);

      try {
        const searchQuery: SearchQuery = {
          text: searchText,
          strategyType: searchStrategy,
          version: currentCursor?.version,
          limit,
          offset: 0,
        };

        await new Promise((resolve) => setTimeout(resolve)); // Allow for state to enter loader
        const result = await executeSearchWithFallback(
          searchQuery,
          searchContext,
        );

        searchStore.setSearchResults(result.items);
        searchStore.setTotalCount(result.totalCount);
        searchStore.setHasMore(result.hasMore);
        searchStore.setLastQuery(searchQuery);
        searchStore.setIsInitialLoading(false);
      } catch (err) {
        console.error('Search error:', err);
        searchStore.setError(
          err instanceof Error ? err.message : 'Search failed',
        );
        searchStore.setSearchResults([]);
        searchStore.setTotalCount(0);
        searchStore.setHasMore(false);
        searchStore.setIsInitialLoading(false);
      } finally {
        searchStore.setIsLoading(false);
        isSearching.current = false;
      }
    },
    [
      searchStore.searchQuery,
      settingsStore.searchStrategy,
      currentCursor,
      searchContext,
      searchStore,
    ],
  );

  // Load more results
  const loadMore = useCallback(async () => {
    if (!searchStore.lastQuery || !searchStore.hasMore || isSearching.current) {
      return;
    }

    isSearching.current = true;
    searchStore.setIsLoading(true);
    searchStore.setError(null);
    // Note: We don't set isInitialLoading to true here since this is loading more, not an initial search

    try {
      // Calculate the next offset based on current results count
      const nextOffset = searchStore.searchResults?.length ?? 0;

      const searchQuery: SearchQuery = {
        ...searchStore.lastQuery,
        offset: nextOffset,
      };

      const result = await executeSearchWithFallback(
        searchQuery,
        searchContext,
      );

      searchStore.setSearchResults([
        ...(searchStore.searchResults ?? []),
        ...result.items,
      ]);
      searchStore.setHasMore(result.hasMore);
    } catch (err) {
      console.error('Load more error:', err);
      searchStore.setError(
        err instanceof Error ? err.message : 'Failed to load more results',
      );
    } finally {
      searchStore.setIsLoading(false);
      isSearching.current = false;
    }
  }, [
    searchStore.lastQuery,
    searchStore.hasMore,
    searchStore.searchResults?.length,
    searchContext,
    searchStore,
  ]);

  // Clear results
  const clearResults = useCallback(() => {
    searchStore.clearResults();
  }, [searchStore]);

  // Clear all
  const clearAll = useCallback(() => {
    searchStore.clearAll();
  }, [searchStore]);

  // Set strategy
  const setStrategy = useCallback(
    (strategy: SearchStrategyType) => {
      settingsStore.setSearchStrategy(strategy);
      searchStore.clearResults();
    },
    [searchStore, settingsStore],
  );

  // Set query
  const setQuery = useCallback(
    (query: string) => {
      searchStore.setSearchQuery(query);
      if (!query.trim()) {
        searchStore.clearResults();
      }
    },
    [searchStore],
  );

  return {
    // State
    searchQuery: searchStore.searchQuery,
    searchResults: searchStore.searchResults,
    isLoading: searchStore.isLoading,
    selectedStrategy: settingsStore.searchStrategy,
    totalCount: searchStore.totalCount,
    hasMore: searchStore.hasMore,
    error: searchStore.error,
    lastQuery: searchStore.lastQuery,
    isInitialLoading: searchStore.isInitialLoading,

    // Actions
    performSearch,
    clearResults,
    clearAll,
    setStrategy,
    loadMore,
    setQuery,
  };
}
