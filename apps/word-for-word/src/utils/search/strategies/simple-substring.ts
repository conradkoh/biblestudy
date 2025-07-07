import type { SearchQuery, SearchContext, SearchResult, SearchResultItem, SearchMatch } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import { findMatches, calculateRelevanceScore } from "../text-processor";
import type { BookId } from "@common/utils/bible-data-utils";
import { bookIds } from "@common/utils/bible-data-utils";

/**
 * Simple substring search strategy
 * Performs basic case-insensitive text matching across all Bible verses
 */
export const simpleSubstringSearch = async (
  query: SearchQuery,
  context: SearchContext
): Promise<SearchResult> => {
  const startTime = Date.now();
  const { text, version = "niv", limit = 50, offset = 0 } = query;

  if (!text.trim()) {
    return {
      items: [],
      totalCount: 0,
      hasMore: false,
      query,
      executionTime: Date.now() - startTime
    };
  }

  const results: SearchResultItem[] = [];
  const bibleStore = context.bibleStore;

  // Search through all books
  for (const bookId of bookIds) {
    const book = bibleStore.getBook(bookId, version);
    if (!book) continue;

    // Search through all chapters
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
      const chapter = book.chapters[chapterIndex];
      const chapterNumber = chapterIndex + 1;

      // Search through all verses in the chapter
      for (let verseIndex = 0; verseIndex < chapter.verses.length; verseIndex++) {
        const verse = chapter.verses[verseIndex];
        const verseNumber = verseIndex + 1;
        const verseText = verse.text;

        // Find matches in this verse
        const matches = findMatches(verseText, text);

        if (matches.length > 0) {
          // Convert matches to SearchMatch format
          const searchMatches: SearchMatch[] = matches.map(match => ({
            startIndex: match.startIndex,
            endIndex: match.endIndex,
            text: verseText.substring(match.startIndex, match.endIndex),
            isHighlighted: true
          }));

          // Calculate relevance score for the best match
          const bestMatch = matches[0];
          if (!bestMatch) continue;

          const relevanceScore = calculateRelevanceScore(
            verseText,
            text,
            bestMatch.startIndex,
            bestMatch.endIndex
          );

          const resultItem: SearchResultItem = {
            bookId,
            chapter: chapterNumber,
            verse: verseNumber,
            version,
            text: verseText,
            matches: searchMatches,
            relevanceScore
          };

          results.push(resultItem);

          // Check if we've reached the limit
          if (results.length >= limit + offset) {
            break;
          }
        }
      }

      if (results.length >= limit + offset) {
        break;
      }
    }

    if (results.length >= limit + offset) {
      break;
    }
  }

  // Sort by relevance score (highest first)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Apply offset and limit
  const paginatedResults = results.slice(offset, offset + limit);
  const hasMore = results.length > offset + limit;

  return {
    items: paginatedResults,
    totalCount: results.length,
    hasMore,
    query,
    executionTime: Date.now() - startTime
  };
};

/**
 * Simple substring search strategy definition
 */
export const simpleSubstringStrategy = {
  type: SearchStrategyType.SIMPLE_SUBSTRING,
  name: "Simple Search",
  description: "Find exact text matches in Bible verses (case-insensitive)",
  search: simpleSubstringSearch
}; 
