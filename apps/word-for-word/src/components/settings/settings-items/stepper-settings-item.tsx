import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, ViewStyle } from "react-native";

interface StepperSettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  style?: ViewStyle;
}

export function StepperSettingsItem({
  title,
  subtitle,
  icon,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  showValue = true,
  valueFormatter,
  style,
}: StepperSettingsItemProps) {
  const themeColors = useThemeColors();

  const formatValue = valueFormatter || ((val: number) => val.toString());

  const handleDecrease = () => {
    const newValue = Math.max(minimumValue, value - step);
    onValueChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(maximumValue, value + step);
    onValueChange(newValue);
  };

  return (
    <View
      style={[
        {
          backgroundColor: themeColors.surface,
          borderBottomWidth: 1,
          borderBottomColor: themeColors.divider,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        {icon && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: themeColors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name={icon} size={18} color={themeColors.primary} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <TText
            style={{
              fontSize: 16,
              fontWeight: "500",
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
                marginBottom: 8,
              }}
            >
              {subtitle}
            </TText>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {showValue && (
            <TText
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: themeColors.text,
                marginHorizontal: 12,
                minWidth: 30,
                textAlign: "center",
              }}
            >
              {formatValue(value)}
            </TText>
          )}

          <TouchableOpacity
            onPress={handleDecrease}
            disabled={value <= minimumValue}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor:
                value <= minimumValue
                  ? themeColors.border
                  : themeColors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Ionicons
              name="remove"
              size={16}
              color={
                value <= minimumValue
                  ? themeColors.textTertiary
                  : themeColors.primary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleIncrease}
            disabled={value >= maximumValue}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor:
                value >= maximumValue
                  ? themeColors.border
                  : themeColors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="add"
              size={16}
              color={
                value >= maximumValue
                  ? themeColors.textTertiary
                  : themeColors.primary
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
