import { useState, useCallback, useRef } from "react";
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
}

export interface UseBibleSearchActions {
  performSearch: (query?: string, strategy?: SearchStrategyType) => Promise<void>;
  clearResults: () => void;
  setStrategy: (strategy: SearchStrategyType) => void;
  loadMore: () => Promise<void>;
  setQuery: (query: string) => void;
}

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

  // Refs for pagination
  const currentOffset = useRef(0);
  const isSearching = useRef(false);

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
      clearResults();
      return;
    }

    if (isSearching.current) {
      return; // Prevent concurrent searches
    }

    isSearching.current = true;
    setIsLoading(true);
    setError(null);
    currentOffset.current = 0;

    try {
      const searchQuery: SearchQuery = {
        text: searchText,
        strategyType: searchStrategy,
        version: currentCursor?.version,
        limit: 20,
        offset: 0
      };

      const context = createSearchContext();
      const result = await executeSearchWithFallback(searchQuery, context);

      setSearchResults(result.items);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setLastQuery(searchQuery);

      if (result.items.length === 0) {
        setError("No results found");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isSearching.current = false;
    }
  }, [searchQuery, currentCursor, createSearchContext]);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!lastQuery || !hasMore || isLoading || isSearching.current) {
      return;
    }

    isSearching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      currentOffset.current += lastQuery.limit || 20;

      const searchQuery: SearchQuery = {
        ...lastQuery,
        offset: currentOffset.current
      };

      const context = createSearchContext();
      const result = await executeSearchWithFallback(searchQuery, context);

      setSearchResults(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Load more error:", err);
      setError(err instanceof Error ? err.message : "Failed to load more results");
    } finally {
      setIsLoading(false);
      isSearching.current = false;
    }
  }, [lastQuery, hasMore, isLoading, createSearchContext]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setTotalCount(0);
    setHasMore(false);
    setError(null);
    setLastQuery(null);
    currentOffset.current = 0;
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

    // Actions
    performSearch,
    clearResults,
    setStrategy,
    loadMore,
    setQuery
  };
} 
