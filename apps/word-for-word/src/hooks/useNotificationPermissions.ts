import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NotificationPermissionsState {
  isEnabled: boolean;
  isGranted: boolean;
  canRequest: boolean;
  isLoading: boolean;
}

export function useNotificationPermissions() {
  const [permissions, setPermissions] = useState<NotificationPermissionsState>({
    isEnabled: false,
    isGranted: false,
    canRequest: false,
    isLoading: true,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setPermissions(prev => ({ ...prev, isLoading: true }));

      if (!Device.isDevice) {
        setPermissions({
          isEnabled: false,
          isGranted: false,
          canRequest: false,
          isLoading: false,
        });
        return;
      }

      const { status, canAskAgain } = await Notifications.getPermissionsAsync();

      setPermissions({
        isEnabled: status === 'granted',
        isGranted: status === 'granted',
        canRequest: canAskAgain ?? false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      setPermissions({
        isEnabled: false,
        isGranted: false,
        canRequest: false,
        isLoading: false,
      });
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myNotificationChannel', {
          name: 'A channel is needed for the permissions prompt to appear',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      const isGranted = status === 'granted';

      setPermissions(prev => ({
        ...prev,
        isEnabled: isGranted,
        isGranted,
        canRequest: !isGranted,
      }));

      return isGranted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const getExpoPushToken = async (): Promise<string | null> => {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for Push Notifications');
        return null;
      }

      if (!permissions.isGranted) {
        const granted = await requestPermissions();
        if (!granted) {
          return null;
        }
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  };

  return {
    ...permissions,
    checkPermissions,
    requestPermissions,
    getExpoPushToken,
  };
} 
