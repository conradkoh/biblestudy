export type InterlinearBible = {
  translation: string;
  abbreviation: string;
  language: string;
  direction: "LTR";
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

declare const bible: InterlinearBible;
export default bible;
