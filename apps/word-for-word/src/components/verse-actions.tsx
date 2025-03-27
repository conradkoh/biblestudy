import type { Verse } from "@/assets/bible-en/kjv.json";
import { Button } from "@/src/components/core/Button";
import { TText } from "@/src/components/core/TText";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import React, { type FC } from "react";
import { View } from "react-native";

type VerseActionsProps = {
  verse: Verse;
  verseName: string;
  version: string;
};

const VerseActions: FC<VerseActionsProps> = ({ verse, verseName, version }) => {
  const themeColors = useThemeColors();

  const handleCopy = () => {
    Clipboard.setString(`${verse.text}\n${verseName} (${version.toUpperCase()})`);
    CommonEvents.emit("SHOW_TOAST", {
      message: `${verseName} (${version.toUpperCase()}) copied to clipboard`,
    });
  };

  return (
    <View
      className="flex-row justify-around p-2 my-3"
      style={{
        borderColor: themeColors.border,
        borderBottomWidth: 1,
        borderTopWidth: 1,
      }}
    >
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name="bookmark" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
      >
        {() => <TText className="text-xs font-bold">Highlight</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name="book" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
      >
        {() => <TText className="text-xs font-bold">Memorize</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name="send" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
      >
        {() => <TText className="text-xs font-bold">Send</TText>}
      </Button>
      <Button
        leadingIcon={(props) => (
          <Ionicons style={[props.style]} name="copy" size={24} />
        )}
        className="flex-col rounded-md p-2 flex-1 ml-2"
        style={{ backgroundColor: themeColors.surfaceSecondary }}
        onPress={handleCopy}
      >
        {() => <TText className="text-xs font-bold">Copy</TText>}
      </Button>
    </View>
  );
};

export default VerseActions;
