import { z } from 'zod';

//========================================
// Verse
//========================================
export type Verse = z.infer<typeof verseSchema>;

// zod
export const verseSchema = z.object({
  verse: z.string(),
  text: z.string(),
});

//========================================
// Chapter
//========================================
export type Chapter = z.infer<typeof chapterSchema>;

// zod
export const chapterSchema = z.object({
  chapter: z.string(),
  verses: z.array(verseSchema),
});

//========================================
// Book
//========================================

export type Book = z.infer<typeof bookSchema>;

// zod
export const bookSchema = z.object({
  book: z.string(),
  chapters: z.array(chapterSchema),
});
