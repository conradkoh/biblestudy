import { useThemeColors } from "@/src/hooks/useThemeColors";
import * as Haptics from "expo-haptics";
import { type FC, type default as React, useRef, useState } from 'react';
import { Animated, PanResponder, View } from "react-native";

interface SwipeableContainerProps {
  children: React.ReactNode;
  isScrolling: boolean;
  onNext: () => void;
  onPrev: () => void;
  nextHint: React.ReactNode;
  prevHint: React.ReactNode;
}

const HORIZONTAL_PAN_THRESHOLD = 12; // Minimum horizontal swipe before allowing panning
const SWIPE_THRESHOLD = 28; // Minimum distance before triggering next/prev
const MAX_SWIPE_DISTANCE = 32;

const SwipeableContainer: FC<SwipeableContainerProps> = ({
  children,
  isScrolling,
  onNext,
  onPrev,
  nextHint,
  prevHint,
}) => {
  const pan = useRef(new Animated.ValueXY());
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const [showHints, setShowHints] = useState(true);

  const translateX = pan.current.x.interpolate({
    inputRange: [-MAX_SWIPE_DISTANCE, 0, MAX_SWIPE_DISTANCE],
    outputRange: [-MAX_SWIPE_DISTANCE, 0, MAX_SWIPE_DISTANCE],
    extrapolate: "clamp",
  });

  const themeColors = useThemeColors();

  const _onNext = useRef(onNext);
  const _onPrev = useRef(onPrev);
  _onNext.current = onNext;
  _onPrev.current = onPrev;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        // Only handle horizontal swipes when not scrolling
        return (
          !isScrolling && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > HORIZONTAL_PAN_THRESHOLD
        );
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only handle horizontal swipes when not scrolling
        return (
          !isScrolling && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > HORIZONTAL_PAN_THRESHOLD
        );
      },
      onPanResponderGrant: () => {
        // pan.setOffset({
        //   x: currentPanX,
        //   y: 0,
        // });
        pan.current.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        setShowHints(true);
        const { dx } = gestureState;
        pan.current.setValue({ x: dx, y: 0 });
        // Trigger haptic feedback at max swipe distance
        const absDx = Math.abs(dx);
        if (absDx > MAX_SWIPE_DISTANCE && !hasTriggeredHaptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setHasTriggeredHaptic(true);
        } else if (absDx <= MAX_SWIPE_DISTANCE) {
          setHasTriggeredHaptic(false);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        setShowHints(false);
        if (Math.abs(dx) > SWIPE_THRESHOLD) dx > 0 ? _onPrev.current() : _onNext.current();

        Animated.spring(pan.current, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          overshootClamping: true,
          speed: 30
        }).start();
      },
      onPanResponderTerminate: () => {
        pan.current.flattenOffset();
        Animated.spring(pan.current, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          overshootClamping: true,
          damping: 30
        }).start();
      },
      onPanResponderReject: () => {
        pan.current.flattenOffset();
        Animated.spring(pan.current, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          overshootClamping: true,
          damping: 30
        }).start();
      },
    }),
  ).current;

  return (
    <View className="flex-1">
      <Animated.View
        className="flex-1"
        style={{
          transform: [{ translateX }],
          width: "100%",
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
      {/* Chapter indicators */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none"
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: [{ translateY: -20 }],
            opacity: pan.current.x.interpolate({
              inputRange: [0, MAX_SWIPE_DISTANCE],
              outputRange: [0, 1],
            }),
          }}
        >
          {prevHint}
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: [{ translateY: -20 }],
            opacity: pan.current.x.interpolate({
              inputRange: [-MAX_SWIPE_DISTANCE, 0],
              outputRange: [1, 0],
            }),
          }}
        >
          {nextHint}
        </Animated.View>
      </View>
    </View>
  );
};

export default SwipeableContainer;
