import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import SearchUserBottomSheet from "@/src/components/search-user-bottom-sheet";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { api } from "@backend/convex/_generated/api";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, {
  type FC,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { Alert, FlatList, Image, TouchableOpacity, View } from "react-native";
import { CommonEvents } from "@/src/hooks/useEvents";
import SessionHistoryGraph from "@/src/components/session-history-graph";
import { formatDate, startOfDay, subDays } from "date-fns";

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

  const friends = useQuery(api.users.getUserFriends);
  // const userGroups = useQuery(api.users.getUserGroups);

  const receivedPrayers = useQuery(api.messages.getReceivedPrayers);
  const sentPrayers = useQuery(api.messages.getSentPrayers);

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
    [router]
  );

  // const navigateToGroup = useCallback((group: UserGroup) => {
  //   // Navigate to group details
  //   console.log("Navigate to group:", group);
  //   // In a real implementation, you would navigate to the group's details
  // }, []);

  const renderFriendItem = useCallback(
    ({ item: user }: { item: Doc<"users"> }) => {
      const receivedPrayer = receivedPrayers?.find(
        (prayer) => prayer.senderId === user._id
      );
      const sentPrayer = sentPrayers?.find(
        (prayer) => prayer.receiverId === user._id
      );

      return (
        <FriendUserItem
          receivedPrayer={receivedPrayer}
          sentPrayer={sentPrayer}
          user={user}
          navigateToUserProfile={navigateToUserProfile}
        />
      );
    },
    [navigateToUserProfile, receivedPrayers, sentPrayers]
  );

  // const renderGroupItem = useCallback(
  //   ({ item }: { item: UserGroup }) => (
  //     <TouchableOpacity
  //       onPress={() => navigateToGroup(item)}
  //       style={{ borderBottomColor: themeColors.divider }}
  //       className="p-3 flex-row items-center border-b"
  //     >
  //       <View
  //         style={{ backgroundColor: themeColors.surfaceTertiary }}
  //         className="w-10 h-10 rounded-full justify-center items-center mr-3"
  //       >
  //         <Ionicons name="people" size={18} color={themeColors.text} />
  //       </View>
  //       <TText className="font-bold">{item.name}</TText>
  //     </TouchableOpacity>
  //   ),
  //   [
  //     navigateToGroup,
  //     themeColors.text,
  //     themeColors.divider,
  //     themeColors.surfaceTertiary,
  //   ]
  // );

  return (
    <TSafeAreaView edges={["top"]}>
      <TView className="h-full">
        {/* Content */}
        <View className="flex-1">
          {/* Friends Section - Top Half */}
          <View className="flex-1">
            <View
              style={{ backgroundColor: themeColors.surfaceMuted }}
              className="flex-row items-center justify-between px-4 py-2"
            >
              <TText className="font-bold">Friends</TText>
              <View className="flex-row items-center gap-2">
                {friends && (
                  <TText className="text-sm">{friends.length} friends</TText>
                )}
                <TouchableOpacity onPress={openAddFriendSheet}>
                  <Ionicons
                    name="person-add"
                    size={24}
                    color={themeColors.text}
                  />
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
                  {friends === undefined && <TText>Loading...</TText>}
                  {friends !== undefined && (
                    <>
                      <TText>You don't have any friends yet.</TText>
                      <TouchableOpacity
                        onPress={openAddFriendSheet}
                        style={{ backgroundColor: themeColors.surfacePressed }}
                        className="mt-2 p-2 rounded-md"
                      >
                        <TText>Add Friends</TText>
                      </TouchableOpacity>
                    </>
                  )}
                </TView>
              }
            />
          </View>

          {/* Groups Section - Bottom Half */}
          {/* <View className="flex-1">
            <View style={{ backgroundColor: themeColors.surfaceMuted }} className="flex-row items-center justify-between px-4 py-2">
              <TText className="font-bold">Groups</TText>
              <View className="flex-row items-center gap-2">
                {userGroups && <TText className="text-sm">{userGroups.length} groups</TText>}
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
                  {userGroups === undefined && <TText>Loading...</TText>}
                  {userGroups !== undefined && <TText>You're not part of any groups yet.</TText>}
                </TView>
              }
            />
          </View> */}
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

