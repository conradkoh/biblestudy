export const mapBookIdsToName = {
  genesis: "Genesis",
  exodus: "Exodus",
  leviticus: "Leviticus",
  numbers: "Numbers",
  deuteronomy: "Deuteronomy",
  joshua: "Joshua",
  judges: "Judges",
  ruth: "Ruth",
  i_samuel: "1 Samuel",
  ii_samuel: "2 Samuel",
  i_kings: "1 Kings",
  ii_kings: "2 Kings",
  i_chronicles: "1 Chronicles",
  ii_chronicles: "2 Chronicles",
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
  i_corinthians: "1 Corinthians",
  ii_corinthians: "2 Corinthians",
  galatians: "Galatians",
  ephesians: "Ephesians",
  philippians: "Philippians",
  colossians: "Colossians",
  i_thessalonians: "1 Thessalonians",
  ii_thessalonians: "2 Thessalonians",
  i_timothy: "1 Timothy",
  ii_timothy: "2 Timothy",
  titus: "Titus",
  philemon: "Philemon",
  hebrews: "Hebrews",
  james: "James",
  i_peter: "1 Peter",
  ii_peter: "2 Peter",
  i_john: "1 John",
  ii_john: "2 John",
  iii_john: "3 John",
  jude: "Jude",
  revelation: "Revelation",
};

export type BookId = keyof typeof mapBookIdsToName;
export const mapBookIdsToChapterCounts: Record<BookId, number> = {
  genesis: 50,
  exodus: 40,
  leviticus: 27,
  numbers: 36,
  deuteronomy: 34,
  joshua: 24,
  judges: 21,
  ruth: 4,
  i_samuel: 31,
  ii_samuel: 24,
  i_kings: 22,
  ii_kings: 25,
  i_chronicles: 29,
  ii_chronicles: 36,
  ezra: 10,
  nehemiah: 13,
  esther: 10,
  job: 42,
  psalms: 150,
  proverbs: 31,
  ecclesiastes: 12,
  song_of_solomon: 8,
  isaiah: 66,
  jeremiah: 52,
  lamentations: 5,
  ezekiel: 48,
  daniel: 12,
  hosea: 14,
  joel: 3,
  amos: 9,
  obadiah: 1,
  jonah: 4,
  micah: 7,
  nahum: 3,
  habakkuk: 3,
  zephaniah: 3,
  haggai: 2,
  zechariah: 14,
  malachi: 4,
  matthew: 28,
  mark: 16,
  luke: 24,
  john: 21,
  acts: 28,
  romans: 16,
  i_corinthians: 16,
  ii_corinthians: 13,
  galatians: 6,
  ephesians: 6,
  philippians: 4,
  colossians: 4,
  i_thessalonians: 5,
  ii_thessalonians: 3,
  i_timothy: 6,
  ii_timothy: 4,
  titus: 3,
  philemon: 1,
  hebrews: 13,
  james: 5,
  i_peter: 5,
  ii_peter: 3,
  i_john: 5,
  ii_john: 1,
  iii_john: 1,
  jude: 1,
  revelation: 22,
};
export const bookIds = Object.keys(mapBookIdsToName) as BookId[];
export const bookNames = Object.values(mapBookIdsToName);
export const BOOK_COUNT = bookIds.length;

export function isBookId(bookId: string): bookId is BookId {
  return bookId.includes(bookId);
}

/**
 * song(s) of songs => song_of_solomon
 * 2 John => ii_John
 */
export function bookIdFromName(bookName: string): BookId | null {
  let normalizedBookName = bookName.toLowerCase();
  normalizedBookName = normalizedBookName.replace(/\s+/g, " ");
  normalizedBookName = normalizedBookName.trim();

  // Handle song(s) of songs and song(s) of solomon => song of solomon
  normalizedBookName = normalizedBookName.replace(
    /song\(s\)\sof\s/g,
    "song of "
  );
  normalizedBookName = normalizedBookName.replace(/of\ssongs/g, "of solomon");

  // Handle ii vs 1/2/3
  normalizedBookName = normalizedBookName.replace(/1(?=\s[a-z]+)/g, "i");
  normalizedBookName = normalizedBookName.replace(/2(?=\s[a-z]+)/g, "ii");
  normalizedBookName = normalizedBookName.replace(/3(?=\s[a-z]+)/g, "iii");

  normalizedBookName = normalizedBookName.replaceAll(/\s+/g, "_");

  if (!isBookId(normalizedBookName)) {
    console.error(`Invalid book name found: ${bookName}`);
    return null;
  }

  return normalizedBookName;
}

export function cursorToIdxCursor(cursor: BibleCursor): BibleIdxCursor {
  return {
    version: cursor.version,
    bookId: cursor.bookId,
    bookIdx: bookIds.indexOf(cursor.bookId),
    chapterIdx: cursor.chapter - 1,
    verseIdx:
      typeof cursor.verse === "number" ? cursor.verse - 1 : cursor.verse,
  };
}

export type BibleCursor = {
  version: "niv" | "kjv";
  bookId: BookId;
  chapter: number; // non-zero indexing
  verse?: number; // non-zero indexing
};

export type BibleIdxCursor = {
  version: "niv" | "kjv";
  bookId: BookId;
  bookIdx: number;
  chapterIdx: number; // zero based indexing
  verseIdx?: number; // zero based indexing
};
