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

declare const bible: GetBibleTranslation;
export default bible;
