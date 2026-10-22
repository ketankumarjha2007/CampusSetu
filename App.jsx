import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import AppNavigator from './src/navigation/AppNavigator';
import { auth } from './src/config/firebase';
import { registerForPushNotificationsAsync } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Auto-register device push token when user is logged in
        registerForPushNotificationsAsync().catch((err) => {
          console.warn('App: Push notification auto-registration failed:', err?.message || err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return <AppNavigator />;
}
