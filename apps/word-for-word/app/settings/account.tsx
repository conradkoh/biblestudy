import { TText } from "@/src/components/core/TText";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { ScrollView, View, Alert } from "react-native";
import { useSignOut } from "@/src/utils/auth-utils";
import { SettingsSection } from "@/src/components/settings/settings-section";
import { ActionSettingsItem } from "@/src/components/settings/settings-items/action-settings-item";

export default function AccountScreen() {
  const themeColors = useThemeColors();
  const { handleSignOut } = useSignOut();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            console.log("Delete account");
          },
        },
      ]
    );
  };

  const handleSignOutWithConfirmation = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: handleSignOut,
        },
      ]
    );
  };

  return (
    <TSafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >

        <SettingsSection title="Account" >
          <ActionSettingsItem
            title="Sign Out"
            subtitle="Sign out of your account"
            icon="log-out-outline"
            onPress={handleSignOutWithConfirmation}
            destructive={true}
          />
          {/* <ActionSettingsItem
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon="trash-outline"
            onPress={handleDeleteAccount}
            destructive={true}
          /> */}
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
            Account changes may require re-authentication
          </TText>
        </View>
      </ScrollView>
    </TSafeAreaView>
  );
} 
