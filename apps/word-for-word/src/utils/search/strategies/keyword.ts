import type { SearchQuery, SearchContext, SearchResult, SearchResultItem, SearchMatch } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import {
    extractKeywords,
    extractAllWords,
    findMatches,
    calculateRelevanceScore,
    calculateImprovedRelevanceScore,
    findOrderedSequenceMatch,
    getMatchContext,
    normalizeText
} from "../text-processor";
import type { BookId } from "@common/utils/bible-data-utils";
import { bookIds } from "@common/utils/bible-data-utils";

/**
 * Keyword search strategy
 * Performs word-based search with better relevance scoring by focusing on individual keywords
 * and phrase matching with improved term order consideration
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

    const allResults: SearchResultItem[] = [];
    const bibleStore = context.bibleStore;

    // Extract keywords from the search query (for backward compatibility)
    const queryKeywords = extractKeywords(text);

    // Extract all words from the search query (including common words for phrase matching)
    const queryAllWords = extractAllWords(text);

    if (queryKeywords.length === 0 && queryAllWords.length === 0) {
        return {
            items: [],
            totalCount: 0,
            hasMore: false,
            query,
            executionTime: Date.now() - startTime
        };
    }

    // Calculate quality threshold based on query complexity
    // Higher threshold for longer queries to ensure quality matches
    const qualityThreshold = Math.max(2.0, Math.min(5.0, queryAllWords.length * 1.5));

    console.log(`Searching with quality threshold: ${qualityThreshold} for query: "${text}"`);

    // Search through all books to collect all potential matches
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
                const verseWords = extractAllWords(verseText);

                // Use improved sequence matching
                const sequenceMatch = findOrderedSequenceMatch(queryAllWords, verseWords);

                if (sequenceMatch.score > 0) {
                    // Calculate improved relevance score
                    const relevanceScore = calculateImprovedRelevanceScore(
                        verseText,
                        queryAllWords,
                        sequenceMatch
                    );

                    // Only include results above the quality threshold
                    if (relevanceScore >= qualityThreshold) {
                        // Create search matches based on the sequence match positions
                        const searchMatches: SearchMatch[] = sequenceMatch.positions.map((pos: number) => {
                            const word = verseWords[pos];
                            if (!word) return null;

                            // Find the actual position of this word in the original text
                            const wordIndex = normalizedVerseText.indexOf(word, pos > 0 ?
                                normalizedVerseText.indexOf(verseWords[pos - 1] || '') + (verseWords[pos - 1]?.length || 0) : 0);

                            if (wordIndex === -1) return null;

                            return {
                                startIndex: wordIndex,
                                endIndex: wordIndex + word.length,
                                text: word,
                                isHighlighted: true
                            };
                        }).filter((match: SearchMatch | null): match is SearchMatch => match !== null);

                        if (searchMatches.length > 0) {
                            // Get context around the first match
                            const firstMatch = searchMatches[0];
                            if (firstMatch) {
                                const context = getMatchContext(verseText, firstMatch.startIndex, firstMatch.endIndex);

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

                                allResults.push(resultItem);
                            }
                        }
                    }
                }
            }
        }
    }

    // Sort by relevance score (highest first)
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`Found ${allResults.length} results above quality threshold ${qualityThreshold}`);

    // Log some sample results for debugging
    if (allResults.length > 0) {
        console.log(`Top 3 results:`);
        allResults.slice(0, 3).forEach((result, index) => {
            console.log(`${index + 1}. ${result.bookId} ${result.chapter}:${result.verse} (score: ${result.relevanceScore.toFixed(2)})`);
        });
    }

    // Apply offset and limit for pagination
    const paginatedResults = allResults.slice(offset, offset + limit);
    const hasMore = allResults.length > offset + limit;

    return {
        items: paginatedResults,
        totalCount: allResults.length,
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