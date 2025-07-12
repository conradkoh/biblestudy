import { CustomBottomSheetBackdrop } from "@/src/components/core/CustomBottomSheetBackdrop";
import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TText } from "@/src/components/core/TText";
import VerseActions from "@/src/components/verse-actions";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { getVerseNameFormatted } from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import { type BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { type FC, useCallback, useEffect, useRef } from "react";
import { View } from "react-native";

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const themeColors = useThemeColors();

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) setIsOpen(false);
    },
    [setIsOpen]
  );

  useEffect(() => {
    if (isOpen) bottomSheetRef.current?.present();
    if (!isOpen) bottomSheetRef.current?.close();
  }, [isOpen]);

  return (
    <TBottomSheetModal
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      enableDynamicSizing
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: themeColors.text,
      }}
      backgroundStyle={{
        backgroundColor: themeColors.surface,
      }}
      backdropComponent={CustomBottomSheetBackdrop}
    >
      <View className="px-3 py-1">
        <View className="flex flex-row items-center" style={{ gap: 8 }}>
          <Ionicons size={20} name="book" style={{ color: themeColors.text }} />
          <TText className="text-[17px] font-bold">
            {getVerseNameFormatted(
              cursorHandler.cursor,
              cursorHandler.cursorRangeEnd
            )}
          </TText>
        </View>
        {!!cursorHandler.cursor.verse && (
          <VerseActions
            cursor={{
              ...cursorHandler.cursor,
              verse: cursorHandler.cursor.verse,
            }}
            verseName={getVerseNameFormatted(
              cursorHandler.cursor,
              cursorHandler.cursorRangeEnd
            )}
            version={cursorHandler.cursor.version}
            cursorRangeEnd={cursorHandler.cursorRangeEnd}
          />
        )}
      </View>
    </TBottomSheetModal>
  );
};

export default VerseRangeBottomSheet;
