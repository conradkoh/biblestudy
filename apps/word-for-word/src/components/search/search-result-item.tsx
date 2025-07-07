import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { HITSLOP_DEFAULT } from "@/src/consts/hitslop";
import type { SearchResultItem } from "@/src/types/search";
import { getVerseNameFormatted } from "@common/utils/bible-data-utils";
import type { BibleCursor } from "@common/utils/bible-data-utils";

interface SearchResultItemProps {
  item: SearchResultItem;
  onPress: (item: SearchResultItem) => void;
  themeColors: any;
}

export const SearchResultItemComponent: React.FC<SearchResultItemProps> = ({
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

    return <TText className="text-sm">{parts}</TText>;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={HITSLOP_DEFAULT}
      className="mb-2"
    >
      <TView
        className="p-2 rounded-md"
        style={{
          backgroundColor: themeColors.surfaceSecondary,
          borderColor: themeColors.border,
          borderWidth: 0.5,
        }}
      >
        {/* Verse Reference and Version */}
        <View className="flex-row items-center mb-1">
          <TText
            className="font-semibold text-sm"
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
        <TView>
          {renderHighlightedText(item.text, item.matches)}
        </TView>
      </TView>
    </TouchableOpacity>
  );
}; 
