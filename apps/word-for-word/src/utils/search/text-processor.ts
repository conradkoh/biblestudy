/**
 * Text processing utilities for search functionality
 */

/**
 * Normalizes text for search by converting to lowercase and removing extra whitespace
 * 
 * @example
 * normalizeText("  The LORD   is   my shepherd  ") 
 * // Returns: "the lord is my shepherd"
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Extracts keywords from text by splitting on delimiters and filtering out common words
 * 
 * @example
 * extractKeywords("The wages of sin is death") 
 * // Returns: ["wages", "sin", "death"] (removes "the", "of", "is")
 * 
 * @example
 * extractKeywords("For God so loved the world") 
 * // Returns: ["god", "loved", "world"] (removes "for", "so", "the")
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
 * Extracts all words from text (including common words) for phrase matching
 * 
 * @example
 * extractAllWords("The wages of sin is death") 
 * // Returns: ["the", "wages", "of", "sin", "is", "death"]
 * 
 * @example
 * extractAllWords("For God so loved the world") 
 * // Returns: ["for", "god", "so", "loved", "the", "world"]
 */
export function extractAllWords(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(/[\s,.;:!?()[\]{}"'`~@#$%^&*+=|\\/<>]/).filter(word => word.length > 0);
}

/**
 * Finds the best ordered sequence match for query terms in text
 * Returns the score and positions of the best match
 * 
 * Algorithm:
 * 1. Try exact phrase match first (highest priority)
 * 2. Try ordered sequence match (terms in order, but not necessarily consecutive)
 * 3. Fall back to unordered match (current behavior)
 * 
 * @example
 * Query: ["wages", "sin", "death"]
 * Text: ["for", "the", "wages", "of", "sin", "is", "death", "but", "the", "gift"]
 * Result: { score: 7, positions: [2, 4, 6], matchType: 'ordered' }
 * Explanation: "wages" at pos 2, "sin" at pos 4, "death" at pos 6 (in order with gaps)
 * 
 * @example
 * Query: ["god", "loved", "world"]
 * Text: ["for", "god", "so", "loved", "the", "world"]
 * Result: { score: 10, positions: [1, 3, 5], matchType: 'exact' }
 * Explanation: Exact phrase match found
 */
export function findOrderedSequenceMatch(
  queryTerms: string[],
  textWords: string[]
): { score: number; positions: number[]; matchType: 'exact' | 'ordered' | 'unordered' } {
  if (queryTerms.length === 0) {
    return { score: 0, positions: [], matchType: 'unordered' };
  }

  // Try exact phrase match first
  // Example: queryTerms=["wages", "sin", "death"] -> "wages sin death"
  const exactPhrase = queryTerms.join(' ');
  const textPhrase = textWords.join(' ');
  const exactIndex = textPhrase.indexOf(exactPhrase);
  if (exactIndex !== -1) {
    // Calculate word positions for exact match
    // Example: If "wages sin death" starts at word position 2, then positions=[2,3,4]
    const beforeWords = textPhrase.substring(0, exactIndex).split(' ').filter(w => w.length > 0);
    const startPos = beforeWords.length;
    const positions = Array.from({ length: queryTerms.length }, (_, i) => startPos + i);
    return {
      score: 10.0, // Maximum score for exact phrase match
      positions,
      matchType: 'exact'
    };
  }

  // Try ordered sequence match (terms in order, but not necessarily consecutive)
  // Example: Find "wages" then "sin" then "death" in order, even if separated by other words
  let bestOrderedScore = 0;
  let bestOrderedPositions: number[] = [];

  for (let startPos = 0; startPos <= textWords.length - queryTerms.length; startPos++) {
    const positions: number[] = [];
    let currentPos = startPos;
    let allFound = true;

    for (const term of queryTerms) {
      // Find the next occurrence of this term from current position
      let found = false;
      for (let i = currentPos; i < textWords.length; i++) {
        if (textWords[i] === term) {
          positions.push(i);
          currentPos = i + 1; // Move to next position for next term
          found = true;
          break;
        }
      }
      if (!found) {
        allFound = false;
        break;
      }
    }

    if (allFound) {
      // Calculate score based on how close the terms are to each other
      // Example: positions=[2,4,6] -> gaps=[1,1] -> totalDistance=2 -> score=8.0-2*0.5=7.0
      const totalDistance = positions.reduce((sum, pos, i) => {
        if (i === 0) return 0;
        const prevPos = positions[i - 1];
        if (prevPos === undefined) return sum;
        return sum + (pos - prevPos - 1); // Count words between terms
      }, 0);

      const score = Math.max(0, 8.0 - totalDistance * 0.5); // Base 8.0, reduce by 0.5 per gap

      if (score > bestOrderedScore) {
        bestOrderedScore = score;
        bestOrderedPositions = [...positions];
      }
    }
  }

  if (bestOrderedScore > 0) {
    return {
      score: bestOrderedScore,
      positions: bestOrderedPositions,
      matchType: 'ordered'
    };
  }

  // Fall back to unordered match (current behavior)
  // Example: Find any occurrence of each term, regardless of order
  const positions: number[] = [];
  let unorderedScore = 0;

  for (const term of queryTerms) {
    const termPositions = textWords
      .map((word, index) => ({ word, index }))
      .filter(({ word }) => word === term)
      .map(({ index }) => index);

    if (termPositions.length > 0) {
      const firstPosition = termPositions[0];
      if (firstPosition !== undefined) {
        positions.push(firstPosition); // Take first occurrence
        unorderedScore += 2.0; // Base score per term
      }
    }
  }

  return {
    score: unorderedScore,
    positions: positions.sort((a, b) => a - b),
    matchType: 'unordered'
  };
}

/**
 * Calculates a relevance score based on match position and frequency
 * 
 * @example
 * calculateRelevanceScore("The wages of sin is death", "wages", 4, 10)
 * // Returns: ~4.5 (base 1.0 + word boundary 1.0 + early position 1.0 + exact match 2.0)
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
 * Calculates an improved relevance score that considers term order and phrase matching
 * 
 * @example
 * Query: ["wages", "sin", "death"]
 * Text: "For the wages of sin is death, but the gift of God is eternal life"
 * MatchResult: { score: 7, positions: [2, 4, 6], matchType: 'ordered' }
 * Final Score: 7 + 1.5 (ordered bonus) + 2.0 (match ratio) + 0.9 (boundary bonus) = 11.4 (capped at 10.0)
 * 
 * @example
 * Query: ["god", "loved", "world"]
 * Text: "For God so loved the world"
 * MatchResult: { score: 10, positions: [1, 3, 5], matchType: 'exact' }
 * Final Score: 10 + 2.0 (exact bonus) + 2.0 (match ratio) + 0.9 (boundary bonus) = 14.9 (capped at 10.0)
 */
export function calculateImprovedRelevanceScore(
  text: string,
  queryTerms: string[],
  matchResult: { score: number; positions: number[]; matchType: 'exact' | 'ordered' | 'unordered' }
): number {
  const normalizedText = normalizeText(text);
  const textWords = extractAllWords(text);

  // Start with the base score from sequence matching
  let score = matchResult.score;

  // Boost for exact phrase matches
  if (matchResult.matchType === 'exact') {
    score += 2.0;
  }

  // Boost for ordered matches
  if (matchResult.matchType === 'ordered') {
    score += 1.5;
  }

  // Boost for matches at the beginning of the text
  if (matchResult.positions.length > 0) {
    const firstMatchPos = matchResult.positions[0];
    if (firstMatchPos !== undefined) {
      const textLength = textWords.length;
      const matchPosition = firstMatchPos / textLength;

      if (matchPosition < 0.1) {
        score += 1.0; // Early in text
      } else if (matchPosition < 0.3) {
        score += 0.5; // Early-middle
      }
    }
  }

  // Boost for word boundary matches
  // Example: If "wages" is surrounded by different words ("the" and "of"), add bonus
  let boundaryBonus = 0;
  for (const pos of matchResult.positions) {
    if (pos > 0 && pos < textWords.length - 1) {
      // Check if this word is at a natural boundary
      const beforeWord = textWords[pos - 1];
      const afterWord = textWords[pos + 1];
      const currentWord = textWords[pos];

      // Boost if surrounded by different words (not repeated)
      if (beforeWord !== currentWord && afterWord !== currentWord) {
        boundaryBonus += 0.3;
      }
    }
  }
  score += Math.min(boundaryBonus, 1.0);

  // Boost for higher percentage of query terms matched
  // Example: 3/3 terms matched = 100% = +2.0 bonus
  const matchRatio = matchResult.positions.length / queryTerms.length;
  score += matchRatio * 2.0;

  return Math.min(score, 10.0); // Cap at 10.0
}

/**
 * Finds all occurrences of a query in text and returns match positions
 * 
 * @example
 * findMatches("The wages of sin is death", "wages")
 * // Returns: [{ startIndex: 4, endIndex: 10 }]
 * 
 * @example
 * findMatches("The wages of sin is death, wages are earned", "wages")
 * // Returns: [{ startIndex: 4, endIndex: 10 }, { startIndex: 25, endIndex: 31 }]
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
 * 
 * @example
 * highlightMatches("The wages of sin is death", [{ startIndex: 4, endIndex: 10 }])
 * // Returns: "The **wages** of sin is death"
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
