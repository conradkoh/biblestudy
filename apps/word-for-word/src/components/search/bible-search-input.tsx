import React, { useState, useCallback, useEffect } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { SearchStrategyType } from "@/src/types/search";

interface BibleSearchInputProps {
  value: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
  strategyType?: SearchStrategyType;
  onStrategyChange?: (strategy: SearchStrategyType) => void;
  isLoading?: boolean;
  className?: string;
}

export const BibleSearchInput: React.FC<BibleSearchInputProps> = ({
  value,
  onSearch,
  onClear,
  placeholder = "Search Bible...",
  debounceMs = 300,
  isLoading = false,
  className = ""
}) => {
  const themeColors = useThemeColors();
  const [inputValue, setInputValue] = useState(value);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [onSearch, debounceMs, debounceTimeout]);

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setInputValue("");
    onClear?.();
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  }, [onClear, debounceTimeout]);
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
          color: isLoading ? themeColors.textTertiary : themeColors.textSecondary,
          marginRight: 8
        }}
      />

      {/* Search Input */}
      <TextInput
        value={inputValue}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        placeholderTextColor={themeColors.textTertiary}
        style={{
          flex: 1,
          color: themeColors.text,
          fontSize: 16,
          fontFamily: "System",
        }}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={{ marginRight: 8 }}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            style={{ color: themeColors.textTertiary }}
          />
        </View>
      )}

      {/* Clear Button */}
      {inputValue.length > 0 && !isLoading && (
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
