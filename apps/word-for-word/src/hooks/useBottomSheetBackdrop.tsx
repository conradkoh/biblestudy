import React from 'react';
import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

/**
 * Custom hook to create a reusable bottom sheet backdrop component.
 * 
 * @returns A reusable backdrop component
 */
const useBottomSheetBackdrop = () => {
  // Create a custom backdrop component that can be used directly
  const CustomBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return CustomBackdrop;
};

export default useBottomSheetBackdrop;
