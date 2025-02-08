import React, { useCallback, useMemo, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useBibleCursor, versions } from "@/src/stores/bible-store";
import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { GetBibleTranslation } from "@/assets/bible-en/kjv.json";

export const VersionSelector = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const { currentVersion, setCurrentVersion } = useBibleCursor();
  const themeColors = useThemeColors();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleVersionSelect = useCallback(
    (version: GetBibleTranslation) => {
      setCurrentVersion(version.id);
      bottomSheetModalRef.current?.dismiss();
    },
    [setCurrentVersion]
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
    [handleVersionSelect]
  );

  return (
    <>
      <TouchableOpacity onPress={handlePresentModalPress}>
        <TText
          type="subtitle"
          className="text-sm mb-1 ml-1"
          style={{ color: themeColors.secondaryText }}
        >
          {versions[currentVersion].abbreviation.toUpperCase()}
        </TText>
      </TouchableOpacity>

      <BottomSheetModal
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
      </BottomSheetModal>
    </>
  );
};
