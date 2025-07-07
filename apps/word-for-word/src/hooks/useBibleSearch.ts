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
  performSearch: (query?: string, strategy?: SearchStrategyType) => Promise<void>;
  clearResults: () => void;
  setStrategy: (strategy: SearchStrategyType) => void;
  loadMore: () => Promise<void>;
  setQuery: (query: string) => void;
}

// Cache interface for search results
interface SearchCache {
  [key: string]: {
    results: SearchResultItem[];
    totalCount: number;
    hasMore: boolean;
    timestamp: number;
  };
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export function useBibleSearch(currentCursor?: BibleCursor): UseBibleSearchState & UseBibleSearchActions {
  const bibleStore = useBibleStore();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<SearchStrategyType>(SearchStrategyType.KEYWORD);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<SearchQuery | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Refs for pagination
  const isSearching = useRef(false);
  const searchCache = useRef<SearchCache>({});

  // Helper function to generate cache key
  const generateCacheKey = useCallback((query: SearchQuery): string => {
    return `${query.text}-${query.strategyType}-${query.version}-${query.limit}`;
  }, []);

  // Helper function to get cached results
  const getCachedResults = useCallback((query: SearchQuery): SearchResultItem[] | null => {
    const cacheKey = generateCacheKey(query);
    const cached = searchCache.current[cacheKey];

    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRATION) {
      // Return results up to the requested offset
      const offset = query.offset || 0;
      const limit = query.limit || 20;
      return cached.results.slice(0, offset + limit);
    }

    return null;
  }, [generateCacheKey]);

  // Helper function to cache results
  const cacheResults = useCallback((query: SearchQuery, results: SearchResultItem[], totalCount: number, hasMore: boolean) => {
    const cacheKey = generateCacheKey(query);
    const cached = searchCache.current[cacheKey];

    if (cached) {
      // Merge with existing cached results
      const mergedResults = [...cached.results];

      // Add new results that aren't already cached
      for (const result of results) {
        const exists = mergedResults.some(existing =>
          existing.bookId === result.bookId &&
          existing.chapter === result.chapter &&
          existing.verse === result.verse &&
          existing.version === result.version
        );

        if (!exists) {
          mergedResults.push(result);
        }
      }

      searchCache.current[cacheKey] = {
        results: mergedResults,
        totalCount: Math.max(cached.totalCount, totalCount),
        hasMore,
        timestamp: Date.now()
      };
    } else {
      // Create new cache entry
      searchCache.current[cacheKey] = {
        results,
        totalCount,
        hasMore,
        timestamp: Date.now()
      };
    }
  }, [generateCacheKey]);

  // Create search context
  const createSearchContext = useCallback((): SearchContext => ({
    bibleStore,
    currentCursor
  }), [bibleStore, currentCursor]);

  // Perform search
  const performSearch = useCallback(async (
    query?: string,
    strategy?: SearchStrategyType
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
        limit: 20,
        offset: 0
      };

      // Check cache first
      const cachedResults = getCachedResults(searchQuery);
      if (cachedResults) {
        setSearchResults(cachedResults);
        setTotalCount(cachedResults.length);
        setHasMore(cachedResults.length >= (searchQuery.limit || 20));
        setLastQuery(searchQuery);
        setIsInitialLoading(false);
        return;
      }

      const context = createSearchContext();
      const result = await executeSearchWithFallback(searchQuery, context);

      // Cache the results
      cacheResults(searchQuery, result.items, result.totalCount, result.hasMore);

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
  }, [searchQuery, selectedStrategy, currentCursor, createSearchContext, getCachedResults, cacheResults]);

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

      // Check cache first
      const cachedResults = getCachedResults(searchQuery);
      if (cachedResults) {
        // Return only the new results (from current offset onwards)
        const newResults = cachedResults.slice(nextOffset);
        setSearchResults(prev => [...prev, ...newResults]);
        setHasMore(newResults.length >= (searchQuery.limit || 20));
        return;
      }

      const context = createSearchContext();
      const result = await executeSearchWithFallback(searchQuery, context);

      // Cache the results
      cacheResults(searchQuery, result.items, result.totalCount, result.hasMore);

      setSearchResults(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Load more error:", err);
      setError(err instanceof Error ? err.message : "Failed to load more results");
    } finally {
      setIsLoading(false);
      isSearching.current = false;
    }
  }, [lastQuery, hasMore, searchResults.length, createSearchContext, getCachedResults, cacheResults]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setTotalCount(0);
    setHasMore(false);
    setError(null);
    setLastQuery(null);
    setIsInitialLoading(true);
    // Clear the search cache
    searchCache.current = {};
  }, []);

  // Set strategy
  const setStrategy = useCallback((strategy: SearchStrategyType) => {
    setSelectedStrategy(strategy);
    // Redo search with new strategy if there's a current query
    if (searchQuery.trim()) {
      performSearch(searchQuery, strategy);
    }
  }, [searchQuery, performSearch]);

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
