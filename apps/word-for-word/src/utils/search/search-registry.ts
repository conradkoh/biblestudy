import type { SearchStrategy, SearchRegistry, SearchStrategyType } from "@/src/types/search";
import { simpleSubstringStrategy } from "./strategies/simple-substring";
import { keywordStrategy } from "./strategies/keyword";

/**
 * Global search registry that holds all available search strategies
 */
let searchRegistry: SearchRegistry = {};

/**
 * Register a search strategy in the global registry
 */
export function registerSearchStrategy(strategy: SearchStrategy): void {
    searchRegistry[strategy.type] = strategy;
}

/**
 * Get a search strategy by type
 */
export function getSearchStrategy(type: SearchStrategyType): SearchStrategy | undefined {
    return searchRegistry[type];
}

/**
 * Get all available search strategies
 */
export function getAllSearchStrategies(): SearchStrategy[] {
    return Object.values(searchRegistry);
}

/**
 * Get available strategy types
 */
export function getAvailableStrategyTypes(): SearchStrategyType[] {
    return Object.keys(searchRegistry) as SearchStrategyType[];
}

/**
 * Check if a strategy type is available
 */
export function hasSearchStrategy(type: SearchStrategyType): boolean {
    return type in searchRegistry;
}

/**
 * Clear all registered strategies (useful for testing)
 */
export function clearSearchRegistry(): void {
    searchRegistry = {};
}

/**
 * Initialize the search registry with default strategies
 */
export function initializeSearchRegistry(): void {
    // Clear existing registry
    clearSearchRegistry();

    // Register default strategies
    registerSearchStrategy(simpleSubstringStrategy);
    registerSearchStrategy(keywordStrategy);
}

/**
 * Get strategy information for UI display
 */
export function getStrategyInfo(type: SearchStrategyType): { name: string; description: string } | null {
    const strategy = getSearchStrategy(type);
    if (!strategy) return null;

    return {
        name: strategy.name,
        description: strategy.description
    };
}

// Initialize the registry when this module is loaded
initializeSearchRegistry(); 