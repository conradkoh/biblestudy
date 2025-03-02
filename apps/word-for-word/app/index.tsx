import BibleChapterView, {
  BibleChapterViewRef,
} from "@/src/components/bible-chapter-view";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import SearchBox from "@/src/components/search-box";
import VerseDetailBottomSheet from "@/src/components/verse-detail-bottom-sheet";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { useBibleBookmark } from "@/src/hooks/useBibleBookmark";
import { useBibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import { BibleCursor, mapBookIdsToName } from "@/src/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useCallback, useRef, useState } from "react";
import { SafeAreaView, TouchableOpacity, View, Text } from "react-native";

export default function ReadScreen() {
  const bible = useBibleStore();
  const settings = useSettingsStore();
  const bibleChapterViewRef = useRef<BibleChapterViewRef | null>(null);
  const onCursorChange = useCallback((delta: Partial<BibleCursor>) => {
    const verse = delta.verse;
    if (verse) {
      // next tick
      setTimeout(() => {
        bibleChapterViewRef.current?.scrollToVerse(verse);
      }, 200);
      return;
    }

    if (delta.chapter) {
      // next tick
      setTimeout(() => {
        bibleChapterViewRef.current?.scrollToVerse(1);
      });
      return;
    }
  }, []);

  const cursorHandler = useBibleCursorHandler(onCursorChange);

  useBibleBookmark(bible, cursorHandler);
  const themeColors = useThemeColors();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [showInterlinear, setShowInterlinear] = useState(false);

  const interlinearCursorHandler = useBibleCursorHandler();

  function onPressVerse(verse: number) {
    setShowInterlinear(true);
    interlinearCursorHandler.updateCursor({
      ...cursorHandler.cursor,
      verse,
    });
  }
  return (
    <BottomSheetModalProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
        }}
      >
        <TView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <BibleChapterView
            ref={bibleChapterViewRef}
            cursorHandler={cursorHandler}
            onPressVerse={onPressVerse}
            highlightedVerse={
              showInterlinear
                ? interlinearCursorHandler.cursor.verse
                : undefined
            }
          />
          <View
            className="flex flex-row items-center justify-between px-2 h-10"
            style={{
              backgroundColor: themeColors.backgroundSecondary,
            }}
          >
            <TouchableOpacity
              hitSlop={HITSLOP_DEFAULT}
              onPress={() => cursorHandler?.goPrev()}
            >
              <Ionicons
                size={20}
                name="arrow-back-sharp"
                style={{ color: themeColors.text }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex flex-row items-center justify-center flex-1"
              onPress={() => setIsSearchVisible(true)}
            >
              <Ionicons
                size={18}
                name="search-sharp"
                style={{ color: themeColors.text }}
              />
              <TText className="font-bold text-[18px] ml-1">
                {mapBookIdsToName[cursorHandler.cursor.bookId]} Chapter{" "}
                {cursorHandler?.cursor.chapter}
              </TText>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={HITSLOP_DEFAULT}
              onPress={() => cursorHandler?.goNext()}
            >
              <Ionicons
                size={20}
                name="arrow-forward-sharp"
                style={{ color: themeColors.text }}
              />
            </TouchableOpacity>
          </View>
        </TView>
      </SafeAreaView>
      <SearchBox
        isVisible={isSearchVisible}
        setIsVisible={setIsSearchVisible}
        cursorHandler={cursorHandler}
      />
      <VerseDetailBottomSheet
        isOpen={showInterlinear}
        setIsOpen={setShowInterlinear}
        cursorHandler={interlinearCursorHandler}
      />
    </BottomSheetModalProvider>
  );
}
