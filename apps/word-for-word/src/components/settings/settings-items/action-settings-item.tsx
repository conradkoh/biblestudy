import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, ViewStyle } from "react-native";

interface ActionSettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  destructive?: boolean;
  style?: ViewStyle;
}

export function ActionSettingsItem({
  title,
  subtitle,
  icon,
  onPress,
  destructive = false,
  style
}: ActionSettingsItemProps) {
  const themeColors = useThemeColors();

  const getIconColor = () => {
    return destructive ? themeColors.error : themeColors.primary;
  };

  const getIconBackground = () => {
    return destructive ? themeColors.error + '20' : themeColors.primary + '20';
  };

  const getTextColor = () => {
    return destructive ? themeColors.error : themeColors.text;
  };

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
            backgroundColor: getIconBackground(),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons
              name={icon}
              size={18}
              color={getIconColor()}
            />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <TText
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: getTextColor(),
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
      </View>
    </TouchableOpacity>
  );
} 
