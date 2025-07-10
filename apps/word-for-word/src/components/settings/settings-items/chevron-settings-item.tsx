import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, ViewStyle } from "react-native";

interface ChevronSettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ChevronSettingsItem({
  title,
  subtitle,
  icon,
  onPress,
  style
}: ChevronSettingsItemProps) {
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
        {icon && (
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: themeColors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons
              name={icon}
              size={18}
              color={themeColors.primary}
            />
          </View>
        )}

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
              }}
            >
              {subtitle}
            </TText>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={themeColors.textTertiary}
        />
      </View>
    </TouchableOpacity>
  );
} 
