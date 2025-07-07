import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TText } from "@/src/components/core/TText";
import { CommonEvents, useEvent } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  BottomSheetFlatList,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { type FC, useCallback, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";

export type OptionSelectorConfig = {
  title: string;
  options: { id: string; label: string; onSelect: () => void }[];
  snapPoint?: number | string;
};

type OptionSelectorBottomSheetProps = unknown;

export const OptionSelectorBottomSheet: FC<OptionSelectorBottomSheetProps> = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [config, setConfig] = useState<OptionSelectorConfig>({ title: '', options: [] });
  const snapPoints = useMemo(() => [config.snapPoint ?? "50%"], [config.snapPoint]);
  const themeColors = useThemeColors();

  useEvent(CommonEvents, "SHOW_OPTION_SELECTOR_BOTTOM_SHEET", (options) => {
    setConfig(options);
    bottomSheetModalRef.current?.present();
  });

  const renderItem = useCallback(
    ({ item }: { item: OptionSelectorConfig['options'][number] }) => (
      <TouchableOpacity
        onPress={() => {
          item.onSelect();
          bottomSheetModalRef.current?.dismiss();
        }}
        className="p-4 border-b"
        style={{
          borderBottomColor: themeColors.border,
        }}
      >
        <TText>
          {item.label}
        </TText>
      </TouchableOpacity>
    ),
    [themeColors],
  );

  return (
    <TBottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <View style={{ flex: 1 }}>
        <TText type="title" className="text-lg font-bold px-4 pb-2">
          {config.title}
        </TText>
        <BottomSheetFlatList
          data={config.options}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </TBottomSheetModal>
  );
};
