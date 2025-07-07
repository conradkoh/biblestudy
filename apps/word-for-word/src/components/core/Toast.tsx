import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import React, { useEffect } from "react";
import { Animated, StyleSheet } from "react-native";

type ToastProps = {
  message: string;
  onHide: () => void;
  duration?: number;
};

export const Toast: React.FC<ToastProps> = ({ message, onHide, duration = 2000 }) => {
  const themeColors = useThemeColors();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [duration, fadeAnim, onHide]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: themeColors.surfaceSecondary,
        },
      ]}
    >
      <TText style={{ color: themeColors.text }}>{message}</TText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 
