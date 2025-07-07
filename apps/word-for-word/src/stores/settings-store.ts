import { StyleProp, TextStyle } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// text size, line height, font weight, font family
export const PARAGRAPH_FONT_OPTIONS = {
  'Sahitya-Regular': 'Sahitya',
  'Merriweather-Regular': 'Merriweather',
  'Lora-Regular': 'Lora',
  'SourceSerifPro-Regular': 'Source Serif Pro',
  'Inter-Regular': 'Inter',
  'SourceSansPro-Regular': 'Source Sans Pro',
  'OpenSans-Regular': 'Open Sans',
} as const;

interface SettingsState {
  textSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
  fontFamily: string;
  paragraphFontFamily: keyof typeof PARAGRAPH_FONT_OPTIONS;
  memoryVerseMode: 'first_letter' | 'full_word';
}

interface SettingsActions {
  setParagraphFontFamily: (font: keyof typeof PARAGRAPH_FONT_OPTIONS) => void;
  toggleMemoryVerseMode: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const initialState: SettingsState = {
  textSize: 18,
  lineHeight: 32,
  fontWeight: "400",
  fontFamily: "Inter",
  paragraphFontFamily: "Sahitya-Regular",
  memoryVerseMode: 'full_word',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setParagraphFontFamily: (font) => set({ paragraphFontFamily: font }),
      toggleMemoryVerseMode: () => set({ memoryVerseMode: get().memoryVerseMode === 'full_word' ? 'first_letter' : 'full_word' })
    }),
    {
      name: "settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
