import { useAppStateListener } from "@/src/hooks/useAppState";
import { api } from "@backend/convex/_generated/api";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppStateStatus, ScrollView } from "react-native";
import { useMutation } from "convex/react";
import { BookId } from "@common/utils/bible-data-utils";
import { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import debounce from "lodash-es/debounce";
import { convex } from "@/src/services/convex";
import { formatDate } from "date-fns";

const LOG_THRESHOLD_SECONDS = 3; // time in seconds it takes before a verse is considered read
export const sessionLogger = makeSessionLogger();


/**
 * Detects when the user is using the reading screen, and logs the session to the database.
 */
export function useSessionLogger() {
  const isScreenFocused = useRef(false);
  const isAppFocused = useRef(false);
  const lastLogTime = useRef<Date | null>(null);
  const sessionStartTime = useRef<Date | null>(null);
  const logSession = useMutation(api.sessionLogger.logSession);

  const onAppStateChange = useCallback((appState: AppStateStatus) => {
    isAppFocused.current = appState === "active";

    if (isAppFocused.current) {
      sessionLogger.startWatcher();
    } else {
      sessionLogger.flushNow();
      sessionLogger.stopWatcher();
    }
  }, []);

  useAppStateListener(onAppStateChange);

  const reset = useCallback(() => {
    sessionStartTime.current = null;
    sessionLogger.stopWatcher();
  }, []);

  useFocusEffect(() => {
    isScreenFocused.current = true;
    sessionLogger.startWatcher();

    return () => {
      isScreenFocused.current = false;
      reset();
    }
  });
}

// Session starts when focused, and ends when losing focus/leaving the app
// The first time a session is logged, it's duration is logged as 1 minute
// Every 3 minutes after that, we increase the duration of the session and update the backend


type SessionLoggerEntry = {
  bookId: BookId;
  chapter: number;
  verse: number;
}

type ConsolidatedEntry = {
  bookId: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
};

function consolidateEntries(entries: { bookId: string; chapter: number; verse: number }[]): ConsolidatedEntry[] {
  // First, sort entries by book, chapter, and verse
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.bookId !== b.bookId) return a.bookId.localeCompare(b.bookId);
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });

  const consolidated: ConsolidatedEntry[] = [];
  let currentChunk: ConsolidatedEntry | null = null;

  for (const entry of sortedEntries) {
    if (!currentChunk) {
      // Start a new chunk
      currentChunk = {
        bookId: entry.bookId,
        chapter: entry.chapter,
        startVerse: entry.verse,
        endVerse: entry.verse
      };
      continue;
    }

    // Check if this entry can be part of the current chunk
    if (
      entry.bookId === currentChunk.bookId &&
      entry.chapter === currentChunk.chapter &&
      entry.verse === currentChunk.endVerse + 1
    ) {
      // Extend the current chunk
      currentChunk.endVerse = entry.verse;
    } else {
      // Save the current chunk and start a new one
      consolidated.push(currentChunk);
      currentChunk = {
        bookId: entry.bookId,
        chapter: entry.chapter,
        startVerse: entry.verse,
        endVerse: entry.verse
      };
    }
  }

  // Don't forget to add the last chunk
  if (currentChunk) {
    consolidated.push(currentChunk);
  }

  return consolidated;
}

function makeSessionLogger() {
  const entries: SessionLoggerEntry[] = [];
  const thresholdEntries = new Map<string, number>(); // keep track of the last time we logged an entry for a given book, chapter, verse
  const bibleChapterViews = new Set<{
    cursorHandler: BibleCursorHandler;
    verseYCoordRef: React.MutableRefObject<{ [verseIdx: number]: number }>;
    scrollYRef: React.MutableRefObject<number>;
    scrollViewHeightRef: React.MutableRefObject<number>;
  }>();

  let interval: NodeJS.Timeout | null = null;

  const sessionLogger = {
    entries,
    startWatcher: () => {
      if (interval) {
        return;
      }

      interval = setInterval(() => {
        captureOnScreenVerses();
      }, 1000);
    },
    stopWatcher: () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    flush: debounce(() => sessionLogger.flushNow(), LOG_THRESHOLD_SECONDS * 3 * 1000),
    flushNow: () => {
      if (!entries.length) return;
      const consolidatedEntries = consolidateEntries(entries);
      entries.length = 0;

      convex.mutation(api.sessionLogger.logSession, {
        date: formatDate(new Date(), "yyyy-MM-dd"),
        verses: consolidatedEntries,
      });
    },
    logEntry: (bookId: BookId, chapter: number, verse: number) => {
      entries.push({ bookId, chapter, verse });
      sessionLogger.flush();
    },
    mountBibleChapterView: (cursorHandler: BibleCursorHandler, verseYCoordRef: React.MutableRefObject<{ [verseIdx: number]: number }>, scrollYRef: React.MutableRefObject<number>, scrollViewHeightRef: React.MutableRefObject<number>) => {
      const bibleChapterViewRef = {
        cursorHandler,
        verseYCoordRef,
        scrollYRef,
        scrollViewHeightRef,
      }
      bibleChapterViews.add(bibleChapterViewRef);

      return () => {
        bibleChapterViews.delete(bibleChapterViewRef);
      }
    }
  }

  return sessionLogger;

  // Take note of all verses that are visible on screen
  // When a verse is visible for more than 3 seconds we add it to the entries array
  function captureOnScreenVerses() {
    const bibleChapterViewRef = Array.from(bibleChapterViews)[0];
    if (!bibleChapterViewRef) {
      return;
    }

    const { cursorHandler, verseYCoordRef, scrollYRef } = bibleChapterViewRef;
    const verseYCoords = verseYCoordRef.current;
    for (const [verseIdx, y] of Object.entries(verseYCoords)) {
      const relativeY = y - scrollYRef.current;
      const isInView = relativeY > 0 && relativeY < bibleChapterViewRef.scrollViewHeightRef.current;
      const verse = +verseIdx + 1;
      const key = `${cursorHandler.cursor.bookId}-${cursorHandler.cursor.chapter}-${verse}`;
      const loggedCount = thresholdEntries.get(key) ?? 0;


      if (loggedCount > LOG_THRESHOLD_SECONDS) continue; // Keep the threshold entries so we don't log it twice

      if (isInView) {
        thresholdEntries.set(key, loggedCount + 1);

        if (loggedCount === LOG_THRESHOLD_SECONDS) {
          sessionLogger.logEntry(cursorHandler.cursor.bookId, cursorHandler.cursor.chapter, verse);
        }
        continue;
      }

      // Went out of view, and not logged - cleanup
      thresholdEntries.delete(key);
    }
  }
}
