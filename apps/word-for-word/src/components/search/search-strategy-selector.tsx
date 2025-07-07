import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TText } from '@/src/components/core/TText';
import { TView } from '@/src/components/core/TView';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { SearchStrategyType } from '@/src/types/search';
import { Ionicons } from '@expo/vector-icons';

export interface SearchStrategyOption {
    type: SearchStrategyType;
    label: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const SEARCH_STRATEGIES: SearchStrategyOption[] = [
    {
        type: SearchStrategyType.SIMPLE_SUBSTRING,
        label: 'Simple Search',
        description: 'Find exact text matches',
        icon: 'text-sharp',
    },
    {
        type: SearchStrategyType.KEYWORD,
        label: 'Keyword Search',
        description: 'Find verses containing keywords',
        icon: 'key-sharp',
    },
    {
        type: SearchStrategyType.ADVANCED,
        label: 'Advanced Search',
        description: 'Smart search with scoring',
        icon: 'search-sharp',
    },
    {
        type: SearchStrategyType.AI_ASSISTANT,
        label: 'AI Assistant',
        description: 'AI-powered search (coming soon)',
        icon: 'sparkles-sharp',
    },
];

interface SearchStrategySelectorProps {
    selectedStrategy: SearchStrategyType;
    onStrategyChange: (strategy: SearchStrategyType) => void;
    availableStrategies?: SearchStrategyType[];
}

export function SearchStrategySelector({
    selectedStrategy,
    onStrategyChange,
    availableStrategies = Object.values(SearchStrategyType),
}: SearchStrategySelectorProps) {
    const themeColors = useThemeColors();

    const filteredStrategies = SEARCH_STRATEGIES.filter(strategy =>
        availableStrategies.includes(strategy.type)
    );

    return (
        <TView className="p-4">
            <TText className="text-lg font-semibold mb-3" style={{ color: themeColors.text }}>
                Search Strategy
            </TText>
            <View className="space-y-2">
                {filteredStrategies.map((strategy) => {
                    const isSelected = strategy.type === selectedStrategy;
                    const isDisabled = strategy.type === SearchStrategyType.AI_ASSISTANT;

                    return (
                        <TouchableOpacity
                            key={strategy.type}
                            onPress={() => !isDisabled && onStrategyChange(strategy.type)}
                            disabled={isDisabled}
                            className={`p-3 rounded-lg border ${isSelected ? 'border-2' : 'border'
                                } ${isDisabled ? 'opacity-50' : ''}`}
                            style={{
                                backgroundColor: isSelected ? themeColors.surfaceSecondary : themeColors.surface,
                                borderColor: isSelected ? themeColors.textHighlight : themeColors.border,
                            }}
                        >
                            <View className="flex-row items-center">
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                    style={{
                                        backgroundColor: isSelected ? themeColors.textHighlight : themeColors.surfaceSecondary,
                                    }}
                                >
                                    <Ionicons
                                        name={strategy.icon}
                                        size={20}
                                        style={{ color: isSelected ? themeColors.surface : themeColors.text }}
                                    />
                                </View>
                                <View className="flex-1">
                                    <TText
                                        className="font-semibold text-base"
                                        style={{ color: themeColors.text }}
                                    >
                                        {strategy.label}
                                    </TText>
                                    <TText
                                        className="text-sm mt-1"
                                        style={{ color: themeColors.textSecondary }}
                                    >
                                        {strategy.description}
                                    </TText>
                                </View>
                                {isSelected && (
                                    <Ionicons
                                        name="checkmark-circle-sharp"
                                        size={24}
                                        style={{ color: themeColors.textHighlight }}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </TView>
    );
} 