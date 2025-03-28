import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import React, { type FC, useCallback } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useBibleStore } from "@/src/stores/bible-store";
import { mapBookIdsToName, type BookId } from "@/src/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import type { Doc } from "@backend/convex/_generated/dataModel";

const MemorizeScreen: FC = () => {
  const themeColors = useThemeColors();
  const memoryVerses = useQuery(api.memoryVerses.getMemoryVerses);
  const bible = useBibleStore();

  const getVerseName = useCallback((bookId: BookId, chapter: number, verse: number) => {
    return `${mapBookIdsToName[bookId]} ${chapter}:${verse}`;
  }, []);

  const getStreakInfo = useCallback((memoryEntries: { createdAt: number }[]) => {
    if (memoryEntries.length === 0) return null;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastEntry = memoryEntries[memoryEntries.length - 1];
    if (!lastEntry) return null;

    const lastEntryDate = new Date(lastEntry.createdAt);
    const lastEntryDay = lastEntryDate.getTime() - (lastEntryDate.getTime() % oneDayMs);
    const today = now - (now % oneDayMs);

    // Check if there are entries for the last 3 consecutive days
    const hasStreak = memoryEntries.some(entry => {
      const entryDate = new Date(entry.createdAt);
      const entryDay = entryDate.getTime() - (entryDate.getTime() % oneDayMs);
      return entryDay === lastEntryDay - oneDayMs;
    }) && memoryEntries.some(entry => {
      const entryDate = new Date(entry.createdAt);
      const entryDay = entryDate.getTime() - (entryDate.getTime() % oneDayMs);
      return entryDay === lastEntryDay - (2 * oneDayMs);
    });

    return {
      lastEntryDate,
      hasStreak
    };
  }, []);

  const renderItem = useCallback(({ item }: { item: Doc<"memoryVerses"> }) => {
    const verseName = getVerseName(item.bookId as BookId, item.chapter, item.verse);
    const streakInfo = getStreakInfo(item.memoryEntries);
    const verseText = `${item.text.split('\n')[0]}...`;

    return (
      <TouchableOpacity
        className="p-4 border-b"
        style={{
          backgroundColor: themeColors.surface,
          borderBottomColor: themeColors.border
        }}
      >
        <TView className="flex-row justify-between items-start mb-2">
          <TText className="font-bold text-lg" style={{ color: themeColors.text }}>
            {verseName}
          </TText>
          {streakInfo?.hasStreak && (
            <TView className="flex-row items-center bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
              <Ionicons name="flame" size={16} color={themeColors.warning} />
              <TText className="ml-1 text-sm" style={{ color: themeColors.warning }}>
                Streak
              </TText>
            </TView>
          )}
        </TView>

        <TText
          className="text-sm mb-2"
          style={{ color: themeColors.textSecondary }}
          numberOfLines={2}
        >
          {verseText}
        </TText>

        <TView className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color={themeColors.textTertiary} />
          <TText
            className="ml-1 text-xs"
            style={{ color: themeColors.textTertiary }}
          >
            Last memorized: {streakInfo?.lastEntryDate.toLocaleDateString()}
          </TText>
        </TView>
      </TouchableOpacity>
    );
  }, [getVerseName, getStreakInfo, themeColors]);

  if (!memoryVerses) {
    return (
      <TSafeAreaView className="items-center justify-center">
        <TText>Loading...</TText>
      </TSafeAreaView>
    );
  }

  if (memoryVerses.length === 0) {
    return (
      <TSafeAreaView className="items-center justify-center">
        <TView className="items-center">
          <Ionicons name="heart-outline" size={48} color={themeColors.textTertiary} />
          <TText className="mt-4 text-lg" style={{ color: themeColors.text }}>
            No memory verses yet
          </TText>
          <TText className="mt-2" style={{ color: themeColors.textSecondary }}>
            Add verses to memorize from the Bible screen
          </TText>
        </TView>
      </TSafeAreaView>
    );
  }

  return (
    <TSafeAreaView>
      <FlatList
        data={memoryVerses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </TSafeAreaView>
  );
};

export default MemorizeScreen;
