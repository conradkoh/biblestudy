import { TText } from "@/src/components/core/TText";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { SettingsSection } from "@/src/components/settings/settings-section";
import { RadioSettingsItem } from "@/src/components/settings/settings-items/radio-settings-item";
import { ScrollView, View } from "react-native";
import { useSettingsStore } from "@/src/stores/settings-store";

type ThemeType = 'light' | 'dark' | undefined;

export default function ThemeScreen() {
  const themeColors = useThemeColors();

  const { theme: currentTheme, setTheme } = useSettingsStore();

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme)
  };

  return (
    <TSafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Theme" >
          <RadioSettingsItem
            title="Light"
            subtitle="Use light theme"
            icon="sunny"
            isSelected={currentTheme === 'light'}
            onPress={() => handleThemeChange('light')}
          />
          <RadioSettingsItem
            title="Dark"
            subtitle="Use dark theme"
            icon="moon"
            isSelected={currentTheme === 'dark'}
            onPress={() => handleThemeChange('dark')}
          />
          <RadioSettingsItem
            title="Auto"
            subtitle="Follow system setting"
            icon="contrast"
            isSelected={currentTheme === undefined}
            onPress={() => handleThemeChange(undefined)}
          />
        </SettingsSection>

        <View style={{
          alignItems: 'center',
          marginTop: 32,
          marginBottom: 16,
          paddingHorizontal: 16,
        }}>
          <TText
            style={{
              fontSize: 12,
              color: themeColors.textTertiary,
              textAlign: 'center',
            }}
          >
            Theme changes will be applied immediately
          </TText>
        </View>
      </ScrollView>
    </TSafeAreaView>
  );
} 
