import { InterlinearVerse } from '@/assets/interlinear/interlinear.json';
import { TText } from '@/src/components/core/TText';
import { BibleCursorHandler } from '@/src/hooks/useBibleCursor';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { BibleStore, LexiconWord } from '@/src/stores/bible-store';
import { BookId, mapBookIdsToName } from '@common/utils/bible-data-utils';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import classNames from 'classnames';
import React, { FC } from 'react'
import { View } from 'react-native';

interface WordAlsoUsedInVerseItemProps {
  cursorHandler: BibleCursorHandler;
  bible: BibleStore;
  item: {
    bookId: BookId;
    chapter: number;
    verse: number;
    contents: InterlinearVerse["contents"];
  };
  currentStrongsWord: LexiconWord;
  onPress: () => void;
}

const WordAlsoUsedInVerseItem: FC<WordAlsoUsedInVerseItemProps> = ({ bible, cursorHandler, item, currentStrongsWord, onPress }) => {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      className="flex flex-col"
      style={{ gap: 4 }}
      onPress={() => {
        onPress();
      }}
    >
      <View className="flex-row" style={{ gap: 4 }}>
        <TText className="text-xs font-semibold">
          {mapBookIdsToName[item.bookId]} {item.chapter}
          :{item.verse}
        </TText>
        <TText className="text-xs font-semibold">
          {bible
            .getTranslation(cursorHandler.cursor.version)
            .abbreviation.toUpperCase()}
        </TText>
      </View>

      {/* Original version's text */}
      <View className="flex flex-row flex-wrap">
        <View
          className="rounded-md items-center justify-center px-1 mr-1"
          style={{
            backgroundColor: themeColors.textSecondary,
          }}
        >
          <TText
            className="text-xs"
            style={{
              color: themeColors.textContrast,
            }}
          >
            {bible
              .getTranslation(cursorHandler.cursor.version)
              .abbreviation.toUpperCase()}
          </TText>
        </View>
        {(
          bible.getBook(
            item.bookId,
            cursorHandler.cursor.version,
          )?.chapters[item.chapter - 1]?.verses[
            item.verse - 1
          ]?.text || ""
        )
          .split(" ")
          .map((t, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <TText key={i} className="mr-1 text-sm">
              {t}
            </TText>
          ))}
      </View>

      {/* Interlinear's English text */}
      <View className="flex flex-row flex-wrap">
        <View
          className="rounded-md items-center justify-center px-1 mr-1"
          style={{
            backgroundColor: themeColors.textSecondary,
          }}
        >
          <TText
            className="text-xs"
            style={{
              color: themeColors.textContrast,
            }}
          >
            Interlinear (KJV)
          </TText>
        </View>
        {item.contents.map((content, wordIdx) => (
          <TText
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={wordIdx}
            className={classNames("mr-1 text-sm", {
              "font-semibold":
                content.strongsNumber ===
                currentStrongsWord.strongs,
            })}
            style={{
              color:
                content.strongsNumber ===
                  currentStrongsWord.strongs
                  ? themeColors.success
                  : themeColors.text,
            }}
          >
            {content.text}
          </TText>
        ))}
      </View>
      {/* Original language text */}
      {/* <View className="flex flex-row flex-wrap">
                            {result.contents.map((content, wordIdx) => (
                              <TText
                                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                key={wordIdx}
                                className={classNames("mr-1 text-sm", {
                                  "text-green-700 font-semibold":
                                    content.strongsNumber ===
                                    currentStrongsWord.strongs,
                                })}
                              >
                                {content.originalWord}
                              </TText>
                            ))}
                          </View> */}
    </TouchableOpacity>
  )
}

export default WordAlsoUsedInVerseItem;
