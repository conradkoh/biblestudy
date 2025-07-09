import { useState, useCallback, useRef, useMemo } from "react";
import type { SearchQuery, SearchContext, SearchResult, SearchResultItem } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import { executeSearchWithFallback } from "@/src/utils/search/search-composer";
import { useBibleStore } from "@/src/stores/bible-store";
import type { BibleCursor } from "@common/utils/bible-data-utils";

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
  performSearch: (query: string, strategy: SearchStrategyType, limit: number) => Promise<void>;
  clearResults: () => void;
  setStrategy: (strategy: SearchStrategyType) => void;
  loadMore: () => Promise<void>;
  setQuery: (query: string) => void;
}

export function useBibleSearch(currentCursor?: BibleCursor) {
  const bibleStore = useBibleStore();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStrategy, setSelectedStrategy] = useState<SearchStrategyType>(SearchStrategyType.KEYWORD);
  // Search Results
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Refs for pagination
  const isSearching = useRef(false);

  // Create memoized search context
  const searchContext = useMemo((): SearchContext => ({
    bibleStore,
    currentCursor
  }), [bibleStore, currentCursor]);

  // Perform search
  const performSearch = useCallback(async (
    query: string,
    strategy: SearchStrategyType,
    limit: number,
  ) => {
    const searchText = query ?? searchQuery;
    const searchStrategy = strategy ?? selectedStrategy;

    if (!searchText.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      setHasMore(false);
      setError(null);
      setLastQuery(null);
      setIsInitialLoading(true);
      return;
    }

    if (isSearching.current) {
      return; // Prevent concurrent searches
    }

    isSearching.current = true;
    setIsLoading(true);
    setIsInitialLoading(true); // This is an initial search
    setError(null);

    try {
      const searchQuery: SearchQuery = {
        text: searchText,
        strategyType: searchStrategy,
        version: currentCursor?.version,
        limit,
        offset: 0
      };

      await new Promise(resolve => setTimeout(resolve)); // Allow for state to enter loader 
      const result = await executeSearchWithFallback(searchQuery, searchContext);

      setSearchResults(result.items);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setLastQuery(searchQuery);
      setIsInitialLoading(false);

    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
      setTotalCount(0);
      setHasMore(false);
      setIsInitialLoading(false);
    } finally {
      setIsLoading(false);
      isSearching.current = false;
    }
  }, [searchQuery, selectedStrategy, currentCursor, searchContext]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!lastQuery || !hasMore || isSearching.current) {
      return;
    }

    isSearching.current = true;
    setIsLoading(true);
    setError(null);
    // Note: We don't set isInitialLoading to true here since this is loading more, not an initial search

    try {
      // Calculate the next offset based on current results count
      const nextOffset = searchResults.length;

      const searchQuery: SearchQuery = {
        ...lastQuery,
        offset: nextOffset
      };

      const result = await executeSearchWithFallback(searchQuery, searchContext);

      setSearchResults(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Load more error:", err);
      setError(err instanceof Error ? err.message : "Failed to load more results");
    } finally {
      setIsLoading(false);
      isSearching.current = false;
    }
  }, [lastQuery, hasMore, searchResults.length, searchContext]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setTotalCount(0);
    setHasMore(false);
    setError(null);
    setLastQuery(null);
    setIsInitialLoading(true);
  }, []);

  // Set strategy
  const setStrategy = useCallback((strategy: SearchStrategyType) => {
    setSelectedStrategy(strategy);
    clearResults();
  }, [clearResults]);

  // Set query
  const setQuery = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      clearResults();
    }
  }, [clearResults]);

  return {
    // State
    searchQuery,
    searchResults,
    isLoading,
    selectedStrategy,
    totalCount,
    hasMore,
    error,
    lastQuery,
    isInitialLoading,

    // Actions
    performSearch,
    clearResults,
    setStrategy,
    loadMore,
    setQuery
  };
} 
