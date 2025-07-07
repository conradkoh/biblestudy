import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { SearchResultItem } from "@/src/types/search";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { twMerge } from "tailwind-merge";
import { SearchResultItemComponent } from "./search-result-item";

interface BibleSearchResultsProps {
  results: SearchResultItem[];
  onResultPress: (result: SearchResultItem) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyStateMessage?: string;
  className?: string;
}



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
    <TView className="flex-1 items-center justify-center py-4">
      <Ionicons
        name="search"
        size={32}
        style={{ color: themeColors.textTertiary, marginBottom: 12 }}
      />
      <TText
        className="font-semibold text-center"
        style={{ color: themeColors.textSecondary }}
      >
        {emptyStateMessage}
      </TText>
    </TView>
  ), [emptyStateMessage, themeColors]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <TView className="py-2 items-center">
        {isLoading ? (
          <TText style={{ color: themeColors.textTertiary }}>
            Loading...
          </TText>
        ) : (
          <TouchableOpacity onPress={handleLoadMore}>
            <TText style={{ color: themeColors.textHighlight }}>
              Load More
            </TText>
          </TouchableOpacity>
        )}
      </TView>
    );
  }, [hasMore, isLoading, handleLoadMore, themeColors]);

  return (
    <TView className={twMerge(`flex-1`, className)}>
      <BottomSheetFlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse}-${item.version}`}
        contentContainerStyle={{ padding: 2 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={15}
        initialNumToRender={10}
        getItemLayout={undefined}
      />
    </TView>
  );
}; 
