import React, { useState, useCallback, useEffect } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TView } from "@/src/components/core/TView";
import { AnimatedLoader } from "@/src/components/core/AnimatedLoader";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { SearchStrategyType } from "@/src/types/search";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

interface BibleSearchInputProps {
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
  strategyType?: SearchStrategyType;
  onStrategyChange?: (strategy: SearchStrategyType) => void;
  isLoading?: boolean;
  onDebounceStateChange?: (isDebouncing: boolean) => void;
  onFocusChange?: (isFocused: boolean) => void;
  className?: string;
}

export const BibleSearchInput: React.FC<BibleSearchInputProps> = ({
  value,
  onSearch,
  onClear,
  placeholder = "Search Bible...",
  debounceMs = 700,
  isLoading = false,
  onDebounceStateChange,
  onFocusChange,
  className = ""
}) => {
  const themeColors = useThemeColors();
  const [inputValue, setInputValue] = useState(value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set debouncing state to true when starting a new debounced search
    setIsDebouncing(true);
    onDebounceStateChange?.(true);

    const timeout = setTimeout(() => {
      onSearch(query);
      // Set debouncing state to false when search is executed
      setIsDebouncing(false);
      onDebounceStateChange?.(false);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [onSearch, debounceMs, debounceTimeout, onDebounceStateChange]);

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Handle focus change
  const handleFocus = useCallback(() => {
    onFocusChange?.(true);
  }, [onFocusChange]);

  const handleBlur = useCallback(() => {
    onFocusChange?.(false);
  }, [onFocusChange]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInputValue("");
    onClear?.();
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    // Clear debouncing state when clearing
    setIsDebouncing(false);
    onDebounceStateChange?.(false);
  }, [onClear, debounceTimeout, onDebounceStateChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return (
    <TView
      className={`flex-row items-center px-3 py-2 rounded-lg ${className}`}
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
          color: (isLoading || isDebouncing) ? themeColors.textTertiary : themeColors.textSecondary,
          marginRight: 8
        }}
      />

      {/* Search Input */}
      <BottomSheetTextInput
        value={inputValue}
        onChangeText={handleInputChange}
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
        autoCorrect={false}
        autoFocus
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
      />

      {/* Clear Button */}
      {inputValue.length > 0 && !isLoading && !isDebouncing && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={HITSLOP_DEFAULT}
        >
          <Ionicons
            name="close-circle"
            size={20}
            style={{ color: themeColors.textSecondary }}
          />
        </TouchableOpacity>
      )}
    </TView>
  );
}; 
