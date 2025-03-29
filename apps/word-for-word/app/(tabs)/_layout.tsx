import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { api } from "@backend/convex/_generated/api";
import { useEffect } from "react";
import { Tabs, useRootNavigationState } from "expo-router";
import { useQuery } from "convex/react";
import { router } from "expo-router";

export default function TabsLayout() {
  const themeColors = useThemeColors();

  const currentUser = useQuery(api.users.getCurrentUser);

  useEffect(() => {
    // Force user to update their username
    if (currentUser && !currentUser.username) {
      console.log("Pushing to set-username-screen");
      router.push({
        pathname: "/set-username-screen",
      });
    }
  }, [currentUser, currentUser?.username]);



  const rootNavigationState = useRootNavigationState();

  if (!rootNavigationState?.key) return null;

  return <Tabs
    screenOptions={{
      tabBarStyle: {
        backgroundColor: themeColors.surface,
      },
      tabBarActiveTintColor: themeColors.text,
      headerShown: false,
    }}
    initialRouteName="read-screen"
  >
    <Tabs.Screen
      name="memory-verses-screen"
      options={{
        title: "Memorize",
        tabBarIcon: ({ color, focused }) => (
          <TabBarIcon
            name={focused ? "heart" : "heart-outline"}
            color={color}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="friends-screen"
      options={{
        title: "Friends",
        tabBarIcon: ({ color, focused }) => (
          <TabBarIcon
            name={focused ? "people-circle" : "people-circle-outline"}
            color={color}
          />
        ),
      }}
    />
    <Tabs.Screen
      name="read-screen"
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
      name="notifications-screen"
      options={{
        title: "Notifications",
        tabBarIcon: ({ color, focused }) => (
          <TabBarIcon
            name={focused ? "notifications" : "notifications-outline"}
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
  </Tabs>;
}
