import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { api } from "@backend/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Slot, useRouter } from "expo-router";
import type { FC } from "react";
import { useState, useCallback, useEffect } from "react";
import { TextInput, TouchableOpacity, Alert } from "react-native";

const SetUsernameScreen: FC = () => {
  const themeColors = useThemeColors();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser);
  const updateUsername = useMutation(api.users.updateUsername);
  const isUsernameAvailable = useQuery(
    api.users.isUsernameAvailable,
    { username: username.trim() }
  );

  const handleSetUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    if (!isUsernameAvailable) {
      Alert.alert("Error", "Username is already taken");
      return;
    }

    setIsLoading(true);
    try {
      await updateUsername({ username: username.trim() });
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to set username");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = useCallback((text: string) => {
    setUsername(text);
  }, []);

  // If user already has a username, redirect them

  useEffect(() => {
    if (currentUser?.username) {
      router.replace("/(tabs)");
    }
  }, [currentUser?.username, router.replace]);


  return (
    <TSafeAreaView className="flex-1">
      <TView className="flex-1 p-4">
        <TText className="text-2xl font-bold mb-6">Set Your Username</TText>

        <TText className="mb-4" style={{ color: themeColors.textSecondary }}>
          Choose a unique username that others will use to find you.
        </TText>

        <TextInput
          className="border rounded-lg p-4 mb-2"
          style={{
            borderColor: themeColors.border,
            color: themeColors.text,
          }}
          placeholder="Enter username"
          placeholderTextColor={themeColors.textSecondary}
          value={username}
          onChangeText={handleUsernameChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />

        {username.trim() && (
          <TText
            className="mb-4 text-sm"
            style={{
              color: isUsernameAvailable === undefined ? themeColors.textSecondary : isUsernameAvailable ? themeColors.success : themeColors.error
            }}
          >
            {isUsernameAvailable === undefined ? "Checking..." : isUsernameAvailable ? "Username is available" : "Username is already taken"}
          </TText>
        )}

        <TouchableOpacity
          className="rounded-lg p-4 items-center"
          style={{
            backgroundColor: themeColors.primary,
            opacity: (!isUsernameAvailable || !username.trim()) ? 0.5 : 1
          }}
          onPress={handleSetUsername}
          disabled={isLoading || !isUsernameAvailable || !username.trim()}
        >
          <TText className="text-white font-semibold">
            {isLoading ? "Setting username..." : "Set Username"}
          </TText>
        </TouchableOpacity>
      </TView>
    </TSafeAreaView>
  );
};

export default SetUsernameScreen;
