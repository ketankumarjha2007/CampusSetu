import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { apiRequest } from './api';

// ==========================================
// NOTIFICATION HANDLER
// ==========================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ==========================================
// SAVE PUSH TOKEN TO BACKEND
// ==========================================

const savePushTokenToBackend = async (
  pushToken
) => {
  try {
    console.log(
      'Notification: Saving push token to backend...'
    );

    const response =
      await apiRequest(
        '/users/push-token',
        {
          method: 'POST',
          body: JSON.stringify({
            pushToken,
          }),
        }
      );

    console.log(
      'Notification: Push token saved:',
      response
    );

    return true;
  } catch (error) {
    console.error(
      'Notification: Failed to save push token:',
      error.message
    );

    return false;
  }
};

// ==========================================
// REGISTER FOR PUSH NOTIFICATIONS
// ==========================================

export const registerForPushNotificationsAsync =
  async () => {
    try {
      // --------------------------------------
      // ANDROID NOTIFICATION CHANNEL
      // --------------------------------------

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(
          'default',
          {
            name: 'default',
            importance:
              Notifications.AndroidImportance.MAX,

            vibrationPattern: [
              0,
              250,
              250,
              250,
            ],

            lightColor: '#2563EB',
          }
        );
      }

      // --------------------------------------
      // CHECK PERMISSION
      // --------------------------------------

      const {
        status: existingStatus,
      } =
        await Notifications.getPermissionsAsync();

      let finalStatus =
        existingStatus;

      if (
        existingStatus !== 'granted'
      ) {
        const {
          status,
        } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (
        finalStatus !== 'granted'
      ) {
        console.log(
          'Notification: Permission not granted.'
        );

        return null;
      }

      // --------------------------------------
      // GET EXPO PROJECT ID
      // --------------------------------------

      const projectId =
        Constants.expoConfig?.extra?.eas
          ?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.error(
          'Notification: Expo EAS projectId not found.'
        );

        return null;
      }

      console.log(
        'Notification: Expo Project ID:',
        projectId
      );

      // --------------------------------------
      // GET EXPO PUSH TOKEN
      // --------------------------------------

      const tokenResponse =
        await Notifications.getExpoPushTokenAsync({
          projectId,
        });

      const pushToken =
        tokenResponse.data;

      console.log(
        'Notification: Expo Push Token:',
        pushToken
      );

      // --------------------------------------
      // SAVE TOKEN TO BACKEND
      // --------------------------------------

      await savePushTokenToBackend(
        pushToken
      );

      return pushToken;
    } catch (error) {
      console.error(
        'Notification registration failed:',
        error
      );

      return null;
    }
  };