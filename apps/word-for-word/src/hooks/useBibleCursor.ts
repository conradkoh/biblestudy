import {
  BibleCursor,
  BOOK_COUNT,
  bookIds,
  cursorToIdxCursor,
  mapBookIdsToChapterCounts,
} from "@/src/utils/bible-data-utils";
import { mod } from "@/src/utils/math";
import { useState } from "react";

export function useBibleCursorHandler(onCursorChange?: (delta: Partial<BibleCursor>) => void) {
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
      updateCursor({
        bookId: bookIds[newBookIdx]!,
        chapter: 1,
      });
      return;
    }
    const delta = { chapter: cursor.chapter + 1 };
    updateCursor(delta);
  }

  function goPrev() {
    const idxCursor = cursorToIdxCursor(cursor);

    if (cursor.chapter === 1) {
      const newBookIdx = mod(idxCursor.bookIdx - 1, BOOK_COUNT);
      const newBookdId = bookIds[newBookIdx]!
      const nextChapterIdx = mapBookIdsToChapterCounts[newBookdId] - 1;
      const nextChapter = nextChapterIdx + 1;
      setCursor({
        ...cursor,
        bookId: bookIds[newBookIdx]!,
        chapter: nextChapter,
      });
      return;
    }
    const delta = { chapter: cursor.chapter - 1 };
    updateCursor(delta);
  }

  function updateCursor(delta: Partial<BibleCursor>) {
    const updatedCursor = { ...cursor, ...delta };
    setCursor(updatedCursor);
    onCursorChange?.(delta);
  }
}

export type BibleCursorHandler = ReturnType<typeof useBibleCursorHandler>;
