import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { useBottomSheetBackHandler } from "@/src/hooks/useBottomSheetBackHandler";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React from "react";
import { Edges } from "react-native-safe-area-context";

type TBottomSheetModalProps = BottomSheetModalProps & {
  children: React.ReactNode;
  enableSafeAreaView?: boolean;
  safeAreaViewEdges?: Edges;
  enableScrollView?: boolean;
  skipBottomSheetContainer?: boolean;
};

const TBottomSheetModal = React.forwardRef<BottomSheetModal, TBottomSheetModalProps>(({ children, safeAreaViewEdges = ['bottom'], enableSafeAreaView = true, enableScrollView = false, skipBottomSheetContainer = false, ...props }, ref) => {
  const renderBackdrop = useBottomSheetBackdrop();
  const themeColors = useThemeColors();

  const { handleSheetPositionChange } = useBottomSheetBackHandler(ref);

  function withSafeAreaView(children: React.ReactNode) {
    if (enableSafeAreaView) {
      return (
        <TSafeAreaView edges={safeAreaViewEdges}>
          {children}
        </TSafeAreaView>
      );
    }
    return children;
  }

  function withScrollView(children: React.ReactNode) {
    if (enableScrollView) {
      return (
        <BottomSheetScrollView>
          {withSafeAreaView(children)}
        </BottomSheetScrollView>
      );
    }

    if (!skipBottomSheetContainer) {
      return withSafeAreaView(children);
    }

    return <BottomSheetView style={{ height: '100%' }}>
      {withSafeAreaView(children)}
    </BottomSheetView>
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
      {withScrollView(children)}
    </BottomSheetModal>
  );
});

TBottomSheetModal.displayName = "TBottomSheetModal";

export default TBottomSheetModal;
