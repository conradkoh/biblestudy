/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const ThemeColors = {
  light: {
    text: "#11181C",
    background: "#fff",
    backgroundSecondary: "#f2f2f2",
    surfaceHighlight: "#1a1c1e",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    negative: "#ab3030",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    backgroundSecondary: "#1a1c1e",
    surfaceHighlight: "#2b2e30",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    negative: "#ab3030",
  },
};
