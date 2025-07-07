import React from "react";
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

/**
 * Custom hook to create a reusable bottom sheet backdrop component.
 *
 * @returns A reusable backdrop component
 */
const useBottomSheetBackdrop = (
  injectProps: { opacity?: number } = {},
) => {
  // Create a custom backdrop component that can be used directly
  const CustomBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={injectProps.opacity}
      />
    ),
    [injectProps.opacity],
  );

  return CustomBackdrop;
};

export default useBottomSheetBackdrop;
