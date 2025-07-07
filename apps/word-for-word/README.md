# Word for Word Bible App

A React Native Bible study application built with Expo.

## Quick Start

### 1. Backend Setup

First, set up the backend service:

```bash
cd <workspace-root>/services/backend
yarn dev
```

Note the Convex URL from the generated `.env.local` file.

### 2. Environment Configuration

Create a `.env` file in the app root:

```bash
EXPO_PUBLIC_CONVEX_URL=<copy from backend .env.local>
EXPO_USE_METRO_WORKSPACE_ROOT=1
```

### 3. Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```
