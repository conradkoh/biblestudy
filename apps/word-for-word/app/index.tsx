import React from "react";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import SearchBox from "@/src/components/search-box";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { CommonEvents, useEvent } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  LexiconWord,
  useBibleCursor,
  versions,
} from "@/src/stores/bible-store";
import { useSettingsStore } from "@/src/stores/settings-store";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import classNames from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { VersionSelector } from "@/src/components/version-selector";
import { mapBookSlugToName } from "@/src/utils/bible-data-utils";
import { useBibleBookmark } from "@/src/hooks/useBibleBookmark";

export default function ReadScreen() {
  const bible = useBibleCursor();
  const settings = useSettingsStore();
  useBibleBookmark(bible);
  const themeColors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const verseYCoordsRef = useRef<{ [verseIdx: number]: number }>({});

  useEvent(CommonEvents, "ON_CHAPTER_CHANGE", () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  });

  useEvent(CommonEvents, "ON_VERSE_CHANGE", (verseNum) => {
    const verseIdx = verseNum - 1;
    const y = verseYCoordsRef.current[verseIdx];
    if (!y) {
      console.warn(`Verse ${verseNum} element ref not found`);
      return;
    }

    scrollViewRef.current?.scrollTo({ y, animated: false });
  });

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        bible.setInterlinearVerseNumber(null);
      }
    },
    [bible]
  );

  const [currentStrongsWord, setCurrentStrongsWord] = useState<
    LexiconWord | undefined
  >();
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  function onPressVerse(verseNum: number) {
    bible.setInterlinearVerseNumber(verseNum);
    setCurrentStrongsWord(undefined);
    bottomSheetRef.current?.snapToIndex(0);
  }

  function onPressStrongsNumber(strongsNumber: string) {
    const lexiconWord = bible.lookupStrongsNumber(strongsNumber);
    setCurrentStrongsWord(lexiconWord);
    bottomSheetRef.current?.snapToIndex(1);
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
          <ScrollView ref={scrollViewRef}>
            <TView className="px-6">
              <TView className="flex-row items-end mb-2 mt-12">
                <TText type="title">
                  {bible.getCurrentBookName()} {bible.chapterIdx + 1}
                </TText>
                <VersionSelector />
              </TView>
              <TText>
                {bible.getCurrentChapterFormatted().map((verse, i) => {
                  const isCurrentVerse =
                    bible.currentInterlinearVerseIdx &&
                    bible.currentInterlinearVerseIdx === i;
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
          <View
            className="flex flex-row items-center justify-between px-2 h-10"
            style={{
              backgroundColor: themeColors.backgroundSecondary,
            }}
          >
            <TouchableOpacity
              hitSlop={HITSLOP_DEFAULT}
              onPress={() => bible.goPrev()}
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
                {bible.getCurrentBookName()} Chapter {bible.chapterIdx + 1}
              </TText>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={HITSLOP_DEFAULT}
              onPress={() => bible.goNext()}
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
      />
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
          backgroundColor: themeColors.backgroundSecondary,
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
                {bible.getCurrentInterlinearVerseName()}
              </TText>
            </View>
            <View className="flex flex-row flex-wrap mt-2" style={{ gap: 8 }}>
              {bible
                .getCurrentInterlinearForVerse()
                ?.contents.map((content, i) => {
                  const isCurrentStrongsWord =
                    content.strongsNumber === currentStrongsWord?.strongs;
                  return (
                    <View
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={content.text + i}
                      className="flex flex-col items-center"
                    >
                      <TText>{content.text || `-`}</TText>
                      <TouchableOpacity
                        onPress={() => {
                          onPressStrongsNumber(content.strongsNumber);
                        }}
                        className="flex flex-col items-center"
                      >
                        <TText
                          type="link"
                          className={classNames("text-xs", {
                            "text-green-700": isCurrentStrongsWord,
                          })}
                        >
                          {content.originalWord}
                        </TText>
                        <TText
                          type="link"
                          className={classNames("text-xs", {
                            "text-green-700": isCurrentStrongsWord,
                          })}
                        >
                          {content.strongsNumber}
                        </TText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>

            {currentStrongsWord &&
              bible.currentInterlinearVerseIdx !== null && (
                <View className="mt-6">
                  <View className="flex flex-col" style={{ gap: 8 }}>
                    <TText className="text-xs font-semibold text-green-700">
                      Strongs: {currentStrongsWord.strongs}
                    </TText>
                    {/* Hebrew / Greek + Translit */}
                    <TText type="subtitle" className="text-green-700">
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
                    <TView className="flex flex-col" style={{ gap: 12 }}>
                      {bible
                        .findVersesByStrongsNumber(
                          currentStrongsWord.strongs,
                          bible.chapterIdx + 1,
                          bible.currentInterlinearVerseIdx + 1
                        )
                        .slice(0, 5) // Show only first 5 results
                        .map((result, idx) => (
                          <TouchableOpacity
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            key={idx}
                            className="flex flex-col"
                            style={{ gap: 4 }}
                            onPress={() => {
                              bible.setBookSlug(result.bookSlug);
                              bible.setChapterIdx(result.chapter - 1);
                              // next tick
                              !Number.isNaN(result.verse) &&
                                setTimeout(() => {
                                  CommonEvents.emit(
                                    "ON_VERSE_CHANGE",
                                    result.verse
                                  );
                                }, 100);

                              bible.setInterlinearVerseNumber(result.verse);
                              setCurrentStrongsWord(undefined);
                              bottomSheetRef.current?.snapToIndex(0);
                            }}
                          >
                            <TView className="flex-row" style={{ gap: 4 }}>
                              <TText className="text-xs font-semibold">
                                {mapBookSlugToName[result.bookSlug]}{" "}
                                {result.chapter}:{result.verse}
                              </TText>
                              <TText className="text-xs font-semibold">
                                {versions[
                                  bible.currentVersion
                                ].abbreviation.toUpperCase()}
                              </TText>
                            </TView>

                            {/* Original version's text */}
                            <TView className="flex flex-row flex-wrap">
                              <TView
                                className="rounded-md items-center justify-center px-1 mr-1"
                                style={{
                                  backgroundColor: themeColors.secondaryText,
                                }}
                              >
                                <TText
                                  className="text-xs"
                                  style={{
                                    color: themeColors.contrastText,
                                  }}
                                >
                                  {versions[
                                    bible.currentVersion
                                  ].abbreviation.toUpperCase()}
                                </TText>
                              </TView>
                              {(
                                bible.getBook(result.bookSlug)?.chapters[
                                  result.chapter - 1
                                ]?.verses[result.verse - 1]?.text || ""
                              )
                                .split(" ")
                                .map((t, i) => (
                                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                  <Text key={i} className="mr-1 text-sm">
                                    {t}
                                  </Text>
                                ))}
                            </TView>

                            {/* Interlinear's English text */}
                            <TView className="flex flex-row flex-wrap">
                              <TView
                                className="rounded-md items-center justify-center px-1 mr-1"
                                style={{
                                  backgroundColor: themeColors.secondaryText,
                                }}
                              >
                                <TText
                                  className="text-xs"
                                  style={{
                                    color: themeColors.contrastText,
                                  }}
                                >
                                  Interlinear (KJV)
                                </TText>
                              </TView>
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
                                  {content.text}
                                </TText>
                              ))}
                            </TView>
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
                    </TView>
                  </View>
                </View>
              )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </BottomSheetModalProvider>
  );
}
const CustomBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.4],
      [0, 0.4],
      Extrapolate.CLAMP
    ),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: "black",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle]
  );

  return <Animated.View style={containerStyle} pointerEvents="none" />;
};
