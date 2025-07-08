import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { BibleSearchInput } from "./bible-search-input";
import { BibleSearchResults } from "./bible-search-results";
import { useBibleSearch } from "@/src/hooks/useBibleSearch";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import type { SearchResultItem } from "@/src/types/search";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface BibleSearchBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  cursorHandler: BibleCursorHandler;
  initialQuery?: string;
  onSearchResultSelect?: (result: SearchResultItem) => void;
}

export const BibleSearchBottomSheet: React.FC<BibleSearchBottomSheetProps> = ({
  isVisible,
  onClose,
  cursorHandler,
  initialQuery = "",
  onSearchResultSelect
}) => {
  const themeColors = useThemeColors();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const renderBackdrop = useBottomSheetBackdrop({ opacity: 0.3 });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["95%"], []);

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
    setQuery
  } = useBibleSearch(cursorHandler.cursor);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      clearResults();
      onClose();
    }
  }, [onClose, clearResults]);

  // Handle result selection
  const handleResultPress = useCallback((result: SearchResultItem) => {
    // Navigate to the selected verse
    cursorHandler.updateCursor({
      bookId: result.bookId,
      chapter: result.chapter,
      verse: result.verse,
      version: result.version
    });

    // Trigger search result highlighting
    onSearchResultSelect?.(result);

    // Close the search bottom sheet
    onClose();
  }, [cursorHandler, onClose, onSearchResultSelect]);

  // Handle search input
  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      performSearch(query, selectedStrategy);
    } else {
      clearResults();
    }
  }, [performSearch, selectedStrategy, clearResults]);

  // Handle clear
  const handleClear = useCallback(() => {
    clearResults();
    setQuery("");
  }, [clearResults, setQuery]);

  // Handle debounce state change
  const handleDebounceStateChange = useCallback((isDebouncing: boolean) => {
    setIsDebouncing(isDebouncing);
  }, []);

  // Handle focus state change
  const handleFocusChange = useCallback((isFocused: boolean) => {
    setIsFocused(isFocused);
  }, []);

  // Show/hide bottom sheet based on visibility prop
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
      // Set initial query if provided
      if (initialQuery && !searchQuery) {
        setQuery(initialQuery);
        performSearch(initialQuery, selectedStrategy);
      }
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, initialQuery, searchQuery, setQuery, performSearch, selectedStrategy]);

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
      safeAreaViewEdges={isFocused ? [] : undefined}
    >
      <TView className="flex-1 px-4">

        {/* Search Input */}
        <TView className="mb-4">
          <BibleSearchInput
            value={searchQuery}
            onSearch={handleSearch}
            onClear={handleClear}
            placeholder="Search for words, phrases, or topics..."
            isLoading={isLoading}
            onDebounceStateChange={handleDebounceStateChange}
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
              {totalCount} result{totalCount !== 1 ? 's' : ''} found
            </TText>
          </TView>
        )}

        {/* Error Message */}
        {error && (
          <TView className="mb-3 p-3 rounded-lg" style={{ backgroundColor: themeColors.error + '20' }}>
            <TText
              className="text-sm"
              style={{ color: themeColors.error }}
            >
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
            isTyping={isDebouncing}
            hasMore={hasMore}
            onLoadMore={loadMore}
            emptyStateMessage={
              searchQuery.trim()
                ? "No results found for your search"
                : "Enter a search term to find verses"
            }
          />
        </TView>
      </TView>
    </TBottomSheetModal>
  );
}; 
