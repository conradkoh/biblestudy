import React, { useCallback } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { AnimatedLoader } from "@/src/components/core/AnimatedLoader";
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

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <TView className="flex-1 items-center justify-center py-16 h-full">
          <AnimatedLoader
            size={32}
            color={themeColors.textTertiary}
            iconName="search"
            animationType="bounce"
            duration={1200}
            style={{ marginBottom: 12 }}
          />
          <TText
            className="font-semibold text-center"
            style={{ color: themeColors.textSecondary }}
          >
            Searching...
          </TText>
        </TView>
      );
    }

    return (
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
    );
  }, [isLoading, emptyStateMessage, themeColors]);

  const renderFooter = useCallback(() => {
    if (!hasMore || isLoading) return null;

    return (
      <TView className="py-2 items-center">
        <TouchableOpacity onPress={handleLoadMore}>
          <TText style={{ color: themeColors.textHighlight }}>
            Load More
          </TText>
        </TouchableOpacity>
      </TView>
    );
  }, [hasMore, isLoading, handleLoadMore, themeColors]);

  return (
    <TView className={twMerge(`flex-1`, className)}>
      <BottomSheetFlatList
        data={isLoading ? [] : results}
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
