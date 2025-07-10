import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export function useSignOut() {
  const { signOut } = useAuthActions();
  const removeUserNotificationToken = useMutation(api.pushNotifications.removeUserNotificationToken);

  const handleSignOut = async () => {
    try {
      // Remove notification token before signing out
      await removeUserNotificationToken();
    } catch (error) {
      console.error('Error removing notification token during sign out:', error);
      // Continue with sign out even if token removal fails
    }

    // Clear local storage and sign out
    await AsyncStorage.clear();
    signOut();

    // Navigate back to the root to trigger login screen
    router.replace('/');
  };

  return { handleSignOut };
} 
