import { SafeAreaView, type ViewProps } from "react-native";
import { useThemeColor } from "@/src/hooks/useThemeColor";

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
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "surface",
  );

  return <SafeAreaView style={[{ backgroundColor, flex: 1 }, style]} {...otherProps} />;
}
