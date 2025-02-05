import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleCursor } from "@/src/stores/bible-store";
import React, { FC, useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Modal, SafeAreaView, TextInput } from "react-native";
import Fuse from "fuse.js";
import { bookNames, bookNameToSlug } from "@/src/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import { HITSLOP_DEFAULT, HITSLOP_LARGE } from "@/src/consts/hitslop";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { CommonEvents } from "@/src/hooks/useEvents";

interface SearchBoxProps {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

const fuse = new Fuse(bookNames, {
  includeScore: true,
  threshold: 0.7,
});

const SearchBox: FC<SearchBoxProps> = ({ isVisible, setIsVisible }) => {
  const bible = useBibleCursor();
  const themeColors = useThemeColors();

  const [bookNameSearch, setBookNameSearch] = useState("");
  const [chapterSearch, setChapterSearch] = useState("1");
  const [verseSearch, setVerseSearch] = useState("1");
  const [currentFocus, setCurrentFocus] = useState<
    "book" | "chapter" | "verse" | null
  >(null);
  const chapterTextInputRef = useRef<TextInput>(null);
  const verseTextInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isVisible) {
      setBookNameSearch("");
      return;
    }
    setBookNameSearch(bible.getCurrentBookName());
    setChapterSearch(`${bible.chapterIdx + 1}`);
  }, [isVisible, bible]);

  const result = fuse.search(bookNameSearch);
  const filteredOptions = bookNameSearch.length
    ? result.map((v) => v.item)
    : bookNames;

  const bookSlug = bookNameToSlug(bookNameSearch ?? "");
  const isValidBookName = Boolean(bookSlug);
  const maxChapterNumber = isValidBookName
    ? (bible.getBook(bookSlug)?.chapters.length ?? -1) + 1
    : 0;

  const chapterSearchNum = Number.parseInt(chapterSearch);
  const isValidChapterSearch =
    chapterSearchNum > 0 && chapterSearchNum <= maxChapterNumber;

  const maxVerseNumber =
    isValidBookName && isValidChapterSearch
      ? // biome-ignore lint/style/noNonNullAssertion: isValidBookName checks for valid book
        bible.getBook(bookSlug)!.chapters[chapterSearchNum - 1].verses.length
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
      setBookNameSearch(filteredOptions[0]);
      chapterTextInputRef.current?.focus();
    }
  }

  function onSubmitChapter() {
    verseTextInputRef.current?.focus();
  }

  function onSubmit() {
    if (!canSubmit) return;
    bible.setBookSlug(bookSlug);
    bible.setChapterIdx(chapterSearchNum - 1);
    setIsVisible(false);
    // next tick
    !Number.isNaN(verseSearchNum) &&
      setTimeout(() => {
        CommonEvents.emit("ON_VERSE_CHANGE", verseSearchNum);
      }, 100);
  }

  function onSubmitAccessoryView() {
    if (currentFocus === "book") onSubmitBook();
    if (currentFocus === "chapter") onSubmitChapter();
    if (currentFocus === "verse" && canSubmit) onSubmit();
  }

  return (
    <Modal
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      presentationStyle="overFullScreen"
      transparent={true}
    >
      <View className="absolute h-screen w-screen bg-black opacity-40" />
      <SafeAreaView>
        <TView
          style={{
            backgroundColor: themeColors.background,
            borderColor: themeColors.backgroundSecondary,
            borderWidth: 1,
          }}
          className="py-3 rounded-md mx-4 mt-[30%]"
        >
          <View className="flex flex-row items-center gap-2 px-4 ">
            <TextInput
              autoFocus
              selectTextOnFocus
              value={bookNameSearch}
              onChangeText={(text) => {
                setBookNameSearch(text);
                setVerseSearch("1");
              }}
              className="font-bold text-[18px] rounded-md p-2"
              style={{
                color: themeColors.text,
                backgroundColor: themeColors.backgroundSecondary,
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
              keyboardType="numeric"
              className="font-bold text-[18px] rounded-md p-2"
              style={{
                color: isValidChapterSearch
                  ? themeColors.text
                  : themeColors.negative,
                backgroundColor: themeColors.backgroundSecondary,
              }}
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
              keyboardType="numeric"
              className="font-bold text-[18px] rounded-md p-2"
              style={{
                color: isValidVerseSearch
                  ? themeColors.text
                  : themeColors.negative,
                backgroundColor: themeColors.backgroundSecondary,
              }}
              onSubmitEditing={onSubmit}
              onFocus={() => setCurrentFocus("verse")}
              onBlur={() => setCurrentFocus(null)}
            />
            <View className="flex-1" />
            <TouchableOpacity
              className="rounded-md items-center justify-center p-2"
              style={{
                backgroundColor: themeColors.backgroundSecondary,
                opacity: canSubmit ? 1 : 0.5,
              }}
              disabled={!canSubmit}
              onPress={onSubmit}
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
            className="max-h-[240px] mt-2"
            keyboardShouldPersistTaps="always"
          >
            {currentFocus === "book" &&
              filteredOptions.map((book, i) => {
                const isFirstOption = i === 0;
                return (
                  <TouchableOpacity
                    key={book}
                    style={{
                      backgroundColor: isFirstOption
                        ? themeColors.backgroundSecondary
                        : themeColors.background,
                    }}
                    className="px-4 py-3 flex flex-row items-center"
                    onPress={() => {
                      setBookNameSearch(book);
                      chapterTextInputRef.current?.focus();
                      setVerseSearch("1");
                    }}
                  >
                    <TText>{book}</TText>
                    <View className="flex-1" />
                    {isFirstOption && (
                      <View
                        className="flex flex-row items-center py-1 px-2 rounded-md"
                        style={{
                          backgroundColor: themeColors.surfaceHighlight,
                        }}
                      >
                        <Ionicons
                          size={20}
                          name="return-down-back-sharp"
                          style={{ color: themeColors.contrastText }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </TView>
      </SafeAreaView>
      <KeyboardStickyView className="absolute bottom-0 w-screen">
        <TView className="w-full h-full flex flex-row items-center justify-between py-2 px-4">
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
              {currentFocus !== "verse" ? "Next" : "Go"}
            </TText>
          </TouchableOpacity>
        </TView>
      </KeyboardStickyView>
    </Modal>
  );
};

export default SearchBox;
