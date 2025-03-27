import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import SearchUserBottomSheet from "@/src/components/search-user-bottom-sheet";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { type FC, useCallback, useRef, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";

type FriendsScreenProps = unknown;

type UserGroup = {
  id: string;
  name: string;
  // Add other group properties as needed
};

const FriendsScreen: FC<FriendsScreenProps> = () => {
  const themeColors = useThemeColors();
  const router = useRouter();
  const searchUserBottomSheetRef = useRef<BottomSheetModal>(null);

  // Placeholder data until backend is implemented
  const [friends, setFriends] = useState<Doc<"users">[]>([
  ]);

  const [userGroups, setUserGroups] = useState<UserGroup[]>([
  ]);

  const openAddFriendSheet = useCallback(() => {
    searchUserBottomSheetRef.current?.present();
  }, []);

  const navigateToUserProfile = useCallback(
    (userId: Id<"users">) => {
      router.push({
        pathname: "/user-profile-screen",
        params: { userId },
      });
    },
    [router],
  );

  const navigateToGroup = useCallback((group: UserGroup) => {
    // Navigate to group details
    console.log("Navigate to group:", group);
    // In a real implementation, you would navigate to the group's details
  }, []);

  const renderFriendItem = useCallback(
    ({ item }: { item: Doc<"users"> }) => (
      <TouchableOpacity
        onPress={() => navigateToUserProfile(item._id)}
        style={{ borderBottomColor: themeColors.divider }}
        className="p-3 flex-row items-center border-b"
      >
        <View style={{ backgroundColor: themeColors.surfaceTertiary }} className="w-10 h-10 rounded-full justify-center items-center mr-3">
          <TText className="text-lg font-bold">
            {item.username?.charAt(0).toUpperCase()}
          </TText>
        </View>
        <TText className="font-bold">@{item.username}</TText>
      </TouchableOpacity>
    ),
    [navigateToUserProfile, themeColors.divider, themeColors.surfaceTertiary],
  );

  const renderGroupItem = useCallback(
    ({ item }: { item: UserGroup }) => (
      <TouchableOpacity
        onPress={() => navigateToGroup(item)}
        style={{ borderBottomColor: themeColors.divider }}
        className="p-3 flex-row items-center border-b"
      >
        <View style={{ backgroundColor: themeColors.surfaceTertiary }} className="w-10 h-10 rounded-full justify-center items-center mr-3">
          <Ionicons name="people" size={18} color={themeColors.text} />
        </View>
        <TText className="font-bold">{item.name}</TText>
      </TouchableOpacity>
    ),
    [navigateToGroup, themeColors.text, themeColors.divider, themeColors.surfaceTertiary],
  );

  return (
    <TSafeAreaView>
      <TView className="h-full">
        {/* Content */}
        <View className="flex-1">
          {/* Friends Section - Top Half */}
          <View className="flex-1">
            <View style={{ backgroundColor: themeColors.surfaceMuted }} className="flex-row items-center justify-between px-4 py-2">
              <TText className="font-bold">Friends</TText>
              <View className="flex-row items-center gap-2">
                <TText className="text-sm">{friends.length} friends</TText>
                <TouchableOpacity onPress={openAddFriendSheet}>
                  <Ionicons name="person-add" size={24} color={themeColors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={friends}
              keyExtractor={(item) => item._id}
              renderItem={renderFriendItem}
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={
                <TView className="p-4 items-center justify-center h-full">
                  <TText>You don't have any friends yet.</TText>
                  <TouchableOpacity
                    onPress={openAddFriendSheet}
                    style={{ backgroundColor: themeColors.surfacePressed }}
                    className="mt-2 p-2 rounded-md"
                  >
                    <TText>Add Friends</TText>
                  </TouchableOpacity>
                </TView>
              }
            />
          </View>

          {/* Groups Section - Bottom Half */}
          <View className="flex-1">
            <View style={{ backgroundColor: themeColors.surfaceMuted }} className="flex-row items-center justify-between px-4 py-2">
              <TText className="font-bold">Groups</TText>
              <View className="flex-row items-center gap-2">
                <TText className="text-sm">{userGroups.length} groups</TText>
                <TouchableOpacity>
                  <Ionicons name="add-circle" size={24} color={themeColors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={userGroups}
              keyExtractor={(item) => item.id}
              renderItem={renderGroupItem}
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              ListEmptyComponent={
                <TView className="p-4 items-center justify-center h-full">
                  <TText>You're not part of any groups yet.</TText>
                </TView>
              }
            />
          </View>
        </View>
      </TView>

      {/* Bottom Sheet for searching and adding friends */}
      <SearchUserBottomSheet
        ref={searchUserBottomSheetRef}
        onSelectUser={navigateToUserProfile}
      />
    </TSafeAreaView>
  );
};

export default FriendsScreen;
