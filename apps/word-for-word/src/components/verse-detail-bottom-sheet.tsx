import { TText } from "@/src/components/core/TText";
import VerseActions from "@/src/components/verse-actions";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  type LexiconWord,
  useBibleStore,
  versions,
} from "@/src/stores/bible-store";
import { getVerseNameFormatted, mapBookIdsToName } from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import classNames from "classnames";
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

type VerseDetailBottomSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cursorHandler: BibleCursorHandler;
};

const VerseDetailBottomSheet: FC<VerseDetailBottomSheetProps> = ({
  isOpen,
  setIsOpen,
  cursorHandler,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const themeColors = useThemeColors();
  const bible = useBibleStore();

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) setIsOpen(false);
    },
    [setIsOpen],
  );

  useEffect(() => {
    if (isOpen) bottomSheetRef.current?.snapToIndex(0);
  }, [isOpen]);

  const [currentStrongsWord, setCurrentStrongsWord] = useState<
    LexiconWord | undefined
  >();

  // function onPressVerse(verse: number) {
  //   setShowInterlinear(true);
  //   interlinearCursor.updateCursor({
  //     ...cursorHandler.cursor,
  //     verse,
  //   });
  //   setCurrentStrongsWord(undefined);
  //   bottomSheetRef.current?.snapToIndex(0);
  // }

  function onPressStrongsNumber(strongsNumber: string) {
    const lexiconWord = bible.lookupStrongsNumber(strongsNumber);
    setCurrentStrongsWord(lexiconWord);
    bottomSheetRef.current?.snapToIndex(1);
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      snapPoints={["50%", "90%"]}
      enablePanDownToClose
      index={-1}
      handleIndicatorStyle={{
        backgroundColor: themeColors.text,
      }}
      backgroundStyle={{
        backgroundColor: themeColors.surface,
      }}
      backdropComponent={CustomBackdrop}
    >
      <BottomSheetScrollView className="flex-1 items-center justify-center">
        <View className="flex-1 px-3 py-1">
          <View className="flex flex-row items-center" style={{ gap: 8 }}>
            <Ionicons
              size={20}
              name="book"
              style={{ color: themeColors.text }}
            />
            <TText className="text-[17px] font-bold">
              {getVerseNameFormatted(cursorHandler.cursor)}
            </TText>
          </View>
          {cursorHandler.cursor.verse && (
            <VerseActions
              cursor={{
                ...cursorHandler.cursor,
                verse: cursorHandler.cursor.verse,
              }}
              verseName={getVerseNameFormatted(cursorHandler.cursor)}
              version={cursorHandler.cursor.version}
            />
          )}
          <View className="flex flex-row flex-wrap" style={{ gap: 8 }}>
            {bible
              .getInterlinearVerse(cursorHandler.cursor)
              ?.contents.map((content, i) => {
                const isCurrentStrongsWord =
                  content.strongsNumber === currentStrongsWord?.strongs;
                return (
                  <View
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={content.text + i}
                    className="flex flex-col items-center"
                  >
                    <TText>{content.text || "-"}</TText>
                    <TouchableOpacity
                      onPress={() => {
                        onPressStrongsNumber(content.strongsNumber);
                      }}
                      className="flex flex-col items-center"
                    >
                      <TText
                        className={classNames("text-xs")}
                        style={{
                          color: isCurrentStrongsWord
                            ? themeColors.success
                            : themeColors.textHighlight,
                        }}
                      >
                        {content.originalWord}
                      </TText>
                      <TText
                        className={classNames("text-xs")}
                        style={{
                          color: isCurrentStrongsWord
                            ? themeColors.success
                            : themeColors.textHighlight,
                        }}
                      >
                        {content.strongsNumber}
                      </TText>
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>

          {cursorHandler && currentStrongsWord && (
            <View className="mt-6">
              <View className="flex flex-col" style={{ gap: 8 }}>
                <TText
                  className="text-xs font-semibold "
                  style={{ color: themeColors.success }}
                >
                  Strongs: {currentStrongsWord.strongs}
                </TText>
                {/* Hebrew / Greek + Translit */}
                <TText type="subtitle" style={{ color: themeColors.success }}>
                  {currentStrongsWord.originalWord} -{" "}
                  {currentStrongsWord.transliteration}
                </TText>
                {/* Pronunciation */}
                {currentStrongsWord.pronounciation && (
                  <TText className="italic text-xs">
                    {currentStrongsWord.pronounciation}
                  </TText>
                )}
                {/* English Word */}
                <TText>{currentStrongsWord.word}</TText>
                <TText className="mt-3" type="subtitle">
                  Short Definition:
                </TText>
                <TText>{currentStrongsWord.data.def?.short}</TText>
                {/* Used in... section */}
                <TText className="mt-6" type="subtitle">
                  Also used in...
                </TText>
                <View className="flex flex-col mb-2" style={{ gap: 12 }}>
                  {!!cursorHandler.cursor.verse &&
                    bible
                      .findVersesByStrongsNumber(
                        currentStrongsWord.strongs,
                        cursorHandler.cursor.chapter,
                        cursorHandler.cursor.verse,
                      )
                      .slice(0, 5) // Show only first 5 results
                      .map((result, idx) => (
                        <TouchableOpacity
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={idx}
                          className="flex flex-col"
                          style={{ gap: 4 }}
                          onPress={() => {
                            // TODO: open new modal
                            cursorHandler.updateCursor({
                              bookId: result.bookId,
                              chapter: result.chapter,
                            });

                            cursorHandler.updateCursor({
                              bookId: result.bookId,
                              chapter: result.chapter,
                              verse: result.verse,
                            });
                            setCurrentStrongsWord(undefined);
                            bottomSheetRef.current?.snapToIndex(0);
                          }}
                        >
                          <View className="flex-row" style={{ gap: 4 }}>
                            <TText className="text-xs font-semibold">
                              {mapBookIdsToName[result.bookId]} {result.chapter}
                              :{result.verse}
                            </TText>
                            <TText className="text-xs font-semibold">
                              {versions[
                                cursorHandler.cursor.version
                              ].abbreviation.toUpperCase()}
                            </TText>
                          </View>

                          {/* Original version's text */}
                          <View className="flex flex-row flex-wrap">
                            <View
                              className="rounded-md items-center justify-center px-1 mr-1"
                              style={{
                                backgroundColor: themeColors.textSecondary,
                              }}
                            >
                              <TText
                                className="text-xs"
                                style={{
                                  color: themeColors.textContrast,
                                }}
                              >
                                {versions[
                                  cursorHandler.cursor.version
                                ].abbreviation.toUpperCase()}
                              </TText>
                            </View>
                            {(
                              bible.getBook(
                                result.bookId,
                                cursorHandler.cursor.version,
                              )?.chapters[result.chapter - 1]?.verses[
                                result.verse - 1
                              ]?.text || ""
                            )
                              .split(" ")
                              .map((t, i) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                <TText key={i} className="mr-1 text-sm">
                                  {t}
                                </TText>
                              ))}
                          </View>

                          {/* Interlinear's English text */}
                          <View className="flex flex-row flex-wrap">
                            <View
                              className="rounded-md items-center justify-center px-1 mr-1"
                              style={{
                                backgroundColor: themeColors.textSecondary,
                              }}
                            >
                              <TText
                                className="text-xs"
                                style={{
                                  color: themeColors.textContrast,
                                }}
                              >
                                Interlinear (KJV)
                              </TText>
                            </View>
                            {result.contents.map((content, wordIdx) => (
                              <TText
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={wordIdx}
                                className={classNames("mr-1 text-sm", {
                                  "font-semibold":
                                    content.strongsNumber ===
                                    currentStrongsWord.strongs,
                                })}
                                style={{
                                  color:
                                    content.strongsNumber ===
                                      currentStrongsWord.strongs
                                      ? themeColors.success
                                      : themeColors.text,
                                }}
                              >
                                {content.text}
                              </TText>
                            ))}
                          </View>
                          {/* Original language text */}
                          {/* <View className="flex flex-row flex-wrap">
                            {result.contents.map((content, wordIdx) => (
                              <TText
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={wordIdx}
                                className={classNames("mr-1 text-sm", {
                                  "text-green-700 font-semibold":
                                    content.strongsNumber ===
                                    currentStrongsWord.strongs,
                                })}
                              >
                                {content.originalWord}
                              </TText>
                            ))}
                          </View> */}
                        </TouchableOpacity>
                      ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default VerseDetailBottomSheet;

const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  const themeColors = useThemeColors();

  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.4],
      [0, 0.4],
      Extrapolate.CLAMP,
    ),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: themeColors.overlay,
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle, themeColors.overlay],
  );

  return <Animated.View style={containerStyle} pointerEvents="none" />;
};
