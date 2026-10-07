import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import StudentHomeScreen from '../screens/StudentHomeScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import IssueDetailsScreen from '../screens/IssueDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import TrackComplaintScreen from '../screens/TrackComplaintScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >

        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="StudentHome"
          component={StudentHomeScreen}
        />

        <Stack.Screen
          name="ReportIssue"
          component={ReportIssueScreen}
        />

        <Stack.Screen
          name="MyReports"
          component={MyReportsScreen}
        />

        <Stack.Screen
          name="IssueDetails"
          component={IssueDetailsScreen}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
        />
        <Stack.Screen
          name="TrackComplaint"
          component={TrackComplaintScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}