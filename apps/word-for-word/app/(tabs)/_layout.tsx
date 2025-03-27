import { TabBarIcon } from "@/src/components/navigation/TabBarIcon";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const themeColors = useThemeColors();
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
