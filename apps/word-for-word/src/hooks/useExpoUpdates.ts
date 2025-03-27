import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { useAppState } from './useAppState';

export function useExpoUpdates() {
  const appState = useAppState();

  useEffect(() => {
    async function checkForUpdates() {
      if (appState === 'active') {
        try {
          const { isAvailable } = await Updates.checkForUpdateAsync();
          if (isAvailable) {
            Alert.alert(
              'Update Available',
              'A new version of the app is available. Would you like to update now?',
              [
                {
                  text: 'Later',
                  style: 'cancel',
                },
                {
                  text: 'Update',
                  onPress: async () => {
                    try {
                      await Updates.fetchUpdateAsync();
                      await Updates.reloadAsync();
                    } catch (error) {
                      Alert.alert(
                        'Update Failed',
                        'There was an error updating the app. Please try again later.'
                      );
                    }
                  },
                },
              ]
            );
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }
    }


    if (!Updates.isEnabled) return;
    checkForUpdates();
  }, [appState]);
} 
