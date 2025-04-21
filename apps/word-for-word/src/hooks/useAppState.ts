import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

export function useAppState(): AppStateStatus {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
}

export function useAppStateListener(onChange: (appState: AppStateStatus) => void) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onChange);

    return () => {
      subscription.remove();
    };
  }, [onChange]);
}
