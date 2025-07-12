import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useBibleSearch } from "@/src/hooks/useBibleSearch";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { SearchResultItem } from "@/src/types/search";
import { SearchStrategyType } from "@/src/types/search";
import { getSearchStrategy } from "@/src/utils/search/search-registry";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BibleSearchInput,
  type BibleSearchInputRef,
} from "./bible-search-input";
import { BibleSearchResults } from "./bible-search-results";
import Ionicons from "@expo/vector-icons/Ionicons";

interface BibleSearchBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  cursorHandler: BibleCursorHandler;
  onSearchResultSelect?: (result: SearchResultItem) => void;
}

export const BibleSearchBottomSheet: React.FC<BibleSearchBottomSheetProps> = ({
  isVisible,
  onClose,
  cursorHandler,
  onSearchResultSelect,
}) => {
  const themeColors = useThemeColors();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const searchInputRef = useRef<BibleSearchInputRef>(null);
  const renderBackdrop = useBottomSheetBackdrop({ opacity: 0.3 });
  const [isFocused, setIsFocused] = useState(false);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["90%"], []);

  // Search hook
  const {
    searchQuery,
    searchResults,
    isLoading,
    selectedStrategy,
    totalCount,
    hasMore,
    error,
    isInitialLoading,
    performSearch,
    clearResults,
    loadMore,
    setQuery,
    setStrategy,
  } = useBibleSearch(cursorHandler.cursor);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        clearResults();
        onClose();
      }
    },
    [onClose, clearResults]
  );

  // Handle result selection
  const handleResultPress = useCallback(
    (result: SearchResultItem) => {
      // Navigate to the selected verse
      cursorHandler.updateCursor({
        bookId: result.bookId,
        chapter: result.chapter,
        verse: result.verse,
        version: result.version,
      });

      // Trigger search result highlighting
      onSearchResultSelect?.(result);

      // Close the search bottom sheet
      onClose();
    },
    [cursorHandler, onClose, onSearchResultSelect]
  );

  // Handle search input
  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        const limit =
          selectedStrategy === SearchStrategyType.AI_ASSISTANT ? 15 : 50;
        performSearch(query, selectedStrategy, limit);
      } else {
        clearResults();
      }
    },
    [performSearch, selectedStrategy, clearResults]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    clearResults();
    setQuery("");
  }, [clearResults, setQuery]);

  // Handle strategy change
  const handleStrategyChange = useCallback(
    (currentStrategy: SearchStrategyType) => {
      // Show option selector with available strategies
      CommonEvents.emit("SHOW_OPTION_SELECTOR_BOTTOM_SHEET", {
        title: "Search Strategy",
        options: [
          {
            id: "simple_substring",
            label: getSearchStrategy(SearchStrategyType.SIMPLE_SUBSTRING)?.name,
            description: getSearchStrategy(SearchStrategyType.SIMPLE_SUBSTRING)
              ?.description,
            onSelect: () => {
              setStrategy(SearchStrategyType.SIMPLE_SUBSTRING);
              // Focus the input after strategy is set
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            },
          },
          {
            id: "keyword",
            label: getSearchStrategy(SearchStrategyType.KEYWORD)?.name,
            description: getSearchStrategy(SearchStrategyType.KEYWORD)
              ?.description,
            onSelect: () => {
              setStrategy(SearchStrategyType.KEYWORD);
              // Focus the input after strategy is set
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            },
          },
          {
            id: "ai_assistant",
            icon: (
              <Ionicons
                name="sparkles"
                size={12}
                color={themeColors.text}
                style={{ marginRight: 4 }}
              />
            ),
            label: getSearchStrategy(SearchStrategyType.AI_ASSISTANT)?.name,
            description: getSearchStrategy(SearchStrategyType.AI_ASSISTANT)
              ?.description,
            onSelect: () => {
              setStrategy(SearchStrategyType.AI_ASSISTANT);
              // Focus the input after strategy is set
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            },
          },
        ],
      });
    },
    [setStrategy]
  );

  // Handle focus state change
  const handleFocusChange = useCallback((isFocused: boolean) => {
    setIsFocused(isFocused);
  }, []);

  // Show/hide bottom sheet based on visibility prop
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, searchQuery, setQuery, performSearch, selectedStrategy]);

  return (
    <TBottomSheetModal
      keyboardBehavior="extend"
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      handleIndicatorStyle={{
        backgroundColor: themeColors.textTertiary,
      }}
      backgroundStyle={{
        backgroundColor: themeColors.surface,
      }}
      backdropComponent={renderBackdrop}
      safeAreaProps={{
        edges: isFocused ? [] : ["bottom"],
        style: { height: "100%" },
      }}
    >
      <TView className="flex-1 px-4">
        {/* Search Input */}
        <TView className="mb-4">
          <BibleSearchInput
            ref={searchInputRef}
            value={searchQuery}
            onSearch={handleSearch}
            onClear={handleClear}
            placeholder="Search for words, phrases, or topics..."
            strategyType={selectedStrategy}
            onStrategyChange={handleStrategyChange}
            isLoading={isLoading}
            onFocusChange={handleFocusChange}
          />
        </TView>

        {/* Results Count */}
        {!isInitialLoading && totalCount > 0 && (
          <TView className="mb-3">
            <TText
              className="text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              {totalCount} result{totalCount !== 1 ? "s" : ""} found
            </TText>
          </TView>
        )}

        {/* Error Message */}
        {error && (
          <TView
            className="mb-3 p-3 rounded-lg"
            style={{ backgroundColor: themeColors.error + "20" }}
          >
            <TText className="text-sm" style={{ color: themeColors.error }}>
              {error}
            </TText>
          </TView>
        )}

        {/* Search Results */}
        <TView className="flex-1">
          <BibleSearchResults
            results={searchResults}
            onResultPress={handleResultPress}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            emptyStateMessage={
              searchQuery.trim()
                ? "No results found for your search"
                : "Press enter to search"
            }
          />
        </TView>
      </TView>
    </TBottomSheetModal>
  );
};
