import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { VersionSelector } from "@/src/components/version-selector";
import {
  BibleCursorHandler,
  useBibleCursorHandler,
} from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import { mapBookIdsToName } from "@/src/utils/bible-data-utils";
import React, { FC, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

interface BibleChapterViewProps {
  cursorHandler: BibleCursorHandler;
}

const BibleChapterView: FC<BibleChapterViewProps> = ({ cursorHandler }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const bible = useBibleStore();
  const settings = useSettingsStore();
  const themeColors = useThemeColors();
  const verseYCoordsRef = useRef<{ [verseIdx: number]: number }>({});

  const [showInterlinear, setShowInterlinear] = useState(false);
  const interlinearCursor = useBibleCursorHandler();

  function onPressVerse(verse: number) {
    setShowInterlinear(true);
    interlinearCursor.updateCursor({
      ...cursorHandler.cursor,
      verse,
    });
    // setCurrentStrongsWord(undefined);
    // bottomSheetRef.current?.snapToIndex(0);
  }

  return (
    <ScrollView ref={scrollViewRef}>
      <TView className="px-6">
        <TView className="flex-row items-end mb-2 mt-12">
          <TText type="title">
            {mapBookIdsToName[cursorHandler.cursor.bookId]}{" "}
            {cursorHandler.cursor.chapter}
          </TText>
          <VersionSelector cursorHandler={cursorHandler} />
        </TView>
        <TText>
          {bible.getChapterFormatted(cursorHandler.cursor).map((verse, i) => {
            const isCurrentVerse =
              showInterlinear && interlinearCursor.cursor.verse === i;
            return (
              <React.Fragment key={verse.name}>
                <TText onPress={() => onPressVerse(i + 1)}>
                  <TText
                    className="ml-1 font-bold"
                    style={{
                      // since this component comes first, line height determined here
                      lineHeight: settings.lineHeight,
                      color: isCurrentVerse
                        ? themeColors.highlightText
                        : undefined,
                    }}
                  >
                    {" "}
                    {i + 1}{" "}
                  </TText>
                  {/* Used as marker for position. Must be after first TText so it doesn't interfere with lineheight */}
                  <View
                    key={verse.name + "marker"}
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
                      color: isCurrentVerse
                        ? themeColors.highlightText
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
};

export default BibleChapterView;
