import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useSettingsStore } from "@/src/stores/settings-store";

const SAMPLE_VERSE =
  "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. - John 3:16";

export function TypographyPreview() {
  const themeColors = useThemeColors();
  const { paragraphFontFamily, textSize, lineHeight } = useSettingsStore();

  return (
    <TView
      style={{
        backgroundColor: themeColors.surfaceMuted,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 16,
      }}
    >
      <TText
        style={{
          fontSize: 12,
          color: themeColors.textSecondary,
          marginBottom: 12,
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        Preview
      </TText>
      <TText
        style={{
          fontSize: textSize,
          lineHeight: lineHeight,
          color: themeColors.text,
          fontFamily: paragraphFontFamily,
        }}
      >
        {SAMPLE_VERSE}
      </TText>
    </TView>
  );
}
