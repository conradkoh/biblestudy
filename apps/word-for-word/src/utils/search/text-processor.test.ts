import { extractKeywords, extractAllWords, findOrderedSequenceMatch } from "./text-processor";

describe("Text Processor Word Boundary Fix", () => {
  test("exact phrase matching should not match substrings within words", () => {
    // Test case 1: "joy" should not match "enjoy"
    const query1 = ["joy"];
    const text1 = ["whoever", "makes", "any", "like", "it", "to", "enjoy", "its", "fragrance"];
    const result1 = findOrderedSequenceMatch(query1, text1);
    
    expect(result1.score).toBe(0);
    expect(result1.positions).toEqual([]);
    expect(result1.matchType).toBe('unordered');
    
    // Test case 2: "joy" should match actual "joy"
    const query2 = ["joy"];
    const text2 = ["the", "joy", "of", "the", "lord"];
    const result2 = findOrderedSequenceMatch(query2, text2);
    
    expect(result2.score).toBe(10);
    expect(result2.positions).toEqual([1]);
    expect(result2.matchType).toBe('exact');
    
    // Test case 3: Multi-word phrase should work
    const query3 = ["wages", "of", "sin"];
    const text3 = ["the", "wages", "of", "sin", "is", "death"];
    const result3 = findOrderedSequenceMatch(query3, text3);
    
    expect(result3.score).toBe(10);
    expect(result3.positions).toEqual([1, 2, 3]);
    expect(result3.matchType).toBe('exact');
    
    // Test case 4: Partial word match should not work  
    const query4 = ["sin"];
    const text4 = ["singing", "songs", "of", "praise"];
    const result4 = findOrderedSequenceMatch(query4, text4);
    
    expect(result4.score).toBe(0);
    expect(result4.positions).toEqual([]);
    expect(result4.matchType).toBe('unordered');
  });
  
  test("edge cases with special characters", () => {
    // Test that regex escaping works correctly
    const query = ["god's"];
    const text = ["for", "god's", "love", "endures"];
    const result = findOrderedSequenceMatch(query, text);
    
    expect(result.score).toBe(10);
    expect(result.positions).toEqual([1]);
    expect(result.matchType).toBe('exact');
  });
});