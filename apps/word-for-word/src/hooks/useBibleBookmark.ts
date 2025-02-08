import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BibleCursorStore } from "@/src/stores/bible-store";

const STORAGE_KEY = "bible-bookmark";

interface BookmarkState {
  currentVersion: BibleCursorStore["currentVersion"];
  bookIdx: number;
  chapterIdx: number;
}

export const useBibleBookmark = (bibleStore: BibleCursorStore) => {
  useEffect(() => {
    // Load saved state on mount
    const loadSavedState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const state = JSON.parse(savedState) as BookmarkState;
          bibleStore.setCurrentVersion(state.currentVersion);
          bibleStore.setBookIdx(state.bookIdx);
          bibleStore.setChapterIdx(state.chapterIdx);
        }
      } catch (error) {
        console.error("Failed to load Bible bookmark:", error);
      }
    };
    loadSavedState();
  }, [
    bibleStore.setBookIdx,
    bibleStore.setChapterIdx,
    bibleStore.setCurrentVersion,
  ]);

  useEffect(() => {
    // Save state whenever it changes
    const saveState = async () => {
      try {
        const state: BookmarkState = {
          currentVersion: bibleStore.currentVersion,
          bookIdx: bibleStore.bookIdx,
          chapterIdx: bibleStore.chapterIdx,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save Bible bookmark:", error);
      }
    };
    saveState();
  }, [bibleStore.currentVersion, bibleStore.bookIdx, bibleStore.chapterIdx]);
};
