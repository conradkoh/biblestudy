/**
 * Text processing utilities for search functionality
 */

/**
 * Normalizes text for search by converting to lowercase and removing extra whitespace
 */
export function normalizeText(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Extracts keywords from text by splitting on delimiters and filtering out common words
 */
export function extractKeywords(text: string): string[] {
    const normalized = normalizeText(text);
    const words = normalized.split(/[\s,.;:!?()[\]{}"'`~@#$%^&*+=|\\/<>]/);

    // Filter out empty strings and common words (can be expanded)
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
        'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);

    return words.filter(word =>
        word.length > 0 &&
        word.length > 1 &&
        !commonWords.has(word)
    );
}

/**
 * Calculates a relevance score based on match position and frequency
 */
export function calculateRelevanceScore(
    text: string,
    query: string,
    matchStartIndex: number,
    matchEndIndex: number
): number {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    // Base score starts at 1.0
    let score = 1.0;

    // Boost score for exact matches
    if (normalizedText.includes(normalizedQuery)) {
        score += 2.0;
    }

    // Boost score for matches at the beginning of the text
    const textLength = normalizedText.length;
    const matchPosition = matchStartIndex / textLength;
    if (matchPosition < 0.1) {
        score += 1.0; // Early in text
    } else if (matchPosition < 0.3) {
        score += 0.5; // Early-middle
    }

    // Boost score for longer matches
    const matchLength = matchEndIndex - matchStartIndex;
    const queryLength = normalizedQuery.length;
    if (matchLength >= queryLength) {
        score += 0.5;
    }

    // Boost score for word boundary matches
    const beforeChar = normalizedText[matchStartIndex - 1];
    const afterChar = normalizedText[matchEndIndex];
    const isWordBoundary = (!beforeChar || /\s/.test(beforeChar)) &&
        (!afterChar || /\s/.test(afterChar));
    if (isWordBoundary) {
        score += 1.0;
    }

    return Math.min(score, 10.0); // Cap at 10.0
}

/**
 * Finds all occurrences of a query in text and returns match positions
 */
export function findMatches(text: string, query: string): Array<{ startIndex: number, endIndex: number }> {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);
    const matches: Array<{ startIndex: number, endIndex: number }> = [];

    let startIndex = 0;
    while (true) {
        const index = normalizedText.indexOf(normalizedQuery, startIndex);
        if (index === -1) break;

        matches.push({
            startIndex: index,
            endIndex: index + normalizedQuery.length
        });

        startIndex = index + 1;
    }

    return matches;
}

/**
 * Highlights matches in text by wrapping them in markers
 */
export function highlightMatches(text: string, matches: Array<{ startIndex: number, endIndex: number }>): string {
    if (matches.length === 0) return text;

    // Sort matches by start index in descending order to avoid index shifting
    const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);

    let result = text;
    for (const match of sortedMatches) {
        const before = result.substring(0, match.startIndex);
        const matched = result.substring(match.startIndex, match.endIndex);
        const after = result.substring(match.endIndex);
        result = before + `**${matched}**` + after;
    }

    return result;
}

/**
 * Gets context around a match (previous and next words)
 */
export function getMatchContext(text: string, matchStartIndex: number, matchEndIndex: number, contextWords: number = 3): {
    before: string;
    after: string;
} {
    const words = text.split(/\s+/);
    const matchStart = text.substring(0, matchStartIndex).split(/\s+/).length - 1;
    const matchEnd = text.substring(0, matchEndIndex).split(/\s+/).length - 1;

    const beforeStart = Math.max(0, matchStart - contextWords);
    const afterEnd = Math.min(words.length, matchEnd + contextWords + 1);

    return {
        before: words.slice(beforeStart, matchStart).join(' '),
        after: words.slice(matchEnd + 1, afterEnd).join(' ')
    };
} 