# Guide: Downgrading Xcode on macOS

## Why Downgrade Xcode?

There are several reasons you might need to downgrade Xcode, including:

- **SDK Compatibility Issues:** Some development tools (like Expo, React Native, or other mobile frameworks) require a specific Xcode version. For example, you may encounter an error like:

  > Your Expo SDK version 51 is not compatible with Xcode 16.4.0. Required Xcode version: <=16.2.0.

  In this case, downgrading to Xcode 16.2 or lower is necessary to continue development.

- **Legacy Project Requirements:** Older projects may not build or run correctly on newer Xcode versions.
- **Toolchain Stability:** Newer Xcode releases may introduce bugs or breaking changes that affect your workflow.

---

## Options for Downgrading Xcode

You have several options for downgrading Xcode on your Mac:

### 1. Replace the Existing Xcode.app

1. Download the required Xcode version (e.g., 16.2) from the [Apple Developer Downloads](https://developer.apple.com/download/all/).
2. Move the downloaded `.xip` file to `/Applications` and extract it.
3. Rename your current Xcode (if needed) to back it up:
   ```sh
   sudo mv /Applications/Xcode.app /Applications/Xcode_backup.app
   ```
4. Rename the extracted Xcode to `Xcode.app`:
   ```sh
   sudo mv /Applications/Xcode_16_2.app /Applications/Xcode.app
   ```
5. Set the system to use the new Xcode:
   ```sh
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

### 2. Keep Multiple Xcode Versions (Advanced)

- You can keep multiple versions (e.g., `Xcode_16_2.app`, `Xcode_16_4.app`) in `/Applications`.
- Switch between them using:
  ```sh
  sudo xcode-select -s /Applications/Xcode_16_2.app/Contents/Developer
  ```
- This is useful if you work on projects requiring different Xcode versions.

### 3. Use Environment Variables (Not Recommended for Xcode)

- Setting `DEVELOPER_DIR` in your shell can temporarily point tools to a specific Xcode version:
  ```sh
  export DEVELOPER_DIR=/Applications/Xcode_16_2.app/Contents/Developer
  ```
- However, this does **not** affect all tools (e.g., Xcode GUI, Simulator) and is not as reliable as using `xcode-select`.

---

## After Downgrading

- Open the new Xcode once to complete initial setup and accept the license agreement.
- Re-run your development tools (e.g., `npx expo-doctor`) to verify compatibility.
- If you encounter issues, you can restore your backup by renaming it back to `Xcode.app`.

---

## References
- [Expo SDK & Xcode Compatibility](https://expo.fyi/expo-sdk-xcode-compatibility)
- [Apple Developer Downloads](https://developer.apple.com/download/all/)
- [Xcode Releases](https://xcodereleases.com/)

---

**Tip:** Always back up your current Xcode before making changes, especially if you have limited bandwidth or slow download speeds.
