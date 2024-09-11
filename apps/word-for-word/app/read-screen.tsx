import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { useQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";

export default function ReadScreen() {
  const data = useQuery(api.bible.getVersesInChapter, {
    version: "kjv",
    bookIdx: 1,
    chapter: 1,
  });

  console.log(data);
  return (
    <TView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TText type="title">Bible</TText>
    </TView>
  );
}
