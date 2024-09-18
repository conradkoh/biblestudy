export const mapBookSlugToName: Record<string, string> = {
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

export const bookSlugs = Object.keys(mapBookSlugToName);
export const bookNames = Object.values(mapBookSlugToName);
export const BOOK_COUNT = bookSlugs.length;

/**
 * song(s) of songs => song of solomon
 * II John => 2 John
 */
export function bookNameToSlug(bookName: string) {
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
  normalizedBookName = normalizedBookName.replace(/i(?=\s[a-z]+)/g, "1");
  normalizedBookName = normalizedBookName.replace(/ii(?=\s[a-z]+)/g, "2");
  normalizedBookName = normalizedBookName.replace(/iii(?=\s[a-z]+)/g, "3");

  normalizedBookName = normalizedBookName.replaceAll(/\s+/g, "_");

  return normalizedBookName;
}
