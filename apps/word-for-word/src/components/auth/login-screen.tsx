import { useAuthActions } from '@convex-dev/auth/react';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Button, SafeAreaView, View } from 'react-native';
import * as Linking from 'expo-linking';

import React, { FC } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import { TView } from '@/src/components/core/TView';

type LoginScreenProps = unknown;

const redirectTo = makeRedirectUri();

const LoginScreen: FC<LoginScreenProps> = () => {
  const { signIn } = useAuthActions();

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

    }
  };
  return <SafeAreaView>
    <TView className=' h-screen justify-center items-center'>
      <Button onPress={handleSignIn} title="Sign in with Google" />
    </TView>
  </SafeAreaView>;
};

export default LoginScreen;
