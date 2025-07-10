import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, ViewStyle } from "react-native";

interface SwitchSettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: ViewStyle;
}

export function SwitchSettingsItem({
  title,
  subtitle,
  icon,
  value,
  onValueChange,
  style
}: SwitchSettingsItemProps) {
  const themeColors = useThemeColors();

  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: themeColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.divider,
    }, style]}>
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

        <TouchableOpacity
          onPress={() => onValueChange(!value)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            backgroundColor: value ? themeColors.primary : themeColors.border,
            alignItems: value ? 'flex-end' : 'flex-start',
            justifyContent: 'center',
            paddingHorizontal: 2,
          }}
        >
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: themeColors.surface,
          }} />
        </TouchableOpacity>
      </View>
    </View>
  );
} 
