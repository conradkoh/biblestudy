import React, { useEffect, useState } from "react";
import { TView } from "@/src/components/core/TView";
import { TText } from "@/src/components/core/TText";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { getExpoPushToken } from "@/src/services/push-notifications";
import { ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import type { Doc } from "@backend/convex/_generated/dataModel";

type Notification = Doc<"userInvites"> & {
  sender: {
    name: string | null | undefined;
    image: string | null | undefined;
  } | null;
};

export default function NotificationsScreen() {
  const themeColors = useThemeColors();
  const notifications = useQuery(api.userNotifications.getUserNotifications);
  const updateUserInvite = useMutation(api.invites.updateUserInvite);


  if (!notifications) {
    return (
      <TSafeAreaView className="h-full">
        <TView className="h-full justify-center items-center">
          <ActivityIndicator size="large" color={themeColors.primary} />
        </TView>
      </TSafeAreaView>
    );
  }

  if (notifications.length === 0) {
    return (
      <TSafeAreaView className="h-full">
        <TView className="h-full justify-center items-center">
          <TText className="text-lg">No notifications</TText>
        </TView>
      </TSafeAreaView>
    );
  }

  return (
    <TSafeAreaView className="h-full">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} updateUserInvite={updateUserInvite} />
        )}
      />
    </TSafeAreaView>
  );
}

interface NotificationItemProps {
  notification: Notification;
  updateUserInvite: (args: {
    inviteId: Doc<"userInvites">["_id"];
    status: "ACCEPTED" | "REJECTED";
  }) => Promise<boolean>;
}

function NotificationItem({ notification, updateUserInvite }: NotificationItemProps) {
  const themeColors = useThemeColors();

  let title = "";
  let description = "";

  switch (notification.inviteType) {
    case "FRIEND":
      title = "Friend Request";
      description = `${notification.sender?.name} wants to be your friend`;
      break;
    case "CLOSE_FRIEND":
      title = "Close Friend Request";
      description = `${notification.sender?.name} wants to be your close friend`;
      break;
    case "GROUP":
      title = "Group Invitation";
      description = `${notification.sender?.name} invited you to join a group`;
      break;
  }

  return (
    <TView
      className="p-4 border-b border-gray-200"
      style={{ backgroundColor: themeColors.surface }}
    >
      <TText className="text-lg font-semibold mb-1">{title}</TText>
      <TText className="text-sm mb-4">{description}</TText>
      <TView className="flex-row justify-end space-x-4">
        <TouchableOpacity
          onPress={() => {
            updateUserInvite({ inviteId: notification._id, status: 'REJECTED' });
          }}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: themeColors.error }}
        >
          <TText className="text-white">Reject</TText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            updateUserInvite({ inviteId: notification._id, status: 'ACCEPTED' });
          }}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: themeColors.success }}
        >
          <TText className="text-white">Accept</TText>
        </TouchableOpacity>
      </TView>
    </TView>
  );
}
