import BibleChapterView, {
  type BibleChapterViewRef,
} from "@/src/components/bible-chapter-view";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
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
import {
  type BibleCursor,
  mapBookIdsToName,
} from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View, PanResponder, Animated, Dimensions, GestureResponderEvent, PanResponderGestureState } from "react-native";
import * as Haptics from 'expo-haptics';
import SwipeableContainer from "@/src/components/swipeable-container";


export default function ReadScreen() {
  const bible = useBibleStore();
  const settings = useSettingsStore();
  const bibleChapterViewRef = useRef<BibleChapterViewRef | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

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
  const scrollTimeout = useRef<NodeJS.Timeout>();


  // Handle scroll state
  const handleScrollBegin = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150); // Reset after 150ms of no scrolling
  }, []);

  function onPressVerse(verse: number) {
    setShowInterlinear(true);
    interlinearCursorHandler.updateCursor({
      ...cursorHandler.cursor,
      verse,
    });
  }

  return (
    <>
      <TSafeAreaView
        style={{
          flex: 1,
        }}
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
              highlightedVerse={
                showInterlinear
                  ? interlinearCursorHandler.cursor.verse
                  : undefined
              }
              onScrollBegin={handleScrollBegin}
            />
          </SwipeableContainer>

          <View
            className="flex flex-row items-center justify-between px-2 h-10"
            style={{
              backgroundColor: themeColors.surfaceSecondary,
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
      </TSafeAreaView>
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
    </>
  );
}
