import { create } from "zustand";

export type BibleVersionId = "niv" | "kjv";

import strongs from "@/src/libraries/strongs";
import {
  type BibleCursor,
  type BibleCursorRangeEnd,
  type BookId,
  bookIds
} from "@common/utils/bible-data-utils";

import type { GetBibleTranslation } from "@/assets/bible-en/kjv.json";

import type {
  InterlinearBible,
  InterlinearVerse,
} from "@/assets/interlinear/interlinear.json";
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system';


export type BibleStore = {
  versions: Partial<Record<BibleVersionId, GetBibleTranslation>>;
  interlinear: InterlinearBible | null;
  lexicon: {
    greek: LexiconWord[];
    hebrew: LexiconWord[];
  }
  load: () => Promise<void>;
  getTranslation: (versionId: BibleVersionId) => GetBibleTranslation;
  getChapterFormatted: (
    chapter: Pick<BibleCursor, "bookId" | "chapter" | "version">,
  ) => GetBibleTranslation["books"][number]["chapters"][number]["verses"];
  getVersesText: (
    cursor: Required<BibleCursor>,
    endCursor?: BibleCursorRangeEnd,
  ) => string;
  getVersesInRange: (
    start: Required<BibleCursor>,
    end?: BibleCursorRangeEnd,
  ) => GetBibleTranslation["books"][number]["chapters"][number]["verses"];
  getBook: (
    bookId: BookId,
    version: BibleVersionId,
  ) => GetBibleTranslation["books"][number] | undefined;
  getInterlinearVerse: (cursor: BibleCursor) => InterlinearVerse | null;
  lookupStrongsNumber: (strongsNumber: string) => LexiconWord | undefined;
  findVersesByStrongsNumber: (
    strongsNumber: string,
    currentChapter: number,
    currentVerse: number,
  ) => LexiconVerseReference[];
};

export type LexiconVerseReference = {
  bookId: BookId;
  chapter: number;
  verse: number;
  contents: InterlinearVerse["contents"];
}

// Helper function to convert numbers to superscript Unicode characters
export const toSuperscript = (num: number): string => {
  const superscriptMap: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹'
  };

  return num.toString().split('').map(digit => superscriptMap[digit] || digit).join('');
};

