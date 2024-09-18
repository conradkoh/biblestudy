import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { ConvexProvider } from "convex/react";
import { convex } from "@/src/services/convex";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  const themeColors = useThemeColors();

  return (
    <ConvexProvider client={convex}>
      <GestureHandlerRootView>
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
      </GestureHandlerRootView>
    </ConvexProvider>
  );
}
