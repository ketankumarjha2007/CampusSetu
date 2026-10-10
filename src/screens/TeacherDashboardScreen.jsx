import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { apiRequest, getCurrentUser } from '../services/api';
import styles from './TeacherDashboardScreen.styles';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const PRIORITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const getPriority = (issue) => {
  const priority = String(issue?.priority || 'medium').toLowerCase();
  return PRIORITY_LABELS[priority] ? priority : 'medium';
};

const getStatus = (issue) => {
  const status = String(issue?.status || 'pending').toLowerCase();
  return STATUS_LABELS[status] ? status : 'pending';
};

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return 'T';

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Date unavailable';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getErrorMessage = (error) => {
  if (error?.message) return error.message;
  return 'Unable to load your dashboard. Please try again.';
};

function SectionHeading({ title, subtitle, right }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        )}
      </View>
      {right || null}
    </View>
  );
}

function StatCard({ label, value, icon, tone, detail }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statCardTop}>
        <View style={[styles.statIcon, styles[`statIcon_${tone}`]]}>
          <Text
            style={[
              styles.statIconText,
              styles[`statIconText_${tone}`],
            ]}
          >
            {icon}
          </Text>
        </View>

        <View style={styles.statAccent}>
          <View
            style={[
              styles.statAccentDot,
              styles[`dot_${tone}`],
            ]}
          />
        </View>
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>

      {!!detail && (
        <Text style={styles.statDetail}>{detail}</Text>
      )}
    </View>
  );
}

function StatusBadge({ status }) {
  return (
    <View
      style={[
        styles.statusBadge,
        styles[`statusBadge_${status}`],
      ]}
    >
      {/* FIXED: closing bracket added to the style array */}
      <View
        style={[
          styles.statusDot,
          styles[`statusDot_${status}`],
        ]}
      />

      <Text
        style={[
          styles.statusText,
          styles[`statusText_${status}`],
        ]}
      >
        {STATUS_LABELS[status] || 'Pending'}
      </Text>
    </View>
  );
}

function PriorityBadge({ priority }) {
  return (
    <View
      style={[
        styles.priorityBadge,
        styles[`priorityBadge_${priority}`],
      ]}
    >
      <View
        style={[
          styles.priorityDot,
          styles[`priorityDot_${priority}`],
        ]}
      />

      <Text
        style={[
          styles.priorityText,
          styles[`priorityText_${priority}`],
        ]}
      >
        {PRIORITY_LABELS[priority] || 'Medium'}
      </Text>
    </View>
  );
}

