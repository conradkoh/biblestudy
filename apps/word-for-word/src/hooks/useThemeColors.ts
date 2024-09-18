import { ThemeColors } from "@/src/constants/ThemeColors";
import { useColorScheme as _useColorScheme } from "react-native";

export function useThemeColors() {
  const colorScheme = _useColorScheme() ?? "light";
  return ThemeColors[colorScheme];
}
