import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { ConvexProvider } from "convex/react";
import { convex } from "@/src/services/convex";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFontLoader } from "@/src/hooks/useFontLoader";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function TabLayout() {
  const themeColors = useThemeColors();
  const fontsLoaded = useFontLoader();

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <KeyboardProvider>
          <ConvexProvider client={convex}>
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
          </ConvexProvider>
        </KeyboardProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
