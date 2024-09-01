import { zodToConvex } from '@/utils/convex';
import { z } from 'zod';
//========================================
// Types
//========================================
export type BibleVerse = z.infer<typeof bibleVerseZodSchema>;

// zod
const bibleVerseZodSchema = z.object({
  version: z.string(),
  bookIdx: z.number(),
  bookName: z.string(),
  chapter: z.number(),
  verse: z.number(),
  text: z.string(),
});

// convex
export const bibleVerseConvexSchema = zodToConvex(bibleVerseZodSchema);
