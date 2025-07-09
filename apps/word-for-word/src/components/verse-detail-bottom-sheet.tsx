import { CustomBottomSheetBackdrop } from "@/src/components/core/CustomBottomSheetBackdrop";
import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TText } from "@/src/components/core/TText";
import VerseActions from "@/src/components/verse-actions";
import WordAlsoUsedInBottomSheet from "@/src/components/word-also-used-in-bottom-sheet";
import WordAlsoUsedInVerseItem from "@/src/components/word-also-used-in-verse-item";
import type { BibleCursorHandler } from "@/src/hooks/useBibleCursor";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { LexiconVerseReference, type LexiconWord, useBibleStore } from "@/src/stores/bible-store";
import {
  getVerseNameFormatted
} from "@common/utils/bible-data-utils";
import { Ionicons } from "@expo/vector-icons";
import {
  type BottomSheetBackdropProps,
  type BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import classNames from "classnames";
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TouchableOpacity, View } from "react-native";

type VerseDetailBottomSheetProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsSelectingRange: (isSelectingRange: boolean) => void;
  cursorHandler: BibleCursorHandler; // Handling which verses the detail view focuses on
  bibleCursorHandler: BibleCursorHandler; // Handles cursor of outside chapter-view bible
  bottomSheetAnimatedValue?: BottomSheetModalProps['animatedPosition'];
};

