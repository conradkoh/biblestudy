import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Bible w Frens",
  slug: "bible-study-mobile",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "biblestudy",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.moosedev.biblestudy",
    usesAppleSignIn: true,
    config: {
      // So that appstore builds don't give usesNonExemptEncryption error
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.moosedev.biblestudy"
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "./androidEnableLargeHeap.js",
    "expo-router",
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Sahitya-Regular.ttf",
          "./assets/fonts/SpaceMono-Regular.ttf",
        ],
      },
    ],
    "expo-secure-store",
    [
      "expo-asset",
      {
        assets: [
          "./assets/bible-en/niv.jsonc",
          "./assets/bible-en/kjv.jsonc",
          "./assets/interlinear/interlinear.jsonc",
          "./assets/lexicon/hebrew.jsonc",
          "./assets/lexicon/greek.jsonc",
        ],
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        resizeMode: "contain",
        image: "./assets/images/splash-icon-light.png",
        dark: {
          image: "./assets/images/splash-icon-dark.png",
          resizeMode: "contain",
          backgroundColor: "#151718",
        },
        imageWidth: 128,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "fce75566-4388-44c8-bb7b-1c26698dd18f",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/fce75566-4388-44c8-bb7b-1c26698dd18f",
  },
  owner: "elliotmoose",
  packagerOpts: {
    // This makes sure that jsons don't get loaded for its contents, but instead a moduleId that lets it be loaded by expo-asset. See https://github.com/expo/expo-cli/issues/1019#issuecomment-557030389
    config: "metro.config.js",
  },
});
