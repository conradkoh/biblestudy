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
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";

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
  const [chapterSearch, setChapterSearch] = useState("");
  const [currentFocus, setCurrentFocus] = useState<"book" | "chapter" | null>(
    null
  );
  const chapterTextInputRef = useRef<TextInput>(null);

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

  const canSubmit = isValidBookName && isValidChapterSearch;

  function onSubmitBook() {
    // Select first option, if any
    if (filteredOptions.length > 0) {
      setBookNameSearch(filteredOptions[0]);
      setChapterSearch("");
      chapterTextInputRef.current?.focus();
    }
  }

  function onSubmit() {
    if (!canSubmit) return;
    bible.setBookSlug(bookSlug);
    bible.setChapterIdx(chapterSearchNum - 1);
    setIsVisible(false);
  }

  return (
    <Modal
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      transparent={true}
    >
      <TouchableOpacity
        className="absolute h-screen w-screen bg-black opacity-40"
        onPress={() => setIsVisible(false)}
      />
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
              onChangeText={setBookNameSearch}
              className="font-bold text-[18px] rounded-md p-2"
              style={{
                color: themeColors.text,
                backgroundColor: themeColors.backgroundSecondary,
              }}
              // on return key, focus next
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
              }}
              keyboardType="numeric"
              className="font-bold text-[18px] rounded-md p-2"
              style={{
                color: isValidChapterSearch
                  ? themeColors.text
                  : themeColors.negative,
                backgroundColor: themeColors.backgroundSecondary,
              }}
              onSubmitEditing={onSubmit}
              onFocus={() => setCurrentFocus("chapter")}
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
                          style={{ color: themeColors.text }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </TView>
      </SafeAreaView>
    </Modal>
  );
};

export default SearchBox;