export default function TeacherDashboardScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(
    async ({ showLoader = false } = {}) => {
      if (showLoader) setLoading(true);

      setError('');

      try {
        const issuesPromise = apiRequest(
          '/issues/teacher/assigned'
        );

        const userPromise = getCurrentUser().catch((userError) => {
          console.warn(
            'Could not load teacher profile:',
            userError.message
          );
          return null;
        });

        const [issuesResponse, userResponse] = await Promise.all([
          issuesPromise,
          userPromise,
        ]);

        if (!Array.isArray(issuesResponse?.issues)) {
          throw new Error(
            'The server returned an unexpected complaints response.'
          );
        }

        setIssues(issuesResponse.issues);

        const backendUser =
          userResponse?.user ||
          userResponse?.currentUser ||
          (userResponse && userResponse._id
            ? userResponse
            : null);

        setTeacher(backendUser);
      } catch (err) {
        console.error('Teacher dashboard error:', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchDashboard({ showLoader: true });
    }, [fetchDashboard])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const counts = useMemo(() => {
    const result = {
      total: issues.length,
      pending: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
      critical: 0,
      awaiting: 0,
    };

    issues.forEach((issue) => {
      const status = getStatus(issue);
      const priority = getPriority(issue);

      result[status] += 1;

      if (
        priority === 'critical' &&
        !['resolved', 'rejected'].includes(status)
      ) {
        result.critical += 1;
      }

      if (['pending', 'assigned'].includes(status)) {
        result.awaiting += 1;
      }
    });

    return result;
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...issues]
      .filter((issue) => {
        const matchesStatus =
          activeFilter === 'all' ||
          getStatus(issue) === activeFilter;

        const searchableText = [
          issue.complaintId,
          issue.title,
          issue.description,
          issue.category,
          issue.location,
          issue.building,
          issue.floor,
          issue.roomNumber,
          issue.reportedBy?.name,
          issue.reportedBy?.email,
          issue.reportedBy?.usn,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return (
          matchesStatus &&
          (!term || searchableText.includes(term))
        );
      })
      .sort((a, b) => {
        const priorityDifference =
          PRIORITY_ORDER[getPriority(a)] -
          PRIORITY_ORDER[getPriority(b)];

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [issues, activeFilter, search]);

  const countStatus = (status) => counts[status] || 0;

  const teacherName =
    teacher?.name?.trim() ||
    auth.currentUser?.displayName?.trim() ||
    auth.currentUser?.email?.split('@')[0] ||
    'Teacher';

  const teacherInitials = getInitials(teacherName);

  const openIssue = (issue) => {
    if (!issue?._id) {
      Alert.alert(
        'Unable to open complaint',
        'This complaint does not have a valid record ID.'
      );
      return;
    }

    navigation.navigate('OfficialIssueDetails', {
      issueId: issue._id,
    });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      `You are signed in as ${teacherName}. Do you want to sign out of CampusSetu?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();

              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              Alert.alert(
                'Sign out failed',
                err?.message || 'Please try again.'
              );
            }
          },
        },
      ]
    );
  };

  const renderIssue = (issue) => {
    const priority = getPriority(issue);
    const status = getStatus(issue);

    const locationParts = [
      issue.building,
      issue.floor ? `Floor ${issue.floor}` : '',
      issue.roomNumber ? `Room ${issue.roomNumber}` : '',
    ].filter(Boolean);

    const location =
      locationParts.join(', ') ||
      issue.location ||
      'Location not specified';

    return (
      <TouchableOpacity
        key={issue._id}
        style={styles.issueCard}
        activeOpacity={0.82}
        onPress={() => openIssue(issue)}
        accessibilityRole="button"
        accessibilityLabel={`Open complaint ${
          issue.complaintId || issue.title || ''
        }`}
      >
        <View style={styles.issueCardHeader}>
          <View style={styles.issueIdentity}>
            <View style={styles.issueMiniIcon}>
              <Text style={styles.issueMiniIconText}>#</Text>
            </View>

            <Text style={styles.complaintId} numberOfLines={1}>
              {issue.complaintId || 'Complaint'}
            </Text>
          </View>

          <PriorityBadge priority={priority} />
        </View>

        <Text style={styles.issueTitle} numberOfLines={2}>
          {issue.title || issue.category || 'Untitled complaint'}
        </Text>

        <Text style={styles.issueDescription} numberOfLines={2}>
          {issue.description || 'No description provided.'}
        </Text>

        <View style={styles.issueMetaRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText} numberOfLines={1}>
              {issue.category || 'General'}
            </Text>
          </View>

          <StatusBadge status={status} />
        </View>

        <View style={styles.issueDivider} />

        <View style={styles.issueDetailsRow}>
          <View style={styles.issueDetailItem}>
            <Text style={styles.detailSymbol}>⌖</Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <View style={styles.issueDetailItem}>
            <Text style={styles.detailSymbol}>◷</Text>
            <Text style={styles.detailText} numberOfLines={1}>
              {formatDate(issue.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.issueCardFooter}>
          <Text style={styles.reportedBy} numberOfLines={1}>
            {issue.reportedBy?.name
              ? `Reported by ${issue.reportedBy.name}`
              : 'Student complaint'}
          </Text>

          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetails}>View details</Text>
            <Text style={styles.viewDetailsArrow}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color="#0D806A" />
          </View>

          <Text style={styles.stateTitle}>
            Preparing your workspace
          </Text>

          <Text style={styles.stateDescription}>
            Fetching your assigned complaints and latest updates.
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateCard}>
          <View style={styles.errorIconContainer}>
            <Text style={styles.errorIcon}>!</Text>
          </View>

          <Text style={styles.stateTitle}>
            Couldn't load your workspace
          </Text>

          <Text style={styles.stateDescription}>{error}</Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => fetchDashboard({ showLoader: true })}
          >
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredIssues.length === 0) {
      const hasSearch = search.trim().length > 0;

      return (
        <View style={styles.stateCard}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>
              {hasSearch ? '⌕' : '✓'}
            </Text>
          </View>

          <Text style={styles.stateTitle}>
            {hasSearch
              ? 'No matching complaints'
              : 'You’re all caught up'}
          </Text>

          <Text style={styles.stateDescription}>
            {hasSearch
              ? 'Try another complaint ID, title, student, or location.'
              : activeFilter === 'all'
                ? 'There are no complaints assigned to you right now. New assignments will appear here.'
                : `No ${
                    STATUS_LABELS[activeFilter]?.toLowerCase() || ''
                  } complaints found.`}
          </Text>

          {hasSearch ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setSearch('')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Clear search
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return filteredIssues.map(renderIssue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#F4F7FB"
        barStyle="dark-content"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0D806A']}
            tintColor="#0D806A"
          />
        }
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>

            <View>
              <Text style={styles.brandName}>CampusSetu</Text>
              <Text style={styles.brandSubtitle}>
                FACULTY WORKSPACE
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Account and sign out"
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {teacherInitials}
              </Text>
            </View>

            <View style={styles.profileChevron}>
              <Text style={styles.profileChevronText}>⌄</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* WELCOME HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroContent}>
            <View style={styles.heroEyebrow}>
              <View style={styles.liveDot} />
              <Text style={styles.heroEyebrowText}>
                YOUR DAILY OVERVIEW
              </Text>
            </View>

            <Text style={styles.heroGreeting}>
              Hello, {teacherName.split(/\s+/)[0]}!
            </Text>

            <Text style={styles.heroTitle}>
              Make every resolution count.
            </Text>

            <Text style={styles.heroDescription}>
              Your attention makes campus life better. Here’s what
              needs you today.
            </Text>

            <View style={styles.heroBottom}>
              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>
                  {counts.awaiting}
                </Text>
                <Text style={styles.heroMetricLabel}>
                  Awaiting action
                </Text>
              </View>

              <View style={styles.heroMetricDivider} />

              <View style={styles.heroMetric}>
                <Text style={styles.heroMetricValue}>
                  {counts.resolved}
                </Text>
                <Text style={styles.heroMetricLabel}>
                  Resolved
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.heroDecoration}>
            <View style={styles.heroDecorationCircle}>
              <Text style={styles.heroDecorationIcon}>✓</Text>
            </View>
          </View>
        </View>

        {/* OVERVIEW */}
        <SectionHeading
          title="Your overview"
          subtitle="A live snapshot of your assigned workload"
          right={
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={refreshing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Refresh dashboard"
            >
              <Text style={styles.refreshIcon}>↻</Text>
            </TouchableOpacity>
          }
        />

        <View style={styles.statsGrid}>
          <StatCard
            label="Assigned total"
            value={counts.total}
            icon="▤"
            tone="teal"
            detail="All complaints"
          />

          <StatCard
            label="Awaiting action"
            value={counts.awaiting}
            icon="◷"
            tone="amber"
            detail="Pending or assigned"
          />

          <StatCard
            label="In progress"
            value={counts.in_progress}
            icon="↗"
            tone="blue"
            detail="Being addressed"
          />

          <StatCard
            label="Resolved"
            value={counts.resolved}
            icon="✓"
            tone="purple"
            detail="Successfully closed"
          />
        </View>

        {/* CRITICAL ALERT */}
        {!loading && !error && counts.critical > 0 ? (
          <View style={styles.criticalAlert}>
            <View style={styles.criticalAlertIcon}>
              <Text style={styles.criticalAlertIconText}>!</Text>
            </View>

            <View style={styles.criticalAlertContent}>
              <Text style={styles.criticalAlertTitle}>
                Immediate attention needed
              </Text>

              <Text style={styles.criticalAlertDescription}>
                {counts.critical} critical{' '}
                {counts.critical === 1
                  ? 'complaint needs'
                  : 'complaints need'}{' '}
                your attention.
              </Text>
            </View>

            <Text style={styles.criticalAlertArrow}>›</Text>
          </View>
        ) : null}

        {/* COMPLAINTS */}
        <SectionHeading
          title="Assigned complaints"
          subtitle="Prioritized to help you focus on what matters"
          right={
            <View style={styles.totalCountBadge}>
              <Text style={styles.totalCountText}>
                {filteredIssues.length}
              </Text>
            </View>
          }
        />

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search complaints, IDs, students..."
            placeholderTextColor="#8A96A8"
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search assigned complaints"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={styles.clearSearchButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearSearchText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => {
            const selected = activeFilter === filter.value;

            const count =
              filter.value === 'all'
                ? issues.length
                : countStatus(filter.value);

            return (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  selected && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter.value)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>

                <View
                  style={[
                    styles.filterCount,
                    selected && styles.filterCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      selected && styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* COMPLAINT LIST */}
        <View style={styles.issueList}>
          {renderContent()}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerBrandMark}>
            <Text style={styles.footerBrandMarkText}>C</Text>
          </View>

          <Text style={styles.footerTitle}>CampusSetu</Text>

          <Text style={styles.footerCaption}>
            FACULTY WORKSPACE
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
