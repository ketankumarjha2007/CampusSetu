
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
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
  const priority = issue?.priority || 'medium';

  return PRIORITY_LABELS[priority] ? priority : 'medium';
};

const getStatus = (issue) => {
  const status = issue?.status || 'pending';

  return STATUS_LABELS[status] ? status : 'pending';
};

const getErrorMessage = (error) => {
  if (error?.message) return error.message;
  return 'Unable to load your dashboard. Please try again.';
};

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return 'T';

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
};

export default function TeacherDashboardScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setError('');

    try {
      // Assigned complaints are required for the dashboard.
      // getCurrentUser() is optional because Firebase profile
      // details can still be used for the greeting.
      const issuesPromise = apiRequest('/issues/teacher/assigned');

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
        (userResponse && userResponse._id ? userResponse : null);

      setTeacher(backendUser);
    } catch (err) {
      console.error('Teacher dashboard error:', err);

      setError(getErrorMessage(err));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        setError('');

        try {
          const [issuesResponse, userResponse] = await Promise.all([
            apiRequest('/issues/teacher/assigned'),
            getCurrentUser().catch((err) => {
              console.warn('Teacher profile unavailable:', err.message);
              return null;
            }),
          ]);

          if (!active) return;

          if (!Array.isArray(issuesResponse?.issues)) {
            throw new Error(
              'The server returned an unexpected complaints response.'
            );
          }

          setIssues(issuesResponse.issues);

          const backendUser =
            userResponse?.user ||
            userResponse?.currentUser ||
            (userResponse && userResponse._id ? userResponse : null);

          setTeacher(backendUser);
        } catch (err) {
          if (active) {
            console.error('Teacher dashboard error:', err);
            setError(getErrorMessage(err));
          }
        } finally {
          if (active) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
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

      result[status] += 1;

      if (
        getPriority(issue) === 'critical' &&
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

  const openIssue = (issue) => {
    if (!issue?._id) {
      return;
    }

    navigation.navigate('OfficialIssueDetails', {
      issueId: issue._id,
    });
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
        activeOpacity={0.85}
        onPress={() => openIssue(issue)}
        accessibilityRole="button"
        accessibilityLabel={`Open complaint ${issue.complaintId || issue.title}`}
      >
        <View style={styles.issueTopRow}>
          <Text style={styles.complaintId} numberOfLines={1}>
            {issue.complaintId || 'Complaint'}
          </Text>

          <View
            style={[
              styles.priorityBadge,
              styles[`priority_${priority}`],
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                styles[`priorityText_${priority}`],
              ]}
            >
              {PRIORITY_LABELS[priority]}
            </Text>
          </View>
        </View>

        <Text style={styles.issueTitle} numberOfLines={2}>
          {issue.title || 'Untitled complaint'}
        </Text>

        <Text style={styles.issueDescription} numberOfLines={2}>
          {issue.description || 'No description provided.'}
        </Text>

        <View style={styles.issueMetaRow}>
          <Text style={styles.issueCategory} numberOfLines={1}>
            {issue.category || 'General'}
          </Text>

          <Text
            style={[
              styles.statusText,
              styles[`status_${status}`],
            ]}
          >
            {STATUS_LABELS[status]}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>⌖</Text>

          <Text style={styles.locationText} numberOfLines={2}>
            {location}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.reportedBy} numberOfLines={1}>
            {issue.reportedBy?.name
              ? `Reported by ${issue.reportedBy.name}`
              : 'Student complaint'}
          </Text>

          <Text style={styles.viewDetails}>
            View details →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#16845B" />

          <Text style={styles.stateTitle}>
            Loading dashboard
          </Text>

          <Text style={styles.stateDescription}>
            Fetching your assigned complaints...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateIcon}>!</Text>

          <Text style={styles.stateTitle}>
            Couldn't load dashboard
          </Text>

          <Text style={styles.stateDescription}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              setLoading(true);

              try {
                await fetchDashboard();
              } finally {
                setLoading(false);
              }
            }}
          >
            <Text style={styles.retryButtonText}>
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredIssues.length === 0) {
      const hasSearch = search.trim().length > 0;

      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>
              {hasSearch ? '⌕' : '✓'}
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            {hasSearch ? 'No matching complaints' : 'No complaints here'}
          </Text>

          <Text style={styles.emptyDescription}>
            {hasSearch
              ? 'Try another complaint ID, title, student or location.'
              : activeFilter === 'all'
                ? 'You currently have no assigned complaints.'
                : `No ${STATUS_LABELS[activeFilter]?.toLowerCase() || ''} complaints found.`}
          </Text>

          {hasSearch ? (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setSearch('')}
            >
              <Text style={styles.retryButtonText}>
                Clear search
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return filteredIssues.map(renderIssue);
  };

  const teacherName =
    teacher?.name?.trim() ||
    auth.currentUser?.displayName?.trim() ||
    auth.currentUser?.email?.split('@')[0] ||
    'Teacher';

  const teacherInitial = getInitials(teacherName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#F5F8F6"
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
            colors={['#16845B']}
            tintColor="#16845B"
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>
              CAMPUSSETU • FACULTY PORTAL
            </Text>

            <Text style={styles.greeting}>
              Hello, {teacherName.split(/\s+/)[0]}!
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's make your campus better.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {teacherInitial}
            </Text>
          </View>
        </View>

        {/* WELCOME CARD */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeCardContent}>
            <Text style={styles.welcomeLabel}>
              YOUR WORKSPACE
            </Text>

            <Text style={styles.welcomeTitle}>
              Every issue deserves a solution.
            </Text>

            <Text style={styles.welcomeDescription}>
              Review complaints, track progress, and keep students informed.
            </Text>
          </View>

          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeIconText}>✓</Text>
          </View>
        </View>

        {/* OVERVIEW */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Complaint overview
          </Text>

          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Text style={styles.refreshText}>
              Refresh ↻
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.statIconGreen,
              ]}
            >
              <Text style={styles.statIconText}>≡</Text>
            </View>

            <Text style={styles.statValue}>
              {counts.total}
            </Text>

            <Text style={styles.statLabel}>
              Assigned total
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.statIconOrange,
              ]}
            >
              <Text style={styles.statIconText}>◷</Text>
            </View>

            <Text style={styles.statValue}>
              {counts.awaiting}
            </Text>

            <Text style={styles.statLabel}>
              Awaiting action
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.statIconBlue,
              ]}
            >
              <Text style={styles.statIconText}>↻</Text>
            </View>

            <Text style={styles.statValue}>
              {countStatus('in_progress')}
            </Text>

            <Text style={styles.statLabel}>
              In progress
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                styles.statIconPurple,
              ]}
            >
              <Text style={styles.statIconText}>✓</Text>
            </View>

            <Text style={styles.statValue}>
              {countStatus('resolved')}
            </Text>

            <Text style={styles.statLabel}>
              Resolved
            </Text>
          </View>
        </View>

        {/* PRIORITY ALERT */}

        {counts.critical > 0 ? (
          <View
            style={{
              marginBottom: 20,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#F3B5B5',
              backgroundColor: '#FFF1F1',
            }}
          >
            <Text
              style={{
                color: '#A52828',
                fontWeight: '800',
                fontSize: 13,
              }}
            >
              ⚠ {counts.critical} critical complaint
              {counts.critical === 1 ? '' : 's'} need attention
            </Text>

            <Text
              style={{
                color: '#8C4242',
                fontSize: 12,
                marginTop: 5,
                lineHeight: 18,
              }}
            >
              Review the critical items in your assigned complaints.
            </Text>
          </View>
        ) : null}

        {/* COMPLAINTS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Assigned complaints
            </Text>

            <Text style={styles.sectionSubtitle}>
              Review and manage your workload
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {filteredIssues.length}
            </Text>
          </View>
        </View>

        {/* SEARCH */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 48,
            paddingHorizontal: 13,
            marginBottom: 13,
            borderWidth: 1,
            borderColor: '#DCE5DF',
            borderRadius: 13,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: '#16845B',
              marginRight: 9,
            }}
          >
            ⌕
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search ID, title, student or location..."
            placeholderTextColor="#8B9A91"
            style={{
              flex: 1,
              minWidth: 0,
              paddingVertical: 11,
              color: '#18352A',
              fontSize: 13,
            }}
            returnKeyType="search"
            accessibilityLabel="Search assigned complaints"
          />

          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text
                style={{
                  fontSize: 22,
                  color: '#718078',
                  paddingLeft: 8,
                }}
              >
                ×
              </Text>
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
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextActive,
                  ]}
                >
                  {filter.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* LIST / LOADING / ERROR */}

        <View style={styles.issueList}>
          {renderContent()}
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            CampusSetu
          </Text>

          <Text style={styles.footerText}>
            Bridging Students and Solutions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
