import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import useBottomSheetBackdrop from "@/src/hooks/useBottomSheetBackdrop";
import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SearchUserBottomSheetProps = {
  onSelectUser?: (userId: Id<"users">) => void;
};

const screenHeight = Dimensions.get("window").height;
export const SearchUserBottomSheet = React.forwardRef<
  BottomSheetModal,
  SearchUserBottomSheetProps
>(({ onSelectUser }, ref) => {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();
  const snapPoints = ["70%"];
  const themeColors = useThemeColors();
  const renderBackdrop = useBottomSheetBackdrop();

  const { results, status, loadMore } = usePaginatedQuery(
    api.users.searchUser,
    { username: searchText },
    { initialNumItems: 10 }
  );

  const handleSelectUser = useCallback(
    (userId: Id<"users">) => {
      onSelectUser?.(userId);
      (ref as React.RefObject<BottomSheetModal>).current?.dismiss();
    },
    [onSelectUser, ref]
  );

  const renderItem = useCallback(
    ({ item }: { item: Doc<"users"> }) => (
      <TView
        key={item._id}
        className="p-3 rounded-sm"
        style={{
          backgroundColor: themeColors.surfaceSecondary,
          borderBottomColor: themeColors.border,
          borderBottomWidth: 1,
        }}
      >
        <TouchableOpacity onPress={() => handleSelectUser(item._id)}>
          <TText className="font-bold" style={{ color: themeColors.text }}>
            @{item.username}
          </TText>
        </TouchableOpacity>
      </TView>
    ),
    [handleSelectUser, themeColors]
  );

  const handleLoadMore = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(5);
    }
  }, [status, loadMore]);

  return (
    <TBottomSheetModal
      ref={ref}
      index={0}
      snapPoints={[`${100 - insets.top / (screenHeight / 100)}`]}
      keyboardBehavior="extend"
      safeAreaProps={{
        style: { height: "100%" },
      }}
      bottomSheetViewProps={false}
    >
      <TView className="px-4 pb-2">
        <TText className="text-lg font-bold mb-2">Search Users</TText>
        <View
          className="flex-row items-center px-3 py-2 mb-2 rounded-md"
          style={{ backgroundColor: themeColors.surfaceSecondary, gap: 4 }}
        >
          <Ionicons name="search" size={16} color={themeColors.text} />
          <BottomSheetTextInput
            autoFocus
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            placeholder="Search by username"
            placeholderTextColor={themeColors.textSecondary}
            style={{ color: themeColors.text, flex: 1, fontWeight: "bold" }}
          />
        </View>
      </TView>

      <BottomSheetFlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 3 }}
        style={{ backgroundColor: themeColors.surface }}
      />
    </TBottomSheetModal>
  );
});

export default SearchUserBottomSheet;
