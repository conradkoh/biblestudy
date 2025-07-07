import React, { useCallback } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import type { SearchResultItem } from "@/src/types/search";
import { getVerseNameFormatted } from "@common/utils/bible-data-utils";
import type { BibleCursor } from "@common/utils/bible-data-utils";

interface BibleSearchResultsProps {
  results: SearchResultItem[];
  onResultPress: (result: SearchResultItem) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyStateMessage?: string;
  className?: string;
}

interface SearchResultItemProps {
  item: SearchResultItem;
  onPress: (item: SearchResultItem) => void;
  themeColors: any;
}

const SearchResultItemComponent: React.FC<SearchResultItemProps> = ({
  item,
  onPress,
  themeColors
}) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  // Create cursor for verse reference
  const cursor: BibleCursor = {
    bookId: item.bookId,
    chapter: item.chapter,
    verse: item.verse,
    version: item.version
  };

  // Highlight matches in text
  const renderHighlightedText = (text: string, matches: SearchResultItem['matches']) => {
    if (matches.length === 0) {
      return <TText style={{ color: themeColors.text }}>{text}</TText>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Sort matches by start index
    const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

    sortedMatches.forEach((match, index) => {
      // Add text before match
      if (match.startIndex > lastIndex) {
        parts.push(
          <TText key={`text-${index}`} style={{ color: themeColors.text }}>
            {text.substring(lastIndex, match.startIndex)}
          </TText>
        );
      }

      // Add highlighted match
      parts.push(
        <TText
          key={`match-${index}`}
          style={{
            color: themeColors.textHighlight,
            fontWeight: 'bold',
            backgroundColor: themeColors.surfaceHighlight
          }}
        >
          {text.substring(match.startIndex, match.endIndex)}
        </TText>
      );

      lastIndex = match.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <TText key="text-end" style={{ color: themeColors.text }}>
          {text.substring(lastIndex)}
        </TText>
      );
    }

    return <>{parts}</>;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={HITSLOP_DEFAULT}
      className="mb-3"
    >
      <TView
        className="p-3 rounded-lg"
        style={{
          backgroundColor: themeColors.surfaceSecondary,
          borderColor: themeColors.border,
          borderWidth: 1,
        }}
      >
        {/* Verse Reference */}
        <View className="flex-row items-center mb-2">
          <Ionicons
            name="book"
            size={16}
            style={{ color: themeColors.textSecondary, marginRight: 6 }}
          />
          <TText
            className="font-bold text-sm"
            style={{ color: themeColors.textHighlight }}
          >
            {getVerseNameFormatted(cursor)}
          </TText>
          <View className="flex-1" />
          <TText
            className="text-xs"
            style={{ color: themeColors.textTertiary }}
          >
            {item.version.toUpperCase()}
          </TText>
        </View>

        {/* Verse Text */}
        <TView className="mb-2">
          {renderHighlightedText(item.text, item.matches)}
        </TView>

        {/* Context (if available) */}
        {item.context && (item.context.previousVerse || item.context.nextVerse) && (
          <TView className="mt-2 pt-2" style={{ borderTopColor: themeColors.border, borderTopWidth: 1 }}>
            {item.context.previousVerse && (
              <TText
                className="text-xs mb-1"
                style={{ color: themeColors.textSecondary }}
              >
                ...{item.context.previousVerse}
              </TText>
            )}
            {item.context.nextVerse && (
              <TText
                className="text-xs"
                style={{ color: themeColors.textSecondary }}
              >
                {item.context.nextVerse}...
              </TText>
            )}
          </TView>
        )}

        {/* Relevance Score */}
        <View className="flex-row items-center mt-2">
          <Ionicons
            name="star"
            size={12}
            style={{ color: themeColors.warning, marginRight: 4 }}
          />
          <TText
            className="text-xs"
            style={{ color: themeColors.textTertiary }}
          >
            Score: {item.relevanceScore.toFixed(1)}
          </TText>
        </View>
      </TView>
    </TouchableOpacity>
  );
};

export const BibleSearchResults: React.FC<BibleSearchResultsProps> = ({
  results,
  onResultPress,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  emptyStateMessage = "No results found",
  className = ""
}) => {
  const themeColors = useThemeColors();

  const renderItem = useCallback(({ item }: { item: SearchResultItem }) => (
    <SearchResultItemComponent
      item={item}
      onPress={onResultPress}
      themeColors={themeColors}
    />
  ), [onResultPress, themeColors]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && onLoadMore && !isLoading) {
      onLoadMore();
    }
  }, [hasMore, onLoadMore, isLoading]);

  const renderEmptyState = useCallback(() => (
    <TView className="flex-1 items-center justify-center py-8">
      <Ionicons
        name="search"
        size={48}
        style={{ color: themeColors.textTertiary, marginBottom: 16 }}
      />
      <TText
        className="text-lg font-bold mb-2"
        style={{ color: themeColors.textSecondary }}
      >
        {emptyStateMessage}
      </TText>
      <TText
        className="text-sm text-center px-8"
        style={{ color: themeColors.textTertiary }}
      >
        Try searching for different words or phrases
      </TText>
    </TView>
  ), [emptyStateMessage, themeColors]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <TView className="py-4 items-center">
        {isLoading ? (
          <TText style={{ color: themeColors.textTertiary }}>
            Loading more results...
          </TText>
        ) : (
          <TouchableOpacity onPress={handleLoadMore}>
            <TText style={{ color: themeColors.textHighlight }}>
              Load More Results
            </TText>
          </TouchableOpacity>
        )}
      </TView>
    );
  }, [hasMore, isLoading, handleLoadMore, themeColors]);

  return (
    <TView className={`flex-1 ${className}`}>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse}-${item.version}`}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </TView>
  );
}; 
