import { useThemeColors } from "@/src/hooks/useThemeColors";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

export type TSafeAreaViewProps = SafeAreaViewProps & {
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
