
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { auth } from '../config/firebase';
import {
  apiRequest,
  getCurrentUser,
} from '../services/api';
import {
  logoutAndClearPushToken,
} from '../services/notificationService';

import styles from './TeacherDashboardScreen.styles';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Awaiting', value: 'awaiting' },
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
  const value = String(issue?.priority || 'medium').toLowerCase();
  return PRIORITY_LABELS[value] ? value : 'medium';
};

const getStatus = (issue) => {
  const value = String(issue?.status || 'pending').toLowerCase();
  return STATUS_LABELS[value] ? value : 'pending';
};

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  return parts.length
    ? parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
    : 'T';
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

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

function StatCard({
  label,
  value,
  icon,
  tone,
  detail,
  onPress,
  active = false,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        active && {
          borderColor: '#0D806A',
          borderWidth: 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}: ${value}. View complaints.`}
    >
      <View style={styles.statCardTop}>
        <View
          style={[
            styles.statIcon,
            styles[`statIcon_${tone}`],
          ]}
        >
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

      <Text
        style={{
          color: '#0D806A',
          fontSize: 11,
          fontWeight: '800',
          marginTop: 10,
        }}
      >
        View complaints →
      </Text>
    </TouchableOpacity>
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
        const issuesPromise = apiRequest('/issues/teacher/workspace');

        const userPromise = getCurrentUser().catch((userError) => {
          console.warn(
            'Could not load teacher profile:',
            userError?.message
          );
          return null;
        });

        const [issuesResponse, userResponse] = await Promise.all([
          issuesPromise,
          userPromise,
        ]);

        // Accept the documented { issues: [...] } response.
        if (!Array.isArray(issuesResponse?.issues)) {
          throw new Error(
            'The server returned an unexpected complaints response.'
          );
        }

        setIssues(issuesResponse.issues);

        const backendUser =
          userResponse?.user ||
          userResponse?.currentUser ||
          (userResponse?._id ? userResponse : null);

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
    if (refreshing) return;

    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard, refreshing]);

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
        const status = getStatus(issue);

        const matchesStatus =
          activeFilter === 'all' ||
          (
            activeFilter === 'awaiting' &&
            ['pending', 'assigned'].includes(status)
          ) ||
          status === activeFilter;

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
          issue.priority,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const matchesSearch =
          !term || searchableText.includes(term);

        const matchesCritical =
          term !== 'critical' ||
          getPriority(issue) === 'critical';

        return matchesStatus && matchesSearch && matchesCritical;
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

  const countStatus = (status) => {
    if (status === 'awaiting') return counts.awaiting;
    return counts[status] || 0;
  };

  const selectFilter = (value) => {
    setActiveFilter(value);
    setSearch('');
  };

  // FIX: Both total-count controls use this function.
  const showAllIssues = () => {
    setActiveFilter('all');
    setSearch('');
  };

  const showCriticalIssues = () => {
    setActiveFilter('all');
    setSearch('critical');
  };

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
              await logoutAndClearPushToken(auth);

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
        key={issue._id || issue.complaintId}
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
              {issue.department
                ? `${issue.category || 'General'} · ${issue.department}`
                : issue.category || 'General'}
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
            Fetching department complaints and your assigned work.
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
            Could not load your workspace
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

      const emptyMessage = hasSearch
        ? 'Try another complaint ID, title, student, or location.'
        : activeFilter === 'all'
          ? 'There are no complaints in your department or assigned to you right now.'
          : activeFilter === 'awaiting'
            ? 'There are no pending or assigned complaints awaiting action.'
            : `No ${
                STATUS_LABELS[activeFilter]?.toLowerCase() || 'matching'
              } complaints found.`;

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
            {emptyMessage}
          </Text>

          {activeFilter !== 'all' || hasSearch ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={showAllIssues}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                Show all complaints
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    // IMPORTANT: render every matching complaint card.
    return filteredIssues.map(renderIssue);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#F5F7FC"
        barStyle="dark-content"
        translucent={false}
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
        {/* BRAND BAR */}
        <View style={styles.topBar}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>

            <View style={{ flexShrink: 1 }}>
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
              <TouchableOpacity
                style={styles.heroMetric}
                onPress={() => selectFilter('awaiting')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroMetricValue}>
                  {counts.awaiting}
                </Text>
                <Text style={styles.heroMetricLabel}>
                  Awaiting action
                </Text>
              </TouchableOpacity>

              <View style={styles.heroMetricDivider} />

              <TouchableOpacity
                style={styles.heroMetric}
                onPress={() => selectFilter('resolved')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroMetricValue}>
                  {counts.resolved}
                </Text>
                <Text style={styles.heroMetricLabel}>
                  Resolved
                </Text>
              </TouchableOpacity>
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
              {refreshing ? (
                <ActivityIndicator size="small" color="#0D806A" />
              ) : (
                <Text style={styles.refreshIcon}>↻</Text>
              )}
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
            active={activeFilter === 'all' && !search}
            onPress={showAllIssues}
          />

          <StatCard
            label="Awaiting action"
            value={counts.awaiting}
            icon="◷"
            tone="amber"
            detail="Pending or assigned"
            active={activeFilter === 'awaiting'}
            onPress={() => selectFilter('awaiting')}
          />

          <StatCard
            label="In progress"
            value={counts.in_progress}
            icon="↗"
            tone="blue"
            detail="Being addressed"
            active={activeFilter === 'in_progress'}
            onPress={() => selectFilter('in_progress')}
          />

          <StatCard
            label="Resolved"
            value={counts.resolved}
            icon="✓"
            tone="purple"
            detail="Successfully closed"
            active={activeFilter === 'resolved'}
            onPress={() => selectFilter('resolved')}
          />
        </View>

        {/* CRITICAL ALERT */}
        {!loading && !error && counts.critical > 0 ? (
          <TouchableOpacity
            style={styles.criticalAlert}
            activeOpacity={0.8}
            onPress={showCriticalIssues}
            accessibilityRole="button"
            accessibilityLabel="Show critical complaints"
          >
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
          </TouchableOpacity>
        ) : null}

        {/* COMPLAINTS */}
        <SectionHeading
          title="Department complaints"
          subtitle={
            activeFilter === 'all' && !search
              ? `${issues.length} department and assigned complaints`
              : `${filteredIssues.length} matching complaints`
          }
          right={
            // FIX: The count badge is now clickable.
            <TouchableOpacity
              style={styles.totalCountBadge}
              onPress={showAllIssues}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Show all department complaints. ${issues.length} total.`}
            >
              <Text style={styles.totalCountText}>
                {filteredIssues.length}
              </Text>
            </TouchableOpacity>
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
            accessibilityLabel="Search department complaints"
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

        {/* STATUS FILTERS */}
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
                onPress={() => selectFilter(filter.value)}
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
