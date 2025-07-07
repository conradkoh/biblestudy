import BibleChapterView, {
  type BibleChapterViewRef,
} from "@/src/components/bible-chapter-view";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { BibleSearchBottomSheet } from "@/src/components/search/bible-search-bottom-sheet";
import SwipeableContainer from "@/src/components/swipeable-container";
import VerseDetailBottomSheet from "@/src/components/verse-detail-bottom-sheet";
import VerseRangeBottomSheet from "@/src/components/verse-range-bottom-sheet";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { useBibleBookmark } from "@/src/hooks/useBibleBookmark";
import { useBibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useSessionLogger } from "@/src/hooks/useSessionLogger";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import type { SearchResultItem } from "@/src/types/search";
import {
  type BibleCursor,
  getVersesFromRange,
  mapBookIdsToName,
} from "@common/utils/bible-data-utils";
import { isDefined } from "@common/utils/typecheck";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import { TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChapterVerseSelector from "@/src/components/chapter-verse-selector";

const BIBLE_CHAPTER_CONTROLS_HEIGHT = 40;

export default function ReadScreen() {
  const bible = useBibleStore();
  const settings = useSettingsStore();
  const bibleChapterViewRef = useRef<BibleChapterViewRef | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const bottomSheetAnimatedValue = useSharedValue(0);

  const dimensions = useWindowDimensions();

  const chapterViewMarginBottom = useDerivedValue(() => {
    if (!bottomSheetAnimatedValue.value) return 0;
    return Math.max(dimensions.height - bottomSheetAnimatedValue.value - tabBarHeight - BIBLE_CHAPTER_CONTROLS_HEIGHT, 0);
  }, [bottomSheetAnimatedValue]);

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
  const [isChapterVerseSelectorVisible, setIsChapterVerseSelectorVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showFocusVerseSingle, setShowFocusVerseSingle] = useState(false);
  const [showFocusVerseRange, setShowFocusVerseRange] = useState(false);
  const [isSelectingRange, setIsSelectingRange] = useState(false)
  const focusCursorHandler = useBibleCursorHandler();

  useSessionLogger();

  // Handle search result selection to trigger highlighting
  const handleSearchResultSelect = useCallback((result: SearchResultItem) => {
    // Trigger highlighting in BibleChapterView
    bibleChapterViewRef.current?.highlightSearchResult(result.verse);
  }, []);

  function onPressVerse(verse: number) {

    // Reset ranges
    setShowFocusVerseRange(false);
    cursorHandler.setCursorRangeEnd(null);

    setShowFocusVerseSingle(true);
    focusCursorHandler.updateCursor({
      ...cursorHandler.cursor,
      verse
    });
  }


  const handleLongPressVerse = (longPressVerse: number) => {
    setShowFocusVerseSingle(false);

    if (focusCursorHandler.cursor.verse === undefined) return;

    if (longPressVerse === focusCursorHandler.cursor.verse) {
      focusCursorHandler.setCursorRangeEnd(null);
      setShowFocusVerseRange(false);
      return;
    }

    if (longPressVerse > focusCursorHandler.cursor.verse) {

      focusCursorHandler.setCursorRangeEnd({
        chapter: focusCursorHandler.cursor.chapter,
        bookId: focusCursorHandler.cursor.bookId,
        verse: longPressVerse,
      });
      setShowFocusVerseRange(true);
      return;
    }

    // Long press is before selection,
    const { bookId, chapter, verse } = focusCursorHandler.cursor;

    focusCursorHandler.setCursor({
      ...focusCursorHandler.cursor,
      verse: longPressVerse,
    });

    focusCursorHandler.setCursorRangeEnd({
      bookId,
      chapter,
      verse,
    });

    setShowFocusVerseRange(true);
  };

  return (
    <>
      <TSafeAreaView
        style={{
          flex: 1,
        }}
        edges={['top']}
      >
        <TView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SwipeableContainer
            isScrolling={isScrolling}
            onNext={cursorHandler.goNext}
            onPrev={cursorHandler.goPrev}
            nextHint={cursorHandler.hasNextChapterInSameBook() ?
              <TText
                style={{
                  fontSize: 24,
                  color: themeColors.text,
                  fontWeight: "bold",
                }}
              >
                {cursorHandler.cursor.chapter + 1}
              </TText> : <Ionicons name="arrow-forward-sharp" size={24} color={themeColors.text} />}
            prevHint={cursorHandler.hasPrevChapterInSameBook() ? <TText
              style={{
                fontSize: 24,
                color: themeColors.text,
                fontWeight: "bold",
              }}
            >
              {cursorHandler.cursor.chapter - 1}
            </TText> : <Ionicons name="arrow-back-sharp" size={24} color={themeColors.text} />}
          >
            <BibleChapterView
              ref={bibleChapterViewRef}
              cursorHandler={cursorHandler}
              onPressVerse={onPressVerse}
              onLongPressVerse={handleLongPressVerse}
              highlightedVerses={
                (showFocusVerseRange && focusCursorHandler.cursorRangeEnd?.verse !== undefined) ? getVersesFromRange(focusCursorHandler.cursor, focusCursorHandler.cursorRangeEnd) :
                  (showFocusVerseSingle && focusCursorHandler.cursor.verse !== undefined)
                    ? [focusCursorHandler.cursor.verse]
                    : undefined
              }
              marginBottom={chapterViewMarginBottom}
            />
          </SwipeableContainer>

          <View
            className="flex flex-row items-center px-2"
            style={{
              backgroundColor: themeColors.surfaceSecondary,
              height: BIBLE_CHAPTER_CONTROLS_HEIGHT
            }}
          >
            <TouchableOpacity
              className="flex flex-row items-center justify-center flex-1 mx-2"
              onPress={() => setIsSearchVisible(true)}
            >
              <TText className="font-bold text-[18px]">
                {mapBookIdsToName[cursorHandler.cursor.bookId]} Chapter{" "}
                {cursorHandler?.cursor.chapter}
              </TText>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={HITSLOP_DEFAULT}
              onPress={() => setIsSearchVisible(true)}
            >
              <Ionicons
                size={20}
                name="search-sharp"
                style={{ color: themeColors.textHighlight }}
              />
            </TouchableOpacity>
          </View>
        </TView>
        <ChapterVerseSelector
          isVisible={isChapterVerseSelectorVisible}
          setIsVisible={setIsChapterVerseSelectorVisible}
          cursorHandler={cursorHandler}
        />
        <BibleSearchBottomSheet
          isVisible={isSearchVisible}
          onClose={() => setIsSearchVisible(false)}
          cursorHandler={cursorHandler}
          onSearchResultSelect={handleSearchResultSelect}
        />
        <VerseDetailBottomSheet
          isOpen={showFocusVerseSingle}
          setIsOpen={setShowFocusVerseSingle}
          cursorHandler={focusCursorHandler}
          bibleCursorHandler={cursorHandler}
          setIsSelectingRange={() => {
            setIsSelectingRange(true);
            setShowFocusVerseRange(false);
            setShowFocusVerseSingle(false);
          }}
          bottomSheetAnimatedValue={bottomSheetAnimatedValue}
        />
        <VerseRangeBottomSheet
          isOpen={showFocusVerseRange}
          setIsOpen={setShowFocusVerseRange}
          cursorHandler={focusCursorHandler}
        />
      </TSafeAreaView>
    </>
  );
}
