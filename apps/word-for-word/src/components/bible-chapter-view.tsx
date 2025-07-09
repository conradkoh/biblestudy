import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { CommonEvents } from "@/src/hooks/useEvents";
import { sessionLogger } from "@/src/hooks/useSessionLogger";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { toSuperscript, useBibleStore } from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import { mapBookIdsToName } from "@common/utils/bible-data-utils";
import { isDefined } from "@common/utils/typecheck";
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { NativeSyntheticEvent, NativeScrollEvent, ScrollView, TouchableOpacity, View, DimensionValue, useWindowDimensions } from "react-native";
import Reanimated, { useDerivedValue } from "react-native-reanimated";
import { SharedValue } from "react-native-reanimated";

type BibleChapterView = {
  cursorHandler: BibleCursorHandler;
  onPressVerse: (verse: number) => void;
  onLongPressVerse: (verse: number) => void;
  highlightedVerses?: number[];
  selectedVerses?: number[];
  onScrollBegin?: () => void;
  marginBottom?: SharedValue<number>;
};

export type BibleChapterViewRef = {
  scrollToVerse: (verse: number) => void;
  highlightSearchResult: (verse: number) => void;
};

const BibleChapterView = React.forwardRef<
  BibleChapterViewRef,
  BibleChapterView
>(({ cursorHandler, onPressVerse, onLongPressVerse, highlightedVerses, selectedVerses, onScrollBegin, marginBottom }, forwardRef) => {
  const scrollViewRef = useRef<Reanimated.ScrollView>(null);
  const bible = useBibleStore();
  const settings = useSettingsStore();
  const themeColors = useThemeColors();
  const verseYCoordsRef = useRef<{ [verseIdx: number]: number }>({});
  const scrollYRef = useRef(0);
  const scrollViewHeightRef = useRef(0);

  // Search result highlighting state
  const [searchResultHighlight, setSearchResultHighlight] = useState<{
    verses: number[];
    timestamp: number;
  } | null>(null);

  // Auto-clear search result highlighting after 3 seconds
  useEffect(() => {
    if (searchResultHighlight) {
      const timer = setTimeout(() => {
        setSearchResultHighlight(null);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [searchResultHighlight]);

  useEffect(() => {
    const unmount = sessionLogger.mountBibleChapterView(cursorHandler, verseYCoordsRef, scrollYRef, scrollViewHeightRef);
    return unmount;
  }, [cursorHandler]);

  useImperativeHandle(
    forwardRef,
    () => ({
      scrollToVerse: (verse: number) => {
        const verseIdx = verse - 1;
        const verseY = verseYCoordsRef.current[verseIdx];
        if (!isDefined(verseY)) {
          console.warn(`Verse ${verse} element ref not found`);
          return;
        }

        if (verseIdx === 0) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: false }); // scroll to top
          return;
        }

        scrollViewRef.current?.scrollTo({ y: verseY, animated: false });
      },
      highlightSearchResult: (verse: number) => {
        setSearchResultHighlight({
          verses: [verse],
          timestamp: Date.now()
        });
      },
    }),
    [],
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const verses = bible.getChapterFormatted(cursorHandler.cursor);

  return (
    <Reanimated.ScrollView
      ref={scrollViewRef}
      onScrollBeginDrag={onScrollBegin}
      onScroll={onScroll}
      onLayout={e => {
        scrollViewHeightRef.current = e.nativeEvent.layout.height;
      }}
      style={{ marginBottom }}
    >
      <TView className="px-6" >
        <TView className="flex-row items-end mb-2 mt-6">
          <TText type="title">
            {mapBookIdsToName[cursorHandler.cursor.bookId]}{" "}
            {cursorHandler.cursor.chapter}
          </TText>
          <TouchableOpacity onPress={() => {
            CommonEvents.emit("SHOW_OPTION_SELECTOR_BOTTOM_SHEET", {
              snapPoint: 200,
              title: "Select Bible Version",
              options: Object.values(bible.versions).map((v) => ({
                id: v.id,
                label: v.abbreviation.toUpperCase(),
                onSelect: () => {
                  cursorHandler.updateCursor({ version: v.id });
                },
              })),
            });
          }}>
            <TText
              type="subtitle"
              className="text-sm mb-1 ml-1"
              style={{ color: themeColors.textSecondary }}
            >
              {bible.getTranslation(cursorHandler.cursor.version).abbreviation.toUpperCase()}
            </TText>
          </TouchableOpacity>
        </TView>
        <TText
          onTextLayout={e => {
            const { lines } = e.nativeEvent;
            let currentTextLength = 0;
            let currentVerseIndex = 0;
            let currentVerseTextLength = 0;
            for (const line of lines) {
              currentTextLength += line.text.length;
              if (currentTextLength > currentVerseTextLength) {
                const currentVerse = verses[currentVerseIndex];
                if (!currentVerse) break;
                currentVerseTextLength += ` ${currentVerse.verse} `.length + currentVerse.text.length;
                verseYCoordsRef.current[currentVerseIndex] = line.y;
                currentVerseIndex++;
              }
            }
          }}>
          {verses.map((verse, i) => {
            // Combine external highlighting with internal search result highlighting
            const isHighlighted = highlightedVerses?.includes(i + 1) ||
              searchResultHighlight?.verses.includes(i + 1);
            const isSelected = selectedVerses?.includes(i + 1);
            return (
              <React.Fragment key={verse.name}>
                <TText
                  onPress={() => onPressVerse(i + 1)}
                  onLongPress={() => onLongPressVerse(i + 1)}
                >
                  <TText
                    className="ml-1 font-bold"
                    style={{
                      // since this component comes first, line height determined here
                      lineHeight: settings.lineHeight,
                      ...isHighlighted && { backgroundColor: themeColors.surfaceHighlight },
                    }}
                  >
                    {` ${toSuperscript(verse.verse)} `}
                  </TText>
                  {/* Used as marker for position. Must be after first TText so it doesn't interfere with lineheight */}
                  <TText
                    style={{
                      fontSize: settings.textSize,
                      fontWeight: settings.fontWeight,
                      fontFamily: settings.paragraphFontFamily,
                      ...isHighlighted && { backgroundColor: themeColors.surfaceHighlight },
                      ...isSelected && { textDecorationLine: 'underline', textDecorationStyle: 'dotted' }
                    }}
                  >
                    {verse.text}
                  </TText>
                </TText>
              </React.Fragment>
            );
          })}
        </TText>
      </TView>
    </Reanimated.ScrollView>
  );
});
export default BibleChapterView;
