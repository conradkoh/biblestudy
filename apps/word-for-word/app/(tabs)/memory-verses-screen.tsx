import { Button } from "@/src/components/core/Button";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { usePersistedQuery } from "@/src/hooks/usePersistedQuery";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import { api } from "@backend/convex/_generated/api";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import {
  getVerseNameFormatted,
  isBookId,
} from "@common/utils/bible-data-utils";
import {
  calculateExpirationInfo,
  getExpirationStatus,
} from "@common/utils/memory-verse-utils";
import { isDefined } from "@common/utils/typecheck";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { useMutation, useQuery } from "convex/react";
import { addDays, isSameDay, startOfDay, startOfWeek } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, type FC } from "react";
import { Alert, FlatList, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { CommonEvents } from "@/src/hooks/useEvents";
import { mapSortToInfo, sortMemoryVerses } from "@/src/utils/memory-verse-sort";

const MemorizeScreen: FC = () => {
  const themeColors = useThemeColors();
  const getVersesText = useBibleStore((s) => s.getVersesText);
  const router = useRouter();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const memoryVerseSortOption = useSettingsStore(
    (s) => s.memoryVerseSortOption
  );
  const setMemoryVerseSortOption = useSettingsStore(
    (s) => s.setMemoryVerseSortOption
  );

  const memoryVerses = usePersistedQuery(
    api.memoryVerses.getMemoryVerses,
    [{}],
    { storageKey: "CACHE_MEMORY_VERSES" }
  );

  const removeMemoryVerse = useMutation(api.memoryVerses.removeMemoryVerse);

  // Sort memory verses based on the selected option
  const sortedMemoryVerses = React.useMemo(() => {
    if (!memoryVerses) return [];
    return sortMemoryVerses(memoryVerses, memoryVerseSortOption);
  }, [memoryVerses, memoryVerseSortOption]);

  const handleVersePress = useCallback(
    (verse: Doc<"memoryVerses">) => {
      router.push({
        pathname: "/recite-verse-screen",
        params: {
          verseId: verse._id,
        },
      });
    },
    [router]
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
    [removeMemoryVerse]
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
    [handleDelete]
  );

  const handleSortPress = useCallback(() => {
    CommonEvents.emit("SHOW_OPTION_SELECTOR_BOTTOM_SHEET", {
      title: "Sort Memory Verses",
      options: Object.values(mapSortToInfo).map((info) => ({
        id: info.id,
        label: info.label,
        description: info.description,
        onSelect: () => setMemoryVerseSortOption(info.id),
      })),
    });
  }, [setMemoryVerseSortOption]);

  const handleStartDailyTest = () => {
    if (!memoryVerses || memoryVerses.length === 0) {
      Alert.alert(
        "No Verses Available",
        "You need to add some memory verses before starting a daily test.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      return;
    }

    const today = startOfDay(new Date());

    // Filter out verses that have been recited today
    const versesNotRecitedToday = memoryVerses.filter((verse) => {
      const todayEntries = verse.memoryEntries.filter((entry) => {
        const entryDate = startOfDay(new Date(entry.createdAt));
        return entryDate.valueOf() === today.valueOf();
      });
      return todayEntries.length === 0;
    });

    // If we don't have enough verses, use all verses
    const availableVerses =
      versesNotRecitedToday.length < 5 ? memoryVerses : versesNotRecitedToday;

    // Randomly select 5 verses
    const selectedVerses = [];
    const versesToChooseFrom = [...availableVerses];

    for (let i = 0; i < 5; i++) {
      if (versesToChooseFrom.length === 0) break;
      const randomIndex = Math.floor(Math.random() * versesToChooseFrom.length);
      selectedVerses.push(versesToChooseFrom[randomIndex]);
      versesToChooseFrom.splice(randomIndex, 1);
    }

    if (selectedVerses.length === 0) {
      Alert.alert(
        "No Verses Available",
        "You need to add some memory verses before starting a daily test.",
        [
          {
            text: "OK",
            style: "default",
          },
        ]
      );
      return;
    }

    // Start with the first verse
    const firstVerse = selectedVerses[0];
    if (!firstVerse) return;

    router.push({
      pathname: "/recite-verse-screen",
      params: {
        verseId: firstVerse._id,
        verseIdsStr: selectedVerses
          .map((v) => v?._id)
          .filter(isDefined)
          .join(","),
      },
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Doc<"memoryVerses"> }) => {
      if (!isBookId(item.bookId)) {
        console.error("Invalid bookId", item.bookId);
        return null;
      }

      const cursorStart = {
        version: item.version,
        bookId: item.bookId,
        chapter: item.chapter,
        verse: item.verse,
      };

      const cursorEnd =
        isDefined(item.endVerse) &&
        isDefined(item.endChapter) &&
        isDefined(item.endBookId) &&
        isBookId(item.endBookId)
          ? {
              verse: item.endVerse,
              chapter: item.endChapter,
              bookId: item.endBookId,
            }
          : undefined;

      const verseName = getVerseNameFormatted(cursorStart, cursorEnd);
      const expirationInfo = calculateExpirationInfo(item.memoryEntries);
      const verseText = getVersesText(cursorStart, cursorEnd);
      const expirationStatus = getExpirationStatus(
        expirationInfo.daysUntilExpiration,
        item.memoryEntries.length,
        item.memoryEntries
      );

      // Map status to theme colors
      const statusColorMap = {
        completed: themeColors.success,
        safe: themeColors.success,
        warning: themeColors.warning,
        expired: themeColors.error,
        unattempted: themeColors.textTertiary,
      } as const;

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
              {expirationInfo.currentStreak > 0 && (
                <TView className="flex-row items-center bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
                  <TText
                    className="mr-1 text-sm"
                    style={{ color: themeColors.orange }}
                  >
                    {expirationInfo.currentStreak}
                  </TText>
                  <Ionicons name="flame" size={16} color={themeColors.orange} />
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
            <TView className="flex-row items-center ml-auto mt-1">
              <TText
                className="mr-1 text-xs"
                style={{ color: statusColorMap[expirationStatus.status] }}
              >
                {expirationStatus.status === "completed"
                  ? "Completed today"
                  : expirationInfo.isExpired
                    ? item.memoryEntries.length > 0
                      ? "Expired"
                      : "Recite"
                    : expirationInfo.daysUntilExpiration === 0
                      ? "Expires today"
                      : `Expires in ${expirationInfo.daysUntilExpiration} day${expirationInfo.daysUntilExpiration > 1 ? "s" : ""}`}
              </TText>
              <Ionicons
                name={expirationStatus.icon}
                size={14}
                style={{ color: statusColorMap[expirationStatus.status] }}
              />
            </TView>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [themeColors, handleVersePress, renderRightActions, getVersesText]
  );

  if (!memoryVerses) {
    return (
      <TSafeAreaView className="items-center justify-center" edges={["top"]}>
        <TText>Loading...</TText>
      </TSafeAreaView>
    );
  }

  if (memoryVerses.length === 0) {
    return (
      <TSafeAreaView
        className="items-center justify-center flex-1"
        edges={["top"]}
      >
        <TView className="flex-1 items-center justify-center">
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
    <TSafeAreaView edges={["top"]} className="h-full">
      <TView className="flex-row items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
          const weekStart = startOfWeek(new Date());
          const dateForDay = addDays(weekStart, index);

          const hasMemoryVerseForDay = memoryVerses.some((verse) => {
            return verse.memoryEntries.some((entry) => {
              const entryDate = startOfDay(new Date(entry.createdAt));
              return isSameDay(entryDate, dateForDay);
            });
          });
          const isToday = isSameDay(dateForDay, new Date());

          return (
            <View className="flex-1 items-center justify-center" key={index}>
              <TText
                className="font-bold"
                style={{ color: themeColors.textSecondary }}
              >
                {day}
              </TText>
              <View
                className={classNames("p-2 rounded-full mt-2", {
                  "bg-orange-100 dark:bg-orange-900": hasMemoryVerseForDay,
                  "border-2 border-orange-500 dark:border-orange-500": isToday,
                })}
                style={{
                  ...(!hasMemoryVerseForDay && {
                    backgroundColor: themeColors.surfaceTertiary,
                  }),
                }}
              >
                <Ionicons
                  name="flame"
                  size={16}
                  color={
                    hasMemoryVerseForDay
                      ? themeColors.warning
                      : themeColors.textTertiary
                  }
                />
              </View>
            </View>
          );
        })}
      </TView>

      {/* Header with sort button */}
      <TView
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ borderBottomColor: themeColors.border }}
      >
        <TText
          className="text-lg font-bold"
          style={{ color: themeColors.text }}
        >
          Memory Verses
        </TText>
        <TouchableOpacity
          onPress={handleSortPress}
          className="flex-row items-center px-3 py-2 rounded-full"
          style={{ backgroundColor: themeColors.surfaceSecondary }}
        >
          <Ionicons
            name={mapSortToInfo[memoryVerseSortOption].icon}
            size={16}
            color={themeColors.textSecondary}
            style={{ marginRight: 4 }}
          />
          <TText
            className="text-sm"
            style={{ color: themeColors.textSecondary }}
          >
            {mapSortToInfo[memoryVerseSortOption].label}
          </TText>
        </TouchableOpacity>
      </TView>

      <FlatList
        data={sortedMemoryVerses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
      {/* <Button
        className="py-3 m-3 mt-2 items-center justify-center rounded-full"
        style={{ backgroundColor: themeColors.orange }}
        onPress={handleStartDailyTest}
        disabled={!memoryVerses.length}
      >
        {props => {
          return <TText {...props} style={[props.style, { color: themeColors.permanentWhite }]} className="font-bold">Start Daily Test</TText>
        }}
      </Button> */}
    </TSafeAreaView>
  );
};

export default MemorizeScreen;
