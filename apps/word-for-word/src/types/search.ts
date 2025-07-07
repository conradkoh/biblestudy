import type { BibleCursor, BookId } from "@common/utils/bible-data-utils";
import type { BibleVersionId } from "@/src/stores/bible-store";

export enum SearchStrategyType {
    SIMPLE_SUBSTRING = "simple_substring",
    KEYWORD = "keyword",
    ADVANCED = "advanced",
    AI_ASSISTANT = "ai_assistant",
}

export interface SearchQuery {
    text: string;
    strategyType: SearchStrategyType;
    version?: BibleVersionId;
    limit?: number;
    offset?: number;
}

export interface SearchContext {
    bibleStore: any; // Will be properly typed when we import the store
    currentCursor?: BibleCursor;
}

export interface SearchMatch {
    startIndex: number;
    endIndex: number;
    text: string;
    isHighlighted: boolean;
}

export interface SearchResultItem {
    bookId: BookId;
    chapter: number;
    verse: number;
    version: BibleVersionId;
    text: string;
    matches: SearchMatch[];
    relevanceScore: number;
    context?: {
        previousVerse?: string;
        nextVerse?: string;
    };
}

export interface SearchResult {
    items: SearchResultItem[];
    totalCount: number;
    hasMore: boolean;
    query: SearchQuery;
    executionTime: number;
}

export interface SearchStrategy {
    type: SearchStrategyType;
    name: string;
    description: string;
    search: (query: SearchQuery, context: SearchContext) => Promise<SearchResult>;
}

export type SearchRegistry = Partial<Record<SearchStrategyType, SearchStrategy>>;

export interface SearchComposerOptions {
    strategies: SearchStrategyType[];
    weights?: Record<SearchStrategyType, number>;
    mergeResults?: boolean;
} 