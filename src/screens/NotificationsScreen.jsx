import React, {
  useCallback,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import styles from './NotificationsScreen.styles';
import { apiRequest } from '../services/api';

const getNotificationData = (
  historyItem,
  issue
) => {
  const status = historyItem.status;

  switch (status) {
    case 'pending':
      return {
        icon: '📝',
        title: 'Complaint Submitted',
        message:
          `Your complaint ${issue.complaintId} was successfully submitted.`,
      };

    case 'assigned':
      return {
        icon: '👤',
        title: 'Complaint Assigned',
        message:
          `Your complaint ${issue.complaintId} has been assigned to a campus official.`,
      };

    case 'in_progress':
      return {
        icon: '🔧',
        title: 'Complaint In Progress',
        message:
          `Work has started on your complaint ${issue.complaintId}.`,
      };

    case 'resolved':
      return {
        icon: '✅',
        title: 'Complaint Resolved',
        message:
          `Your complaint ${issue.complaintId} has been marked as resolved.`,
      };

    case 'rejected':
      return {
        icon: '❌',
        title: 'Complaint Rejected',
        message:
          `Your complaint ${issue.complaintId} has been rejected.`,
      };

    default:
      return {
        icon: '🔔',
        title: 'Complaint Updated',
        message:
          `Your complaint ${issue.complaintId} has been updated.`,
      };
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function NotificationsScreen({
  navigation,
}) {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadNotifications =
    useCallback(async () => {
      try {
        setError('');

        let liveNotifications = [];
        try {
          const notifRes = await apiRequest('/issues/notifications/me');
          if (Array.isArray(notifRes?.notifications) && notifRes.notifications.length > 0) {
            liveNotifications = notifRes.notifications.map((n) => ({
              id: n._id,
              issueId: n.issueId,
              complaintId: n.complaintId,
              issueTitle: n.title,
              icon: n.title.includes('✅') || n.title.includes('Resolved')
                ? '✅'
                : n.title.includes('❌') || n.title.includes('Rejected')
                  ? '❌'
                  : n.title.includes('👨‍🏫') || n.title.includes('Assigned')
                    ? '👤'
                    : '🔔',
              title: n.title,
              message: n.body,
              date: n.createdAt,
              status: n.type,
              read: n.read,
            }));
          }
        } catch {
          // If in-app notifications endpoint returns empty or not available, fall back
        }

        if (liveNotifications.length > 0) {
          setNotifications(liveNotifications);
          return;
        }

        const response =
          await apiRequest('/issues/my');

        const issues =
          response.issues || [];

        const generatedNotifications = [];

        issues.forEach((issue) => {
          const history =
            issue.history || [];

          history.forEach(
            (historyItem, index) => {
              const notification =
                getNotificationData(
                  historyItem,
                  issue
                );

              generatedNotifications.push({
                id:
                  `${issue._id}-${historyItem._id || index}`,

                issueId: issue._id,

                complaintId:
                  issue.complaintId,

                issueTitle:
                  issue.title,

                icon:
                  notification.icon,

                title:
                  notification.title,

                message:
                  historyItem.note
                    ? historyItem.note
                    : notification.message,

                date:
                  historyItem.changedAt ||
                  issue.updatedAt ||
                  issue.createdAt,

                status:
                  historyItem.status,
              });
            }
          );
        });

        generatedNotifications.sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

        setNotifications(
          generatedNotifications
        );
      } catch (requestError) {
        console.error(
          'Notifications error:',
          requestError
        );

        setError(
          requestError.message ||
            'Unable to load notifications.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = (
    notification
  ) => {
    navigation.navigate(
      'IssueDetails',
      {
        issueId:
          notification.issueId,
      }
    );
  };

  const renderNotification = ({
    item,
  }) => {
    return (
      <TouchableOpacity
        style={styles.notificationCard}
        activeOpacity={0.8}
        onPress={() =>
          handleNotificationPress(
            item
          )
        }
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <Text
            style={styles.iconText}
          >
            {item.icon}
          </Text>
        </View>

        <View
          style={
            styles.notificationContent
          }
        >
          <View
            style={
              styles.notificationTopRow
            }
          >
            <Text
              style={
                styles.notificationTitle
              }
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <View
              style={[
                styles.statusDot,
                item.status ===
                  'resolved' &&
                  styles.statusDotResolved,
              ]}
            />
          </View>

          <Text
            style={
              styles.notificationMessage
            }
          >
            {item.message}
          </Text>

          <Text
            style={
              styles.notificationIssue
            }
            numberOfLines={1}
          >
            {item.complaintId} •{' '}
            {item.issueTitle}
          </Text>

          <Text
            style={
              styles.notificationDate
            }
          >
            {formatDate(item.date)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (
    loading &&
    notifications.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text
            style={styles.loadingText}
          >
            Loading notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (
    error &&
    notifications.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={styles.backArrow}
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View>
            <Text
              style={
                styles.headerEyebrow
              }
            >
              CAMPUSSETU
            </Text>

            <Text
              style={styles.headerTitle}
            >
              Notifications
            </Text>
          </View>
        </View>

        <View
          style={styles.emptyContainer}
        >
          <Text
            style={styles.emptyIcon}
          >
            ⚠️
          </Text>

          <Text
            style={styles.emptyTitle}
          >
            Couldn't load notifications
          </Text>

          <Text
            style={styles.emptyMessage}
          >
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadNotifications}
          >
            <Text
              style={styles.retryText}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.8}
        >
          <Text
            style={styles.backArrow}
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.headerEyebrow}
          >
            CAMPUSSETU
          </Text>

          <Text
            style={styles.headerTitle}
          >
            Notifications
          </Text>
        </View>

        {notifications.length > 0 && (
          <View
            style={
              styles.countBadge
            }
          >
            <Text
              style={
                styles.countText
              }
            >
              {notifications.length}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={
          renderNotification
        }
        contentContainerStyle={
          notifications.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
          />
        }
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View
              style={
                styles.introCard
              }
            >
              <Text
                style={
                  styles.introTitle
                }
              >
                Stay updated
              </Text>

              <Text
                style={
                  styles.introText
                }
              >
                You'll see updates about
                your complaints here.
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text
              style={styles.emptyIcon}
            >
              🔔
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No notifications yet
            </Text>

            <Text
              style={styles.emptyMessage}
            >
              Updates about your complaints
              will appear here.
            </Text>

            <TouchableOpacity
              style={
                styles.reportButton
              }
              onPress={() =>
                navigation.navigate(
                  'ReportIssue'
                )
              }
            >
              <Text
                style={
                  styles.reportButtonText
                }
              >
                Report an Issue
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}