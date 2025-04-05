import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "bible-study-mobile",
  slug: "bible-study-mobile",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "biblestudy",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.moosedev.biblestudy",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.moosedev.biblestudy",
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
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
