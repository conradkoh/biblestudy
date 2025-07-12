import { create } from "zustand";
import type { SearchResultItem } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import type { SearchQuery } from "@/src/types/search";

export interface SearchState {
  searchQuery: string;
  searchResults: SearchResultItem[] | null; // null means haven't searched
  selectedStrategy: SearchStrategyType;
  totalCount: number;
  hasMore: boolean;
  error: string | null;
  lastQuery: SearchQuery | null;
  isInitialLoading: boolean;
  isLoading: boolean;
}

export interface SearchStore extends SearchState {
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResultItem[]) => void;
  setSelectedStrategy: (strategy: SearchStrategyType) => void;
  setTotalCount: (count: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setError: (error: string | null) => void;
  setLastQuery: (query: SearchQuery | null) => void;
  setIsInitialLoading: (loading: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  clearResults: () => void;
  clearAll: () => void;
}

const initialState: SearchState = {
  searchQuery: "",
  searchResults: null,
  selectedStrategy: SearchStrategyType.KEYWORD,
  totalCount: 0,
  hasMore: false,
  error: null,
  lastQuery: null,
  isInitialLoading: true,
  isLoading: false,
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...initialState,
  
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  setSearchResults: (results: SearchResultItem[]) => set({ searchResults: results }),
  
  setSelectedStrategy: (strategy: SearchStrategyType) => set({ selectedStrategy: strategy }),
  
  setTotalCount: (count: number) => set({ totalCount: count }),
  
  setHasMore: (hasMore: boolean) => set({ hasMore }),
  
  setError: (error: string | null) => set({ error }),
  
  setLastQuery: (query: SearchQuery | null) => set({ lastQuery: query }),
  
  setIsInitialLoading: (loading: boolean) => set({ isInitialLoading: loading }),
  
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  
  clearResults: () => set({
    searchResults: null,
    totalCount: 0,
    hasMore: false,
    error: null,
    lastQuery: null,
    isInitialLoading: true,
  }),
  
  clearAll: () => set(initialState),
})); 
