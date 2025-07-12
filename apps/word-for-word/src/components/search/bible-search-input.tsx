import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { SearchStrategyType } from "@/src/types/search";
import { getSearchStrategy } from "@/src/utils/search/search-registry";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Keyboard, TouchableOpacity } from "react-native";

interface BibleSearchInputProps {
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  strategyType?: SearchStrategyType;
  onStrategyChange?: (strategy: SearchStrategyType) => void;
  isLoading?: boolean;
  onFocusChange?: (isFocused: boolean) => void;
  className?: string;
}

export interface BibleSearchInputRef {
  focus: () => void;
}

export const BibleSearchInput = forwardRef<
  BibleSearchInputRef,
  BibleSearchInputProps
>(
  (
    {
      value,
      onSearch,
      onClear,
      onChangeText,
      placeholder = "Search Bible...",
      strategyType = SearchStrategyType.KEYWORD,
      onStrategyChange,
      isLoading = false,
      onFocusChange,
      className = "",
    },
    ref
  ) => {
    const themeColors = useThemeColors();
    const inputRef = React.useRef<any>(null);

    // Expose focus method to parent component
    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          inputRef.current?.focus();
        },
      }),
      []
    );

    // Handle input change
    const handleInputChange = useCallback(
      (text: string) => {
        onChangeText?.(text);
      },
      [onChangeText]
    );

    // Handle search submission (when user presses return)
    const handleSubmitEditing = useCallback(() => {
      if (value.trim()) {
        onSearch(value.trim());
      }
    }, [value, onSearch]);

    // Handle focus change
    const handleFocus = useCallback(() => {
      onFocusChange?.(true);
    }, [onFocusChange]);

    const handleBlur = useCallback(() => {
      onFocusChange?.(false);
    }, [onFocusChange]);

    // Handle clear
    const handleClear = useCallback(() => {
      onChangeText?.("");
      onClear?.();
    }, [onChangeText, onClear]);

    // Handle strategy button press
    const handleStrategyPress = useCallback(() => {
      // This will be handled by the parent component to show the option selector
      onStrategyChange?.(strategyType);
      Keyboard.dismiss();
    }, [onStrategyChange, strategyType]);

    return (
      <TView
        className={`flex-row items-center pl-3 pr-2 py-2 rounded-lg ${className}`}
        style={{
          backgroundColor: themeColors.surfaceSecondary,
          borderColor: themeColors.border,
          borderWidth: 1,
        }}
      >
        {/* Search Icon */}
        <Ionicons
          name="search"
          size={20}
          style={{
            color: isLoading
              ? themeColors.textTertiary
              : themeColors.textSecondary,
            marginRight: 8,
          }}
        />

        {/* Search Input */}
        <BottomSheetTextInput
          ref={inputRef}
          value={value}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={themeColors.textTertiary}
          style={{
            flex: 1,
            color: themeColors.text,
            fontSize: 16,
            fontFamily: "System",
          }}
          autoFocus
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
          blurOnSubmit={false}
        />

        {/* Clear Button */}
        {value.length > 0 && !isLoading && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={HITSLOP_DEFAULT}
            className="ml-1"
          >
            <Ionicons
              name="close-circle"
              size={20}
              style={{ color: themeColors.textSecondary }}
            />
          </TouchableOpacity>
        )}

        {/* Strategy Selector Button */}
        <TouchableOpacity
          onPress={() => {
            handleStrategyPress();
          }}
          hitSlop={HITSLOP_DEFAULT}
          style={{
            gap: 4,
            backgroundColor: themeColors.surface,
            borderWidth: 1,
            borderColor: themeColors.border,
          }}
          className="flex-row items-center ml-1 px-2 py-0.5 rounded-md"
        >
          <TText className="text-xs text-textSecondary">
            {getSearchStrategy(strategyType)?.name}
          </TText>
          <Ionicons
            name="chevron-down"
            size={12}
            style={{
              color: themeColors.textSecondary,
            }}
          />
        </TouchableOpacity>
      </TView>
    );
  }
);