const VerseDetailBottomSheet: FC<VerseDetailBottomSheetProps> = ({
  isOpen,
  setIsOpen,
  setIsSelectingRange,
  cursorHandler,
  bibleCursorHandler,
  bottomSheetAnimatedValue
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const themeColors = useThemeColors();
  const bible = useBibleStore();

  const [showAllUsedInBottomSheet, setShowAllUsedInBottomSheet] = useState(false);

  // callbacks
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) setIsOpen(false);
    },
    [setIsOpen],
  );

  useEffect(() => {
    if (isOpen) bottomSheetRef.current?.present();
    if (!isOpen) {
      bottomSheetRef.current?.close();
      setShowAllUsedInBottomSheet(false);
    }
  }, [isOpen]);

  const [currentStrongsWord, setCurrentStrongsWord] = useState<
    LexiconWord | undefined
  >();

  function onPressStrongsNumber(strongsNumber: string) {
    const lexiconWord = bible.lookupStrongsNumber(strongsNumber);
    setCurrentStrongsWord(lexiconWord);
    bottomSheetRef.current?.snapToIndex(1);
  }

  const alsoUsedInVerses = currentStrongsWord && cursorHandler.cursor.verse ?
    bible
      .findVersesByStrongsNumber(
        currentStrongsWord.strongs,
        cursorHandler.cursor.chapter,
        cursorHandler.cursor.verse,
      ) : null

  const onSelectLexiconVerseReference = useCallback((item: LexiconVerseReference) => {
    cursorHandler.updateCursor({
      bookId: item.bookId,
      chapter: item.chapter,
      verse: item.verse,
    });


    bibleCursorHandler.updateCursor({
      bookId: item.bookId,
      chapter: item.chapter,
      verse: item.verse,
    })

    setCurrentStrongsWord(undefined);
    bottomSheetRef.current?.snapToIndex(0);
    setShowAllUsedInBottomSheet(false);
  }, [cursorHandler.updateCursor, bibleCursorHandler.updateCursor]);

  return (
    <>
      <TBottomSheetModal
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["50%", "90%"]}
        enablePanDownToClose
        handleIndicatorStyle={{
          backgroundColor: themeColors.text,
        }}
        backgroundStyle={{
          backgroundColor: themeColors.surface,
        }}
        backdropComponent={CustomBottomSheetBackdrop}
        enableScrollView
        animatedPosition={bottomSheetAnimatedValue}
      >
        <View className="flex-1 py-1">
          <View className="flex-row justify-between items-center px-3">
            <View className="flex flex-row items-center" style={{ gap: 8 }}>
              <Ionicons
                size={20}
                name="book"
                style={{ color: themeColors.text }}
              />
              <TText className="text-[17px] font-bold">
                {getVerseNameFormatted(cursorHandler.cursor)}
              </TText>
            </View>
            {/* <TouchableOpacity onPress={() => setIsSelectingRange(true)} className="flex-row">
              <TText className="text-xs mr-1" style={{ color: themeColors.textSecondary }}>Select multiple</TText>
              <Ionicons name="chevron-forward-outline" size={16} style={{ color: themeColors.textSecondary }} />
            </TouchableOpacity> */}
          </View>
          {isOpen && cursorHandler.cursor.verse !== undefined && (
            <VerseActions
              cursor={{
                ...cursorHandler.cursor,
                verse: cursorHandler.cursor.verse,
              }}
              verseName={getVerseNameFormatted(cursorHandler.cursor)}
              version={cursorHandler.cursor.version}
            />
          )}
          <View className="flex flex-row flex-wrap px-3" style={{ gap: 8 }}>
            {bible
              .getInterlinearVerse(cursorHandler.cursor)
              ?.contents.map((content, i) => {
                const isCurrentStrongsWord =
                  content.strongsNumber === currentStrongsWord?.strongs;
                return (
                  <View
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={content.text + i}
                    className="flex flex-col items-center"
                  >
                    <TText>{content.text || "-"}</TText>
                    <TouchableOpacity
                      onPress={() => {
                        onPressStrongsNumber(content.strongsNumber);
                      }}
                      className="flex flex-col items-center"
                    >
                      <TText
                        className={classNames("text-xs")}
                        style={{
                          color: isCurrentStrongsWord
                            ? themeColors.selected
                            : themeColors.textHighlight,
                        }}
                      >
                        {content.originalWord}
                      </TText>
                      <TText
                        className={classNames("text-xs")}
                        style={{
                          color: isCurrentStrongsWord
                            ? themeColors.selected
                            : themeColors.textHighlight,
                        }}
                      >
                        {content.strongsNumber}
                      </TText>
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>

          {cursorHandler && currentStrongsWord && (
            <View className="mt-6">
              <View className="flex flex-col">
                <View className="flex flex-col px-3" style={{ gap: 8 }}>
                  <TText
                    className="text-xs font-semibold "
                    style={{ color: themeColors.selected }}
                  >
                    Strongs: {currentStrongsWord.strongs}
                  </TText>
                  {/* Hebrew / Greek + Translit */}
                  <TText
                    type="subtitle"
                    style={{ color: themeColors.selected, textAlign: "left" }}
                  >
                    {currentStrongsWord.originalWord} -{" "}
                    {currentStrongsWord.transliteration}
                  </TText>
                  {/* Pronunciation */}
                  {currentStrongsWord.pronounciation && (
                    <TText className="italic text-xs">
                      {currentStrongsWord.pronounciation}
                    </TText>
                  )}
                  {/* English Word */}
                  <TText>{currentStrongsWord.word}</TText>
                  <TText className="mt-3" type="subtitle">
                    Short Definition:
                  </TText>
                  <TText>{currentStrongsWord.data.def?.short}</TText>
                </View>
                {/* Used in... section */}
                <TText className="mt-6 mb-3 mx-3" type="subtitle">
                  Also used in...
                </TText>
                <View className="flex flex-col mb-2" style={{ gap: 12 }}>
                  {!!alsoUsedInVerses && alsoUsedInVerses
                    .slice(0, 5) // Show only first 5 results
                    .map((result, idx) => (
                      <WordAlsoUsedInVerseItem
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={idx}
                        onPress={() => onSelectLexiconVerseReference(result)}
                        cursorHandler={cursorHandler}
                        bible={bible}
                        currentStrongsWord={currentStrongsWord}
                        item={result}
                      />
                    ))}
                  {alsoUsedInVerses && alsoUsedInVerses?.length > 5 &&
                    <TouchableOpacity
                      onPress={() => setShowAllUsedInBottomSheet(true)}
                    >
                      <TText className="text-center" style={{ color: themeColors.textHighlight }}>
                        Show All {alsoUsedInVerses.length} Results
                      </TText>
                    </TouchableOpacity>
                  }
                </View>
              </View>
            </View>
          )}
        </View>
      </TBottomSheetModal>
      {currentStrongsWord && <WordAlsoUsedInBottomSheet
        currentStrongsWord={currentStrongsWord}
        cursorHandler={cursorHandler}
        isOpen={showAllUsedInBottomSheet}
        onSelectVerse={(verseReference) => onSelectLexiconVerseReference(verseReference)}
      />}
    </>
  );
};

export default VerseDetailBottomSheet;
