import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import {
  FontSelectionSheet,
  TypographyPreview,
  SettingsSection,
  ValueSettingsItem,
  StepperSettingsItem,
} from "@/src/components/settings";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  PARAGRAPH_FONT_OPTIONS,
  useSettingsStore,
} from "@/src/stores/settings-store";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { ScrollView } from "react-native";

export default function TypographyScreen() {
  const themeColors = useThemeColors();
  const {
    paragraphFontFamily,
    textSize,
    setTextSize,
    lineHeight,
    setLineHeight,
  } = useSettingsStore();
  const fontSheetRef = useRef<BottomSheetModal>(null);

  return (
    <TSafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Font">
          <ValueSettingsItem
            title={`Current: ${PARAGRAPH_FONT_OPTIONS[paragraphFontFamily]}`}
            subtitle="Choose your preferred reading font"
            onPress={() => fontSheetRef.current?.present()}
          />
        </SettingsSection>

        <SettingsSection title="Font Size">
          <StepperSettingsItem
            title="Text Size"
            subtitle="Adjust the size of Bible text"
            icon="text"
            value={textSize}
            onValueChange={setTextSize}
            minimumValue={12}
            maximumValue={24}
            step={1}
            valueFormatter={(value) => `${value}px`}
          />
        </SettingsSection>
        <SettingsSection title="Line Height">
          <StepperSettingsItem
            title="Line Height"
            subtitle="Adjust the height of Bible text"
            icon="text"
            value={lineHeight}
            onValueChange={setLineHeight}
            minimumValue={20}
            maximumValue={40}
            step={1}
            valueFormatter={(value) => `${value}px`}
          />
        </SettingsSection>

        <TypographyPreview />

        <FontSelectionSheet ref={fontSheetRef} />
      </ScrollView>
    </TSafeAreaView>
  );
}
