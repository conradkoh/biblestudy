import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import SearchBox from "@/src/components/search-box";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { CommonEvents, useEvent } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { LexiconWord, useBibleCursor } from "@/src/stores/bible-store";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import classNames from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function ReadScreen() {
  const bible = useBibleCursor();
  const themeColors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);

  useEvent(CommonEvents, "ON_CHAPTER_CHANGE", () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  });

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [currentStrongsWord, setCurrentStrongsWord] = useState<
    LexiconWord | undefined
  >();
  const [isSearchVisible, setIsSearchVisible] = useState(true);

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
    <>
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
            <TView className="px-3">
              <TText type="title" className="my-2">
                {bible.getCurrentBookName()} {bible.chapterIdx + 1}
              </TText>
              <TText>
                {bible.getCurrentChapterFormatted().map((verse, i) => {
                  return (
                    <TText key={verse.name} onPress={() => onPressVerse(i + 1)}>
                      <TText className="ml-1 font-bold"> {i + 1} </TText>
                      <TText type="paragraph">{verse.text}</TText>
                    </TText>
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

            {currentStrongsWord && (
              <View className="mt-6">
                <View className="flex flex-col" style={{ gap: 8 }}>
                  <TText type="subtitle">
                    Strongs Number: {currentStrongsWord.strongs}
                  </TText>
                  <TText>{currentStrongsWord.word}</TText>
                  <TText className="mt-3" type="subtitle">
                    Short Definition:
                  </TText>
                  <TText>{currentStrongsWord.data.def?.short}</TText>
                  <TText className="mt-3" type="subtitle">
                    Long Definition:
                  </TText>
                  <TText>{currentStrongsWord.data.def?.long?.join("\n")}</TText>
                  <TText className="mt-3" type="subtitle">
                    Comment:
                  </TText>
                  <TText className="">{currentStrongsWord.data.comment}</TText>
                </View>
              </View>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </>
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
