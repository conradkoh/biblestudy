import kjv from "@/assets/bible-en/kjv.json";
import niv from "@/assets/bible-en/niv.json";
import { create } from "zustand";

export const versions = { niv, kjv };
export type BibleVersionId = keyof typeof versions;

import { GetBibleTranslation } from "@/assets/bible-en/kjv.json";
import interlinear, {
  InterlinearVerse,
} from "@/assets/interlinear/interlinear.json";
import greekLexicon from "@/assets/lexicon/greek.json";
import hebrewLexicon from "@/assets/lexicon/hebrew.json";
import strongs from "@/src/libraries/strongs";
import {
  BibleCursor,
  BookId,
  bookIds,
  mapBookIdsToName,
} from "@/src/utils/bible-data-utils";

export type BibleStore = {
  getTranslation: (versionId: BibleVersionId) => GetBibleTranslation;
  getChapterFormatted: (
    chapter: Pick<BibleCursor, "bookId" | "chapter" | "version">
  ) => GetBibleTranslation["books"][number]["chapters"][number]["verses"];
  getBook: (
    bookId: BookId,
    version: BibleVersionId
  ) => GetBibleTranslation["books"][number] | undefined;
  getInterlinearVerseName: (cursor: BibleCursor) => string;
  getInterlinearVerse: (cursor: BibleCursor) => InterlinearVerse | null;
  lookupStrongsNumber: (strongsNumber: string) => LexiconWord | undefined;
  findVersesByStrongsNumber: (
    strongsNumber: string,
    currentChapter: number,
    currentVerse: number
  ) => Array<{
    bookId: BookId;
    chapter: number;
    verse: number;
    contents: InterlinearVerse["contents"];
  }>;
};

export const useBibleStore = create<BibleStore>((set, get) => ({
  currentVersionId: "niv",
  bookIdx: 0,
  chapterIdx: 0,
  getTranslation: (versionId) => versions[versionId],
  /**
   * Returns an array of verses
   */
  getChapterFormatted: (
    cursor: Pick<BibleCursor, "bookId" | "chapter" | "version">
  ) => {
    const { bookId, chapter, version } = cursor;
    const chapterIdx = chapter - 1;
    const bookIdx = bookIds.indexOf(bookId);
    return get().getTranslation(version).books[bookIdx].chapters[chapterIdx]
      .verses;
  },
  getBook: (bookId: BookId, version: BibleVersionId) => {
    const bookIdx = bookIds.indexOf(bookId);
    if (bookIdx === -1) return;
    const book = get().getTranslation(version).books[bookIdx];
    return book;
  },
  getInterlinearVerseName(cursor: BibleCursor) {
    const bookName = mapBookIdsToName[cursor.bookId];
    return `${bookName} ${cursor.chapter}:${cursor.verse}`;
  },
  getInterlinearVerse: (cursor) => {
    const { bookId, chapter, verse } = cursor;
    if (typeof verse !== "number")
      throw new Error("verse not specified for interlinear verse");
    const bookIdx = bookIds.indexOf(bookId);
    const chapterIdx = chapter - 1;
    const verseIdx = verse - 1;
    return interlinear.books[bookIdx].chapters[chapterIdx].verses[verseIdx];
  },
  lookupStrongsNumber: (strongsNumber: string) => {
    const lexicon = strongsNumber[0] === "h" ? hebrewLexicon : greekLexicon;
    const lexiconReference = lexicon.find((w) => w.strongs === strongsNumber);
    const strongsDefinition = strongs[strongsNumber.toUpperCase()];
    if (!lexiconReference) return undefined;
    return {
      ...lexiconReference,
      originalWord: strongsDefinition?.lemma,
      transliteration: strongsDefinition?.translit ?? strongsDefinition.xlit,
      pronounciation: strongsDefinition.pron,
    };
  },
  findVersesByStrongsNumber: (
    strongsNumber: string,
    currentChapter: number,
    currentVerse: number
  ) => {
    const results: ReturnType<BibleStore["findVersesByStrongsNumber"]> = [];

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
                )
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
