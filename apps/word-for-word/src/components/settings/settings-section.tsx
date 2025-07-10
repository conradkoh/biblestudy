import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { View, ViewStyle } from "react-native";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SettingsSection({
  title,
  children,
  style
}: SettingsSectionProps) {
  const themeColors = useThemeColors();

  return (
    <View style={{ marginBottom: 32 }}>
      <TText
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: themeColors.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 8,
          marginLeft: 16,
        }}
      >
        {title}
      </TText>
      <View style={[{
        backgroundColor: themeColors.surface,
        overflow: 'hidden',
      }, style]}>
        {children}
      </View>
    </View>
  );
} 
