import { zodToConvex } from '@/utils/convex';
import { z } from 'zod';
//========================================
// Types
//========================================
export type BibleChapter = z.infer<typeof bibleChapterZodSchema>;

// zod
const bibleChapterZodSchema = z.object({
  version: z.string(),
  bookIdx: z.number(),
  bookName: z.string(),
  chapter: z.number(),
  verses: z.array(
    z.object({
      verse: z.number(),
      text: z.string(),
    }),
  ),
});

// convex
export const bibleChaptersConvexSchema = zodToConvex(bibleChapterZodSchema);
