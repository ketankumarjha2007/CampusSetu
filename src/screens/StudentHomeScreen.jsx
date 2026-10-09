import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { apiRequest } from '../services/api';
import styles from './StudentHomeScreen.styles';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    background: '#FFF7ED',
    border: '#FED7AA',
    text: '#C2410C',
  },
  assigned: {
    label: 'Assigned',
    background: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
  },
  in_progress: {
    label: 'In Progress',
    background: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
  },
  resolved: {
    label: 'Resolved',
    background: '#F0FDF4',
    border: '#BBF7D0',
    text: '#15803D',
  },
  rejected: {
    label: 'Rejected',
    background: '#FEF2F2',
    border: '#FECACA',
    text: '#B91C1C',
  },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low priority', color: '#15803D' },
  medium: { label: 'Medium priority', color: '#B45309' },
  high: { label: 'High priority', color: '#C2410C' },
  critical: { label: 'Critical priority', color: '#B91C1C' },
};

const QUICK_ACTIONS = [
  {
    id: 'reports',
    icon: '≡',
    title: 'My Reports',
    subtitle: 'View your complaints',
    background: '#EAF2FF',
    color: '#2563EB',
    route: 'MyReports',
  },
  {
    id: 'track',
    icon: '⌕',
    title: 'Track Complaint',
    subtitle: 'Check complaint status',
    background: '#E7F8F0',
    color: '#168653',
    route: 'TrackComplaint',
  },
  {
    id: 'resolved',
    icon: '✓',
    title: 'Resolved',
    subtitle: 'Completed complaints',
    background: '#E7F8F0',
    color: '#15803D',
    route: 'MyReports',
    params: { filter: 'Resolved' },
  },
  {
    id: 'pending',
    icon: '◷',
    title: 'Pending',
    subtitle: 'Awaiting action',
    background: '#FFF2E5',
    color: '#C2410C',
    route: 'MyReports',
    params: { filter: 'Pending' },
  },
  {
    id: 'help',
    icon: '?',
    title: 'Help & Support',
    subtitle: 'Get assistance',
    background: '#F3E8FF',
    color: '#7E22CE',
    route: 'Help',
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'GOOD MORNING';
  if (hour >= 12 && hour < 17) return 'GOOD AFTERNOON';
  if (hour >= 17 && hour < 21) return 'GOOD EVENING';

  return 'GOOD NIGHT';
}

function formatDate(dateValue) {
  if (!dateValue) return 'Date unavailable';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatus(status) {
  return (
    STATUS_CONFIG[String(status || '').toLowerCase()] ||
    STATUS_CONFIG.pending
  );
}

function getPriority(priority) {
  return (
    PRIORITY_CONFIG[String(priority || '').toLowerCase()] ||
    null
  );
}

function getLocation(report) {
  if (report?.location) return report.location;

  const parts = [
    report?.building,
    report?.floor ? `Floor ${report.floor}` : null,
    report?.roomNumber ? `Room ${report.roomNumber}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : 'Location not provided';
}

export default function StudentHomeScreen({ navigation }) {
  const [recentReports, setRecentReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportsError, setReportsError] = useState('');

  const openNotifications = useCallback(() => {
    let currentNavigation = navigation;

    // Check the current navigator and its parents.
    while (currentNavigation) {
      const state = currentNavigation.getState?.();
      const routeNames = state?.routeNames || [];

      if (routeNames.includes('Notifications')) {
        currentNavigation.navigate('Notifications');
        return;
      }

      currentNavigation = currentNavigation.getParent?.();
    }

    console.warn(
      'CampusSetu: Notifications route was not found in the navigation tree.'
    );
  }, [navigation]);

  const loadRecentReports = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setReportsLoading(true);
    }

    setReportsError('');

    try {
      const response = await apiRequest('/issues/my');

      if (!response?.success || !Array.isArray(response?.issues)) {
        throw new Error(
          response?.message || 'Unable to load your recent complaints.'
        );
      }

      const sortedReports = [...response.issues].sort((a, b) => {
        const dateA = new Date(a?.createdAt || 0).getTime();
        const dateB = new Date(b?.createdAt || 0).getTime();

        return dateB - dateA;
      });

      setRecentReports(sortedReports.slice(0, 3));
    } catch (error) {
      console.error('Student home recent reports error:', error);

      setReportsError(
        error?.message || 'Something went wrong while loading your reports.'
      );
      setRecentReports([]);
    } finally {
      setReportsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentReports(true);
    }, [loadRecentReports])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecentReports();
  }, [loadRecentReports]);

  const navigateTo = useCallback(
    (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    [navigation]
  );

  const renderRecentReport = (report) => {
    const status = getStatus(report?.status);
    const priority = getPriority(report?.priority);

    return (
      <TouchableOpacity
        key={report?._id || report?.complaintId}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={`Open complaint ${report?.title || 'details'}`}
        onPress={() =>
          navigateTo('IssueDetails', { issueId: report?._id })
        }
        style={styles.reportCard}
      >
        <View style={styles.reportTopRow}>
          <View style={styles.reportTitleContainer}>
            <Text style={styles.reportCategory}>
              {report?.category || 'General'}
            </Text>

            <Text style={styles.reportTitle} numberOfLines={2}>
              {report?.title || 'Untitled complaint'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: status.background,
                borderColor: status.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.reportLocationRow}>
          <Text style={styles.smallIcon}>⌖</Text>
          <Text style={styles.reportLocation} numberOfLines={2}>
            {getLocation(report)}
          </Text>
        </View>

        <View style={styles.reportDivider} />

        <View style={styles.reportBottomRow}>
          <View style={styles.reportMeta}>
            <Text style={styles.metaLabel}>COMPLAINT ID</Text>
            <Text style={styles.complaintId}>
              {report?.complaintId || 'ID unavailable'}
            </Text>
          </View>

          <View style={styles.reportMetaRight}>
            {priority ? (
              <Text style={[styles.priorityText, { color: priority.color }]}>
                {priority.label}
              </Text>
            ) : null}

            <Text style={styles.reportDate}>
              {formatDate(report?.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.openDetailsRow}>
          <Text style={styles.openDetailsText}>View complaint details</Text>
          <Text style={styles.openDetailsArrow}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F8F6"
        translucent={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#168653']}
            tintColor="#168653"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>

            <View>
              <Text style={styles.brandName}>CampusSetu</Text>
              <Text style={styles.brandTagline}>
                Bridging Students and Solutions
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={openNotifications}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Text style={styles.notificationIcon}>♧</Text>
            <View style={styles.notificationBellOverlay}>
              <Text style={styles.notificationBellText}>!</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.welcomeTitle}>Welcome back! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Your campus concerns, all in one place.
          </Text>
        </View>

        {/* CAMPUS SETU INTRO CARD */}
        <View style={styles.campusCard}>
          <View style={styles.campusCardIcon}>
            <Text style={styles.campusCardIconText}>✓</Text>
          </View>

          <View style={styles.campusCardContent}>
            <Text style={styles.campusCardTitle}>
              Your voice matters
            </Text>
            <Text style={styles.campusCardSubtitle}>
              Report campus issues and follow their progress right here.
            </Text>
          </View>
        </View>

        {/* PRIMARY ACTION */}
        <TouchableOpacity
          style={styles.primaryAction}
          activeOpacity={0.88}
          onPress={() => navigateTo('ReportIssue')}
          accessibilityRole="button"
          accessibilityLabel="Report a campus issue"
        >
          <View style={styles.primaryActionContent}>
            <Text style={styles.primaryEyebrow}>NEED SOMETHING FIXED?</Text>
            <Text style={styles.primaryTitle}>Report an Issue</Text>
            <Text style={styles.primarySubtitle}>
              Tell us what needs attention on campus.
            </Text>

            <View style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Report now</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </View>
          </View>

          <View style={styles.primaryDecoration}>
            <Text style={styles.primaryDecorationText}>+</Text>
          </View>
        </TouchableOpacity>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need, one tap away
            </Text>
          </View>
        </View>

        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => navigateTo(action.route, action.params)}
              accessibilityRole="button"
              accessibilityLabel={action.title}
            >
              <View
                style={[
                  styles.quickIconContainer,
                  { backgroundColor: action.background },
                ]}
              >
                <Text style={[styles.quickIcon, { color: action.color }]}>
                  {action.icon}
                </Text>
              </View>

              <Text style={styles.quickTitle} numberOfLines={1}>
                {action.title}
              </Text>

              <Text style={styles.quickSubtitle} numberOfLines={2}>
                {action.subtitle}
              </Text>

              <Text style={styles.quickArrow}>↗</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT ACTIVITY HEADER */}
        <View style={styles.recentHeader}>
          <View style={styles.sectionHeaderText}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <Text style={styles.sectionSubtitle}>
              Your latest campus complaints
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigateTo('MyReports')}
            activeOpacity={0.75}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Text style={styles.viewAllArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* RECENT ACTIVITY CONTENT */}
        {reportsLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#168653" />
            <Text style={styles.loadingText}>
              Loading your recent complaints...
            </Text>
          </View>
        ) : reportsError ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>

            <Text style={styles.errorTitle}>
              Couldn’t load recent activity
            </Text>
            <Text style={styles.errorMessage}>{reportsError}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              activeOpacity={0.8}
              onPress={() => loadRecentReports(true)}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : recentReports.length > 0 ? (
          <View style={styles.reportsList}>
            {recentReports.map(renderRecentReport)}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>≡</Text>
            </View>

            <Text style={styles.emptyTitle}>No complaints yet</Text>
            <Text style={styles.emptySubtitle}>
              When you report a campus issue, it will appear here so you can
              easily follow its progress.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.85}
              onPress={() => navigateTo('ReportIssue')}
            >
              <Text style={styles.emptyButtonText}>
                Report your first issue
              </Text>
              <Text style={styles.emptyButtonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SUPPORT FOOTER */}
        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <Text style={styles.footerIconText}>?</Text>
          </View>

          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>Need a hand?</Text>
            <Text style={styles.footerSubtitle}>
              Visit Help & Support for guidance using CampusSetu.
            </Text>

            <TouchableOpacity
              onPress={() => navigateTo('Help')}
              activeOpacity={0.75}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>Get help</Text>
              <Text style={styles.footerLinkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.bottomNote}>
          CampusSetu · Bridging Students and Solutions
        </Text>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => {
            // Already on the student home screen.
          }}
        >
          <Text style={styles.navIconActive}>⌂</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => navigateTo('MyReports')}
        >
          <Text style={styles.navIcon}>≡</Text>
          <Text style={styles.navLabel}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navAddItem}
          activeOpacity={0.85}
          onPress={() => navigateTo('ReportIssue')}
          accessibilityRole="button"
          accessibilityLabel="Create a complaint"
        >
          <View style={styles.navAddButton}>
            <Text style={styles.navAddText}>+</Text>
          </View>
          <Text style={styles.navLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={openNotifications}
        >
          <Text style={styles.navIcon}>♧</Text>
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.75}
          onPress={() => navigateTo('Profile')}
        >
          <Text style={styles.navIcon}>●</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}