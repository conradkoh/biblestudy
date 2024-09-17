import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import { ThemeColors } from "@/src/constants/ThemeColors";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import { ConvexProvider } from "convex/react";
import { convex } from "@/src/services/convex";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ConvexProvider client={convex}>
      <GestureHandlerRootView>
        <Tabs
          screenOptions={{
            tabBarStyle: {
              backgroundColor: ThemeColors[colorScheme ?? "light"].background,
            },
            tabBarActiveTintColor: ThemeColors[colorScheme ?? "light"].text,
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
