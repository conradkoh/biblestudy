import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, ViewStyle } from "react-native";

interface ValueSettingsItemProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: () => void;
  showPreview?: boolean;
  previewText?: string;
  previewFontFamily?: string;
  style?: ViewStyle;
}

export function ValueSettingsItem({
  title,
  subtitle,
  value,
  onPress,
  showPreview = false,
  previewText,
  previewFontFamily,
  style
}: ValueSettingsItemProps) {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: themeColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.divider,
      }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <TText
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: themeColors.text,
              marginBottom: subtitle ? 2 : 0,
            }}
          >
            {title}
          </TText>
          {subtitle && (
            <TText
              style={{
                fontSize: 14,
                color: themeColors.textSecondary,
                marginBottom: showPreview ? 8 : 0,
              }}
            >
              {subtitle}
            </TText>
          )}
          {showPreview && previewText && (
            <TText
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: themeColors.textSecondary,
                fontFamily: previewFontFamily,
              }}
            >
              {previewText}
            </TText>
          )}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          {value && (
            <TText
              style={{
                fontSize: 16,
                color: themeColors.textSecondary,
                marginBottom: 4,
              }}
            >
              {value}
            </TText>
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeColors.textTertiary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
} 
