import TBottomSheetModal from "@/src/components/core/TBottomSheetModal";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import { TText } from "@/src/components/core/TText";
import { TView } from "@/src/components/core/TView";
import { CommonEvents } from "@/src/hooks/useEvents";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { api } from "@backend/convex/_generated/api";
import type { Doc, Id } from "@backend/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, useRouter, useSegments } from "expo-router";
import React, {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import SessionHistoryGraph from "@/src/components/session-history-graph";
import { formatDate } from "date-fns";

interface UserProfileScreenProps {
  userId?: Id<"users">;
  isTab?: boolean;
}

export default function UserProfileScreen({
  userId: propUserId,
  isTab = false,
}: UserProfileScreenProps) {
  const themeColors = useThemeColors();
  const { userId: paramUserId } = useLocalSearchParams<{
    userId: Id<"users">;
  }>();
  const router = useRouter();

  // Use prop userId if provided, otherwise use the one from params
  const userId = propUserId ?? paramUserId;
  if (!userId) {
    return null;
  }

  const user = useQuery(api.users.getUserById, { userId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const sessionHistoryData = useQuery(api.sessionLogger.getSessionHistoryData, {
    userId,
    endDateStr: formatDate(new Date(), "yyyy-MM-dd"),
    startDateStr: formatDate(
      new Date(new Date().setDate(new Date().getDate() - 30)),
      "yyyy-MM-dd"
    ),
  });

  const [isLoading, setIsLoading] = useState(false);

  const friendOptionSheetRef = useRef<BottomSheetModal>(null);

  // Backend queries and mutations
  const sendFriendInvite = useMutation(api.invites.sendFriendInvite);
  const updateUserInvite = useMutation(api.invites.updateUserInvite);
  const friendshipStatus = useQuery(api.invites.getFriendshipStatus, {
    otherUserId: userId,
  });

  const sendInvite = useCallback(
    async (friendType: "FRIEND" | "CLOSE_FRIEND") => {
      if (!user?._id) throw new Error("User not found");

      setIsLoading(true);

      try {
        const result = await sendFriendInvite({
          receivedByUserId: userId,
          friendType,
        });

        Alert.alert(
          "Success",
          `Friend request sent to ${user.username || user.name}`
        );

        // Close the bottom sheet
        friendOptionSheetRef.current?.dismiss();
      } catch (error) {
        Alert.alert("Error", "Failed to send friend request");
        console.error("Error sending friend request:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [sendFriendInvite, userId, user]
  );

  const handleAddFriend = useCallback(() => {
    CommonEvents.emit("SHOW_OPTION_SELECTOR_BOTTOM_SHEET", {
      snapPoint: 200,
      title: "Add as",
      options: [
        {
          id: "friend",
          label: "Friend",
          onSelect: () => {
            sendInvite("FRIEND");
          },
        },
        {
          id: "close_friend",
          label: "Close Friend",
          onSelect: () => {
            sendInvite("CLOSE_FRIEND");
          },
        },
      ],
    });
  }, [sendInvite]);

  const handleAcceptInvite = useCallback(async () => {
    if (!friendshipStatus?.inviteId) return;
    const { inviteId } = friendshipStatus;
    if (!user) return;

    setIsLoading(true);

    try {
      await updateUserInvite({
        inviteId,
        status: "ACCEPTED",
      });
      Alert.alert(
        "Success",
        `You are now friends with ${user.username || user.name}`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to accept friend request");
      console.error("Error accepting friend request:", error);
    } finally {
      setIsLoading(false);
    }
  }, [updateUserInvite, user, friendshipStatus]);

  const handleRejectInvite = useCallback(async () => {
    if (!friendshipStatus?.inviteId) return;
    const { inviteId } = friendshipStatus;

    setIsLoading(true);

    try {
      await updateUserInvite({
        inviteId,
        status: "REJECTED",
      });

      Alert.alert("Success", "Friend request rejected");
    } catch (error) {
      Alert.alert("Error", "Failed to reject friend request");
      console.error("Error rejecting friend request:", error);
    } finally {
      setIsLoading(false);
    }
  }, [updateUserInvite, friendshipStatus]);

  const renderFriendshipButton = () => {
    // Don't show friend button when viewing own profile
    if (currentUser?._id === user?._id) {
      return null;
    }

    switch (friendshipStatus?.status) {
      case "OUTGOING_INVITE":
        return (
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: themeColors.surfaceSecondary }}
            disabled={true}
          >
            <TText className="text-center">Request Sent</TText>
          </TouchableOpacity>
        );
      case "INCOMING_INVITE":
        return (
          <View className="flex-row">
            <TouchableOpacity
              className="px-4 py-2 rounded-full mr-2"
              style={{ backgroundColor: themeColors.error }}
              onPress={handleRejectInvite}
              disabled={isLoading}
            >
              <TText className="text-center">Decline</TText>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: themeColors.primary }}
              onPress={handleAcceptInvite}
              disabled={isLoading}
            >
              <TText className="text-center text-white">
                {isLoading ? "Processing..." : "Accept"}
              </TText>
            </TouchableOpacity>
          </View>
        );
      case "FRIEND":
        return (
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: themeColors.secondary }}
          >
            <TText className="text-center">Friends</TText>
          </TouchableOpacity>
        );
      case "CLOSE_FRIEND":
        return (
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: themeColors.secondary }}
          >
            <TText className="text-center">Close Friends</TText>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: themeColors.primary }}
            onPress={handleAddFriend}
          >
            <TText className="text-center text-white">Add Friend</TText>
          </TouchableOpacity>
        );
    }
  };

  if (!user) {
    return (
      <TSafeAreaView className="h-full">
        <TView className="h-full justify-center items-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
        </TView>
      </TSafeAreaView>
    );
  }

  // Show loading indicator while fetching friendship status
  if (user?._id && friendshipStatus === undefined) {
    return (
      <TSafeAreaView className="h-full">
        <TView className="h-full justify-center items-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
          <TText className="mt-4">Loading profile...</TText>
        </TView>
      </TSafeAreaView>
    );
  }

  if (user === undefined) {
    return (
      <TSafeAreaView className="h-full">
        <TView className="h-full justify-center items-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
          <TText className="mt-4">Loading profile...</TText>
        </TView>
      </TSafeAreaView>
    );
  }

  return (
    <TSafeAreaView className="h-full" edges={isTab ? [] : ["top", "bottom"]}>
      <TView className="h-full">
        {/* Header with back button */}
        {!isTab && (
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <TText className="ml-3 text-lg font-semibold">Profile</TText>
          </View>
        )}

        {/* User Profile Content */}
        <View className="items-center px-4 pt-6">
          {/* Profile Image */}
          <View
            className="w-24 h-24 rounded-full overflow-hidden justify-center items-center mb-4"
            style={{ backgroundColor: themeColors.surfaceTertiary }}
          >
            {user.image ? (
              <Image
                source={{ uri: user.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={50} color={themeColors.surface} />
            )}
          </View>

          {/* User Name */}
          <TText className="text-2xl font-bold mb-1">
            {user.name || "No Name"}
          </TText>

          {/* Username */}
          <TText className="text-lg text-gray-500 mb-6">
            @{user.username || "username"}
          </TText>

          {/* Add Friend Button */}
          {renderFriendshipButton()}
        </View>

        {/* Stats Section */}
        {/* <View className="flex-row justify-around mt-10 px-4 py-6 border-t border-b border-gray-200">
          <View className="items-center">
            <TText className="text-xl font-bold">0</TText>
            <TText className="text-gray-500">Friends</TText>
          </View>
          <View className="items-center">
            <TText className="text-xl font-bold">0</TText>
            <TText className="text-gray-500">Groups</TText>
          </View>
        </View> */}

        {/* Session History Graph */}
        <View className="mt-6 px-4">
          <TText className="text-lg font-semibold mb-4">
            Bible Reading History
          </TText>
          {sessionHistoryData ? (
            <SessionHistoryGraph
              size={18}
              spacing={2}
              xLabelSize={10}
              data={sessionHistoryData}
            />
          ) : (
            <TText className="text-center text-gray-500">
              No activity data available
            </TText>
          )}
        </View>
      </TView>
    </TSafeAreaView>
  );
}
