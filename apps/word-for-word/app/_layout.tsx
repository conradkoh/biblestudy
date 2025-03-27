import { Stack } from "expo-router";
import React from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from "@/src/services/convex";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFontLoader } from "@/src/hooks/useFontLoader";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "@/src/components/auth/login-screen";
import { Authenticated, Unauthenticated, AuthLoading, useQuery } from "convex/react";
import { ActivityIndicator, Text } from "react-native";
import { useNotificationObserver } from "@/src/services/push-notifications";
import { api } from "@backend/convex/_generated/api";
import { TView } from "@/src/components/core/TView";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { TText } from "@/src/components/core/TText";


const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function TabLayout() {
  const fontsLoaded = useFontLoader();
  const themeColors = useThemeColors();

  useNotificationObserver();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <KeyboardProvider>
          <ConvexAuthProvider client={convex} storage={secureStorage}>
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
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="user-profile-screen" options={{ headerShown: false }} />
              </Stack>
            </Authenticated>
          </ConvexAuthProvider>
        </KeyboardProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
