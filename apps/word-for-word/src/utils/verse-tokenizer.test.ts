import { tokeniseVerse, tokeniseVerses, isWord, Token } from './verse-tokenizer';

describe('verse-tokenizer', () => {
  describe('isWord', () => {
    it('should return true for valid words', () => {
      expect(isWord('hello')).toBe(true);
      expect(isWord('world')).toBe(true);
      expect(isWord('123')).toBe(true);
    });

    it('should return false for delimiters and invalid inputs', () => {
      expect(isWord(' ')).toBe(false);
      expect(isWord(',')).toBe(false);
      expect(isWord('.')).toBe(false);
      expect(isWord(null)).toBe(false);
      expect(isWord(undefined)).toBe(false);
      expect(isWord('')).toBe(false);
    });
  });

  describe('tokeniseVerse', () => {
    it('should handle perfect match', () => {
      const verse = 'In the beginning was the Word';
      const userText = 'In the beginning was the Word';
      const result = tokeniseVerse(verse, userText);

      expect(result).toHaveLength(11); // 6 words + 5 spaces
      expect(result.filter(t => !t.isDelimiter && t.match)).toHaveLength(6);
      expect(result.every(t => t.userAttempted)).toBe(true);
    });

    it('should handle partial match', () => {
      const verse = 'In the beginning was the Word';
      const userText = 'In the beginning';
      const result = tokeniseVerse(verse, userText);

      const words = result.filter(t => !t.isDelimiter);
      expect(words.length).toBeGreaterThanOrEqual(6);
      expect(words[0]?.match).toBe(true); // 'In'
      expect(words[1]?.match).toBe(true); // 'the'  
      expect(words[2]?.match).toBe(true); // 'beginning'
      expect(words[3]?.match).toBe(false); // 'was'
      expect(words[4]?.match).toBe(false); // 'the'
      expect(words[5]?.match).toBe(false); // 'Word'

      expect(words[0]?.userAttempted).toBe(true);
      expect(words[1]?.userAttempted).toBe(true);
      expect(words[2]?.userAttempted).toBe(true);
      expect(words[3]?.userAttempted).toBe(false);
    });

    it('should handle case insensitivity', () => {
      const verse = 'In the beginning';
      const userText = 'in THE Beginning';
      const result = tokeniseVerse(verse, userText);

      const words = result.filter(t => !t.isDelimiter);
      expect(words.every(w => w.match)).toBe(true);
    });

    it('should handle no user input', () => {
      const verse = 'In the beginning';
      const userText = '';
      const result = tokeniseVerse(verse, userText);

      const words = result.filter(t => !t.isDelimiter);
      expect(words.every(w => !w.match)).toBe(true);
      expect(words.every(w => !w.userAttempted)).toBe(true);
    });

    it('should handle punctuation correctly', () => {
      const verse = 'Hello, world!';
      const userText = 'Hello world';
      const result = tokeniseVerse(verse, userText);

      expect(result.find(t => t.text === 'Hello')?.match).toBe(true);
      expect(result.find(t => t.text === ',')?.isDelimiter).toBe(true);
      expect(result.find(t => t.text === 'world')?.match).toBe(true);
      expect(result.find(t => t.text === '!')?.isDelimiter).toBe(true);
    });
  });

  describe('tokeniseVerses', () => {
    it('should handle empty verses array', () => {
      const result = tokeniseVerses([], 'some text');
      expect(result).toEqual([]);
    });

    it('should handle single verse (same as tokeniseVerse)', () => {
      const verses = ['In the beginning was the Word'];
      const userText = 'In the beginning';
      const result = tokeniseVerses(verses, userText);

      expect(result).toHaveLength(1);
      expect(verses[0]).toBeDefined();
      const singleResult = tokeniseVerse(verses[0] as string, userText);
      expect(result[0]).toEqual(singleResult);
    });

    it('should handle multiple verses with complete match', () => {
      const verses = ['In the beginning', 'was the Word'];
      const userText = 'In the beginning was the Word';
      const result = tokeniseVerses(verses, userText);

      expect(result).toHaveLength(2);

      // First verse
      expect(result[0]).toBeDefined();
      const firstVerseWords = result[0]?.filter(t => !t.isDelimiter);
      expect(firstVerseWords?.every(w => w.match)).toBe(true);

      // Second verse
      expect(result[1]).toBeDefined();
      const secondVerseWords = result[1]?.filter(t => !t.isDelimiter);
      expect(secondVerseWords?.every(w => w.match)).toBe(true);
    });

    it('should handle partial match across verses', () => {
      const verses = ['In the beginning', 'was the Word'];
      const userText = 'In the beginning was';
      const result = tokeniseVerses(verses, userText);

      expect(result).toHaveLength(2);

      // First verse - all words should match
      expect(result[0]).toBeDefined();
      const firstVerseWords = result[0]?.filter(t => !t.isDelimiter);
      expect(firstVerseWords?.every(w => w.match)).toBe(true);

      // Second verse - only first word should match
      expect(result[1]).toBeDefined();
      const secondVerseWords = result[1]?.filter(t => !t.isDelimiter);
      expect(secondVerseWords?.length).toBeGreaterThanOrEqual(1);
      expect(secondVerseWords?.[0]?.match).toBe(true); // 'was'
      if (secondVerseWords && secondVerseWords.length > 1) {
        expect(secondVerseWords?.[1]?.match).toBe(false); // 'the'
      }
      if (secondVerseWords && secondVerseWords.length > 2) {
        expect(secondVerseWords?.[2]?.match).toBe(false); // 'Word'
      }
    });

    it('should handle user attempt tracking across verses', () => {
      const verses = ['Hello world', 'goodbye moon'];
      const userText = 'Hello world goodbye';
      const result = tokeniseVerses(verses, userText);

      // First verse
      expect(result[0]).toBeDefined();
      const firstVerseWords = result[0]?.filter(t => !t.isDelimiter);
      expect(firstVerseWords?.every(w => w.userAttempted)).toBe(true);

      // Second verse
      expect(result[1]).toBeDefined();
      // biome-ignore lint/style/noNonNullAssertion: check isDefined above
      const secondVerseWords = result[1]!.filter(t => !t.isDelimiter);
      expect(secondVerseWords.length).toBeGreaterThanOrEqual(1);
      expect(secondVerseWords[0]?.userAttempted).toBe(true); // 'goodbye'
      if (secondVerseWords.length > 1) {
        expect(secondVerseWords[1]?.userAttempted).toBe(false); // 'moon'
      }
    });

    it('should preserve verse structure with punctuation', () => {
      const verses = ['Hello, world!', 'How are you?'];
      const userText = 'Hello world How are';
      const result = tokeniseVerses(verses, userText);

      expect(result).toHaveLength(2);

      // Check that delimiters are preserved in their respective verses
      expect(result[0]).toBeDefined();
      if (!result[0]) throw new Error('result[0] is undefined');
      expect(result[0].find(t => t.text === ',')?.isDelimiter).toBe(true);
      expect(result[0].find(t => t.text === '!')?.isDelimiter).toBe(true);
      expect(result[1]).toBeDefined();
      if (!result[1]) throw new Error('result[1] is undefined');
      const questionMark = result[1].find(t => t.text === '?');
      if (questionMark) {
        expect(questionMark.isDelimiter).toBe(true);
      }
    });

    it('should handle case insensitivity across verses', () => {
      const verses = ['In the beginning', 'Was The Word'];
      const userText = 'in THE beginning was the word';
      const result = tokeniseVerses(verses, userText);

      const allWords = result.flat().filter(t => !t.isDelimiter);
      expect(allWords.every(w => w.match)).toBe(true);
    });

    it('should handle three verses with mixed matching', () => {
      const verses = ['First verse', 'Second verse', 'Third verse'];
      const userText = 'First verse Second';
      const result = tokeniseVerses(verses, userText);

      expect(result).toHaveLength(3);

      // First verse: complete match
      expect(result[0]).toBeDefined();
      // biome-ignore lint/style/noNonNullAssertion: check isDefined above
      const firstWords = result[0]!.filter(t => !t.isDelimiter);
      expect(firstWords.every(w => w.match)).toBe(true);

      // Second verse: partial match
      expect(result[1]).toBeDefined();
      if (!result[1]) throw new Error('result[1] is undefined');
      const secondWords = result[1].filter(t => !t.isDelimiter);
      expect(secondWords.length).toBeGreaterThanOrEqual(1);
      expect(secondWords[0]?.match).toBe(true); // 'Second'
      if (secondWords.length > 1) {
        expect(secondWords[1]?.match).toBe(false); // 'verse'
      }

      // Third verse: no match
      expect(result[2]).toBeDefined();
      // biome-ignore lint/style/noNonNullAssertion: check isDefined above
      const thirdWords = result[2]!.filter(t => !t.isDelimiter);
      expect(thirdWords.every(w => !w.match)).toBe(true);
      expect(thirdWords.every(w => !w.userAttempted)).toBe(true);
    });

    it('should handle psalms 16:', () => {
      const verses = [
        "To man belong the plans of the heart, but from the LORD comes the reply of the tongue.",
        "All a man's ways seem innocent to him, but motives are weighed by the LORD.",
        "Commit to the LORD whatever you do, and your plans will succeed.",
        "The LORD works out everything for his own ends- even the wicked for a day of disaster.",
        "The LORD detests all the proud of heart. Be sure of this: They will not go unpunished.",
        "Through love and faithfulness sin is atoned for; through the fear of the LORD a man avoids evil.",
        "When a man's ways are pleasing to the LORD, he makes even his enemies live at peace with him.",
        "Better a little with righteousness than much gain with injustice.",
        "In his heart a man plans his course, but the LORD determines his steps."
      ];
      const result = tokeniseVerses(verses, '');

      expect(result[0]?.[0]?.text).toEqual('To');
      expect(result[1]?.[0]?.text).toEqual('All');
      expect(result[2]?.[0]?.text).toEqual('Commit');
      expect(result[3]?.[0]?.text).toEqual('The');
      expect(result[4]?.[0]?.text).toEqual('The');
      expect(result[5]?.[0]?.text).toEqual('Through');
      expect(result[6]?.[0]?.text).toEqual('When');
      expect(result[7]?.[0]?.text).toEqual('Better');
    })
  });
}); 
