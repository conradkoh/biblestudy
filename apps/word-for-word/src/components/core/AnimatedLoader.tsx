import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate
} from "react-native-reanimated";

type AnimationType = "rotate" | "pulse" | "bounce";

interface AnimatedLoaderProps {
  size?: number;
  color?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  duration?: number;
  animationType?: AnimationType;
  style?: any;
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = 20,
  color,
  iconName = "ellipsis-horizontal",
  duration = 1000,
  animationType = "rotate",
  style
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animationType === "rotate") {
      rotation.value = withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        false // Don't reverse
      );
    } else if (animationType === "pulse") {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: duration / 2, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: duration / 2, easing: Easing.in(Easing.quad) })
        ),
        -1,
        false
      );
    } else if (animationType === "bounce") {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: duration / 3, easing: Easing.out(Easing.back(1.5)) }),
          withTiming(0.8, { duration: duration / 3, easing: Easing.in(Easing.back(1.5)) }),
          withTiming(1, { duration: duration / 3, easing: Easing.out(Easing.back(1.5)) })
        ),
        -1,
        false
      );
    }

    return () => {
      rotation.value = 0;
      scale.value = 1;
      opacity.value = 1;
    };
  }, [rotation, scale, opacity, duration, animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    const transform = [];

    if (animationType === "rotate") {
      transform.push({ rotate: `${rotation.value}deg` });
    }

    if (animationType === "pulse" || animationType === "bounce") {
      transform.push({ scale: scale.value });
    }

    return {
      transform,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Ionicons
        name={iconName}
        size={size}
        style={{ color }}
      />
    </Animated.View>
  );
}; 
