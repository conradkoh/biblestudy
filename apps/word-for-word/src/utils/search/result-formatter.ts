import { SearchResult, SearchMatch, SearchResultItem } from '@/src/types/search';
import { BibleCursor } from '@common/utils/bible-data-utils';
import { mapBookIdsToName } from '@common/utils/bible-data-utils';

export interface FormattedSearchResult {
  id: string;
  reference: string;
  text: string;
  highlightedText: string;
  cursor: BibleCursor;
  relevanceScore: number;
  matchCount: number;
  context: string;
}

export interface GroupedSearchResults {
  bookName: string;
  bookId: string;
  results: FormattedSearchResult[];
}

/**
 * Formats a search result item with highlighted text and context
 */
export function formatSearchResultItem(
  item: SearchResultItem,
  query: string
): FormattedSearchResult {
  const reference = `${mapBookIdsToName[item.bookId]} ${item.chapter}:${item.verse}`;

  const highlightedText = highlightMatches(item.text, item.matches, query);

  const context = generateContext(item.text, item.matches);

  const cursor: BibleCursor = {
    bookId: item.bookId,
    chapter: item.chapter,
    verse: item.verse,
    version: item.version,
  };

  return {
    id: `${item.bookId}-${item.chapter}-${item.verse}`,
    reference,
    text: item.text,
    highlightedText,
    cursor,
    relevanceScore: item.relevanceScore,
    matchCount: item.matches.length,
    context,
  };
}

/**
 * Highlights matching text in search results
 */
export function highlightMatches(
  text: string,
  matches: SearchMatch[],
  query: string
): string {
  if (matches.length === 0) return text;

  // Sort matches by position to avoid overlapping
  const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

  let highlightedText = text;
  let offset = 0;

  for (const match of sortedMatches) {
    const before = highlightedText.substring(0, match.startIndex + offset);
    const matchText = highlightedText.substring(match.startIndex + offset, match.endIndex + offset);
    const after = highlightedText.substring(match.endIndex + offset);

    // Add highlighting markers (these will be processed by the UI component)
    highlightedText = `${before}**${matchText}**${after}`;
    offset += 4; // Length of "**" markers
  }

  return highlightedText;
}

/**
 * Generates context around matches for better understanding
 */
export function generateContext(text: string, matches: SearchMatch[]): string {
  if (matches.length === 0) return text.substring(0, 100) + (text.length > 100 ? '...' : '');

  // Find the first and last match positions
  const firstMatch = Math.min(...matches.map(m => m.startIndex));
  const lastMatch = Math.max(...matches.map(m => m.endIndex));

  // Extract context with some padding
  const contextStart = Math.max(0, firstMatch - 30);
  const contextEnd = Math.min(text.length, lastMatch + 30);

  let context = text.substring(contextStart, contextEnd);

  // Add ellipsis if we're not showing the full text
  if (contextStart > 0) context = '...' + context;
  if (contextEnd < text.length) context = context + '...';

  return context;
}

/**
 * Groups search results by book
 */
export function groupResultsByBook(results: FormattedSearchResult[]): GroupedSearchResults[] {
  const grouped = results.reduce((acc, result) => {
    const bookId = result.cursor.bookId;
    const bookName = mapBookIdsToName[bookId];

    if (!acc[bookId]) {
      acc[bookId] = {
        bookName,
        bookId,
        results: [],
      };
    }

    acc[bookId].results.push(result);
    return acc;
  }, {} as Record<string, GroupedSearchResults>);

  // Convert to array and sort by book order
  return Object.values(grouped).sort((a, b) => {
    const bookOrder = Object.keys(mapBookIdsToName);
    const aIndex = bookOrder.indexOf(a.bookId);
    const bIndex = bookOrder.indexOf(b.bookId);
    return aIndex - bIndex;
  });
}

/**
 * Sorts search results by relevance score
 */
export function sortResultsByRelevance(results: FormattedSearchResult[]): FormattedSearchResult[] {
  return [...results].sort((a, b) => {
    // Primary sort by relevance score (higher is better)
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }

    // Secondary sort by match count (more matches is better)
    if (b.matchCount !== a.matchCount) {
      return b.matchCount - a.matchCount;
    }

    // Tertiary sort by book and chapter order
    const bookOrder = Object.keys(mapBookIdsToName);
    const aBookIndex = bookOrder.indexOf(a.cursor.bookId);
    const bBookIndex = bookOrder.indexOf(b.cursor.bookId);

    if (aBookIndex !== bBookIndex) {
      return aBookIndex - bBookIndex;
    }

    if (a.cursor.chapter !== b.cursor.chapter) {
      return a.cursor.chapter - b.cursor.chapter;
    }

    return (a.cursor.verse ?? 0) - (b.cursor.verse ?? 0);
  });
}

/**
 * Formats search results with highlighting and grouping
 */
export function formatSearchResults(
  searchResult: SearchResult,
  query: string
): {
  formattedResults: FormattedSearchResult[];
  groupedResults: GroupedSearchResults[];
} {
  const formattedResults = searchResult.items.map(item => formatSearchResultItem(item, query));
  const sortedResults = sortResultsByRelevance(formattedResults);
  const groupedResults = groupResultsByBook(sortedResults);

  return {
    formattedResults: sortedResults,
    groupedResults,
  };
} 
