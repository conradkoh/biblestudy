/**
 * Design System Color Palette
 * 
 * Surface levels:
 * - surface: Base surface color (background)
 * - surfaceSecondary: Slightly elevated surface (cards, bottom sheets)
 * - surfaceTertiary: Further elevated surface (modals, popovers)
 * - surfaceHighlight: Interactive surface (buttons, selected states)
 * - surfaceMuted: Subtle background for sections (like gray-100)
 * - surfacePressed: Background color for pressed states
 * 
 * Text hierarchy:
 * - text: Primary text color
 * - textSecondary: Secondary text color (subtle information)
 * - textTertiary: Tertiary text color (disabled, subtle)
 * - textContrast: Text color for contrast (on colored backgrounds)
 * - textHighlight: Highlighted text color
 * 
 * Interactive elements:
 * - primary: Primary brand color
 * - primaryHover: Hover state for primary elements
 * - secondary: Secondary brand color
 * - secondaryHover: Hover state for secondary elements
 * - selected: Selected state color (complements textHighlight)
 * 
 * Status colors:
 * - success: Success states
 * - warning: Warning states
 * - error: Error states
 * - info: Information states
 * 
 * Utility colors:
 * - border: Border color
 * - divider: Divider color
 * - overlay: Overlay color for modals/backdrops
 */

export const ThemeColors = {
  light: {
    // Surface colors
    surface: "#ffffff",
    surfaceSecondary: "#f8fafc",
    surfaceTertiary: "#f1f5f9",
    surfaceHighlight: "#e0f2fe",
    surfaceMuted: "#f1f5f9",
    surfacePressed: "#e2e8f0",

    // Text colors
    text: "#0f172a",
    textSecondary: "#475569",
    textTertiary: "#94a3b8",
    textContrast: "#ffffff",
    textHighlight: "#3b82f6",

    // Interactive colors
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    secondary: "#6366f1",
    secondaryHover: "#4f46e5",
    selected: "#059669",

    // Status colors
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#dc2626",
    info: "#3b82f6",

    // Utility colors
    border: "#e2e8f0",
    divider: "#e2e8f0",
    overlay: "rgba(0, 0, 0, 0.5)",

    // Highlighter (literally) colors
    highlighterBlue: "#cce7ff",
    highlighterGreen: "#d1fae5",
    highlighterYellow: "#fff9c4",
    highlighterRed: "#ffd6d6",
    highlighterPurple: "#ede9fe",
    highlighterOrange: "#ffe5b4",
    highlighterPink: "#ffe4ef",

    permanentWhite: "#ffffff",
    permanentBlack: "#000000",

    // Accent colors
    orange: "#f59e0b",
  },
  dark: {
    // Surface colors
    surface: "#151718",
    surfaceSecondary: "#1a1d1e",
    surfaceTertiary: "#2a2d2e",
    surfaceHighlight: "#1e2a2e",
    surfaceMuted: "#1a1d1e",
    surfacePressed: "#2a2d2e",

    // Text colors
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    textTertiary: "#64748b",
    textContrast: "#151718",
    textHighlight: "#60a5fa",

    // Interactive colors
    primary: "#60a5fa",
    primaryHover: "#93c5fd",
    secondary: "#818cf8",
    secondaryHover: "#a5b4fc",
    selected: "#10b981",

    // Status colors
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#ef4444",
    info: "#60a5fa",

    // Utility colors
    border: "#232627",
    divider: "#232627",
    overlay: "rgba(0, 0, 0, 0.7)",

    // Highlighter (literally) colors
    highlighterBlue: "#2563eb55",
    highlighterGreen: "#34d39955",
    highlighterYellow: "#ffe06699",
    highlighterRed: "#f8717155",
    highlighterPurple: "#a78bfa55",
    highlighterOrange: "#fdba7455",
    highlighterPink: "#f472b655",

    permanentWhite: "#ffffff",
    permanentBlack: "#000000",

    // Accent colors
    orange: "#fbbf24",
  },
};
