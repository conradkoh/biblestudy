import { create } from "zustand";
import kjv from "@/assets/bible-en/kjv.json";
import interlinear, {
  InterlinearBible,
  InterlinearVerse,
} from "@/assets/interlinear/interlinear.json";
import greekLexicon from "@/assets/lexicon/greek.json";
import hebrewLexicon from "@/assets/lexicon/hebrew.json";
import {
  BOOK_COUNT,
  bookSlugs,
  mapBookSlugToName,
} from "@/src/utils/bible-data-utils";
import { GetBibleTranslation } from "@/assets/bible-en/kjv.json";
import { CommonEvents } from "@/src/hooks/useEvents";
import { mod } from "@/src/utils/math";

type BibleCursorStore = {
  bookIdx: number;
  chapterIdx: number;
  setBookIdx: (bookIdx: number) => void;
  setBookSlug: (bookSlug: string) => void;
  setChapterIdx: (chapterIdx: number) => void;
  translation: GetBibleTranslation["books"];
  getCurrentChapterFormatted: () => { text: string; name: string }[];
  interlinear: InterlinearBible["books"];
  currentInterlinearVerseIdx: number | null;
  getCurrentBookName: () => string;
  getBook: (slug: string) => GetBibleTranslation["books"][number] | undefined;
  getCurrentInterlinearVerseName: () => string;
  setInterlinearVerseNumber: (verseNum: number | null) => void;
  getCurrentInterlinearForVerse: () => InterlinearVerse | null;
  lookupStrongsNumber: (strongsNumber: string) => LexiconWord | undefined;
  goNext: () => void;
  goPrev: () => void;
};

export const useBibleCursor = create<BibleCursorStore>((set, get) => ({
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
  translation: kjv.books,
  interlinear: interlinear.books,
  /**
   * Returns an array of verses
   */
  getCurrentChapterFormatted: () => {
    const { bookIdx, chapterIdx } = get();
    const book = get().translation[bookIdx];
    const chapter = book.chapters[chapterIdx];
    return chapter.verses;
  },
  getBook: (slug: string) => {
    const bookIdx = bookSlugs.indexOf(slug);
    if (bookIdx === -1) return;
    const book = get().translation[bookIdx];
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
    set({ currentInterlinearVerseIdx: verseNum });
  },
  getCurrentInterlinearForVerse: () => {
    const { bookIdx, chapterIdx, interlinear, currentInterlinearVerseIdx } =
      get();
    if (!currentInterlinearVerseIdx) return null;

    return interlinear[bookIdx].chapters[chapterIdx].verses[
      currentInterlinearVerseIdx - 1
    ];
  },
  lookupStrongsNumber: (strongsNumber: string) => {
    const lexicon = strongsNumber[0] === "h" ? hebrewLexicon : greekLexicon;
    return lexicon.find((w) => w.strongs === strongsNumber);
  },
  goNext: () => {
    const { bookIdx, chapterIdx, translation, setBookIdx, setChapterIdx } =
      get();
    const nextChapterIdx = chapterIdx + 1;
    if (nextChapterIdx >= translation[bookIdx].chapters.length) {
      setBookIdx(bookIdx + 1);
      setChapterIdx(0);
      return;
    }
    set({ chapterIdx: nextChapterIdx });
  },
  goPrev: () => {
    const { bookIdx, chapterIdx, setBookIdx, setChapterIdx, translation } =
      get();
    if (chapterIdx === 0) {
      const newBookIdx = mod(bookIdx - 1, BOOK_COUNT);
      setBookIdx(newBookIdx);
      setChapterIdx(translation[newBookIdx].chapters.length - 1);
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
};
