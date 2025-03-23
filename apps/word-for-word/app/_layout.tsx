import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { convex } from "@/src/services/convex";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFontLoader } from "@/src/hooks/useFontLoader";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "@/src/components/auth/login-screen";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Text } from "react-native";
import { useNotificationObserver } from "@/src/services/push-notifications";


const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function TabLayout() {
  const themeColors = useThemeColors();
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
              <Tabs
                screenOptions={{
                  tabBarStyle: {
                    backgroundColor: themeColors.background,
                  },
                  tabBarActiveTintColor: themeColors.text,
                  headerShown: false,
                }}
                initialRouteName="read-screen"
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    title: "Read",
                    tabBarIcon: ({ color, focused }) => (
                      <TabBarIcon
                        name={focused ? "book-sharp" : "book-outline"}
                        color={color}
                      />
                    ),
                  }}
                />
                <Tabs.Screen
                  name="settings-screen"
                  options={{
                    title: "Settings",
                    tabBarIcon: ({ color, focused }) => (
                      <TabBarIcon
                        name={focused ? "settings-sharp" : "settings-outline"}
                        color={color}
                      />
                    ),
                  }}
                />
              </Tabs>
            </Authenticated>
          </ConvexAuthProvider>
        </KeyboardProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
