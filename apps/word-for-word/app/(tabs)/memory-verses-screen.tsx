import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import React, { type FC, useCallback } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useBibleStore } from "@/src/stores/bible-store";
import { mapBookIdsToName, type BookId } from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import type { Doc } from "@backend/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { startOfDay, isSameDay, isYesterday, isToday, differenceInDays } from "date-fns";

type StreakInfo = {
  lastEntryDate: Date;
  numStreakDays: number;
};

const MemorizeScreen: FC = () => {
  const themeColors = useThemeColors();
  const memoryVerses = useQuery(api.memoryVerses.getMemoryVerses);
  const router = useRouter();

  const getVerseName = useCallback((bookId: BookId, chapter: number, verse: number) => {
    return `${mapBookIdsToName[bookId]} ${chapter}:${verse}`;
  }, []);

  const handleVersePress = useCallback((verse: Doc<"memoryVerses">) => {
    router.push({
      pathname: "/recite-verse-screen",
      params: {
        verseId: verse._id,
      },
    });
  }, [router]);

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
        onPress={() => handleVersePress(item)}
      >
        <TView className="flex-row justify-between items-start mb-2">
          <TText className="font-bold text-lg" style={{ color: themeColors.text }}>
            {verseName}
          </TText>
          {streakInfo && streakInfo.numStreakDays > 0 && (
            <TView className="flex-row items-center bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
              <Ionicons name="flame" size={16} color={themeColors.warning} />
              <TText className="ml-1 text-sm" style={{ color: themeColors.warning }}>
                {streakInfo.numStreakDays} day{streakInfo.numStreakDays > 1 ? 's' : ''} streak
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
          <Ionicons name="time-outline" size={14} color={streakInfo?.lastEntryDate ? themeColors.success : themeColors.textTertiary} />
          <TText
            className="ml-1 text-xs"
            style={{ color: streakInfo?.lastEntryDate ? themeColors.success : themeColors.textTertiary }}
          >
            {!streakInfo ? 'Not memorized' : `Last memorized: ${streakInfo.lastEntryDate.toLocaleDateString()}`}
          </TText>
        </TView>
      </TouchableOpacity>
    );
  }, [getVerseName, themeColors, handleVersePress]);

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


const getStreakInfo = (memoryEntries: { createdAt: number }[]): StreakInfo | null => {
  if (memoryEntries.length === 0) return null;

  // Sort entries by date in descending order
  const sortedEntries = [...memoryEntries].sort((a, b) => b.createdAt - a.createdAt);
  const lastEntry = sortedEntries[0];
  if (!lastEntry) return null;

  const lastEntryDate = new Date(lastEntry.createdAt);
  const lastEntryStartOfDay = startOfDay(lastEntryDate);

  // If the last entry was not today or yesterday, there's no streak
  if (!isToday(lastEntryDate) && !isYesterday(lastEntryDate)) {
    return {
      lastEntryDate,
      numStreakDays: 0
    };
  }

  // Count consecutive days
  let numStreakDays = 1;
  let currentDate = lastEntryStartOfDay;

  for (let i = 1; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    if (!entry) continue;

    const entryDate = startOfDay(new Date(entry.createdAt));
    const daysDiff = differenceInDays(currentDate, entryDate);

    // If there's a gap in days, break the streak
    if (daysDiff > 1) break;
    currentDate = entryDate;

    if (daysDiff === 0) continue;
    numStreakDays++;
  }

  return {
    lastEntryDate,
    numStreakDays
  };
};
