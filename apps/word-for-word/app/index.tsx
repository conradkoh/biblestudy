import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { create } from "zustand";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { ThemeColors } from "@/src/constants/ThemeColors";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import { LexiconWord, useBibleCursor } from "@/src/stores/bible-store";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";

export default function ReadScreen() {
  const bible = useBibleCursor();
  const colorScheme = useColorScheme();

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [currentStrongsWord, setCurrentStrongsWord] = useState<
    LexiconWord | undefined
  >();

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
          backgroundColor: ThemeColors[colorScheme ?? "light"].background,
        }}
      >
        <TView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ScrollView>
            <TView className="px-3">
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
        </TView>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["50%", "90%"]}
        enablePanDownToClose
        handleIndicatorStyle={{
          backgroundColor: ThemeColors[colorScheme ?? "light"].text,
        }}
        backgroundStyle={{
          backgroundColor:
            ThemeColors[colorScheme ?? "light"].backgroundSecondary,
        }}
        backdropComponent={CustomBackdrop}
      >
        <BottomSheetScrollView className="flex-1 items-center justify-center">
          <View className="flex-1 px-3 py-1">
            <View className="flex flex-row items-center" style={{ gap: 8 }}>
              <Ionicons
                size={20}
                name="book"
                style={{ color: ThemeColors[colorScheme ?? "light"].text }}
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
        pointerEvents: "none",
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle]
  );

  return <Animated.View style={containerStyle} />;
};
