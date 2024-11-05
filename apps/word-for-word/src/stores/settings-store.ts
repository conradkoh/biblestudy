import { StyleProp, TextStyle } from "react-native";
import { create } from "zustand";

// text size, line height, font weight, font family
type SettingsStore = {
  textSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
  fontFamily: string;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  textSize: 18,
  lineHeight: 32,
  fontWeight: "400",
  fontFamily: "Inter",
}));
