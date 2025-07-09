import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  type BottomSheetBackdropProps
} from "@gorhom/bottom-sheet";
import React, {
  useMemo
} from "react";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const CustomBottomSheetBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  const themeColors = useThemeColors();

  // animated variables
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 0.4],
      [0, 0.4],
      Extrapolate.CLAMP,
    ),
  }));

  // styles
  const containerStyle = useMemo(
    () => [
      style,
      {
        backgroundColor: themeColors.overlay,
      },
      containerAnimatedStyle,
    ],
    [style, containerAnimatedStyle, themeColors.overlay],
  );

  return <Animated.View style={containerStyle} pointerEvents="none" />;
};
