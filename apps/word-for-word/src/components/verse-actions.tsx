import type { Verse } from "@/assets/bible-en/kjv.json";
import { Button } from "@/src/components/core/Button";
import { TText } from "@/src/components/core/TText";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { type FC, useState } from "react";
import { View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import type {
  BibleCursor,
  BibleCursorRangeEnd,
} from "@common/utils/bible-data-utils";
import { getVerseNameFormatted } from "@common/utils/bible-data-utils";
import { useBibleStore } from "@/src/stores/bible-store";
import HighlightColorPicker from "@/src/components/highlight-color-picker";
import type { HighlightColor } from "@/src/types/highlight";

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
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>("highlighterYellow");

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
  };

  const handleToggleHighlight = async () => {
    if (chapterHighlights === undefined) return;

    if (!existingHighlight) {
      // Show color picker to add highlight
      setShowColorPicker(true);
    } else {
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
    }
  };

  const handleColorSelect = async (color: HighlightColor) => {
    setSelectedColor(color);
    setShowColorPicker(false);

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
  };

  if (showColorPicker) {
    return (
      <View
        className="p-2 my-3"
        style={{
          borderColor: themeColors.border,
          borderBottomWidth: 1,
          borderTopWidth: 1,
        }}
      >
        <TText className="text-center mb-2 font-bold">Choose Highlight Color</TText>
        <HighlightColorPicker
          onColorSelect={handleColorSelect}
          selectedColor={selectedColor}
        />
      </View>
    );
  }

  return (
    <View
      className="flex-row justify-around p-2 my-3"
      style={{
        borderColor: themeColors.border,
        borderBottomWidth: 1,
        borderTopWidth: 1,
      }}
    >
      <Button
        leadingIcon={(props) => (
          <Ionicons
            style={[props.style]}
            name={existingHighlight ? "bookmark" : "bookmark-outline"}
            size={24}
          />
        )}
        className="flex-col rounded-md p-2 flex-1"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
        onPress={handleToggleHighlight}
      >
        {() => <TText numberOfLines={1} className="text-xs font-bold">Highlight</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons
            style={[props.style]}
            name={existingMemoryVerseId ? "heart-outline" : "heart"}
            size={24}
          />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
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
  );
};

export default VerseActions;
