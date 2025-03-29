import LoginScreen from "@/src/components/auth/login-screen";
import { ToastProvider } from "@/src/components/core/ToastProvider";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useExpoUpdates } from "@/src/hooks/useExpoUpdates";
import { useFontLoader } from "@/src/hooks/useFontLoader";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { convex } from "@/src/services/convex";
import { useNotificationObserver } from "@/src/services/push-notifications";
import { ConvexAuthProvider, useAuthToken } from "@convex-dev/auth/react";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function TabLayout() {
  const fontsLoaded = useFontLoader();
  const themeColors = useThemeColors();
  const isAuthenticated = !!useAuthToken();

  useNotificationObserver(isAuthenticated);
  useExpoUpdates();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <KeyboardProvider>
          <ConvexAuthProvider client={convex} storage={secureStorage}>
            <ToastProvider>
              <AuthLoading>
                <TSafeAreaView className="h-full">
                  <TView className="h-full justify-center items-center">
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <TText className="mt-4 text-sm" style={{ color: themeColors.primary }} >Logging In...</TText>
                  </TView>
                </TSafeAreaView>
              </AuthLoading>
              <Unauthenticated>
                <LoginScreen />
              </Unauthenticated>
              <Authenticated>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
                  <Stack.Screen name="recite-verse-screen" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
                  <Stack.Screen name="user-profile-screen" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
                  <Stack.Screen name="set-username-screen" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
                </Stack>
              </Authenticated>
            </ToastProvider>
          </ConvexAuthProvider>
        </KeyboardProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
