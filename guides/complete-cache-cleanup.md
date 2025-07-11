# Guide: Complete Cache Cleanup for Bible Study Project

## Why Clean All Caches?

There are several scenarios where you might need to perform a complete cache cleanup:

- **Build Issues:** When `yarn ios` or `yarn android` fails with cryptic errors
- **Metro Bundler Problems:** When the development server behaves unexpectedly
- **Dependency Conflicts:** When packages seem to be in an inconsistent state
- **iOS Build Failures:** When Xcode builds fail due to cached artifacts
- **Performance Issues:** When the development environment feels sluggish

This guide provides a comprehensive approach to cleaning all caches in the Bible Study project.

---

## Complete Cache Cleanup Steps

### 1. Clean Yarn Cache

Start by clearing the yarn cache to remove any corrupted or outdated cache files:

```sh
yarn cache clean
```

### 2. Clean Node Modules (Root Level)

Remove and reinstall dependencies at the project root:

```sh
# From the project root (/Users/conradkoh/Documents/Repos/biblestudy)
rm -rf node_modules
yarn install
```

### 3. Clean Node Modules (App Level)

Remove and reinstall dependencies in the app directory:

```sh
# From the project root
cd apps/word-for-word
rm -rf node_modules
yarn install
```

### 4. Clean iOS Build Artifacts

Remove iOS build folders and derived data:

```sh
# From apps/word-for-word
rm -rf ios/build
rm -rf ios/DerivedData
```

### 5. Clean CocoaPods

Deintegrate and reinstall CocoaPods for iOS:

```sh
# From apps/word-for-word
cd ios
pod deintegrate
pod install
cd ..
```

### 6. Clean Metro Bundler Cache

Reset the Metro bundler cache:

```sh
# From apps/word-for-word
yarn expo start --reset-cache
```

**Note:** This command will start the Metro bundler. You can stop it after it initializes (Ctrl+C) or let it run if you want to test the build.

### 7. Clean Xcode Derived Data (Optional)

If you're still experiencing iOS build issues, clean Xcode's derived data:

```sh
rm -rf ~/Library/Developer/Xcode/DerivedData
```

---

## Automated Cleanup Script

You can create a script to automate the cleanup process. Create a file called `cleanup.sh` in the project root:

```sh
#!/bin/bash

echo "🧹 Starting complete cache cleanup..."

# Clean yarn cache
echo "📦 Cleaning yarn cache..."
yarn cache clean

# Clean root node_modules
echo "🗂️  Cleaning root node_modules..."
rm -rf node_modules
yarn install

# Clean app node_modules
echo "📱 Cleaning app node_modules..."
cd apps/word-for-word
rm -rf node_modules
yarn install

# Clean iOS build artifacts
echo "🍎 Cleaning iOS build artifacts..."
rm -rf ios/build
rm -rf ios/DerivedData

# Clean CocoaPods
echo "📱 Cleaning CocoaPods..."
cd ios
pod deintegrate
pod install
cd ..

# Clean Metro cache
echo "🚇 Cleaning Metro cache..."
yarn expo start --reset-cache &

echo "✅ Cleanup complete! You can now try running yarn ios"
```

Make the script executable:

```sh
chmod +x cleanup.sh
```

Then run it:

```sh
./cleanup.sh
```

---

## Verification Steps

After completing the cleanup, verify that everything is working:

1. **Test Metro Bundler:**

   ```sh
   cd apps/word-for-word
   yarn expo start
   ```

2. **Test iOS Build:**

   ```sh
   yarn ios
   ```

3. **Test Android Build (if applicable):**
   ```sh
   yarn android
   ```

---

## Troubleshooting

### If iOS Build Still Fails

1. **Check Xcode Version Compatibility:**

   - Ensure your Xcode version is compatible with your Expo SDK
   - See the [downgrading-xcode.md](./downgrading-xcode.md) guide if needed

2. **Reset iOS Simulator:**

   ```sh
   xcrun simctl erase all
   ```

3. **Clean Xcode Cache:**
   ```sh
   rm -rf ~/Library/Developer/Xcode/DerivedData
   rm -rf ~/Library/Caches/com.apple.dt.Xcode
   ```

### If Metro Bundler Issues Persist

1. **Kill Metro Processes:**

   ```sh
   pkill -f "expo start"
   pkill -f "metro"
   ```

2. **Clear React Native Cache:**
   ```sh
   npx react-native start --reset-cache
   ```

---

## When to Use This Guide

Use this complete cleanup process when:

- ✅ `yarn ios` fails with build errors
- ✅ Metro bundler shows unexpected behavior
- ✅ Dependencies seem to be in an inconsistent state
- ✅ After major dependency updates
- ✅ When switching between different branches with significant changes
- ✅ When experiencing performance issues in development

---

## References

- [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/)
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [CocoaPods Troubleshooting](https://guides.cocoapods.org/using/troubleshooting.html)

---

**Tip:** Always commit your changes before running a complete cleanup, as this process removes all cached files and reinstalls dependencies.
