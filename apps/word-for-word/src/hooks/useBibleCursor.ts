import {
  BibleCursor,
  BOOK_COUNT,
  bookIds,
  cursorToIdxCursor,
  mapBookIdsToChapterCounts,
} from "@/src/utils/bible-data-utils";
import { mod } from "@/src/utils/math";
import { useState } from "react";

export function useBibleCursorHandler() {
  const [cursor, setCursor] = useState<BibleCursor>({
    version: "niv",
    bookId: "genesis",
    chapter: 1,
    verse: 1,
  });

  return {
    cursor,
    goNext,
    goPrev,
    setCursor,
    updateCursor,
  };

  function goNext() {
    const idxCursor = cursorToIdxCursor(cursor);
    const nextChapter = cursor.chapter + 1;
    if (nextChapter > mapBookIdsToChapterCounts[cursor.bookId]) {
      const newBookIdx = mod(idxCursor.bookIdx + 1, BOOK_COUNT);
      setCursor({
        ...cursor,
        bookId: bookIds[newBookIdx],
        chapter: 0,
      });
      return;
    }
    setCursor({ ...cursor, chapter: cursor.chapter + 1 });
  }

  function goPrev() {
    const idxCursor = cursorToIdxCursor(cursor);

    if (cursor.chapter === 1) {
      const newBookIdx = mod(idxCursor.bookIdx - 1, BOOK_COUNT);
      const nextChapterIdx = mapBookIdsToChapterCounts[cursor.bookId] - 1;
      const nextChapter = nextChapterIdx + 1;
      setCursor({
        ...cursor,
        bookId: bookIds[newBookIdx],
        chapter: nextChapter,
      });
      return;
    }
    setCursor({ ...cursor, chapter: cursor.chapter - 1 });
  }

  function updateCursor(delta: Partial<BibleCursor>) {
    setCursor({ ...cursor, ...delta });
  }
}

export type BibleCursorHandler = ReturnType<typeof useBibleCursorHandler>;
