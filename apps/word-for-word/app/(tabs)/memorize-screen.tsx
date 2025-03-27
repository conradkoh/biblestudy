import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import React, { type FC } from "react";

type MemorizeScreenProps = {};

const MemorizeScreen: FC<MemorizeScreenProps> = ({ }) => {
  return <TSafeAreaView className="items-center justify-center">
    <TText>Coming Soon...</TText>
  </TSafeAreaView>;
};

export default MemorizeScreen;
