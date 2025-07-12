import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TView } from "@/src/components/core/TView";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { useBottomSheetBackHandler } from "@/src/hooks/useBottomSheetBackHandler";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React, { ComponentProps } from "react";
import { View } from "react-native";
import {
  Edge,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type TBottomSheetModalProps = BottomSheetModalProps & {
  children: React.ReactNode;
  /**
   * If defined, means we enabled SafeAreaView
   * default: { edges: ['bottom'] } // will wrap
   */
  safeAreaProps?: (ComponentProps<typeof View> & { edges?: Edge[] }) | false;
  /**
   * If defined, means we want to wrap bottom sheet container
   * default: {} // will wrap
   */
  bottomSheetViewProps?:
    | Omit<ComponentProps<typeof BottomSheetView>, "children">
    | false;
  /**
   * If true, will wrap children in a BottomSheetScrollView
   * default: false
   */
  scrollViewProps?: Omit<
    ComponentProps<typeof BottomSheetScrollView>,
    "children"
  >;
};

const TBottomSheetModal = React.forwardRef<
  BottomSheetModal,
  TBottomSheetModalProps
>(
  (
    {
      children,
      safeAreaProps = { edges: ["bottom"] },
      scrollViewProps,
      bottomSheetViewProps = {},
      ...props
    },
    ref
  ) => {
    const renderBackdrop = useBottomSheetBackdrop();
    const themeColors = useThemeColors();

    const { handleSheetPositionChange } = useBottomSheetBackHandler(ref);

    // IMPORTABNT: bug with SafeAreaView from react-native-safe-area-context
    // Doesn't work inside bottom sheet modal
    const safeAreaInsets = useSafeAreaInsets();

    function withSafeAreaView(children: React.ReactNode) {
      if (safeAreaProps) {
        const edges: Edge[] = safeAreaProps.edges ?? ["bottom"];
        const hasBottom = edges.includes("bottom");
        const hasTop = edges.includes("top");

        return (
          <TView
            style={{
              ...(hasBottom && { paddingBottom: safeAreaInsets.bottom }),
              ...(hasTop && { paddingTop: safeAreaInsets.top }),
            }}
            {...safeAreaProps}
          >
            {children}
          </TView>
        );
      }
      return children;
    }

    function withScrollView(children: React.ReactNode) {
      if (scrollViewProps) {
        return (
          <BottomSheetScrollView keyboardShouldPersistTaps="handled">
            {withSafeAreaView(children)}
          </BottomSheetScrollView>
        );
      }

      if (bottomSheetViewProps === false) {
        return withSafeAreaView(children);
      }

      return (
        <BottomSheetView {...bottomSheetViewProps}>
          {withSafeAreaView(children)}
        </BottomSheetView>
      );
    }

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: themeColors.text }}
        backgroundStyle={{ backgroundColor: themeColors.surface }}
        {...props}
        onChange={(params) => {
          handleSheetPositionChange(params);
          props.onChange?.(params);
        }}
      >
        <SafeAreaProvider>{withScrollView(children)}</SafeAreaProvider>
      </BottomSheetModal>
    );
  }
);

TBottomSheetModal.displayName = "TBottomSheetModal";

export default TBottomSheetModal;
