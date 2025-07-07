import type { SearchQuery, SearchContext, SearchResult, SearchResultItem, SearchComposerOptions } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import { getSearchStrategy } from "./search-registry";

/**
 * Merge multiple search results into a single result
 */
function mergeSearchResults(results: SearchResult[]): SearchResult {
  if (results.length === 0) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query: results[0]?.query || { text: "", strategyType: SearchStrategyType.SIMPLE_SUBSTRING },
      executionTime: 0
    };
  }

  // Combine all items from all results
  const allItems: SearchResultItem[] = [];
  let totalExecutionTime = 0;

  for (const result of results) {
    allItems.push(...result.items);
    totalExecutionTime += result.executionTime;
  }

  // Remove duplicates based on bookId, chapter, verse, and version
  const uniqueItems = allItems.filter((item, index, self) =>
    index === self.findIndex(t =>
      t.bookId === item.bookId &&
      t.chapter === item.chapter &&
      t.verse === item.verse &&
      t.version === item.version
    )
  );

  // Sort by relevance score (highest first)
  uniqueItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Apply pagination from the first result
  const firstResult = results[0];
  if (!firstResult) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query: { text: "", strategyType: SearchStrategyType.SIMPLE_SUBSTRING },
      executionTime: totalExecutionTime
    };
  }

  const { limit = 50, offset = 0 } = firstResult.query;
  const paginatedItems = uniqueItems.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    totalCount: uniqueItems.length,
    hasMore: uniqueItems.length > offset + limit,
    query: firstResult.query,
    executionTime: totalExecutionTime
  };
}

/**
 * Weight and merge search results based on strategy weights
 */
function mergeWeightedResults(results: SearchResult[], weights: Record<SearchStrategyType, number>): SearchResult {
  if (results.length === 0) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query: results[0]?.query || { text: "", strategyType: SearchStrategyType.SIMPLE_SUBSTRING },
      executionTime: 0
    };
  }

  // Create a map to store weighted scores for each unique verse
  const verseScores = new Map<string, { item: SearchResultItem; totalScore: number; count: number }>();

  let totalExecutionTime = 0;

  for (const result of results) {
    totalExecutionTime += result.executionTime;
    const weight = weights[result.query.strategyType] || 1.0;

    for (const item of result.items) {
      const key = `${item.bookId}-${item.chapter}-${item.verse}-${item.version}`;
      const existing = verseScores.get(key);

      if (existing) {
        // Add weighted score to existing entry
        existing.totalScore += item.relevanceScore * weight;
        existing.count += 1;
      } else {
        // Create new entry
        verseScores.set(key, {
          item: { ...item, relevanceScore: item.relevanceScore * weight },
          totalScore: item.relevanceScore * weight,
          count: 1
        });
      }
    }
  }

  // Convert map to array and sort by total score
  const weightedItems = Array.from(verseScores.values())
    .map(({ item, totalScore }) => ({ ...item, relevanceScore: totalScore }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Apply pagination
  const firstResult = results[0];
  if (!firstResult) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query: { text: "", strategyType: SearchStrategyType.SIMPLE_SUBSTRING },
      executionTime: totalExecutionTime
    };
  }

  const { limit = 50, offset = 0 } = firstResult.query;
  const paginatedItems = weightedItems.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    totalCount: weightedItems.length,
    hasMore: weightedItems.length > offset + limit,
    query: firstResult.query,
    executionTime: totalExecutionTime
  };
}

/**
 * Execute multiple search strategies and compose their results
 */
export async function composeSearchStrategies(
  query: SearchQuery,
  context: SearchContext,
  options: SearchComposerOptions
): Promise<SearchResult> {
  const { strategies, weights, mergeResults = true } = options;

  if (strategies.length === 0) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query,
      executionTime: 0
    };
  }

  // Execute all strategies in parallel
  const strategyPromises = strategies.map(async (strategyType) => {
    const strategy = getSearchStrategy(strategyType);
    if (!strategy) {
      console.warn(`Search strategy ${strategyType} not found`);
      return null;
    }

    try {
      return await strategy.search(query, context);
    } catch (error) {
      console.error(`Error executing search strategy ${strategyType}:`, error);
      return null;
    }
  });

  const results = await Promise.all(strategyPromises);
  const validResults = results.filter((result): result is SearchResult => result !== null);

  if (validResults.length === 0) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query,
      executionTime: 0
    };
  }

  // Merge results based on options
  if (weights && Object.keys(weights).length > 0) {
    return mergeWeightedResults(validResults, weights);
  } else if (mergeResults) {
    return mergeSearchResults(validResults);
  } else {
    // Return the first valid result
    return validResults[0] || {
      items: [],
      totalCount: 0,
      hasMore: false,
      query,
      executionTime: 0
    };
  }
}

/**
 * Execute a single search strategy with fallback
 */
export async function executeSearchWithFallback(
  query: SearchQuery,
  context: SearchContext,
  fallbackStrategies: SearchStrategyType[] = [SearchStrategyType.SIMPLE_SUBSTRING]
): Promise<SearchResult> {
  const primaryStrategy = getSearchStrategy(query.strategyType);

  if (primaryStrategy) {
    try {
      return await primaryStrategy.search(query, context);
    } catch (error) {
      console.error(`Primary search strategy failed:`, error);
    }
  }

  // Try fallback strategies
  for (const fallbackType of fallbackStrategies) {
    const fallbackStrategy = getSearchStrategy(fallbackType);
    if (fallbackStrategy) {
      try {
        const fallbackQuery = { ...query, strategyType: fallbackType };
        return await fallbackStrategy.search(fallbackQuery, context);
      } catch (error) {
        console.error(`Fallback search strategy ${fallbackType} failed:`, error);
      }
    }
  }

  // Return empty result if all strategies fail
  return {
    items: [],
    totalCount: 0,
    hasMore: false,
    query,
    executionTime: 0
  };
} 
