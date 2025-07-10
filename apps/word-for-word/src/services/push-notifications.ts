
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function useNotificationObserver(isAuthenticated: boolean, unreadCount: number) {

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (!isMounted || !response?.notification) {
          return;
        }
        redirect(response?.notification);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [isAuthenticated]);

  // Update app badge count whenever unread notifications change
  useEffect(() => {
    Notifications.setBadgeCountAsync(unreadCount).catch(console.error);
  }, [unreadCount]);

  // Handle background notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      // Increment badge count when a new notification is received
      Notifications.getBadgeCountAsync().then(currentCount => {
        Notifications.setBadgeCountAsync((currentCount ?? 0) + 1).catch(console.error);
      });
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
