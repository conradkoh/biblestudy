import type { Verse } from "@/assets/bible-en/kjv.json";
import { Button } from "@/src/components/core/Button";
import { TText } from "@/src/components/core/TText";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { type FC } from "react";
import { View } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import type { BibleCursor } from "@/src/utils/bible-data-utils";
import { useBibleStore } from "@/src/stores/bible-store";

type VerseActionsProps = {
  cursor: Required<BibleCursor>;
  verseName: string;
  version: string;
};

const VerseActions: FC<VerseActionsProps> = ({
  cursor,
  verseName,
  version,
}) => {
  const themeColors = useThemeColors();

  const bible = useBibleStore();


  const verse = bible.getVerse(cursor);
  const existingMemoryVerseId = useQuery(api.memoryVerses.getExistingMemoryVerseId, {
    text: verse.text,
  });

  const addMemoryVerse = useMutation(api.memoryVerses.addMemoryVerse);
  const removeMemoryVerse = useMutation(api.memoryVerses.removeMemoryVerse);

  const handleCopy = () => {
    Clipboard.setString(
      `${verse.text}\n${verseName} (${version.toUpperCase()})`,
    );
    CommonEvents.emit("SHOW_TOAST", {
      message: `${verseName} (${version.toUpperCase()}) copied to clipboard`,
    });
  };

  const handleToggleMemoryVerse = async () => {
    if (existingMemoryVerseId === undefined) return;
    if (!existingMemoryVerseId) {
      await addMemoryVerse({
        text: verse.text,
        verse: verse.verse,
        chapter: cursor.chapter,
        bookId: cursor.bookId,
        version: version,
      });
      CommonEvents.emit("SHOW_TOAST", {
        message: `${verseName} (${version.toUpperCase()}) added to memory verses.`,
      });
    } else {
      await removeMemoryVerse({
        id: existingMemoryVerseId
      })
      CommonEvents.emit("SHOW_TOAST", {
        message: `${verseName} (${version.toUpperCase()}) removed from memory verses.`,
      });
    }

  };

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
          <Ionicons style={[props.style]} name="bookmark" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
      >
        {() => <TText className="text-xs font-bold">Highlight</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name={existingMemoryVerseId ? "heart-outline" : "heart"} size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
        onPress={handleToggleMemoryVerse}
      >
        {() => <TText className="text-xs font-bold">{existingMemoryVerseId ? "Remove" : "Memorise"}</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name="send" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
      >
        {() => <TText className="text-xs font-bold">Send</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name="copy" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
        onPress={handleCopy}
      >
        {() => <TText className="text-xs font-bold">Copy</TText>}
      </Button>
    </View>
  );
};

export default VerseActions;
