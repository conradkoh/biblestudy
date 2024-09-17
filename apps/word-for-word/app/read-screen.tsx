import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import kjv from "@/assets/bible-en/kjv.json";
import interlinear from "@/assets/interlinear/interlinear.json";
import { create } from "zustand";
import { Alert, SafeAreaView, ScrollView, useColorScheme } from "react-native";
import { ThemeColors } from "@/src/constants/ThemeColors";

type BibleCursorStore = {
  bookIdx: number;
  chapterIdx: number;
  setBookIdx: (bookIdx: number) => void;
  setChapterIdx: (chapterIdx: number) => void;
  translation: GetBibleTranslation["books"];
  interlinear: InterlinearBible["books"];
  getCurrentChapterFormatted: () => { text: string; name: string }[];
  getCurrentInterlinearForVerse: (verseNum: number) => string;
};

const useBibleCursor = create<BibleCursorStore>((set, get) => ({
  bookIdx: 0,
  chapterIdx: 0,
  setBookIdx: (bookIdx: number) => set({ bookIdx }),
  setChapterIdx: (chapterIdx: number) => set({ chapterIdx }),
  translation: (kjv as GetBibleTranslation).books,
  interlinear: (interlinear as InterlinearBible).books,
  /**
   * Returns an array of verses
   */
  getCurrentChapterFormatted: () => {
    const { bookIdx, chapterIdx } = get();
    const book = get().translation[bookIdx];
    const chapter = book.chapters[chapterIdx];
    return chapter.verses;
  },
  getCurrentInterlinearForVerse: (verseNum) => {
    const { bookIdx, chapterIdx, interlinear } = get();

    console.log(interlinear[bookIdx].chapters[chapterIdx].verses[verseNum - 1]);

    return interlinear[bookIdx].chapters[chapterIdx].verses[
      verseNum - 1
    ].contents
      .map((w) => `${w.text} (${w.originalWord})`)
      .join(" ");
  },
}));

export interface GetBibleTranslation {
  translation: string;
  abbreviation: string;
  description: string;
  lang: string;
  language: string;
  direction: string;
  encoding: string;
  books: Book[];
}

export interface Book {
  nr: number;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  chapter: number;
  name: string;
  verses: Verse[];
}

export interface Verse {
  chapter: number;
  verse: number;
  name: string;
  text: string;
}

type InterlinearBible = {
  books: {
    bookIdx: number;
    name: string;
    slug: string;
    chapters: {
      chapter: number;
      verses: {
        chapter: number;
        verse: number;
        contents: {
          i: number; // index for ordering
          text: string;
          originalWord: string;
          strongsNumber: string;
        }[];
      }[];
    }[];
  }[];
};

export default function ReadScreen() {
  const bible = useBibleCursor();
  const colorScheme = useColorScheme();

  function onPressVerse(verseNum: number) {
    const interlinear = bible.getCurrentInterlinearForVerse(verseNum);
    Alert.alert("Interlinear", interlinear);
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: ThemeColors[colorScheme ?? "light"].background,
      }}
    >
      <TView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ScrollView>
          <TView className="px-2">
            <TText>
              {bible.getCurrentChapterFormatted().map((verse, i) => {
                return (
                  <TText key={verse.name} onPress={() => onPressVerse(i + 1)}>
                    <TText type="defaultSemiBold" className="ml-1">
                      {" "}
                      {i + 1}{" "}
                    </TText>
                    <TText type="default">{verse.text}</TText>
                  </TText>
                );
              })}
            </TText>
          </TView>
        </ScrollView>
      </TView>
    </SafeAreaView>
  );
}
