import React, { useEffect, useState } from "react";
import { TView } from "@/src/components/core/TView";
import { TText } from "@/src/components/core/TText";
import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { TSafeAreaView } from "@/src/components/core/TSafeAreaView";
import type { Doc } from "@backend/convex/_generated/dataModel";
import { format } from "date-fns";

type Notification = Doc<"userNotifications">;

export default function NotificationsScreen() {
  const themeColors = useThemeColors();
  const notifications = useQuery(api.userNotifications.getUserNotificationsV2);
  const updateUserInvite = useMutation(api.invites.updateUserInvite);
  const markNotificationAsRead = useMutation(api.userNotifications.markNotificationAsRead);
  const pendingInvites = useQuery(api.invites.getPendingInvites);

  // Mark all notifications as read when screen is focused
  useEffect(() => {
    if (notifications) {
      const unreadNotifications = notifications.filter(n => !n.readAt);
      if (unreadNotifications.length > 0) {
        markNotificationAsRead({
          notificationIds: unreadNotifications.map(n => n._id)
        });
      }
    }
  }, [notifications, markNotificationAsRead]);

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
        renderItem={({ item }) => {
          if (item.kind === "USER_INVITE") {
            const pendingInvite = pendingInvites?.find((invite) => invite._id === item.inviteId);
            return <InviteNotificationItem notification={item} pendingInvite={pendingInvite} updateUserInvite={updateUserInvite} />
          }

          return <NotificationItem notification={item} />
        }}
      />
    </TSafeAreaView>
  );
}

interface NotificationItemProps {
  notification: Notification;
}

interface InviteNotificationItemProps extends NotificationItemProps {
  pendingInvite: Doc<"userInvites"> | undefined;
  updateUserInvite: (args: {
    inviteId: Doc<"userInvites">["_id"];
    status: "ACCEPTED" | "REJECTED";
  }) => Promise<boolean>;
}

function NotificationItem({ notification }: NotificationItemProps) {
  const themeColors = useThemeColors();

  return (
    <TView
      className="p-3 border-b"
      style={{
        backgroundColor: notification.readAt ? themeColors.surface : themeColors.surfaceHighlight,
        borderColor: themeColors.border
      }}
    >
      <View className="flex-row">
        <View className="flex-1">
          <TText className="text-sm mb-1">{notification.title}</TText>
          {!!notification.body && <TText className="text-sm mb-4">{notification.body}</TText>}
        </View>
        <TText className="text-xs" style={{ color: themeColors.textSecondary }}>{format(notification.createdAt, "MMM d hh:mma")}</TText>
      </View>
    </TView>
  );
}

function InviteNotificationItem({ notification, pendingInvite, updateUserInvite }: InviteNotificationItemProps) {
  const themeColors = useThemeColors();

  return (
    <TView
      className="p-3 border-b"
      style={{
        backgroundColor: notification.readAt ? themeColors.surface : themeColors.surfaceHighlight,
        borderColor: themeColors.border
      }}
    >
      <View className="flex-row">
        <View className="flex-1">
          <TText className="text-sm mb-1">{notification.title}</TText>
          {!!notification.body && <TText className="text-sm mb-4">{notification.body}</TText>}
        </View>
        <TText className="text-xs" style={{ color: themeColors.textSecondary }}>{format(notification.createdAt, "MMM d hh:mma")}</TText>
      </View>
      {pendingInvite && <TView className="flex-row justify-end space-x-4">
        <TouchableOpacity
          onPress={() => {
            updateUserInvite({ inviteId: pendingInvite._id, status: 'REJECTED' });
          }}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: themeColors.error }}
        >
          <TText className="text-white">Reject</TText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            updateUserInvite({ inviteId: pendingInvite._id, status: 'ACCEPTED' });
          }}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: themeColors.success }}
        >
          <TText className="text-white">Accept</TText>
        </TouchableOpacity>
      </TView>}
    </TView>
  );
}
