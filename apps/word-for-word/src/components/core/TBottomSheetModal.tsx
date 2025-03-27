import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import React from "react";

type TBottomSheetModalProps = BottomSheetModalProps & {
  children: React.ReactNode;
};

const TBottomSheetModal = React.forwardRef<BottomSheetModal, TBottomSheetModalProps>(({ children, ...props }, ref) => {
  const renderBackdrop = useBottomSheetBackdrop();
  const themeColors = useThemeColors();

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: themeColors.text }}
      backgroundStyle={{ backgroundColor: themeColors.surface }}
      {...props}
    >
      <BottomSheetView style={{ height: '100%' }}>
        <TSafeAreaView>
          {children}
        </TSafeAreaView>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

TBottomSheetModal.displayName = "TBottomSheetModal";

export default TBottomSheetModal;
