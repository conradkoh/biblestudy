import React from "react";
import { View, TouchableOpacity } from "react-native";
import { TText } from "@/src/components/core/TText";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { HighlightColor } from "@/src/types/highlight";

type HighlightColorPickerProps = {
  onColorSelect: (color: HighlightColor) => void;
  selectedColor?: HighlightColor;
};

const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({
  onColorSelect,
  selectedColor,
}) => {
  const themeColors = useThemeColors();

  const highlightColors: { color: HighlightColor; label: string }[] = [
    { color: "highlighterYellow", label: "Yellow" },
    { color: "highlighterGreen", label: "Green" },
    { color: "highlighterBlue", label: "Blue" },
    { color: "highlighterPink", label: "Pink" },
    { color: "highlighterPurple", label: "Purple" },
    { color: "highlighterOrange", label: "Orange" },
    { color: "highlighterRed", label: "Red" },
  ];

  return (
    <View className="flex-row flex-wrap justify-center gap-2 p-4">
      {highlightColors.map(({ color, label }) => (
        <TouchableOpacity
          key={color}
          onPress={() => onColorSelect(color)}
          className={`w-12 h-12 rounded-full items-center justify-center border-2 ${selectedColor === color ? "border-2" : "border"
            }`}
          style={{
            backgroundColor: themeColors[color],
            borderColor: selectedColor === color ? themeColors.primary : themeColors.border,
          }}
        >
          {selectedColor === color && (
            <TText
              className="text-xs font-bold"
              style={{ color: themeColors.textContrast }}
            >
              ✓
            </TText>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HighlightColorPicker; 
