import { api } from "@backend/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { openAuthSessionAsync } from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import React, { type FC } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TView } from "@/src/components/core/TView";
import { TText } from "@/src/components/core/TText";
import { getExpoPushToken } from "@/src/services/push-notifications";
import { useThemeColors } from "@/src/hooks/useThemeColors";

type LoginScreenProps = unknown;

const redirectTo = makeRedirectUri();

// Custom Google Sign-In Button
const GoogleSignInButton: FC<{ onPress: () => void }> = ({ onPress }) => {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.googleButton,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <View style={styles.googleIcon}>
          <Ionicons name="logo-google" size={20} color="#4285F4" />
        </View>
        <TText
          style={[
            styles.buttonText,
            { color: themeColors.text }
          ]}
          type="defaultSemiBold"
        >
          Continue with Google
        </TText>
      </View>
    </TouchableOpacity>
  );
};

// Custom Apple Sign-In Button
const AppleSignInButton: FC<{ onPress: () => void }> = ({ onPress }) => {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.appleButton,
        {
          backgroundColor: themeColors.text,
          borderColor: themeColors.text,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <View style={styles.appleIcon}>
          <Ionicons name="logo-apple" size={20} color={themeColors.surface} />
        </View>
        <TText
          style={[
            styles.buttonText,
            { color: themeColors.surface }
          ]}
          type="defaultSemiBold"
        >
          Continue with Apple
        </TText>
      </View>
    </TouchableOpacity>
  );
};

const LoginScreen: FC<LoginScreenProps> = () => {
  const { signIn } = useAuthActions();
  const themeColors = useThemeColors();
  const insertUserNotificationToken = useMutation(
    api.pushNotifications.insertUserNotificationToken,
  );

  const handleSignIn = async (provider: 'google' | 'apple') => {
    const signInResponse = await signIn(provider, { redirectTo });
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
      <TView
        style={[
          styles.container,
          { backgroundColor: themeColors.surface }
        ]}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons
              name="book"
              size={48}
              color={themeColors.primary}
            />
          </View>
          <TText
            type="title"
            style={[
              styles.appTitle,
              { color: themeColors.text }
            ]}
          >
            Bible with Friends
          </TText>
          <TText
            type="subtitle"
            style={[
              styles.appSubtitle,
              { color: themeColors.textSecondary }
            ]}
          >
            Study the Bible, encourage one another
          </TText>
        </View>

        {/* Login Section */}
        <View style={styles.loginSection}>
          <TText
            type="defaultSemiBold"
            style={[
              styles.welcomeText,
              { color: themeColors.text }
            ]}
          >
            Welcome back
          </TText>
          <TText
            type="paragraph"
            style={[
              styles.signInText,
              { color: themeColors.textSecondary }
            ]}
          >
            Sign in to continue your Bible study journey
          </TText>

          <View style={styles.buttonContainer}>
            <GoogleSignInButton onPress={() => handleSignIn('google')} />
            <AppleSignInButton onPress={() => handleSignIn('apple')} />
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <TText
            type="paragraph"
            style={[
              styles.footerText,
              { color: themeColors.textTertiary }
            ]}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </TText>
        </View>
      </TView>
    </TSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loginSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  signInText: {
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerSection: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default LoginScreen;
