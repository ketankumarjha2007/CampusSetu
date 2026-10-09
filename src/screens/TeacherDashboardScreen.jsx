import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { apiRequest } from '../services/api';

import styles from './TeacherDashboardScreen.styles';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
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

export default function TeacherDashboardScreen({
  navigation,
}) {
  const [issues, setIssues] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setError('');

      /*
       * These endpoints will be added to the backend
       * in the next step.
       */
      const [issuesResponse, userResponse] =
        await Promise.all([
          apiRequest('/issues/teacher/assigned'),
          apiRequest('/users/me'),
        ]);

      setIssues(
        Array.isArray(issuesResponse.issues)
          ? issuesResponse.issues
          : []
      );

      setTeacher(
        userResponse.user ||
          userResponse.currentUser ||
          userResponse
      );
    } catch (err) {
      console.error(
        'Teacher dashboard error:',
        err.message
      );

      setError(
        err.message ||
          'Unable to load your dashboard.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDashboard();
    }, [fetchDashboard])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const filteredIssues =
    activeFilter === 'all'
      ? issues
      : issues.filter(
          (issue) => issue.status === activeFilter
        );

  const countStatus = (status) =>
    issues.filter(
      (issue) => issue.status === status
    ).length;

  const openIssue = (issue) => {
    navigation.navigate('OfficialIssueDetails', {
      issueId: issue._id,
    });
  };

  const renderIssue = (issue) => {
    const priority =
      issue.priority || 'medium';

    const status =
      issue.status || 'pending';

    return (
      <TouchableOpacity
        key={issue._id}
        style={styles.issueCard}
        activeOpacity={0.85}
        onPress={() => openIssue(issue)}
      >
        <View style={styles.issueTopRow}>
          <Text style={styles.complaintId}>
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
              {PRIORITY_LABELS[priority] ||
                'Medium'}
            </Text>
          </View>
        </View>

        <Text
          style={styles.issueTitle}
          numberOfLines={2}
        >
          {issue.title}
        </Text>

        <Text
          style={styles.issueDescription}
          numberOfLines={2}
        >
          {issue.description}
        </Text>

        <View style={styles.issueMetaRow}>
          <Text
            style={styles.issueCategory}
            numberOfLines={1}
          >
            {issue.category || 'General'}
          </Text>

          <Text
            style={[
              styles.statusText,
              styles[`status_${status}`],
            ]}
          >
            {STATUS_LABELS[status] || status}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>⌖</Text>

          <Text
            style={styles.locationText}
            numberOfLines={2}
          >
            {[
              issue.building,
              issue.floor
                ? `Floor ${issue.floor}`
                : '',
              issue.roomNumber
                ? `Room ${issue.roomNumber}`
                : '',
            ]
              .filter(Boolean)
              .join(', ') ||
              issue.location ||
              'Location not specified'}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.reportedBy}>
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
          <ActivityIndicator
            size="large"
            color="#16845B"
          />

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
            onPress={() => {
              setLoading(true);
              fetchDashboard();
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
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No complaints here
          </Text>

          <Text style={styles.emptyDescription}>
            {activeFilter === 'all'
              ? 'You currently have no assigned complaints.'
              : `No ${STATUS_LABELS[activeFilter]?.toLowerCase() || ''} complaints found.`}
          </Text>
        </View>
      );
    }

    return filteredIssues.map(renderIssue);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar
        backgroundColor="#F5F8F6"
        barStyle="dark-content"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16845B']}
            tintColor="#16845B"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>
              CAMPUSSETU • OFFICIAL PORTAL
            </Text>

            <Text style={styles.greeting}>
              Hello,{' '}
              {teacher?.name?.trim()
                ? teacher.name.trim().split(' ')[0]
                : 'Teacher'}
              !
            </Text>

            <Text style={styles.headerSubtitle}>
              Let's make your campus better.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {teacher?.name?.trim()?.charAt(0)?.toUpperCase() ||
                'T'}
            </Text>
          </View>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeCardContent}>
            <Text style={styles.welcomeLabel}>
              YOUR WORKSPACE
            </Text>

            <Text style={styles.welcomeTitle}>
              Every issue deserves a solution.
            </Text>

            <Text style={styles.welcomeDescription}>
              Review complaints, track progress, and
              keep students informed.
            </Text>
          </View>

          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeIconText}>
              ✓
            </Text>
          </View>
        </View>

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
              <Text style={styles.statIconText}>
                ≡
              </Text>
            </View>

            <Text style={styles.statValue}>
              {issues.length}
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
              <Text style={styles.statIconText}>
                ◷
              </Text>
            </View>

            <Text style={styles.statValue}>
              {countStatus('pending') +
                countStatus('assigned')}
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
              <Text style={styles.statIconText}>
                ↻
              </Text>
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
              <Text style={styles.statIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.statValue}>
              {countStatus('resolved')}
            </Text>

            <Text style={styles.statLabel}>
              Resolved
            </Text>
          </View>
        </View>

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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => {
            const selected =
              activeFilter === filter.value;

            return (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  selected &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setActiveFilter(filter.value)
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    selected &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.issueList}>
          {renderContent()}
        </View>

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