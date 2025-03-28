import type { GetBibleTranslation } from "@/assets/bible-en/kjv.json";
import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TText } from "@/src/components/core/TText";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useBibleStore } from "@/src/stores/bible-store";
import {
  BottomSheetFlatList,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { type FC, useCallback, useMemo, useRef } from "react";
import { TouchableOpacity, View } from "react-native";

type VersionSelectorProps = {
  cursorHandler: BibleCursorHandler;
};
export const VersionSelector: FC<VersionSelectorProps> = ({
  cursorHandler,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const { version } = cursorHandler.cursor;
  const themeColors = useThemeColors();
  const bibleStore = useBibleStore();
  const versions = bibleStore.getTranslation(version);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleVersionSelect = useCallback(
    (version: GetBibleTranslation) => {
      cursorHandler.updateCursor({ version: version.id });
      bottomSheetModalRef.current?.dismiss();
    },
    [cursorHandler.updateCursor],
  );

  const renderItem = useCallback(
    ({ item }: { item: GetBibleTranslation }) => (
      <TouchableOpacity
        onPress={() => handleVersionSelect(item)}
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
        }}
      >
        <TText>
          {item.translation} ({item.abbreviation})
        </TText>
      </TouchableOpacity>
    ),
    [handleVersionSelect],
  );

  return (
    <>
      <TouchableOpacity onPress={handlePresentModalPress}>
        <TText
          type="subtitle"
          className="text-sm mb-1 ml-1"
          style={{ color: themeColors.textSecondary }}
        >
          {versions.abbreviation.toUpperCase()}
        </TText>
      </TouchableOpacity>

      <TBottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <View style={{ flex: 1 }}>
          <TText type="title" className="text-lg font-bold px-4 py-2">
            Select Bible Version
          </TText>
          <BottomSheetFlatList
            data={Object.values(versions).map((v) => ({
              ...v,
              key: v.id,
            }))}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        </View>
      </TBottomSheetModal>
    </>
  );
};
