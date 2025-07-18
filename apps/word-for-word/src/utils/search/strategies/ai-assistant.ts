import { convex } from "@/src/services/convex";
import type { SearchContext, SearchMatch, SearchQuery, SearchResult, SearchResultItem } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import { api } from "@backend/convex/_generated/api";

/**
 * AI Assistant search strategy
 * Uses AI to find relevant Bible verses based on natural language queries
 */
export const aiAssistantSearch = async (
  query: SearchQuery,
  context: SearchContext
): Promise<SearchResult> => {
  const startTime = Date.now();
  const { text, version = "niv", limit = 50 } = query;

  if (!text.trim()) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query,
      executionTime: Date.now() - startTime
    };
  }

  try {
    // Call the AI search Convex function
    const results = await convex.action(api.aiSearch.performAISearch, {
      query: text,
      limit,
    });

    // Convert AI results to SearchResultItem format
    const items = results.map((aiResult, index) => {
      // Create a simple match for the entire verse text
      const matches: SearchMatch[] = [{
        startIndex: 0,
        endIndex: 0, // Will be updated when we get the actual verse text
        text: "",
        isHighlighted: true
      }];

      return {
        bookId: aiResult.bookId as any, // Type assertion needed for BookId
        chapter: aiResult.chapter,
        verse: aiResult.verse,
        text: "", // Will be populated when we fetch the actual verse text
        extraContext: aiResult.extraContext,
        matches,
        relevanceScore: aiResult.relevance ?? (1 - index * 0.1), // Use relevance or fallback
      };
    });

    // Fetch actual verse text for each result
    const bibleStore = context.bibleStore;
    const itemsWithText: SearchResultItem[] = [];

    for (const item of items) {
      try {
        const book = bibleStore.getBook(item.bookId, version);
        if (!book) {
          console.warn(`Book not found: ${item.bookId}`);
          continue;
        }

        const chapter = book.chapters[item.chapter - 1]; // Convert to 0-based index
        if (!chapter) {
          console.warn(`Chapter not found: ${item.chapter}`);
          continue;
        }

        const verse = chapter.verses[item.verse - 1]; // Convert to 0-based index
        if (!verse) {
          console.warn(`Verse not found: ${item.verse}`);
          continue;
        }

        // Update the item with actual verse text
        const updatedItem: SearchResultItem = {
          ...item,
          version,
          text: verse.text,
          matches: [{
            startIndex: 0,
            endIndex: 0, // We don't want to highlight the entire verse text
            text: verse.text,
            isHighlighted: true
          }],
          context: {
            extraContext: item.extraContext,
          }
        };

        itemsWithText.push(updatedItem);
      } catch (error) {
        console.warn(`Failed to fetch verse text for ${item.bookId} ${item.chapter}:${item.verse}:`, error);
        // Skip this result if we can't fetch the text
      }
    }

    return {
      items: itemsWithText,
      totalCount: itemsWithText.length,
      hasMore: false, // AI search doesn't support pagination in this implementation
      query,
      executionTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('AI assistant search error:', error);
    throw error;
  }
};

/**
 * AI Assistant search strategy definition
 */
export const aiAssistantStrategy = {
  type: SearchStrategyType.AI_ASSISTANT,
  name: "AI Search",
  description: "Ask for anything, and the AI will find related verses",
  search: aiAssistantSearch,
  limit: 10,
}; 
