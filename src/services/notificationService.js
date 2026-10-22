import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { apiRequest } from './api';

// ==========================================
// NOTIFICATION HANDLER SETUP (FOREGROUND)
// ==========================================

let notificationsModule = null;

const getNotifications = async () => {
  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
    try {
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch (e) {
      console.warn('Notification: Failed to set notification handler:', e?.message || e);
    }
  }
  return notificationsModule;
};

// Eagerly set handler
getNotifications().catch(() => {});

// ==========================================
// SAVE PUSH TOKEN TO BACKEND
// ==========================================

const savePushTokenToBackend = async (pushToken) => {
  try {
    console.log('Notification: Saving push token to backend...');

    const response = await apiRequest('/users/push-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    });

    console.log('Notification: Push token saved:', response);
    return true;
  } catch (error) {
    console.error('Notification: Failed to save push token:', error.message);
    return false;
  }
};

export const clearPushTokenFromBackend = async () => {
  try {
    await apiRequest('/users/push-token/clear', {
      method: 'POST',
    });
    return true;
  } catch (error) {
    console.warn(
      'Notification: Failed to clear push token from backend:',
      error?.message || error
    );
    return false;
  }
};

export const logoutAndClearPushToken = async (authInstance) => {
  try {
    await clearPushTokenFromBackend();
  } catch (error) {
    console.warn(
      'Notification: Error while clearing backend push token on logout:',
      error?.message || error
    );
  }

  if (authInstance && typeof authInstance.signOut === 'function') {
    await authInstance.signOut();
  }
};

// ==========================================
// REGISTER FOR PUSH NOTIFICATIONS
// ==========================================

export const registerForPushNotificationsAsync = async () => {
  try {
    if (
      Platform.OS === 'android' &&
      (Constants.appOwnership === 'expo' || Constants.expoGoConfig != null)
    ) {
      console.log(
        'Notification: Remote push notifications require a development or production build on Android.'
      );
      return null;
    }

    const Notifications = await getNotifications();

    // --------------------------------------
    // ANDROID NOTIFICATION CHANNEL
    // --------------------------------------
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#176B4D',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // --------------------------------------
    // CHECK & REQUEST PERMISSION
    // --------------------------------------
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification: Permission not granted.');
      return null;
    }

    // --------------------------------------
    // GET EXPO PROJECT ID (WITH HARDCODED FALLBACK)
    // --------------------------------------
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      '97f5656d-5be3-4b0c-9af0-f8d7bf4b60ba';

    console.log('Notification: Expo Project ID:', projectId);

    // --------------------------------------
    // GET EXPO PUSH TOKEN
    // --------------------------------------
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenResponse?.data;

    if (!pushToken) {
      console.error('Notification: Failed to get push token from Expo.');
      return null;
    }

    console.log('Notification: Expo push token obtained:', pushToken);

    // --------------------------------------
    // SAVE TOKEN TO BACKEND
    // --------------------------------------
    const tokenSaved = await savePushTokenToBackend(pushToken);

    if (!tokenSaved) {
      console.error(
        'Notification: Push token was not saved; this device will not receive push notifications.'
      );
      return null;
    }

    console.log('Notification: Push token saved successfully.');
    return pushToken;
  } catch (error) {
    console.error('Notification registration failed:', error);
    return null;
  }
};
