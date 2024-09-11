import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/src/hooks/useThemeColor";

export type TViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function TView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: TViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
