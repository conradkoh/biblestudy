import { SafeAreaView, type ViewProps } from "react-native";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useThemeColors } from "@/src/hooks/useThemeColors";

export type TSafeAreaViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function TSafeAreaView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: TSafeAreaViewProps) {
  const themeColors = useThemeColors();

  return <SafeAreaView style={[{ backgroundColor: themeColors.surface, flex: 1 }, style]} {...otherProps} />;
}
