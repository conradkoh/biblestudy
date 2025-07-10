import { TText } from "@/src/components/core/TText";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { ScrollView, View, Alert } from "react-native";
import { useNotificationPermissions } from "@/src/hooks/useNotificationPermissions";
import { useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { useAuthToken } from "@convex-dev/auth/react";
import { SettingsSection } from "@/src/components/settings/settings-section";
import { SwitchSettingsItem } from "@/src/components/settings/settings-items/switch-settings-item";

export default function NotificationsScreen() {
  const themeColors = useThemeColors();
  const { isEnabled, isGranted, canRequest, isLoading, requestPermissions, getExpoPushToken } = useNotificationPermissions();
  const insertUserNotificationToken = useMutation(api.pushNotifications.insertUserNotificationToken);
  const removeUserNotificationToken = useMutation(api.pushNotifications.removeUserNotificationToken);
  const isAuthenticated = !!useAuthToken();

  const handleToggle = async (value: boolean) => {
    if (value) {
      // User wants to enable notifications
      if (!isGranted) {
        if (canRequest) {
          const granted = await requestPermissions();
          if (granted) {
            const token = await getExpoPushToken();
            if (token && isAuthenticated) {
              await insertUserNotificationToken({ token });
            }
          } else {
            Alert.alert(
              'Permission Denied',
              'Please enable notifications in your device settings to receive push notifications.',
              [{ text: 'OK' }]
            );
            return;
          }
        } else {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive push notifications.',
            [{ text: 'OK' }]
          );
          return;
        }
      } else {
        const token = await getExpoPushToken();
        if (token && isAuthenticated) {
          await insertUserNotificationToken({ token });
        }
      }
    } else {
      // User wants to disable notifications
      if (isAuthenticated) {
        try {
          await removeUserNotificationToken();
        } catch (error) {
          console.error('Error removing notification token:', error);
          Alert.alert(
            'Error',
            'Failed to disable notifications. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  return (
    <TSafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      >

        <SettingsSection title="General" >
          <SwitchSettingsItem
            title="Push Notifications"
            subtitle={isLoading
              ? "Checking permissions..."
              : !isEnabled
                ? "Notifications are disabled in device settings"
                : "Enable all notifications"
            }
            icon="notifications"
            value={isEnabled}
            onValueChange={(enabled) => !isLoading && handleToggle(enabled)}
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
            You can also manage notifications in your device settings
          </TText>
        </View>
      </ScrollView>
    </TSafeAreaView>
  );
} 
