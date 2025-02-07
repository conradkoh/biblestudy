import React, { useCallback, useMemo, useRef } from "react";
import { View, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useBibleCursor } from "@/src/stores/bible-store";
import niv from "@/assets/bible-en/niv.json";
import kjv from "@/assets/bible-en/kjv.json";
import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";

const versions = { niv, kjv };

type Version = {
  key: keyof typeof versions;
  translation: string;
  abbreviation: string;
};

const versionsList: Version[] = [
  { key: "niv", translation: "New International Version", abbreviation: "NIV" },
  { key: "kjv", translation: "King James Version", abbreviation: "KJV" },
];

export const VersionSelector = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const { currentVersion, setCurrentVersion } = useBibleCursor();
  const themeColors = useThemeColors();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleVersionSelect = useCallback(
    (version: Version) => {
      setCurrentVersion(version.key);
      bottomSheetModalRef.current?.dismiss();
    },
    [setCurrentVersion]
  );

  const renderItem = useCallback(
    ({ item }: { item: Version }) => (
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
          {versionsList.find((v) => v.key === currentVersion)?.abbreviation}
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
            data={versionsList}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};
