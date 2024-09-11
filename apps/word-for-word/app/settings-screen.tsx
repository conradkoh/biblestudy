import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";

export default function SettingsScreen() {
  return (
    <TView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TText type="title">Settings</TText>
    </TView>
  );
}
