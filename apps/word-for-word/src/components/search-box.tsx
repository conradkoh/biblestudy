import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { HITSLOP_DEFAULT, HITSLOP_LARGE } from "@/src/consts/hitslop";
import { SHADOW_SMALL } from "@/src/consts/shadow";
import type { useBibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import {
  bookIdFromName,
  bookNames,
  mapBookIdsToChapterCounts,
  mapBookIdsToName,
  type BibleCursor,
} from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import Fuse from "fuse.js";
import React, { useEffect, useRef, useState, type FC } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";

const NUM_BUTTONS_PER_ROW = 5;
const KEYBOARD_TOOLBAR_HEIGHT = 42;

interface SearchBoxProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  cursorHandler: ReturnType<typeof useBibleCursorHandler>;
}

const fuse = new Fuse(bookNames, {
  includeScore: true,
  threshold: 0.7,
});

const SEARCH_BOOK_ITEM_HEIGHT = 48;
const SearchBox: FC<SearchBoxProps> = ({
  isVisible,
  setIsVisible,
  cursorHandler,
}) => {
  const bible = useBibleStore();
  const themeColors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);

  const [bookNameSearch, setBookNameSearch] = useState("");
  const [chapterSearch, setChapterSearch] = useState("1");
  const [verseSearch, setVerseSearch] = useState("1");
  const [currentFocus, setCurrentFocus] = useState<
    "book" | "chapter" | "verse" | null
  >(null);
  const [isPristine, setIsPristine] = useState(true);
  const chapterTextInputRef = useRef<TextInput>(null);
  const verseTextInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isVisible) {
      setBookNameSearch("");
      setIsPristine(true);
      return;
    }
    setBookNameSearch(mapBookIdsToName[cursorHandler.cursor.bookId]);
    setChapterSearch(`${cursorHandler.cursor.chapter}`);
  }, [isVisible, cursorHandler.cursor.bookId, cursorHandler.cursor.chapter]);

  useEffect(() => {
    if (isVisible && isPristine) {
      const currentBookIndex = bookNames.findIndex(
        (book) => book.toLowerCase() === bookNameSearch.toLowerCase()
      );
      if (currentBookIndex !== -1) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: currentBookIndex * SEARCH_BOOK_ITEM_HEIGHT - 100, // so that it shows the books before the current book
            animated: false,
          });
        }, 100); // scroll after mounting
      }
    }
  }, [isVisible, isPristine, bookNameSearch]);

  const result = fuse.search(bookNameSearch);
  const filteredOptions = (!isPristine && bookNameSearch.length)
    ? result.map((v) => v.item)
    : bookNames;

  const bookId = bookNameSearch ? bookIdFromName(bookNameSearch) : null;
  const maxChapterNumber = bookId ? mapBookIdsToChapterCounts[bookId] : 0;
  const isValidBookName = !!bookId;
  const chapterSearchNum = Number.parseInt(chapterSearch);
  const isValidChapterSearch =
    chapterSearchNum > 0 && chapterSearchNum <= maxChapterNumber;

  const maxVerseNumber =
    isValidBookName && isValidChapterSearch
      ? bible.getBook(bookId, cursorHandler.cursor.version)?.chapters[
        chapterSearchNum - 1
      ]?.verses.length ?? 0
      : 0;
  const verseSearchNum = Number.parseInt(verseSearch);
  const isValidVerseSearch =
    !Number.isNaN(verseSearchNum) &&
    verseSearchNum > 0 &&
    verseSearchNum <= maxVerseNumber;

  const canSubmit =
    isValidBookName && isValidChapterSearch && isValidVerseSearch;

  function onSubmitBook() {
    // Select first option, if any
    if (filteredOptions.length > 0) {
      !isPristine && setBookNameSearch(filteredOptions[0] ?? "");
      setTimeout(() => {
        chapterTextInputRef.current?.focus();
      }, 100);
    }
  }

  function onSubmitChapter() {
    setTimeout(() => {
      verseTextInputRef.current?.focus();
    }, 100);
  }

  function onSubmit(cursor?: Partial<BibleCursor>) {
    if (!canSubmit) return;
    const delta = cursor ?? {
      bookId,
      chapter: chapterSearchNum,
      verse: verseSearchNum,
    };

    if (
      (delta.chapter !== undefined && Number.isNaN(delta.chapter)) ||
      (delta.verse !== undefined && Number.isNaN(delta.verse))
    ) {
      console.warn("Invalid cursor values", delta);
      return;
    }
    cursorHandler.updateCursor(delta);
    setIsVisible(false);
  }

  function onSubmitAccessoryView() {
    if (currentFocus === "book") onSubmitBook();
    if (currentFocus === "chapter") onSubmitChapter();
    if (currentFocus === "verse" && canSubmit)
      onSubmit({
        bookId,
        chapter: chapterSearchNum,
        verse: verseSearchNum,
      });
  }

  const maxButtonNumber =
    currentFocus === "chapter" ? maxChapterNumber : maxVerseNumber;

  return (
    <Modal
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      presentationStyle="overFullScreen"
      transparent={true}
    >

      <SafeAreaView>
        <View className="absolute h-screen w-screen bg-black opacity-40" />
        <KeyboardAvoidingView behavior="padding" className="h-full">
          <TView
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.surfaceSecondary,
              borderWidth: 1,
              marginBottom: KEYBOARD_TOOLBAR_HEIGHT,
            }}
            className="pt-3 pb-1 rounded-sm flex-1"
          >
            <View className="flex flex-row items-center gap-2 px-4 my-2">
              <TextInput
                autoFocus
                selectTextOnFocus
                value={bookNameSearch}
                onChangeText={(text) => {
                  setBookNameSearch(text);
                  setVerseSearch("1");
                  setIsPristine(false);
                  scrollViewRef.current?.scrollTo({
                    y: 0,
                    animated: false,
                  });
                }}
                className="font-bold text-[18px] rounded-md p-2"
                style={{
                  color: themeColors.text,
                  backgroundColor: themeColors.surfaceSecondary,
                }}
                // on return key, focus next
                autoComplete="off"
                autoCorrect={false}
                onSubmitEditing={onSubmitBook}
                onFocus={() => setCurrentFocus("book")}
                onBlur={() => setCurrentFocus(null)}
              />
              <TextInput
                ref={chapterTextInputRef}
                selectTextOnFocus
                value={`${chapterSearch}`}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9]/g, "");
                  setChapterSearch(cleanText);
                  setVerseSearch("1");
                }}
                className="font-bold text-[18px] rounded-md p-2"
                style={{
                  color: isValidChapterSearch
                    ? themeColors.text
                    : themeColors.error,
                  backgroundColor: themeColors.surfaceSecondary,
                }}
                keyboardType="numeric"
                onSubmitEditing={onSubmitChapter}
                onFocus={() => setCurrentFocus("chapter")}
                onBlur={() => setCurrentFocus(null)}
              />
              <TText>:</TText>
              <TextInput
                ref={verseTextInputRef}
                selectTextOnFocus
                value={`${verseSearch}`}
                onChangeText={(text) => {
                  const cleanText = text.replace(/[^0-9]/g, "");
                  setVerseSearch(cleanText);
                }}
                className="font-bold text-[18px] rounded-md p-2"
                style={{
                  color: isValidVerseSearch
                    ? themeColors.text
                    : themeColors.error,
                  backgroundColor: themeColors.surfaceSecondary,
                }}
                keyboardType="numeric"
                onSubmitEditing={() => bookId && onSubmit()}
                onFocus={() => setCurrentFocus("verse")}
                onBlur={() => setCurrentFocus(null)}
              />
              <View className="flex-1" />
              <TouchableOpacity
                className="rounded-md items-center justify-center p-2"
                style={{
                  backgroundColor: themeColors.surfaceSecondary,
                  opacity: canSubmit ? 1 : 0.5,
                }}
                disabled={!canSubmit}
                onPress={() => onSubmit()}
                hitSlop={HITSLOP_DEFAULT}
              >
                <Ionicons
                  size={20}
                  name="arrow-forward"
                  style={{ color: themeColors.text }}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              ref={scrollViewRef}
              className="mt-2 flex-1"
              keyboardShouldPersistTaps="always"
            >
              {currentFocus === "book" &&
                filteredOptions.map((book, i) => {
                  // When search first opens, we show all books in order. In that case, the current
                  // option is the one that matches the search string.
                  const isCurrent = isPristine ? book.toLowerCase() === bookNameSearch.toLowerCase() : i === 0;
                  return (
                    <TouchableOpacity
                      key={book}
                      style={{
                        backgroundColor: isCurrent
                          ? themeColors.surfaceSecondary
                          : themeColors.surface,
                        height: SEARCH_BOOK_ITEM_HEIGHT,
                      }}
                      className="px-4 py-3 flex flex-row items-center"
                      onPress={() => {
                        setBookNameSearch(book);
                        setVerseSearch("1");
                        setTimeout(() => {
                          chapterTextInputRef.current?.focus();
                        }, 100);
                      }}
                    >
                      <TText>{book}</TText>
                      <View className="flex-1" />
                      {isCurrent && (
                        <View
                          className="flex flex-row items-center py-1 px-2 rounded-md"
                          style={{
                            backgroundColor: themeColors.surfaceTertiary,
                          }}
                        >
                          <Ionicons
                            size={20}
                            name="return-down-back-sharp"
                            style={{ color: themeColors.text }}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

              {(currentFocus === "chapter" || currentFocus === "verse") && (
                <View className="flex flex-col px-3" style={{ gap: 12 }}>
                  {Array.from({
                    length: Math.ceil(maxButtonNumber / NUM_BUTTONS_PER_ROW),
                  }).map((_, rowIdx) => {
                    return (
                      <View
                        // biome-ignore lint/suspicious/noArrayIndexKey: idx is valid
                        key={rowIdx}
                        className="justify-between flex-row w-full"
                        style={{ gap: 12 }}
                      >
                        {Array.from({ length: NUM_BUTTONS_PER_ROW }).map(
                          (_, colIdx) => {
                            const number =
                              rowIdx * NUM_BUTTONS_PER_ROW + colIdx + 1;
                            if (number > maxButtonNumber) {
                              return (
                                <View
                                  key={number}
                                  className="flex-1 opacity-0"
                                />
                              );
                            }
                            return (
                              <TouchableOpacity
                                key={number}
                                style={{
                                  flex: 1,
                                  backgroundColor: themeColors.surfaceSecondary,
                                  aspectRatio: 1,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderRadius: 8,
                                }}
                                onPress={() => {
                                  if (currentFocus === "chapter") {
                                    setChapterSearch(`${number}`);
                                    setTimeout(() => {
                                      verseTextInputRef.current?.focus();
                                    }, 100);
                                    return;
                                  }
                                  setVerseSearch(`${number}`);
                                  canSubmit &&
                                    onSubmit({
                                      bookId,
                                      chapter: chapterSearchNum,
                                      verse: number,
                                    });
                                }}
                              >
                                <TText>{number}</TText>
                              </TouchableOpacity>
                            );
                          },
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </TView>
        </KeyboardAvoidingView>
        <KeyboardStickyView className="absolute bottom-0 w-screen">
          <TView
            className="w-full h-full flex flex-row items-center justify-between py-2 px-4"
            style={{ ...SHADOW_SMALL, height: KEYBOARD_TOOLBAR_HEIGHT }}
          >
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              hitSlop={HITSLOP_LARGE}
            >
              <TText className="font-bold">Cancel</TText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmitAccessoryView}
              hitSlop={HITSLOP_LARGE}
              disabled={!canSubmit && currentFocus === "verse"}
              style={{
                opacity: !canSubmit && currentFocus === "verse" ? 0.5 : 1,
              }}
            >
              <TText className="font-bold">
                {currentFocus !== "verse"
                  ? "Next"
                  : `Go to ${bookNameSearch} ${chapterSearch}:${verseSearch}`}
              </TText>
            </TouchableOpacity>
          </TView>
        </KeyboardStickyView>

      </SafeAreaView>
    </Modal>
  );
};

export default SearchBox;
