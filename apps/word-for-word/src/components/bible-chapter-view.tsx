import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import { mapBookIdsToName } from "@common/utils/bible-data-utils";
import React, { useImperativeHandle, useRef } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

type BibleChapterView = {
  cursorHandler: BibleCursorHandler;
  onPressVerse: (verse: number) => void;
  onLongPressVerse: (verse: number) => void;
  highlightedVerses?: number[];
  onScrollBegin?: () => void;
};

export type BibleChapterViewRef = {
  scrollToVerse: (verse: number) => void;
};

const BibleChapterView = React.forwardRef<
  BibleChapterViewRef,
  BibleChapterView
>(({ cursorHandler, onPressVerse, onLongPressVerse, highlightedVerses, onScrollBegin }, forwardRef) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const bible = useBibleStore();
  const settings = useSettingsStore();
  const themeColors = useThemeColors();
  const verseYCoordsRef = useRef<{ [verseIdx: number]: number }>({});

  useImperativeHandle(
    forwardRef,
    () => ({
      scrollToVerse: (verse: number) => {
        const verseIdx = verse - 1;
        const y = verseYCoordsRef.current[verseIdx];
        if (!y) {
          console.warn(`Verse ${verse} element ref not found`);
          return;
        }

        scrollViewRef.current?.scrollTo({ y: y, animated: false });
      },
    }),
    [],
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      onScrollBeginDrag={onScrollBegin}
    >
      <TView className="px-6">
        <TView className="flex-row items-end mb-2 mt-12">
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
              {bible.versions[cursorHandler.cursor.version]?.abbreviation.toUpperCase()}
            </TText>
          </TouchableOpacity>
        </TView>
        <TText>
          {bible.getChapterFormatted(cursorHandler.cursor).map((verse, i) => {
            const isHighlighted = highlightedVerses?.includes(i + 1);;
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
                      color: isHighlighted
                        ? themeColors.textHighlight
                        : undefined,
                    }}
                  >
                    {" "}
                    {i + 1}{" "}
                  </TText>
                  {/* Used as marker for position. Must be after first TText so it doesn't interfere with lineheight */}
                  <View
                    key={`${verse.name}-marker`}
                    onLayout={(e) => {
                      verseYCoordsRef.current[i] = e.nativeEvent.layout.y;
                    }}
                  />
                  <TText
                    type="paragraph"
                    style={{
                      fontSize: settings.textSize,
                      fontWeight: settings.fontWeight,
                      fontFamily: settings.paragraphFontFamily,
                      color: isHighlighted
                        ? themeColors.textHighlight
                        : undefined,
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
    </ScrollView>
  );
});
export default BibleChapterView;
