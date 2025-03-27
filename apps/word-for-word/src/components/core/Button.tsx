import { useThemeColors } from "@/src/hooks/useThemeColors";
import React from "react";
import {
  ActivityIndicator,
  type StyleProp,
  type TextStyle,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { twMerge } from "tailwind-merge";

export type ButtonProps = Omit<TouchableOpacityProps, "ref" | "children"> & {
  size?: "small" | "medium";
  isLoading?: boolean;
  leadingIcon?: (props: { style: StyleProp<TextStyle> }) => React.ReactNode;
  trailingIcon?: (props: { style: StyleProp<TextStyle> }) => React.ReactNode;
  children: (props: unknown) => React.ReactNode;
};

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  function Button(
    {
      children,
      style,
      leadingIcon,
      trailingIcon,
      size,
      disabled,
      isLoading,
      ...otherProps
    },
    forwardedRef,
  ) {
    const themeColors = useThemeColors();
    const divRef = React.useRef<TouchableOpacity | null>(null);

    return (
      <TouchableOpacity
        ref={(ref) => {
          if (forwardedRef) {
            if (typeof forwardedRef === "function") {
              forwardedRef(ref);
            } else {
              forwardedRef.current = ref;
            }
          }

          divRef.current = ref;
        }}
        style={[{ gap: 4 }, style]}
        {...otherProps}
        className={twMerge(
          "flex flex-row items-center justify-center",
          otherProps.className,
        )}
      >
        {isLoading && (
          <ActivityIndicator
            color={
              themeColors.text
            } /** lazy, haven't implemented dynamic colors yet */
          />
        )}
        {!isLoading &&
          leadingIcon &&
          leadingIcon({ style: { color: themeColors.text } })}
        {!isLoading && children({})}
        {!isLoading &&
          trailingIcon &&
          trailingIcon({ style: { color: themeColors.text } })}
      </TouchableOpacity>
    );
  },
);
