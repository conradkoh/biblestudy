import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import React, { type FC, useCallback, useRef } from "react";
import { FlatList, TouchableOpacity, View, Animated } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useBibleStore } from "@/src/stores/bible-store";
import { getVerseNameFormatted, isBookId, mapBookIdsToName, type BookId } from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import {
  startOfDay,
  isSameDay,
  isYesterday,
  isToday,
  differenceInDays,
  formatDistanceToNow,
} from "date-fns";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { isDefined } from "@common/utils/typecheck";
import { Button } from "@/src/components/core/Button";
import { useCachedMemoryVerses } from "@/src/hooks/useCachedMemoryVerses";

type StreakInfo = {
  lastEntryDate: Date;
  numStreakDays: number;
};

const MemorizeScreen: FC = () => {
  const themeColors = useThemeColors();
  const getVersesText = useBibleStore(s => s.getVersesText);
  const memoryVerses = useQuery(api.memoryVerses.getMemoryVerses);

  const cachedOrActualVerses = useCachedMemoryVerses(memoryVerses);

  const removeMemoryVerse = useMutation(api.memoryVerses.removeMemoryVerse);
  const router = useRouter();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const handleVersePress = useCallback(
    (verse: Doc<"memoryVerses">) => {
      router.push({
        pathname: "/recite-verse-screen",
        params: {
          verseId: verse._id,
        },
      });
    },
    [router],
  );

  const handleDelete = useCallback(
    async (verseId: Id<"memoryVerses">) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await removeMemoryVerse({ id: verseId });
      } catch (error) {
        console.error("Failed to delete memory verse:", error);
      }
    },
    [removeMemoryVerse],
  );

  const renderRightActions = useCallback(
    (verseId: Id<"memoryVerses">) => {
      return (
        <TouchableOpacity
          className="justify-center items-center px-4 bg-red-500"
          onPress={() => handleDelete(verseId)}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      );
    },
    [handleDelete],
  );

  const renderItem = useCallback(
    ({ item }: { item: Doc<"memoryVerses"> }) => {

      if (!isBookId(item.bookId)) {
        console.error("Invalid bookId", item.bookId);
        return null
      };

      const cursorStart = {
        version: item.version,
        bookId: item.bookId,
        chapter: item.chapter,
        verse: item.verse,
      };

      const cursorEnd = (isDefined(item.endVerse) && isDefined(item.endChapter) && isDefined(item.endBookId) && isBookId(item.endBookId)) ? {
        verse: item.endVerse,
        chapter: item.endChapter,
        bookId: item.endBookId,
      } : undefined;

      const verseName = getVerseNameFormatted(cursorStart, cursorEnd);
      const streakInfo = getStreakInfo(item.memoryEntries);
      const verseText = getVersesText(cursorStart, cursorEnd);

      const setSwipeableRef = (ref: Swipeable | null) => {
        swipeableRefs.current[item._id] = ref;
      };

      return (
        <Swipeable
          ref={setSwipeableRef}
          renderRightActions={() => renderRightActions(item._id)}
          rightThreshold={40}
        >
          <TouchableOpacity
            className="p-4 border-b"
            style={{
              backgroundColor: themeColors.surface,
              borderBottomColor: themeColors.border,
            }}
            onPress={() => handleVersePress(item)}
          >
            <TView className="flex-row justify-between items-start mb-2">
              <TText
                className="font-bold text-lg"
                style={{ color: themeColors.text }}
              >
                {verseName}
              </TText>
              {streakInfo && streakInfo.numStreakDays > 0 && (
                <TView className="flex-row items-center bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
                  <Ionicons
                    name="flame"
                    size={16}
                    color={themeColors.warning}
                  />
                  <TText
                    className="ml-1 text-sm"
                    style={{ color: themeColors.warning }}
                  >
                    {streakInfo.numStreakDays} day
                    {streakInfo.numStreakDays > 1 ? "s" : ""} streak
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
              <Ionicons
                name="time-outline"
                size={14}
                color={
                  streakInfo?.lastEntryDate
                    ? themeColors.success
                    : themeColors.textTertiary
                }
              />
              <TText
                className="ml-1 text-xs"
                style={{
                  color: streakInfo?.lastEntryDate
                    ? themeColors.success
                    : themeColors.textTertiary,
                }}
              >
                {!streakInfo
                  ? "Not memorized"
                  : `Last memorized ${formatDistanceToNow(new Date(streakInfo.lastEntryDate), { addSuffix: true })}`}
              </TText>
            </TView>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [themeColors, handleVersePress, renderRightActions, getVersesText],
  );

  if (!cachedOrActualVerses) {
    return (
      <TSafeAreaView className="items-center justify-center" edges={['top']}>
        <TText>Loading...</TText>
      </TSafeAreaView>
    );
  }

  if (cachedOrActualVerses.length === 0) {
    return (
      <TSafeAreaView className="items-center justify-center" edges={['top']}>
        <TView className="items-center">
          <Ionicons
            name="heart-outline"
            size={48}
            color={themeColors.textTertiary}
          />
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
    <TSafeAreaView edges={['top']}>
      <FlatList
        data={cachedOrActualVerses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
      <Button className="w-full py-3 items-center justify-center" style={{ backgroundColor: themeColors.primary }}>
        {props => {
          return <TText {...props} className="font-bold">Start Daily Test</TText>
        }}
      </Button>
    </TSafeAreaView>
  );
};

export default MemorizeScreen;

const getStreakInfo = (
  memoryEntries: { createdAt: number }[],
): StreakInfo | null => {
  if (memoryEntries.length === 0) return null;

  // Sort entries by date in descending order
  const sortedEntries = [...memoryEntries].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  const lastEntry = sortedEntries[0];
  if (!lastEntry) return null;

  const lastEntryDate = new Date(lastEntry.createdAt);
  const lastEntryStartOfDay = startOfDay(lastEntryDate);

  // If the last entry was not today or yesterday, there's no streak
  if (!isToday(lastEntryDate) && !isYesterday(lastEntryDate)) {
    return {
      lastEntryDate,
      numStreakDays: 0,
    };
  }

  // Count consecutive days
  let numStreakDays = 1;
  let currentDate = lastEntryStartOfDay;

  const dates = new Set<number>();
  for (const entry of sortedEntries) {
    dates.add(startOfDay(new Date(entry.createdAt)).valueOf());
  }

  const sortedDates = Array.from(dates).sort((a, b) => a - b);

  if (sortedDates.length <= 1) {
    return {
      lastEntryDate,
      numStreakDays: 0,
    };
  }

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    if (!date) continue;

    const entryDate = startOfDay(new Date(date));
    const daysDiff = differenceInDays(currentDate, entryDate);

    // If there's a gap in days, break the streak
    if (daysDiff > 1) break;
    currentDate = entryDate;

    if (daysDiff === 0) continue;
    numStreakDays++;
  }

  return {
    lastEntryDate,
    numStreakDays,
  };
};
