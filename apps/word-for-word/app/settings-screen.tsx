import { TText } from "@/src/components/core/TText";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { getVersionString } from "@/src/use-cases/mobile-versioning";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSignOut } from "@/src/utils/auth-utils";
import { SettingsSection } from "@/src/components/settings/settings-section";
import { ChevronSettingsItem } from "@/src/components/settings/settings-items/chevron-settings-item";
import { ActionSettingsItem } from "@/src/components/settings/settings-items/action-settings-item";

export default function SettingsScreen() {
  const themeColors = useThemeColors();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { handleSignOut } = useSignOut();

  return (
    <TSafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Appearance">
          <ChevronSettingsItem
            title="Typography"
            subtitle="Font style and selection" // , size, and spacing
            icon="text"
            onPress={() => router.push('/settings/typography')}
          />
          <ChevronSettingsItem
            title="Theme"
            subtitle="Dark, light, or auto"
            icon="moon"
            onPress={() => router.push('/settings/theme')}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <ChevronSettingsItem
            title="Push Notifications"
            subtitle="Reminders and updates"
            icon="notifications"
            onPress={() => router.push('/settings/notifications')}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <ChevronSettingsItem
            title="Account Management"
            subtitle="Security and data settings"
            icon="shield-checkmark"
            onPress={() => router.push('/settings/account')}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <ActionSettingsItem
            title="Sign Out"
            subtitle={`Signed in as ${currentUser?.email}`}
            icon="log-out-outline"
            onPress={handleSignOut}
            destructive={true}
          />
        </SettingsSection>

        <View style={{
          alignItems: 'center',
          marginTop: 32,
          marginBottom: 16,
          paddingHorizontal: 16,
        }}>
          <TText
            style={{
              fontSize: 12,
              color: themeColors.textTertiary,
              textAlign: 'center',
            }}
          >
            {getVersionString()}
          </TText>
        </View>
      </ScrollView>
    </TSafeAreaView>
  );
}
