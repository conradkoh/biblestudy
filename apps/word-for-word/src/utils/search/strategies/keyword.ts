import type { SearchQuery, SearchContext, SearchResult, SearchResultItem, SearchMatch } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import { extractKeywords, findMatches, calculateRelevanceScore, getMatchContext, normalizeText } from "../text-processor";
import type { BookId } from "@common/utils/bible-data-utils";
import { bookIds } from "@common/utils/bible-data-utils";

/**
 * Keyword search strategy
 * Performs word-based search with better relevance scoring by focusing on individual keywords
 */
export const keywordSearch = async (
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

    // Extract keywords from the search query
    const queryKeywords = extractKeywords(text);
    if (queryKeywords.length === 0) {
        // If no keywords found, fall back to simple substring search
        return {
            items: [],
            totalCount: 0,
            hasMore: false,
            query,
            executionTime: Date.now() - startTime
        };
    }

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
                const normalizedVerseText = normalizeText(verseText);

                // Check how many keywords match in this verse
                const matchingKeywords = queryKeywords.filter(keyword =>
                    normalizedVerseText.includes(keyword)
                );

                if (matchingKeywords.length > 0) {
                    // Calculate keyword match ratio
                    const keywordMatchRatio = matchingKeywords.length / queryKeywords.length;

                    // Find all matches for the best matching keyword
                    const bestKeyword = matchingKeywords[0];
                    if (!bestKeyword) continue;
                    const matches = findMatches(verseText, bestKeyword);

                    if (matches.length > 0) {
                        // Convert matches to SearchMatch format
                        const searchMatches: SearchMatch[] = matches.map(match => ({
                            startIndex: match.startIndex,
                            endIndex: match.endIndex,
                            text: verseText.substring(match.startIndex, match.endIndex),
                            isHighlighted: true
                        }));

                        // Calculate base relevance score
                        const bestMatch = matches[0];
                        if (!bestMatch) continue;

                        let relevanceScore = calculateRelevanceScore(
                            verseText,
                            bestKeyword,
                            bestMatch.startIndex,
                            bestMatch.endIndex
                        );

                        // Boost score based on keyword match ratio
                        relevanceScore += keywordMatchRatio * 3.0;

                        // Boost score for verses that match more keywords
                        if (matchingKeywords.length > 1) {
                            relevanceScore += (matchingKeywords.length - 1) * 1.5;
                        }

                        // Get context around the first match
                        const context = getMatchContext(verseText, bestMatch.startIndex, bestMatch.endIndex);

                        const resultItem: SearchResultItem = {
                            bookId,
                            chapter: chapterNumber,
                            verse: verseNumber,
                            version,
                            text: verseText,
                            matches: searchMatches,
                            relevanceScore,
                            context: {
                                previousVerse: context.before,
                                nextVerse: context.after
                            }
                        };

                        results.push(resultItem);

                        // Check if we've reached the limit
                        if (results.length >= limit + offset) {
                            break;
                        }
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
 * Keyword search strategy definition
 */
export const keywordStrategy = {
    type: SearchStrategyType.KEYWORD,
    name: "Keyword Search",
    description: "Search for individual words and phrases with smart relevance scoring",
    search: keywordSearch
}; 