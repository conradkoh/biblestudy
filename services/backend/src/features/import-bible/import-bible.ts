import {
  BIBLE_BOOKS_ORDERED_LIST,
  BibleBookEnum,
} from '@/domain/entities/bible-books';
import { bookSchema } from '@/features/import-bible/kjv/types';
import { internal } from '@/../convex/_generated/api';
import type { ActionCtx } from '@/../convex/_generated/server';
/**
 * Imports the KJV bible from the local file system into the DB
 * @param ctx
 */
export const loadKJV = async (ctx: ActionCtx) => {
  // for (const book of BIBLE_BOOKS_ORDERED_LIST) {
  for (let bookIdx = 0; bookIdx < BIBLE_BOOKS_ORDERED_LIST.length; bookIdx++) {
    const book = BIBLE_BOOKS_ORDERED_LIST[bookIdx];
    const fileName = getFileNameForBook(book);
    const url = `https://raw.githubusercontent.com/aruljohn/Bible-kjv/master/${fileName}`;
    const data = await fetch(url).then((res) => res.json());

    const bookData = bookSchema.parse(data);
    for (
      let chapterIdx = 0;
      chapterIdx < bookData.chapters.length;
      chapterIdx++
    ) {
      const chapter = bookData.chapters[chapterIdx];
      // load chapters
      await ctx.runMutation(internal.bible._writeChapter, {
        version: 'kjv',
        bookName: book,
        bookIdx, //starts at 0
        chapter: Number.parseInt(chapter.chapter),
        verses: chapter.verses.map((v) => ({
          verse: Number.parseInt(v.verse),
          text: v.text,
        })),
      });
      await ctx.runMutation(internal.bible._batchWriteVerses, {
        verses: chapter.verses.map((v) => ({
          version: 'kjv',
          bookName: book,
          bookIdx, //starts at 0
          chapter: Number.parseInt(chapter.chapter),
          verse: Number.parseInt(v.verse),
          text: v.text,
        })),
      });
    }
  }
};
//map of book enum to file name
const bibleBookToFileMap: Record<BibleBookEnum, string> = {
  [BibleBookEnum.OT_Genesis]: 'Genesis.json',
  [BibleBookEnum.OT_Exodus]: 'Exodus.json',
  [BibleBookEnum.OT_Leviticus]: 'Leviticus.json',
  [BibleBookEnum.OT_Numbers]: 'Numbers.json',
  [BibleBookEnum.OT_Deuteronomy]: 'Deuteronomy.json',
  [BibleBookEnum.OT_Joshua]: 'Joshua.json',
  [BibleBookEnum.OT_Judges]: 'Judges.json',
  [BibleBookEnum.OT_Ruth]: 'Ruth.json',
  [BibleBookEnum.OT_1Samuel]: '1Samuel.json',
  [BibleBookEnum.OT_2Samuel]: '2Samuel.json',
  [BibleBookEnum.OT_1Kings]: '1Kings.json',
  [BibleBookEnum.OT_2Kings]: '2Kings.json',
  [BibleBookEnum.OT_1Chronicles]: '1Chronicles.json',
  [BibleBookEnum.OT_2Chronicles]: '2Chronicles.json',
  [BibleBookEnum.OT_Ezra]: 'Ezra.json',
  [BibleBookEnum.OT_Nehemiah]: 'Nehemiah.json',
  [BibleBookEnum.OT_Esther]: 'Esther.json',
  [BibleBookEnum.OT_Job]: 'Job.json',
  [BibleBookEnum.OT_Psalms]: 'Psalms.json',
  [BibleBookEnum.OT_Proverbs]: 'Proverbs.json',
  [BibleBookEnum.OT_Ecclesiastes]: 'Ecclesiastes.json',
  [BibleBookEnum.OT_SongOfSolomon]: 'SongofSolomon.json',
  [BibleBookEnum.OT_Isaiah]: 'Isaiah.json',
  [BibleBookEnum.OT_Jeremiah]: 'Jeremiah.json',
  [BibleBookEnum.OT_Lamentations]: 'Lamentations.json',
  [BibleBookEnum.OT_Ezekiel]: 'Ezekiel.json',
  [BibleBookEnum.OT_Daniel]: 'Daniel.json',
  [BibleBookEnum.OT_Hosea]: 'Hosea.json',
  [BibleBookEnum.OT_Joel]: 'Joel.json',
  [BibleBookEnum.OT_Amos]: 'Amos.json',
  [BibleBookEnum.OT_Obadiah]: 'Obadiah.json',
  [BibleBookEnum.OT_Jonah]: 'Jonah.json',
  [BibleBookEnum.OT_Micah]: 'Micah.json',
  [BibleBookEnum.OT_Nahum]: 'Nahum.json',
  [BibleBookEnum.OT_Habakkuk]: 'Habakkuk.json',
  [BibleBookEnum.OT_Zephaniah]: 'Zephaniah.json',
  [BibleBookEnum.OT_Haggai]: 'Haggai.json',
  [BibleBookEnum.OT_Zechariah]: 'Zechariah.json',
  [BibleBookEnum.OT_Malachi]: 'Malachi.json',
  [BibleBookEnum.NT_Matthew]: 'Matthew.json',
  [BibleBookEnum.NT_Mark]: 'Mark.json',
  [BibleBookEnum.NT_Luke]: 'Luke.json',
  [BibleBookEnum.NT_John]: 'John.json',
  [BibleBookEnum.NT_Acts]: 'Acts.json',
  [BibleBookEnum.NT_Romans]: 'Romans.json',
  [BibleBookEnum.NT_1Corinthians]: '1Corinthians.json',
  [BibleBookEnum.NT_2Corinthians]: '2Corinthians.json',
  [BibleBookEnum.NT_Galatians]: 'Galatians.json',
  [BibleBookEnum.NT_Ephesians]: 'Ephesians.json',
  [BibleBookEnum.NT_Philippians]: 'Philippians.json',
  [BibleBookEnum.NT_Colossians]: 'Colossians.json',
  [BibleBookEnum.NT_1Thessalonians]: '1Thessalonians.json',
  [BibleBookEnum.NT_2Thessalonians]: '2Thessalonians.json',
  [BibleBookEnum.NT_1Timothy]: '1Timothy.json',
  [BibleBookEnum.NT_2Timothy]: '2Timothy.json',
  [BibleBookEnum.NT_Titus]: 'Titus.json',
  [BibleBookEnum.NT_Philemon]: 'Philemon.json',
  [BibleBookEnum.NT_Hebrews]: 'Hebrews.json',
  [BibleBookEnum.NT_James]: 'James.json',
  [BibleBookEnum.NT_1Peter]: '1Peter.json',
  [BibleBookEnum.NT_2Peter]: '2Peter.json',
  [BibleBookEnum.NT_1John]: '1John.json',
  [BibleBookEnum.NT_2John]: '2John.json',
  [BibleBookEnum.NT_3John]: '3John.json',
  [BibleBookEnum.NT_Jude]: 'Jude.json',
  [BibleBookEnum.NT_Revelation]: 'Revelation.json',
};

// Function to get the file name based on the enum value
function getFileNameForBook(book: BibleBookEnum): string {
  return bibleBookToFileMap[book];
}
