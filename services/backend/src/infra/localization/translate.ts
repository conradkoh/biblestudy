import type { BibleBookEnum } from '@/domain/entities/bible-books';
import { BIBLE_BOOK_NAMES_EN } from '@/infra/localization/lang/en/en';
import type { Language } from '@/infra/localization/lang/languages';

/**
 * Bible book formatter. Receives a locale in the constructor and formats strings for that locale
 */
export class BibleBookTranslator {
  private bibleBookNames: { [key in BibleBookEnum]: string };
  constructor(locale: Language) {
    switch (locale) {
      case 'en': {
        this.bibleBookNames = BIBLE_BOOK_NAMES_EN;
        break;
      }
      default: {
        const _: never = locale; //exhaustive check
        throw new Error(`Locale ${locale} is not supported`);
      }
    }
  }
  /**
   * Formats a bible book name
   * @param bibleBook
   * @param opts
   * @returns
   */
  book(
    bibleBook: BibleBookEnum,
    opts?:
      | { chapter: number; verse: number }
      | { chapter: number; verseRange: { start: number; end: number } },
  ): string {
    const bibleBookNames = this.bibleBookNames;
    const bookName = bibleBookNames[bibleBook];

    if (!opts) {
      return bookName;
    }

    if ('verse' in opts) {
      return `${bookName} ${opts.chapter}:${opts.verse}`;
    }

    if ('verseRange' in opts) {
      return `${bookName} ${opts.chapter}:${opts.verseRange.start}-${opts.verseRange.end}`;
    }

    return bookName;
  }
}