type FriendUserItemProps = {
  user: Doc<"users">;
  receivedPrayer: Doc<"messages"> | undefined;
  sentPrayer: Doc<"messages"> | undefined;
  navigateToUserProfile: (userId: Id<"users">) => void;
};
const FriendUserItem: FC<FriendUserItemProps> = ({
  user,
  receivedPrayer,
  sentPrayer,
  navigateToUserProfile,
}) => {
  const [expandReceivedPrayer, setExpandReceivedPrayer] = useState(false);
  const [expandSentPrayer, setExpandSentPrayer] = useState(false);
  const sessionGraphData = useQuery(api.sessionLogger.getSessionHistoryData, {
    userId: user._id,
    endDateStr: formatDate(new Date(), "yyyy-MM-dd"),
    startDateStr: formatDate(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      "yyyy-MM-dd"
    ),
  });

  const themeColors = useThemeColors();
  const removeFriend = useMutation(api.users.removeFriend);
  const sendMessage = useMutation(api.messages.sendMessage);

  const sessionStreak = getSessionStreak(sessionGraphData ?? []);

  return (
    <View
      className="flex-col px-3 py-2 border-b"
      style={{ borderBottomColor: themeColors.divider }}
    >
      <TouchableOpacity
        className="flex-row items-center"
        onPress={() => {
          CommonEvents.emit("SHOW_OPTION_SELECTOR_BOTTOM_SHEET", {
            title: user.username,
            options: [
              {
                id: "view_profile",
                label: "View Profile",
                onSelect: () => navigateToUserProfile(user._id),
              },
              {
                id: "poke",
                label: "Poke to read their bible",
                onSelect: () => {
                  sendMessage({
                    content: "",
                    kind: "POKE",
                    receiverId: user._id,
                  });
                },
              },
              {
                id: "prayer",
                label: "Leave a prayer",
                onSelect: () => {
                  const prayerHints = [
                    "Write your prayer here...",
                    "What is the Lord saying?",
                    "Leave an encouragement...",
                  ];

                  CommonEvents.emit("SHOW_INPUT_BOTTOM_SHEET", {
                    title: `Leave @${user.username} a prayer`,
                    subtitle: `Your latest prayer for @${user.username} will show in the Friends tab for a week.`,
                    placeholder:
                      prayerHints[
                        Math.floor(Math.random() * prayerHints.length)
                      ],
                    onSubmit: (text: string) => {
                      sendMessage({
                        content: text,
                        kind: "PRAYER",
                        receiverId: user._id,
                      });
                    },
                  });
                },
              },
              {
                id: "remove_friend",
                label: "Remove Friend",
                onSelect: () => {
                  Alert.alert(
                    "Remove Friend",
                    "Are you sure you want to remove this friend?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Remove",
                        style: "destructive",
                        onPress: () => removeFriend({ otherUserId: user._id }),
                      },
                    ]
                  );
                },
              },
            ],
          });
        }}
      >
        <View
          style={{ backgroundColor: themeColors.surfaceTertiary }}
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
        >
          {user.image ? (
            <Image
              source={{ uri: user.image }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <TText className="text-lg font-bold">
              {(user.name ?? user.username)?.charAt(0).toUpperCase()}
            </TText>
          )}
        </View>
        <View className="flex-col flex-1" style={{ gap: 4 }}>
          <TText className="font-semibold mr-auto">{user.username}</TText>
          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Ionicons name="flame" size={16} color={themeColors.textTertiary} />
            <TText
              className="text-xs"
              style={{ color: themeColors.textTertiary }}
            >
              {sessionStreak} streak
            </TText>
          </View>
        </View>
        <SessionHistoryGraph
          data={sessionGraphData ?? []}
          legend={false}
          axisLabels={false}
        />
      </TouchableOpacity>
      {receivedPrayer && (
        <TouchableOpacity
          onPress={() => setExpandReceivedPrayer(!expandReceivedPrayer)}
        >
          <View
            className="rounded-md p-2 mt-2"
            style={{ backgroundColor: themeColors.surfaceSecondary }}
          >
            <TText
              className="text-xs font-bold"
              style={{ color: themeColors.textTertiary }}
            >
              Left a prayer for you:
            </TText>
            <TText
              className="text-sm"
              style={{ color: themeColors.text }}
              numberOfLines={expandReceivedPrayer ? undefined : 2}
            >
              {receivedPrayer.content}
            </TText>
          </View>
        </TouchableOpacity>
      )}
      {sentPrayer && (
        <TouchableOpacity
          onPress={() => setExpandSentPrayer(!expandSentPrayer)}
        >
          <View
            className="rounded-md p-2 mt-2"
            style={{ backgroundColor: themeColors.surfaceSecondary }}
          >
            <TText
              className="text-xs font-bold"
              style={{ color: themeColors.textTertiary }}
            >
              You left a prayer:
            </TText>
            <TText
              className="text-sm"
              style={{ color: themeColors.text }}
              numberOfLines={expandSentPrayer ? undefined : 2}
            >
              {sentPrayer.content}
            </TText>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

function getSessionStreak(sessionGraphData: { date: string; count: number }[]) {
  let streak = 0;

  const dates = new Set<string>();
  for (let session of sessionGraphData) {
    if (session.count <= 0) continue;
    dates.add(startOfDay(new Date(session.date)).toISOString());
  }

  let currentDate = startOfDay(new Date());
  while (dates.has(currentDate.toISOString())) {
    streak++;
    currentDate = subDays(currentDate, 1);
  }

  // No such thing as a 1 day streak, so we return 0
  return streak <= 1 ? 0 : streak;
}
