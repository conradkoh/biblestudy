import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BibleStore } from "@/src/stores/bible-store";
import type { BibleCursor } from "@/src/utils/bible-data-utils";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";

const STORAGE_KEY = "bible-bookmark";

export const useBibleBookmark = (
  bibleStore: BibleStore,
  cursorHandler: BibleCursorHandler,
) => {
  useEffect(() => {
    // Load saved state on mount
    const loadSavedState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const cursor = JSON.parse(savedState) as BibleCursor;
          cursorHandler.setCursor(cursor);
        }
      } catch (error) {
        console.error("Failed to load Bible bookmark:", error);
      }
    };
    loadSavedState();
  }, [cursorHandler.setCursor]);

  useEffect(() => {
    // Save state whenever it changes
    const saveState = async () => {
      try {
        const cursor: BibleCursor = cursorHandler.cursor;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cursor));
      } catch (error) {
        console.error("Failed to save Bible bookmark:", error);
      }
    };
    saveState();
  }, [cursorHandler.cursor]);
};
