import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { FontSelectionSheet } from "@/src/components/settings/FontSelectionSheet";
import { ValueSettingsItem } from "@/src/components/settings/settings-items/value-settings-item";
import { SettingsSection } from "@/src/components/settings/settings-section";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { PARAGRAPH_FONT_OPTIONS, useSettingsStore } from "@/src/stores/settings-store";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { ScrollView } from "react-native";

const SAMPLE_VERSE = "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. - John 3:16";

export default function TypographyScreen() {
  const themeColors = useThemeColors();
  const { paragraphFontFamily, textSize, lineHeight } = useSettingsStore();
  const fontSheetRef = useRef<BottomSheetModal>(null);

  return (
    <TSafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Font" >
          <ValueSettingsItem
            title={`Current: ${PARAGRAPH_FONT_OPTIONS[paragraphFontFamily]}`}
            subtitle="Choose your preferred reading font"
            onPress={() => fontSheetRef.current?.present()}
            showPreview={true}
            previewText={SAMPLE_VERSE}
            previewFontFamily={paragraphFontFamily}
          />
        </SettingsSection>
        <FontSelectionSheet ref={fontSheetRef} />
      </ScrollView>
    </TSafeAreaView>
  );
} 
