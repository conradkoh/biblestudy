import { TText } from "@/src/components/core/TText";
import VerseActions from "@/src/components/verse-actions";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { getVerseNameFormatted, mapBookIdsToName } from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

type VerseRangeBottomSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cursorHandler: BibleCursorHandler;
};

const VerseRangeBottomSheet: FC<VerseRangeBottomSheetProps> = ({
  isOpen,
  setIsOpen,
  cursorHandler,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const themeColors = useThemeColors();
  const renderBackdrop = useBottomSheetBackdrop({ opacity: 0 });

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) setIsOpen(false);
    },
    [setIsOpen],
  );

  useEffect(() => {
    if (isOpen) bottomSheetRef.current?.snapToIndex(0);
    if (!isOpen) bottomSheetRef.current?.close();
  }, [isOpen]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      snapPoints={[150]}
      enablePanDownToClose
      index={-1}
      handleIndicatorStyle={{
        backgroundColor: themeColors.text,
      }}
      backgroundStyle={{
        backgroundColor: themeColors.surface,
      }}
      backdropComponent={renderBackdrop}
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
              {getVerseNameFormatted(cursorHandler.cursor, cursorHandler.cursorRangeEnd)}
            </TText>
          </View>
          {!!cursorHandler.cursor.verse && <VerseActions
            cursor={{ ...cursorHandler.cursor, verse: cursorHandler.cursor.verse }}
            verseName={getVerseNameFormatted(cursorHandler.cursor, cursorHandler.cursorRangeEnd)}
            version={cursorHandler.cursor.version}
            cursorRangeEnd={cursorHandler.cursorRangeEnd}
          />}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

export default VerseRangeBottomSheet;
