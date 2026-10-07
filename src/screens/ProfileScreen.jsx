import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getAuth,
  signOut,
} from 'firebase/auth';

import { apiRequest } from '../services/api';
import styles from './ProfileScreen.styles';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    try {
      setError('');

      const response = await apiRequest('/users/me');

      if (response?.success && response?.user) {
        setUser(response.user);
      } else {
        throw new Error(
          response?.message || 'Unable to load profile'
        );
      }
    } catch (err) {
      console.error(
        'Profile loading error:',
        err
      );

      setError(
        err.message ||
          'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleRetry = () => {
    setLoading(true);
    loadProfile();
  };

  const handleEditProfile = () => {
    if (!user) {
      return;
    }

    navigation.navigate('EditProfile', {
      user,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from CampusSetu?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const auth = getAuth();

              await signOut(auth);

              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'Welcome',
                  },
                ],
              });
            } catch (error) {
              console.error(
                'Logout error:',
                error
              );

              Alert.alert(
                'Logout Failed',
                'Unable to logout right now. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  if (error && !user) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Couldn't load profile
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.85}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayName =
    user?.name || 'CampusSetu Student';

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0)
    )
    .join('')
    .toUpperCase();

  const role = String(
    user?.role || 'student'
  )
    .replace(/_/g, ' ')
    .toUpperCase();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              My Profile
            </Text>

            <Text
              style={styles.headerSubtitle}
            >
              Your CampusSetu account
            </Text>
          </View>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials || 'S'}
            </Text>
          </View>

          <Text style={styles.name}>
            {displayName}
          </Text>

          <Text style={styles.email}>
            {user?.email ||
              'No email available'}
          </Text>

          <View style={styles.roleBadge}>
            <Text
              style={styles.roleBadgeText}
            >
              {role}
            </Text>
          </View>
        </View>

        {/* EDIT PROFILE BUTTON */}

        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.85}
          onPress={handleEditProfile}
        >
          <Text
            style={styles.editButtonIcon}
          >
            ✎
          </Text>

          <Text
            style={styles.editButtonText}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>

        {/* ACCOUNT INFORMATION */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ACCOUNT INFORMATION
          </Text>

          <View style={styles.infoCard}>
            {/* NAME */}

            <View style={styles.infoRow}>
              <View
                style={
                  styles.infoLabelContainer
                }
              >
                <Text style={styles.infoIcon}>
                  N
                </Text>

                <Text
                  style={styles.infoLabel}
                >
                  Full Name
                </Text>
              </View>

              <Text style={styles.infoValue}>
                {user?.name ||
                  'Not available'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* EMAIL */}

            <View style={styles.infoRow}>
              <View
                style={
                  styles.infoLabelContainer
                }
              >
                <Text style={styles.infoIcon}>
                  @
                </Text>

                <Text
                  style={styles.infoLabel}
                >
                  Email
                </Text>
              </View>

              <Text
                style={[
                  styles.infoValue,
                  styles.emailValue,
                ]}
                numberOfLines={2}
              >
                {user?.email ||
                  'Not available'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* USN */}

            <View style={styles.infoRow}>
              <View
                style={
                  styles.infoLabelContainer
                }
              >
                <Text style={styles.infoIcon}>
                  ID
                </Text>

                <Text
                  style={styles.infoLabel}
                >
                  USN
                </Text>
              </View>

              <Text style={styles.usnValue}>
                {user?.usn ||
                  'Not available'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* ROLE */}

            <View style={styles.infoRow}>
              <View
                style={
                  styles.infoLabelContainer
                }
              >
                <Text style={styles.infoIcon}>
                  R
                </Text>

                <Text
                  style={styles.infoLabel}
                >
                  Role
                </Text>
              </View>

              <Text style={styles.infoValue}>
                {role}
              </Text>
            </View>

            {/* DEPARTMENT */}

            {user?.department ? (
              <>
                <View
                  style={styles.divider}
                />

                <View
                  style={styles.infoRow}
                >
                  <View
                    style={
                      styles.infoLabelContainer
                    }
                  >
                    <Text
                      style={styles.infoIcon}
                    >
                      D
                    </Text>

                    <Text
                      style={
                        styles.infoLabel
                      }
                    >
                      Department
                    </Text>
                  </View>

                  <Text
                    style={styles.infoValue}
                  >
                    {user.department}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* ACCOUNT STATUS */}

        <View style={styles.statusCard}>
          <View style={styles.statusDot} />

          <View
            style={styles.statusContent}
          >
            <Text
              style={styles.statusTitle}
            >
              Account active
            </Text>

            <Text
              style={styles.statusText}
            >
              Your CampusSetu student account
              is active and connected.
            </Text>
          </View>
        </View>

        {/* LOGOUT BUTTON */}

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutIcon}
          >
            ⇥
          </Text>

          <Text
            style={styles.logoutText}
          >
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          BRIDGING STUDENTS AND SOLUTIONS
        </Text>
      </ScrollView>
    </View>
  );
}