import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { PARAGRAPH_FONT_OPTIONS, useSettingsStore } from "@/src/stores/settings-store";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { FontSelectionSheet } from "@/src/components/settings/FontSelectionSheet";
import { useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";
const SAMPLE_VERSE = "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. - John 3:16";

export default function SettingsScreen() {
  const themeColors = useThemeColors();
  const { paragraphFontFamily } = useSettingsStore();
  const fontSheetRef = useRef<BottomSheetModal>(null);
  const { signOut } = useAuthActions();

  const currentUser = useQuery(api.users.currentUser);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <TView style={{ padding: 16 }} className="h-full">
        <TText type="title" style={{ marginBottom: 16 }}>Settings</TText>

        <TText type="subtitle" style={{ marginBottom: 8 }}>Paragraph Font</TText>
        <TouchableOpacity
          onPress={() => fontSheetRef.current?.present()}
          style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: themeColors.background,
            borderWidth: 1,
            borderColor: themeColors.border,
          }}
        >
          <TView style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <TText>{PARAGRAPH_FONT_OPTIONS[paragraphFontFamily]}</TText>
            <Ionicons name="chevron-forward" size={20} color={themeColors.text} />
          </TView>
          <TText
            style={{
              fontFamily: paragraphFontFamily,
              fontSize: 16,
              lineHeight: 24,
            }}
          >
            {SAMPLE_VERSE}
          </TText>
        </TouchableOpacity>

        <FontSelectionSheet ref={fontSheetRef} />

        <View className="flex-1" />

        <View className="flex-row items-center justify-between">
          <View>
            <TText className="text-sm text-gray-500">Logged in as: </TText>
            <TText className="text-sm text-gray-500">{currentUser?.email}</TText>
            <TText className="text-sm text-gray-500">@{currentUser?.username}</TText>
          </View>
          <TouchableOpacity className="mx-auto" onPress={signOut}>
            <TText className="font-bold text-red-500">Logout</TText>
          </TouchableOpacity>
        </View>
      </TView>
    </SafeAreaView>
  );
}