export const useBibleStore = create<BibleStore>((set, get) => ({
  currentVersionId: "niv",
  bookIdx: 0,
  chapterIdx: 0,
  versions: {},
  interlinear: null,
  lexicon: {
    greek: [],
    hebrew: [],
  },
  load: async () => {
    const nivAsset = Asset.loadAsync(require('@/assets/bible-en/niv.jsonc')); // Adjust path as needed
    const kjvAsset = Asset.loadAsync(require('@/assets/bible-en/kjv.jsonc')); // Adjust path as needed
    const interlinearAsset = Asset.loadAsync(require('@/assets/interlinear/interlinear.jsonc')); // Adjust path as needed
    const hebrewLexiconAsset = Asset.loadAsync(require('@/assets/lexicon/hebrew.jsonc'));
    const greekLexiconAsset = Asset.loadAsync(require('@/assets/lexicon/greek.jsonc'));

    const [niv, kjv, interlinear, hebrewLexicon, greekLexicon] = await Promise.all((await Promise.all([nivAsset, kjvAsset, interlinearAsset, hebrewLexiconAsset, greekLexiconAsset])).map(async ([asset]) => {
      if (!asset) throw new Error("Asset not found");
      if (!asset.localUri) throw new Error("Asset not found");
      await asset.downloadAsync(); // Ensure the asset is available
      const jsonString = await FileSystem.readAsStringAsync(asset.localUri);
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    }));

    set({
      interlinear,
      lexicon: {
        hebrew: hebrewLexicon,
        greek: greekLexicon,
      },
      versions: {
        niv,
        kjv,
      }
    })

    console.log('Bible loaded')
  },
  getTranslation: (versionId) => {
    const translation = get().versions[versionId];
    if (!translation) throw new Error(`Translation ${versionId} not loaded`);
    return translation;
  },
  /**
   * Returns an array of verses
   */
  getChapterFormatted: (
    cursor: Pick<BibleCursor, "bookId" | "chapter" | "version">,
  ) => {
    const { bookId, chapter, version } = cursor;
    const chapterIdx = chapter - 1;
    const bookIdx = bookIds.indexOf(bookId);
    const verses =
      get().getTranslation(version).books[bookIdx]?.chapters[chapterIdx]
        ?.verses;
    if (!verses) throw new Error(`Chapter ${chapter} not found in ${bookId}`);
    return verses;
  },
  getVersesText: (
    cursor: Required<BibleCursor>,
    endCursor?: BibleCursorRangeEnd,
  ) => {
    const verses = get().getVersesInRange(cursor, endCursor);
    return endCursor
      ? verses.map((v) => toSuperscript(v.verse) + v.text).join("")
      : verses[0]?.text ?? "";
  },
  getBook: (bookId: BookId, version: BibleVersionId) => {
    const bookIdx = bookIds.indexOf(bookId);
    if (bookIdx === -1) return;
    const book = get().getTranslation(version).books[bookIdx];
    return book;
  },
  getInterlinearVerse: (cursor) => {
    const interlinear = get().interlinear;
    if (!interlinear) throw new Error("Interlinear not loaded");
    const { bookId, chapter, verse } = cursor;
    if (typeof verse !== "number")
      throw new Error("verse not specified for interlinear verse");
    const bookIdx = bookIds.indexOf(bookId);
    const chapterIdx = chapter - 1;
    const verseIdx = verse - 1;
    const verseData =
      interlinear.books[bookIdx]?.chapters[chapterIdx]?.verses[verseIdx];
    if (!verseData)
      throw new Error(
        `Verse ${verse} not found in chapter ${chapter} of book ${bookId}`,
      );
    return verseData;
  },
  lookupStrongsNumber: (strongsNumber: string) => {
    const { hebrew: hebrewLexicon, greek: greekLexicon } = get().lexicon;
    const lexicon = strongsNumber[0] === "h" ? hebrewLexicon : greekLexicon;
    const lexiconReference = lexicon.find((w) => w.strongs === strongsNumber);
    const strongsDefinition = strongs[strongsNumber.toUpperCase()];
    if (!lexiconReference) return undefined;
    return {
      ...lexiconReference,
      originalWord: strongsDefinition?.lemma,
      transliteration: strongsDefinition?.translit ?? strongsDefinition?.xlit,
      pronounciation: strongsDefinition?.pron,
    };
  },
  findVersesByStrongsNumber: (
    strongsNumber: string,
    currentChapter: number,
    currentVerse: number,
  ) => {
    const results: ReturnType<BibleStore["findVersesByStrongsNumber"]> = [];
    const interlinear = get().interlinear;
    if (!interlinear) throw new Error("Interlinear not loaded");

    // Search through all books, chapters, and verses
    for (const book of interlinear.books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          // Check if this verse contains the Strong's number
          if (
            verse.contents.some(
              (content) =>
                content.strongsNumber === strongsNumber &&
                !(
                  verse.chapter === currentChapter &&
                  currentVerse === verse.verse
                ),
            )
          ) {
            results.push({
              bookId: book.bookId,
              chapter: verse.chapter,
              verse: verse.verse,
              contents: verse.contents,
            });
          }
        }
      }
    }

    return results;
  },
  getVersesInRange: (
    start: Required<BibleCursor>,
    end: BibleCursorRangeEnd = {
      bookId: start.bookId,
      chapter: start.chapter,
      verse: start.verse,
    },
  ) => {
    const verses: GetBibleTranslation["books"][number]["chapters"][number]["verses"] =
      [];

    if (!end.verse) {
      throw new Error("End verse is required for verse range");
    }

    // If same book and chapter
    if (start.bookId === end.bookId && start.chapter === end.chapter) {
      const chapter = get().getChapterFormatted(start);
      for (let i = start.verse - 1; i <= end.verse - 1; i++) {
        const verse = chapter[i];
        if (verse) verses.push(verse);
      }
      return verses;
    }

    // If different chapters in same book
    if (start.bookId === end.bookId) {
      // Add verses from start chapter
      const startChapter = get().getChapterFormatted(start);
      for (let i = start.verse - 1; i < startChapter.length; i++) {
        const verse = startChapter[i];
        if (verse) verses.push(verse);
      }

      // Add verses from chapters in between
      for (let chapter = start.chapter; chapter < end.chapter; chapter++) {
        const chapterVerses = get().getChapterFormatted({
          ...start,
          chapter,
        });
        verses.push(...chapterVerses);
      }

      // Add verses from end chapter
      const endChapter = get().getChapterFormatted({
        ...start,
        chapter: end.chapter,
      });
      for (let i = 0; i <= end.verse - 1; i++) {
        const verse = endChapter[i];
        if (verse) verses.push(verse);
      }
      return verses;
    }

    // If different books
    // Add verses from start book
    const startBook = get().getBook(start.bookId, start.version);
    if (!startBook) throw new Error(`Book ${start.bookId} not found`);

    // Add verses from start chapter
    const startChapter = get().getChapterFormatted(start);
    for (let i = start.verse - 1; i < startChapter.length; i++) {
      const verse = startChapter[i];
      if (verse) verses.push(verse);
    }

    // Add verses from remaining chapters in start book
    for (
      let chapter = start.chapter;
      chapter < startBook.chapters.length;
      chapter++
    ) {
      const chapterVerses = get().getChapterFormatted({
        ...start,
        chapter,
      });
      verses.push(...chapterVerses);
    }

    // Add verses from books in between
    const startBookIdx = bookIds.indexOf(start.bookId);
    const endBookIdx = bookIds.indexOf(end.bookId);
    if (startBookIdx === -1 || endBookIdx === -1) {
      throw new Error(`Invalid book indices: ${startBookIdx}, ${endBookIdx}`);
    }

    for (let bookIdx = startBookIdx + 1; bookIdx < endBookIdx; bookIdx++) {
      const bookId = bookIds[bookIdx];
      if (!bookId) continue;

      const book = get().getBook(bookId, start.version);
      if (!book) throw new Error(`Book ${bookId} not found`);

      for (let chapter = 1; chapter <= book.chapters.length; chapter++) {
        const chapterVerses = get().getChapterFormatted({
          ...start,
          bookId,
          chapter,
        });
        verses.push(...chapterVerses);
      }
    }

    // Add verses from end book
    const endBook = get().getBook(end.bookId, start.version);
    if (!endBook) throw new Error(`Book ${end.bookId} not found`);

    // Add verses from chapters in end book up to end chapter
    for (let chapter = 1; chapter < end.chapter; chapter++) {
      const chapterVerses = get().getChapterFormatted({
        ...start,
        bookId: end.bookId,
        chapter,
      });
      verses.push(...chapterVerses);
    }

    // Add verses from end chapter
    const endChapter = get().getChapterFormatted({
      ...start,
      bookId: end.bookId,
      chapter: end.chapter,
    });
    for (let i = 0; i <= end.verse - 1; i++) {
      const verse = endChapter[i];
      if (verse) verses.push(verse);
    }

    return verses;
  },
}));

export type LexiconWord = {
  word: string; // en
  strongs: string;
  data: {
    comment?: string;
    see?: string[]; // related strongs references
    derive?: string; // where it was derived from
    def?: {
      // definitions
      short?: string;
      long?: (string | (string | string[])[])[];
    };
  };
  originalWord?: string; // original greek/hebrew
  transliteration?: string; // in english letters
  pronounciation?: string; // how to pronounce
};
