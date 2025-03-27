import * as Updates from "expo-updates";
import * as Application from "expo-application";
import Constants from "expo-constants";

export function getRuntimeVersion() {
  return (
    Constants.manifest2?.runtimeVersion ||
    (Updates.isEnabled && Updates.runtimeVersion) ||
    "1.0.0"
  );
}

export function getBuildVersion() {
  if (Updates.isEnabled) {
    return Updates.updateId;
  }

  return Application.nativeBuildVersion;
}

export function getVersionString() {
  return `v${getRuntimeVersion()}-${getBuildVersion()}`;
}
