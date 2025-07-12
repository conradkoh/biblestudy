import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  PARAGRAPH_FONT_OPTIONS,
  useSettingsStore,
} from "@/src/stores/settings-store";
import {
  type BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

const SAMPLE_VERSE =
  "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. - John 3:16";

export const FontSelectionSheet = forwardRef<BottomSheetModal>((_, ref) => {
  const themeColors = useThemeColors();
  const { paragraphFontFamily, setParagraphFontFamily } = useSettingsStore();

  const snapPoints = useMemo(() => ["80%"], []);
  const renderBackdrop = useBottomSheetBackdrop();

  const handleFontSelect = useCallback(
    (font: keyof typeof PARAGRAPH_FONT_OPTIONS) => {
      setParagraphFontFamily(font);
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    },
    [setParagraphFontFamily, ref]
  );

  return (
    <TBottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: themeColors.surface,
      }}
      handleIndicatorStyle={{
        backgroundColor: themeColors.border,
      }}
      scrollViewProps={{}}
      safeAreaProps={{
        style: { height: "100%" },
      }}
    >
      <TView style={{ padding: 16, gap: 16 }}>
        <TText type="title">Select Font</TText>
        {Object.entries(PARAGRAPH_FONT_OPTIONS).map(([key, displayName]) => (
          <TouchableOpacity
            key={key}
            onPress={() =>
              handleFontSelect(key as keyof typeof PARAGRAPH_FONT_OPTIONS)
            }
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: themeColors.surface,
              borderWidth: 1,
              borderColor:
                paragraphFontFamily === key
                  ? themeColors.text
                  : themeColors.border,
            }}
          >
            <TText style={{ marginBottom: 8, fontFamily: key }}>
              {displayName}
            </TText>
            <TText
              style={{
                fontFamily: key,
                fontSize: 16,
                lineHeight: 24,
                color: themeColors.text,
              }}
            >
              {SAMPLE_VERSE}
            </TText>
          </TouchableOpacity>
        ))}
      </TView>
    </TBottomSheetModal>
  );
});
