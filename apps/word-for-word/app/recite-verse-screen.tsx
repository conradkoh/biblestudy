import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import {
  type BibleCursorRangeEnd,
  getVerseNameFormatted,
  isBookId,
  mapBookIdsToName,
  type BibleCursor,
  type BookId,
} from "@common/utils/bible-data-utils";
import { isWord, tokeniseVerse, type Token } from "@/src/utils/verse-tokenizer";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import { Button } from "@/src/components/core/Button";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { isDefined } from "@common/utils/typecheck";

function memoryVerseToCursor(
  memoryVerse: Doc<"memoryVerses"> | null | undefined,
): { cursor: Required<BibleCursor>; endCursor?: BibleCursorRangeEnd } | undefined {
  if (!memoryVerse) return undefined;
  if (!isBookId(memoryVerse.bookId)) return undefined;
  return {
    cursor: {
      bookId: memoryVerse.bookId as BookId,
      chapter: memoryVerse.chapter,
      verse: memoryVerse.verse,
      version: memoryVerse.version,
    },
    endCursor:
      isDefined(memoryVerse.endVerse) &&
        isDefined(memoryVerse.endChapter) &&
        isDefined(memoryVerse.endBookId) &&
        isBookId(memoryVerse.endBookId)
        ? {
          chapter: memoryVerse.endChapter,
          verse: memoryVerse.endVerse,
          bookId: memoryVerse.endBookId,
        }
        : undefined,
  };
}

export default function MemoryVersePracticeScreen() {
  const { verseId } = useLocalSearchParams<{ verseId: Id<"memoryVerses"> }>();
  const themeColors = useThemeColors();
  const bible = useBibleStore();

  const memoryVerse = useQuery(api.memoryVerses.getMemoryVerse, {
    id: verseId,
  });
  const addMemoryEntry = useMutation(api.memoryVerses.addMemoryEntry);
  const { cursor: memoryVerseCursor, endCursor: memoryVerseEndCursor } = memoryVerseToCursor(memoryVerse) ?? {};

  const verseRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [isPeeking, setIsPeeking] = useState(true);
  const [userText, setUserText] = useState("");

  const memoryVerseText = memoryVerseCursor ? bible.getVersesText(memoryVerseCursor, memoryVerseEndCursor) : undefined;

  useEffect(() => {
    if (isPeeking) {
      inputRef.current?.blur();
      setUserText("");
    } else {
      inputRef.current?.focus();
    }
  }, [isPeeking]);

  const handleTextChange = (text: string) => {
    if (text === " ") {
      setUserText("");
      return;
    }
    setUserText(text);

    if (!memoryVerse || !memoryVerseText) return;
    const latestTokens = tokeniseVerse(memoryVerseText, text);
    // Check if the verse is complete
    const isComplete = latestTokens
      .filter((t) => isWord(t.text))
      .every((token: Token) => token.userAttempted && token.match);
    if (isComplete) handleVerseComplete();
  };

  const handleVerseComplete = async () => {
    if (!memoryVerseCursor) return;
    Alert.alert(
      "Well done!",
      `You have successfully recited ${getVerseNameFormatted(memoryVerseCursor)}`,
    );
    if (!verseId) return;
    await addMemoryEntry({ memoryVerseId: verseId });
    setUserText("");
    setIsPeeking(true);
    router.replace({ pathname: "/memory-verses-screen" });
  };

  const togglePeek = () => {
    setIsPeeking(!isPeeking);
  };

  if (!memoryVerse || !memoryVerseCursor || !memoryVerseText) {
    return (
      <TSafeAreaView className="flex-1 items-center justify-center">
        <TText>Loading...</TText>
      </TSafeAreaView>
    );
  }

  const tokens = tokeniseVerse(memoryVerseText, userText);

  return (
    <TSafeAreaView className="flex-1">
      <View className="flex-row items-center justify-between p-4">
        <Button onPress={() => router.back()}>
          {(props) => <TText {...props}>Back</TText>}
        </Button>
        <TText>{getVerseNameFormatted(memoryVerseCursor, memoryVerseEndCursor, true)}</TText>
      </View>
      <ScrollView ref={verseRef} className="flex-1 p-4">
        <View className="flex-row flex-wrap">
          {tokens.map((token: Token, index: number) => {
            let tokenTextColor = themeColors.text;
            let tokenBackgroundColor = "transparent";
            const isSolved = token.match && token.userAttempted;

            const revealToken = token.isDelimiter || isPeeking;

            if (!revealToken) {
              tokenTextColor = themeColors.secondary;
              tokenBackgroundColor = themeColors.secondary;

              if (isSolved) {
                tokenTextColor = themeColors.success;
                tokenBackgroundColor = themeColors.success;
              }

              if (token.userAttempted) {
                tokenTextColor = token.match
                  ? themeColors.success
                  : themeColors.error;
                tokenBackgroundColor = token.match
                  ? themeColors.success
                  : themeColors.error;
              }
            }

            return (
              <TText
                key={`token-${token.text}-${index}`}
                style={{
                  color: tokenTextColor,
                  backgroundColor: tokenBackgroundColor,
                }}
              >
                {token.text}
              </TText>
            );
          })}
        </View>
      </ScrollView>

      <KeyboardAvoidingView behavior="padding">
        <View
          className="p-4"
          style={{
            backgroundColor: themeColors.surfaceSecondary,
            borderTopColor: themeColors.border,
            borderTopWidth: 1,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1" />
            <Button
              onPress={togglePeek}
              leadingIcon={(props) => (
                <Ionicons
                  {...props}
                  name={isPeeking ? "eye-off" : "eye"}
                  size={16}
                />
              )}
            >
              {(props) => (
                <TText className="ml-1" {...props}>
                  {isPeeking ? "Hide" : "Show"}
                </TText>
              )}
            </Button>
          </View>

          <TextInput
            ref={inputRef}
            multiline
            placeholder={
              isPeeking
                ? "Start typing to recite from memory..."
                : "Enter verse..."
            }
            onFocus={() => setIsPeeking(false)}
            placeholderTextColor={themeColors.textSecondary}
            value={userText}
            onChangeText={handleTextChange}
            className="p-2 rounded-md min-h-[100px]"
            style={{
              color: themeColors.text,
              backgroundColor: themeColors.surfaceTertiary,
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </TSafeAreaView>
  );
}
