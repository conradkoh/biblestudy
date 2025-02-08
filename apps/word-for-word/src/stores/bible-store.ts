import { create } from "zustand";
import niv from "@/assets/bible-en/niv.json";
import kjv from "@/assets/bible-en/kjv.json";

const versions = { niv, kjv };

import interlinear, {
  InterlinearBible,
  InterlinearVerse,
} from "@/assets/interlinear/interlinear.json";
import greekLexicon from "@/assets/lexicon/greek.json";
import hebrewLexicon from "@/assets/lexicon/hebrew.json";
import strongs from "@/src/libraries/strongs";
import {
  BOOK_COUNT,
  bookSlugs,
  mapBookSlugToName,
} from "@/src/utils/bible-data-utils";
import { GetBibleTranslation } from "@/assets/bible-en/kjv.json";
import { CommonEvents } from "@/src/hooks/useEvents";
import { mod } from "@/src/utils/math";

type BibleCursorStore = {
  currentVersion: keyof typeof versions;
  bookIdx: number;
  chapterIdx: number;
  setBookIdx: (bookIdx: number) => void;
  setBookSlug: (bookSlug: string) => void;
  setChapterIdx: (chapterIdx: number) => void;
  setCurrentVersion: (version: keyof typeof versions) => void;
  getTranslation: () => GetBibleTranslation;
  getCurrentChapterFormatted: () => { text: string; name: string }[];
  interlinear: InterlinearBible["books"];
  currentInterlinearVerseIdx: number | null;
  getCurrentBookName: () => string;
  getBook: (slug: string) => GetBibleTranslation["books"][number] | undefined;
  getCurrentInterlinearVerseName: () => string;
  setInterlinearVerseNumber: (verseNum: number | null) => void;
  getCurrentInterlinearForVerse: () => InterlinearVerse | null;
  lookupStrongsNumber: (strongsNumber: string) => LexiconWord | undefined;
  findVersesByStrongsNumber: (
    strongsNumber: string,
    currentChapter: number,
    currentVerse: number
  ) => Array<{
    bookSlug: string;
    chapter: number;
    verse: number;
    contents: InterlinearVerse["contents"];
  }>;
  goNext: () => void;
  goPrev: () => void;
};

export const useBibleCursor = create<BibleCursorStore>((set, get) => ({
  currentVersion: "niv",
  bookIdx: 0,
  chapterIdx: 0,
  setBookIdx: (bookIdx: number) => {
    const newBookIdx = mod(bookIdx, BOOK_COUNT);
    set({ bookIdx: newBookIdx });
  },
  setBookSlug: (bookSlug: string) => {
    const bookIdx = bookSlugs.indexOf(bookSlug);
    if (bookIdx === -1) {
      console.warn("Invalid slug:", bookSlug);
      return;
    }
    set({ bookIdx });
  },
  setChapterIdx: (chapterIdx: number) => {
    set({ chapterIdx });
    CommonEvents.emit("ON_CHAPTER_CHANGE");
  },
  setCurrentVersion: (version: keyof typeof versions) => {
    set({ currentVersion: version });
  },
  getTranslation: () => versions[get().currentVersion],
  interlinear: interlinear.books,
  /**
   * Returns an array of verses
   */
  getCurrentChapterFormatted: () => {
    const { bookIdx, chapterIdx } = get();
    const book = get().getTranslation().books[bookIdx];
    const chapter = book.chapters[chapterIdx];
    return chapter.verses;
  },
  getBook: (slug: string) => {
    const bookIdx = bookSlugs.indexOf(slug);
    if (bookIdx === -1) return;
    const book = get().getTranslation().books[bookIdx];
    return book;
  },
  getCurrentBookName() {
    const { bookIdx, interlinear } = get();
    return mapBookSlugToName[interlinear[bookIdx].slug] ?? "";
  },
  currentInterlinearVerseIdx: 0,
  getCurrentInterlinearVerseName() {
    const { bookIdx, chapterIdx, interlinear, currentInterlinearVerseIdx } =
      get();
    if (currentInterlinearVerseIdx === null) return "";
    const bookName = mapBookSlugToName[interlinear[bookIdx].slug];
    return `${bookName} ${chapterIdx + 1}:${currentInterlinearVerseIdx + 1}`;
  },
  setInterlinearVerseNumber: (verseNum) => {
    set({ currentInterlinearVerseIdx: verseNum && verseNum - 1 });
  },
  getCurrentInterlinearForVerse: () => {
    const { bookIdx, chapterIdx, interlinear, currentInterlinearVerseIdx } =
      get();
    if (typeof currentInterlinearVerseIdx !== "number") return null;

    return interlinear[bookIdx].chapters[chapterIdx].verses[
      currentInterlinearVerseIdx
    ];
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
    const { interlinear } = get();
    const results: Array<{
      bookSlug: string;
      chapter: number;
      verse: number;
      contents: InterlinearVerse["contents"];
    }> = [];

    // Search through all books, chapters, and verses
    for (const book of interlinear) {
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
              bookSlug: book.slug,
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
  goNext: () => {
    const { bookIdx, chapterIdx, getTranslation, setBookIdx, setChapterIdx } =
      get();
    const nextChapterIdx = chapterIdx + 1;
    if (nextChapterIdx >= getTranslation().books[bookIdx].chapters.length) {
      setBookIdx(bookIdx + 1);
      setChapterIdx(0);
      return;
    }
    set({ chapterIdx: nextChapterIdx });
  },
  goPrev: () => {
    const { bookIdx, chapterIdx, setBookIdx, setChapterIdx, getTranslation } =
      get();
    if (chapterIdx === 0) {
      const newBookIdx = mod(bookIdx - 1, BOOK_COUNT);
      setBookIdx(newBookIdx);
      setChapterIdx(getTranslation().books[newBookIdx].chapters.length - 1);
      return;
    }
    set({ chapterIdx: chapterIdx - 1 });
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
