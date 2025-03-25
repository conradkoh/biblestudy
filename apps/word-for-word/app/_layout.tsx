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
import { Text } from "react-native";
import { useNotificationObserver } from "@/src/services/push-notifications";
import { api } from "@backend/convex/_generated/api";


const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function TabLayout() {
  const fontsLoaded = useFontLoader();

  useNotificationObserver();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <KeyboardProvider>
          <ConvexAuthProvider client={convex} storage={secureStorage}>
            <AuthLoading>
              <Text>
                Logging In...
              </Text>
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
