import React, { useState, useCallback, useEffect } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import { SearchStrategyType } from "@/src/types/search";
import { getStrategyInfo } from "@/src/utils/search/search-registry";

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
    strategyType,
    onStrategyChange,
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

    // Get strategy info for display
    const strategyInfo = strategyType ? getStrategyInfo(strategyType) : null;

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

            {/* Strategy Indicator (if provided) */}
            {strategyInfo && (
                <TouchableOpacity
                    onPress={() => {
                        // Cycle through available strategies
                        const strategies: SearchStrategyType[] = [
                            "simple_substring" as SearchStrategyType,
                            "keyword" as SearchStrategyType,
                        ];
                        const currentIndex = strategies.indexOf(strategyType || SearchStrategyType.SIMPLE_SUBSTRING);
                        const nextIndex = (currentIndex + 1) % strategies.length;
                        const nextStrategy = strategies[nextIndex];
                        if (nextStrategy) {
                            onStrategyChange?.(nextStrategy);
                        }
                    }}
                    hitSlop={HITSLOP_DEFAULT}
                    style={{ marginRight: 8 }}
                >
                    <TText
                        className="text-xs px-2 py-1 rounded"
                        style={{
                            backgroundColor: themeColors.surfaceTertiary,
                            color: themeColors.textSecondary,
                        }}
                    >
                        {strategyInfo.name}
                    </TText>
                </TouchableOpacity>
            )}

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