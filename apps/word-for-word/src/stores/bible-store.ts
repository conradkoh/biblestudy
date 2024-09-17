import { create } from "zustand";
import kjv from "@/assets/bible-en/kjv.json";
import interlinear from "@/assets/interlinear/interlinear.json";
import greekLexicon from "@/assets/lexicon/greek.json";
import hebrewLexicon from "@/assets/lexicon/hebrew.json";

type BibleCursorStore = {
  bookIdx: number;
  chapterIdx: number;
  setBookIdx: (bookIdx: number) => void;
  setChapterIdx: (chapterIdx: number) => void;
  translation: GetBibleTranslation["books"];
  getCurrentChapterFormatted: () => { text: string; name: string }[];
  interlinear: InterlinearBible["books"];
  currentInterlinearVerseIdx: number | null;
  getCurrentInterlinearVerseName: () => string;
  setInterlinearVerseNumber: (verseNum: number | null) => void;
  getCurrentInterlinearForVerse: () => InterlinearVerse | null;
  lookupStrongsNumber: (strongsNumber: string) => LexiconWord | undefined;
};

export const useBibleCursor = create<BibleCursorStore>((set, get) => ({
  bookIdx: 0,
  chapterIdx: 0,
  setBookIdx: (bookIdx: number) => set({ bookIdx }),
  setChapterIdx: (chapterIdx: number) => set({ chapterIdx }),
  translation: (kjv as GetBibleTranslation).books,
  interlinear: (interlinear as InterlinearBible).books,
  /**
   * Returns an array of verses
   */
  getCurrentChapterFormatted: () => {
    const { bookIdx, chapterIdx } = get();
    const book = get().translation[bookIdx];
    const chapter = book.chapters[chapterIdx];
    return chapter.verses;
  },
  currentInterlinearVerseIdx: 0,
  getCurrentInterlinearVerseName() {
    const { bookIdx, chapterIdx, interlinear, currentInterlinearVerseIdx } =
      get();
    if (currentInterlinearVerseIdx === null) return null;
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
}));

export interface GetBibleTranslation {
  translation: string;
  abbreviation: string;
  description: string;
  lang: string;
  language: string;
  direction: string;
  encoding: string;
  books: Book[];
}

export interface Book {
  nr: number;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  chapter: number;
  name: string;
  verses: Verse[];
}

export interface Verse {
  chapter: number;
  verse: number;
  name: string;
  text: string;
}

export type InterlinearBible = {
  books: {
    bookIdx: number;
    name: string;
    slug: string;
    chapters: {
      chapter: number;
      verses: {
        chapter: number;
        verse: number;
        contents: {
          i: number; // index for ordering
          text: string;
          originalWord: string;
          strongsNumber: string;
        }[];
      }[];
    }[];
  }[];
};

export type InterlinearVerse =
  InterlinearBible["books"][number]["chapters"][number]["verses"][number];

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

const mapBookSlugToName: Record<string, string> = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
  joshua: "Joshua",
  judges: "Judges",
  ruth: "Ruth",
  i_samuel: "I Samuel",
  ii_samuel: "II Samuel",
  i_kings: "I Kings",
  ii_kings: "II Kings",
  i_chronicles: "I Chronicles",
  ii_chronicles: "II Chronicles",
  ezra: "Ezra",
  nehemiah: "Nehemiah",
  esther: "Esther",
  job: "Job",
  psalms: "Psalms",
  proverbs: "Proverbs",
  ecclesiastes: "Ecclesiastes",
  song_of_solomon: "Song Of Solomon",
  isaiah: "Isaiah",
  jeremiah: "Jeremiah",
  lamentations: "Lamentations",
  ezekiel: "Ezekiel",
  daniel: "Daniel",
  hosea: "Hosea",
  joel: "Joel",
  amos: "Amos",
  obadiah: "Obadiah",
  jonah: "Jonah",
  micah: "Micah",
  nahum: "Nahum",
  habakkuk: "Habakkuk",
  zephaniah: "Zephaniah",
  haggai: "Haggai",
  zechariah: "Zechariah",
  malachi: "Malachi",
  matthew: "Matthew",
  mark: "Mark",
  luke: "Luke",
  john: "John",
  acts: "Acts",
  romans: "Romans",
  i_corinthians: "I Corinthians",
  ii_corinthians: "II Corinthians",
  galatians: "Galatians",
  ephesians: "Ephesians",
  philippians: "Philippians",
  colossians: "Colossians",
  i_thessalonians: "I Thessalonians",
  ii_thessalonians: "II Thessalonians",
  i_timothy: "I Timothy",
  ii_timothy: "II Timothy",
  titus: "Titus",
  philemon: "Philemon",
  hebrews: "Hebrews",
  james: "James",
  i_peter: "I Peter",
  ii_peter: "II Peter",
  i_john: "I John",
  ii_john: "II John",
  iii_john: "III John",
  jude: "Jude",
  revelation: "Revelation",
};
