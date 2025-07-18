import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { action, query } from './_generated/server';
import { v } from 'convex/values';
import { z } from 'zod';
import { BookId, isValidBookId, isValidChapter, isValidVerse, mapBookIdsToName } from '../../../common/utils/bible-data-utils';

// AI search response schema
const aiSearchResponseSchema = z.object({
  results: z.array(z.object({
    bookId: z.string(),
    chapter: z.number(),
    verse: z.number(),
    relevance: z.number().min(0).max(1),
    extraContext: z.string().optional(),
  }))
});

export const performAISearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, limit = 10 } = args;

    if (!query.trim()) {
      return [];
    }

    // Create the AI prompt with clear JSON structure
    const systemPrompt = `You are a Bible search assistant. Your task is to find relevant Bible verses based on user queries.

IMPORTANT RULES:
1. Only include results that are very relevant to the query.
2. Sort the results by relevance
3. Provide extra context in the extraContext field
   - Please only do so when the information is insightful, and when you are extremely confident the information is truthful, accurate, not controversal in any way,
   and more a matter of fact than it is a matter of opinion.
   - You may only include interpretations when they are widely accepted and not controversial.
   - If it does not satisfy the above, do not include extra context.
4. Use one of the available book IDs: ${Object.keys(mapBookIdsToName).join(', ')}
5. Chapter and verse numbers should be 1-indexed
6. Maximum ${limit} results`;

    const { object: aiResponse } = await generateObject({
      model: google('gemini-2.5-flash-lite-preview-06-17'),
      prompt: query,
      system: systemPrompt,
      schema: aiSearchResponseSchema,
    });

    // Validate and filter results
    const validResults = aiResponse.results.filter(result => {
      if (!isValidBookId(result.bookId)) return false;
      if (!isValidChapter(result.bookId, result.chapter)) return false;
      if (!isValidVerse(result.bookId, result.chapter, result.verse)) return false;
      return true;
    });

    return validResults.slice(0, limit);
  },
});

