import TBottomSheetModal from '@/src/components/core/TBottomSheetModal';
import WordAlsoUsedInVerseItem from '@/src/components/word-also-used-in-verse-item';
import { BibleCursorHandler } from '@/src/hooks/useBibleCursor';
import { LexiconVerseReference, LexiconWord, useBibleStore } from '@/src/stores/bible-store';
import { BibleCursor } from '@common/utils/bible-data-utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { FlatList } from 'react-native';

interface WordAlsoUsedInBottomSheetProps {
  cursorHandler: BibleCursorHandler;
  currentStrongsWord: LexiconWord;
  isOpen: boolean;
  onSelectVerse: (reference: LexiconVerseReference) => void;
}

const WordAlsoUsedInBottomSheet: FC<WordAlsoUsedInBottomSheetProps> = ({ cursorHandler, currentStrongsWord, onSelectVerse, isOpen }) => {
  const bible = useBibleStore();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const alsoUsedInVerses = currentStrongsWord && cursorHandler.cursor.verse ?
    bible
      .findVersesByStrongsNumber(
        currentStrongsWord.strongs,
        cursorHandler.cursor.chapter,
        cursorHandler.cursor.verse,
      ) : null


  useEffect(() => {
    if (isOpen) bottomSheetModalRef.current?.present();
    if (!isOpen) bottomSheetModalRef.current?.dismiss();
  }, [isOpen]);


  const renderItem = useCallback(({ item }: { item: ReturnType<typeof bible.findVersesByStrongsNumber>[number] }) => {
    return <WordAlsoUsedInVerseItem
      item={item}
      bible={bible}
      currentStrongsWord={currentStrongsWord}
      cursorHandler={cursorHandler}
      onPress={() => {
        onSelectVerse(item);
      }}
    />
  }, [bible, cursorHandler, currentStrongsWord, onSelectVerse]);

  return (
    <TBottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <FlatList
        className='px-3'
        renderItem={renderItem}
        data={alsoUsedInVerses}
        contentContainerStyle={{ gap: 12 }}
      />
    </TBottomSheetModal>
  )
}

export default WordAlsoUsedInBottomSheet;
