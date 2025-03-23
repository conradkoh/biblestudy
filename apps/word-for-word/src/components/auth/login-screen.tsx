import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from "convex/react";
import { openAuthSessionAsync } from 'expo-web-browser';
import { Button, Platform, SafeAreaView } from 'react-native';
import { api } from "@backend/convex/_generated/api";

import React, { FC } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import { TView } from '@/src/components/core/TView';
import { getExpoPushToken } from '@/src/services/push-notifications';

type LoginScreenProps = unknown;

const redirectTo = makeRedirectUri();

const LoginScreen: FC<LoginScreenProps> = () => {
  const { signIn } = useAuthActions();
  const insertUserNotificationToken = useMutation(api.pushNotifications.insertUserNotificationToken);

  const handleSignIn = async () => {
    const signInResponse = await signIn('google', { redirectTo });
    const { redirect } = signInResponse
    if (!redirect) throw new Error('No redirect found');
    const result = await openAuthSessionAsync(redirect.toString(), redirectTo);
    if (result.type === 'success') {
      const { url } = result;
      const code = new URL(url).searchParams.get('code');
      if (!code) throw new Error('No code found');
      await signIn('google', { code });

      const expoNotificationsToken = await getExpoPushToken();
      if (!expoNotificationsToken) {
        console.warn('No expo notification token');
        return;
      }
      insertUserNotificationToken({ token: expoNotificationsToken });
    }
  };
  return <SafeAreaView>
    <TView className='h-screen justify-center items-center'>
      <Button onPress={handleSignIn} title="Sign in with Google" />
    </TView>
  </SafeAreaView>;
};

export default LoginScreen;
