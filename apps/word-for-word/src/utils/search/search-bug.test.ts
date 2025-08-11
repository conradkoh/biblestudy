import { keywordSearch } from "./strategies/keyword";
import { SearchStrategyType } from "@/src/types/search";
import { extractKeywords, extractAllWords, findOrderedSequenceMatch } from "./text-processor";

// Mock Bible store for testing the specific bug
const mockBibleStore = {
  getBook: (bookId: string, version: string) => ({
    chapters: [
      {
        verses: [
          { text: "Whoever makes any like it to enjoy its fragrance must be cut off from his people" },
          { text: "The joy of the Lord is your strength" },
          { text: "I will greatly rejoice in the Lord" }
        ]
      }
    ]
  })
};

// Mock search context
const mockContext = {
  bibleStore: mockBibleStore,
  currentCursor: {
    bookId: "exodus" as const,
    chapter: 30,
    verse: 38,
    version: "esv" as const
  }
};

describe("Keyword Search Bug Test", () => {
  test("searching for 'joy' should not match 'enjoy'", async () => {
    const query = {
      text: "joy",
      strategyType: SearchStrategyType.KEYWORD,
      version: "esv" as const,
      limit: 10,
      offset: 0
    };

    const result = await keywordSearch(query, mockContext);

    console.log("Search results:", result.items.map(item => ({
      text: item.text,
      matches: item.matches.map(m => m.text),
      score: item.relevanceScore
    })));

    // The verse with "enjoy" should NOT be in the results
    const enjoyVerse = result.items.find(item => 
      item.text.includes("enjoy") && !item.text.includes("joy ")
    );
    
    expect(enjoyVerse).toBeUndefined();

    // The verse with "joy" should be in the results
    const joyVerse = result.items.find(item => 
      item.text.includes("joy of the Lord")
    );
    
    expect(joyVerse).toBeDefined();
  });

  test("text processing functions work correctly", () => {
    const text1 = "Whoever makes any like it to enjoy its fragrance must be cut off from his people";
    const text2 = "The joy of the Lord is your strength";
    
    const words1 = extractAllWords(text1);
    const words2 = extractAllWords(text2);
    
    console.log("Words from text with 'enjoy':", words1);
    console.log("Words from text with 'joy':", words2);
    
    const queryTerms = ["joy"];
    
    const match1 = findOrderedSequenceMatch(queryTerms, words1);
    const match2 = findOrderedSequenceMatch(queryTerms, words2);
    
    console.log("Match result for 'enjoy' text:", match1);
    console.log("Match result for 'joy' text:", match2);
    
    // "enjoy" should not match "joy"
    expect(match1.score).toBe(0);
    
    // "joy" should match "joy"
    expect(match2.score).toBeGreaterThan(0);
  });
});