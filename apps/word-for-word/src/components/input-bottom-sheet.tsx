import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TText } from "@/src/components/core/TText";
import { CommonEvents, useEvent } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  BottomSheetTextInput,
  type BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, { type FC, useCallback, useMemo, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type InputBottomSheetConfig = {
  title: string;
  subtitle?: string;
  placeholder?: string;
  multiline?: boolean;
  onSubmit: (text: string) => void;
  snapPoint?: number | string;
};

type InputBottomSheetProps = unknown;

export const InputBottomSheet: FC<InputBottomSheetProps> = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [config, setConfig] = useState<InputBottomSheetConfig>({
    title: "",
    placeholder: "",
    multiline: true,
    onSubmit: () => {},
  });
  const [inputText, setInputText] = useState("");
  const snapPoints = useMemo(
    () => [config.snapPoint ?? "50%"],
    [config.snapPoint]
  );
  const themeColors = useThemeColors();

  useEvent(CommonEvents, "SHOW_INPUT_BOTTOM_SHEET", (options) => {
    setConfig(options);
    setInputText("");
    bottomSheetModalRef.current?.present();
  });

  const handleSubmit = useCallback(() => {
    config.onSubmit(inputText);
    bottomSheetModalRef.current?.dismiss();
  }, [config, inputText]);

  const safeAreaInsets = useSafeAreaInsets();

  return (
    <TBottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      safeAreaProps={false}
      bottomSheetViewProps={false}
    >
      <View
        style={{
          padding: 16,
          paddingTop: 4,
          flex: 1,
          paddingBottom: safeAreaInsets.bottom,
        }}
      >
        <TText type="title" className="text-lg font-bold mb-1">
          {config.title}
        </TText>
        {!!config.subtitle && (
          <TText
            className="text-sm mb-2"
            style={{ color: themeColors.textTertiary }}
          >
            {config.subtitle}
          </TText>
        )}
        <BottomSheetTextInput
          onChangeText={setInputText}
          placeholder={config.placeholder}
          placeholderTextColor={themeColors.textTertiary}
          multiline={config.multiline ?? true}
          style={{
            flex: 1,
            backgroundColor: themeColors.surfaceSecondary,
            borderRadius: 8,
            padding: 12,
            color: themeColors.text,
            borderWidth: 1,
            borderColor: themeColors.border,
            textAlignVertical: config.multiline ? "top" : "center",
            minHeight: config.multiline ? 120 : 48,
          }}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: themeColors.primary,
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <TText className="font-bold text-white">Send</TText>
        </TouchableOpacity>
      </View>
    </TBottomSheetModal>
  );
};

export default InputBottomSheet;
