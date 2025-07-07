import { simpleSubstringSearch } from "./strategies/simple-substring";
import { keywordSearch } from "./strategies/keyword";
import { SearchStrategyType } from "@/src/types/search";

// Mock Bible store for testing
const mockBibleStore = {
  getBook: (bookId: string, version: string) => ({
    chapters: [
      {
        verses: [
          { text: "In the beginning God created the heavens and the earth." },
          { text: "The earth was formless and empty, and darkness covered the deep waters." },
          { text: "And the Spirit of God was hovering over the surface of the waters." }
        ]
      }
    ]
  })
};

// Mock search context
const mockContext = {
  bibleStore: mockBibleStore,
  currentCursor: {
    bookId: "genesis" as const,
    chapter: 1,
    verse: 1,
    version: "niv" as const
  }
};

describe("Search Strategies", () => {
  test("simpleSubstringSearch should find matches", async () => {
    const query = {
      text: "God",
      strategyType: SearchStrategyType.SIMPLE_SUBSTRING,
      version: "niv" as const,
      limit: 10,
      offset: 0
    };

    const result = await simpleSubstringSearch(query, mockContext);

    expect(result.items).toHaveLength(2); // "God" appears in verses 1 and 3
    expect(result.totalCount).toBe(2);
    expect(result.items[0]?.text).toContain("God");
    expect(result.items[0]?.matches).toHaveLength(1);
    expect(result.items[0]?.matches[0]?.text).toBe("God");
  });

  test("keywordSearch should find keyword matches", async () => {
    const query = {
      text: "earth waters",
      strategyType: SearchStrategyType.KEYWORD,
      version: "niv" as const,
      limit: 10,
      offset: 0
    };

    const result = await keywordSearch(query, mockContext);

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.relevanceScore).toBeGreaterThan(0);
  });

  test("empty query should return empty results", async () => {
    const query = {
      text: "",
      strategyType: SearchStrategyType.SIMPLE_SUBSTRING,
      version: "niv" as const,
      limit: 10,
      offset: 0
    };

    const result = await simpleSubstringSearch(query, mockContext);

    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.hasMore).toBe(false);
  });
}); 
