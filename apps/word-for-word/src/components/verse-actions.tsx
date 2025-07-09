import type { Verse } from "@/assets/bible-en/kjv.json";
import { Button } from "@/src/components/core/Button";
import { TText } from "@/src/components/core/TText";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { type FC, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import type {
  BibleCursor,
  BibleCursorRangeEnd,
} from "@common/utils/bible-data-utils";
import { getVerseNameFormatted } from "@common/utils/bible-data-utils";
import { useBibleStore } from "@/src/stores/bible-store";
import type { HighlightColor } from "@/src/types/highlight";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

type VerseActionsProps = {
  cursor: Required<BibleCursor>;
  verseName: string;
  version: "niv" | "kjv";
  cursorRangeEnd?: BibleCursorRangeEnd | null;
};

const VerseActions: FC<VerseActionsProps> = ({
  cursor,
  verseName,
  version,
  cursorRangeEnd,
}) => {
  const themeColors = useThemeColors();
  const bible = useBibleStore();

  const existingMemoryVerseId = useQuery(
    api.memoryVerses.getExistingMemoryVerseId2,
    {
      version,
      bookId: cursor.bookId,
      chapter: cursor.chapter,
      verse: cursor.verse,
      ...(cursorRangeEnd && {
        endVerse: cursorRangeEnd.verse,
        endChapter: cursorRangeEnd.chapter,
        endBookId: cursorRangeEnd.bookId,
      }),
    },
  );

  const chapterHighlights = useQuery(
    api.verseHighlights.getChapterHighlights,
    {
      version,
      bookId: cursor.bookId,
      chapter: cursor.chapter,
    },
  );

  // Check if current verse is highlighted
  const existingHighlight = chapterHighlights
    ? chapterHighlights[cursor.verse.toString()]
    : undefined;

  const addMemoryVerse = useMutation(api.memoryVerses.addMemoryVerse);
  const removeMemoryVerse = useMutation(api.memoryVerses.removeMemoryVerse);
  const addVerseHighlight = useMutation(api.verseHighlights.addVerseHighlight);
  const removeVerseHighlight = useMutation(api.verseHighlights.removeVerseHighlight);

  const handleCopy = () => {
    const textToCopy = bible.getVersesText(cursor, cursorRangeEnd ?? undefined);

    Clipboard.setString(
      `${textToCopy}\n${verseName} (${version.toUpperCase()})`,
    );
    CommonEvents.emit("SHOW_TOAST", {
      message: `${verseName} (${version.toUpperCase()}) copied to clipboard`,
    });
  };

  const handleToggleMemoryVerse = async () => {
    if (existingMemoryVerseId === undefined) return;

    try {
      if (!existingMemoryVerseId) {
        await addMemoryVerse({
          text: bible.getVersesText(cursor, cursorRangeEnd ?? undefined), // TODO: remove. only for push notifications
          verse: cursor.verse,
          chapter: cursor.chapter,
          bookId: cursor.bookId,
          version: version,
          ...(cursorRangeEnd && {
            endVerse: cursorRangeEnd.verse,
            endChapter: cursorRangeEnd.chapter,
            endBookId: cursorRangeEnd.bookId,
          }),
        });
        CommonEvents.emit("SHOW_TOAST", {
          message: `${verseName} (${version.toUpperCase()}) added to memory verses.`,
        });
      } else {
        await removeMemoryVerse({
          id: existingMemoryVerseId,
        });
        CommonEvents.emit("SHOW_TOAST", {
          message: `${verseName} (${version.toUpperCase()}) removed from memory verses.`,
        });
      }
    } catch (error) {
      CommonEvents.emit("SHOW_TOAST", {
        message: "You need to be online to perform this action.",
      });
    }
  };

  const handleColorSelect = async (color: HighlightColor) => {
    try {
      if (existingHighlight?.color === color) {
        // Remove existing highlight
        await removeVerseHighlight({
          version,
          bookId: cursor.bookId,
          chapter: cursor.chapter,
          verse: cursor.verse,
        });
        CommonEvents.emit("SHOW_TOAST", {
          message: `Highlight removed from ${verseName}`,
        });
      } else {
        // Add new highlight
        await addVerseHighlight({
          version,
          bookId: cursor.bookId,
          chapter: cursor.chapter,
          verse: cursor.verse,
          color,
        });
        CommonEvents.emit("SHOW_TOAST", {
          message: `${verseName} highlighted`,
        });
      }
    } catch (error) {
      CommonEvents.emit("SHOW_TOAST", {
        message: "You need to be online to perform this action.",
      });
    }
  };

  const highlightColors: { color: HighlightColor; label: string }[] = [
    { color: "highlighterOrange", label: "Orange" },
    { color: "highlighterRed", label: "Red" },
    { color: "highlighterPink", label: "Pink" },
    { color: "highlighterPurple", label: "Purple" },
    { color: "highlighterBlue", label: "Blue" },
    { color: "highlighterGreen", label: "Green" },
    { color: "highlighterYellow", label: "Yellow" },
  ];

  return (
    <View
      className="p-2 my-3"
      style={{
        borderColor: themeColors.border,
        borderBottomWidth: 1,
        borderTopWidth: 1,
      }}
    >


      {/* Highlight color options */}
      <View className="mb-4 mt-1 w-full px-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
          <View className="flex-row justify-between min-w-full" style={{ gap: 8 }}>
            {highlightColors.map(({ color, label }) => (
              <TouchableOpacity
                key={color}
                onPress={() => handleColorSelect(color)}
                className="w-8 h-8 rounded-full items-center justify-center border"
                style={{
                  backgroundColor: themeColors[color],
                  borderColor: themeColors.text,
                }}
              >
                {existingHighlight?.color === color ? (
                  <Ionicons
                    name="close"
                    size={16}
                    style={{ color: themeColors.text }}
                  />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Main action buttons */}
      <View className="flex-row justify-around mb-3">
        <Button
          leadingIcon={(props) => (
            <Ionicons
              style={[props.style]}
              name={existingMemoryVerseId ? "heart-outline" : "heart"}
              size={24}
            />
          )}
          className="flex-col rounded-md p-2 flex-1"
          style={{ backgroundColor: themeColors.surfaceSecondary }}
          onPress={handleToggleMemoryVerse}
        >
          {() => (
            <TText numberOfLines={1} className="text-xs font-bold">
              {existingMemoryVerseId ? "Remove" : "Memorise"}
            </TText>
          )}
        </Button>
        <Button
          leadingIcon={(props) => (
            <Ionicons style={[props.style]} name="send" size={24} />
          )}
          className="flex-col rounded-md p-2 flex-1 ml-2"
          style={{ backgroundColor: themeColors.surfaceSecondary }}
        >
          {() => <TText numberOfLines={1} className="text-xs font-bold">Send</TText>}
        </Button>
        <Button
          leadingIcon={(props) => (
            <Ionicons style={[props.style]} name="copy" size={24} />
          )}
          className="flex-col rounded-md p-2 flex-1 ml-2"
          style={{ backgroundColor: themeColors.surfaceSecondary }}
          onPress={handleCopy}
        >
          {() => <TText numberOfLines={1} className="text-xs font-bold">Copy</TText>}
        </Button>
      </View>
    </View>
  );
};

export default VerseActions;
