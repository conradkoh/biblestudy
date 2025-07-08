import { api } from "@backend/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { openAuthSessionAsync } from "expo-web-browser";
import { Button } from "react-native";

import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TView } from "@/src/components/core/TView";
import { getExpoPushToken } from "@/src/services/push-notifications";
import { makeRedirectUri } from "expo-auth-session";
import React, { type FC } from "react";
import { TText } from "@/src/components/core/TText";

type LoginScreenProps = unknown;

const redirectTo = makeRedirectUri();

const LoginScreen: FC<LoginScreenProps> = () => {
  const { signIn } = useAuthActions();
  const insertUserNotificationToken = useMutation(
    api.pushNotifications.insertUserNotificationToken,
  );

  const handleSignIn = async () => {
    const signInResponse = await signIn("google", { redirectTo });
    const { redirect } = signInResponse;
    if (!redirect) throw new Error("No redirect found");
    const result = await openAuthSessionAsync(redirect.toString(), redirectTo);
    if (result.type === "success") {
      const { url } = result;
      const code = new URL(url).searchParams.get("code");
      if (!code) throw new Error("No code found");
      await signIn("google", { code });

      const expoNotificationsToken = await getExpoPushToken();
      if (!expoNotificationsToken) {
        console.warn("No expo notification token");
        return;
      }
      insertUserNotificationToken({ token: expoNotificationsToken });
    }
  };
  return (
    <TSafeAreaView>
      <TView className="h-screen justify-center items-center">
        <Button onPress={handleSignIn} title="Sign in with Google" />
      </TView>
    </TSafeAreaView>
  );
};

export default LoginScreen;
