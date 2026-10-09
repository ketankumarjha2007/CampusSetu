
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import styles from './MyReportsScreen.styles';
import { apiRequest } from '../services/api';

const FILTERS = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#A16207',
    background: '#FEF3C7',
    dot: '#D97706',
  },
  assigned: {
    label: 'In Progress',
    color: '#1D4ED8',
    background: '#DBEAFE',
    dot: '#3B82F6',
  },
  in_progress: {
    label: 'In Progress',
    color: '#6D28D9',
    background: '#EDE9FE',
    dot: '#8B5CF6',
  },
  resolved: {
    label: 'Resolved',
    color: '#047857',
    background: '#D1FAE5',
    dot: '#10B981',
  },
  rejected: {
    label: 'Rejected',
    color: '#B91C1C',
    background: '#FEE2E2',
    dot: '#EF4444',
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: '#15803D',
    background: '#DCFCE7',
  },
  medium: {
    label: 'Medium',
    color: '#A16207',
    background: '#FEF3C7',
  },
  high: {
    label: 'High',
    color: '#C2410C',
    background: '#FFEDD5',
  },
  critical: {
    label: 'Critical',
    color: '#B91C1C',
    background: '#FEE2E2',
  },
};

const getDisplayStatus = (status) => {
  if (!status) return 'Unknown';

  return (
    STATUS_CONFIG[status]?.label ||
    String(status)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
};

const getDisplayPriority = (priority) => {
  const normalized = String(priority || 'medium').toLowerCase();

  return (
    PRIORITY_CONFIG[normalized]?.label ||
    normalized.charAt(0).toUpperCase() + normalized.slice(1)
  );
};

const formatDate = (dateValue) => {
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
};

const normalizeNavigationFilter = (filter) => {
  if (!filter) return 'All';

  const normalized = String(filter).trim().toLowerCase();

  switch (normalized) {
    case 'all':
      return 'All';
    case 'pending':
      return 'Pending';
    case 'in progress':
    case 'in_progress':
    case 'assigned':
      return 'In Progress';
    case 'resolved':
      return 'Resolved';
    case 'rejected':
      return 'Rejected';
    default:
      return 'All';
  }
};

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: getDisplayStatus(status),
      color: '#475569',
      background: '#F1F5F9',
      dot: '#94A3B8',
    }
  );
};

const getPriorityConfig = (priority) => {
  return (
    PRIORITY_CONFIG[String(priority || 'medium').toLowerCase()] || {
      label: getDisplayPriority(priority),
      color: '#475569',
      background: '#F1F5F9',
    }
  );
};

export default function MyReportsScreen({ navigation, route }) {
  const [reports, setReports] = useState([]);
  const [activeFilter, setActiveFilter] = useState(
    normalizeNavigationFilter(route?.params?.filter)
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setActiveFilter(
      normalizeNavigationFilter(route?.params?.filter)
    );
  }, [route?.params?.filter]);

  const fetchMyReports = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      setError('');

      const response = await apiRequest('/issues/my');

      setReports(
        Array.isArray(response?.issues) ? response.issues : []
      );
    } catch (requestError) {
      console.error(
        'My Reports: Fetch failed:',
        requestError.message
      );

      setError(
        requestError.message || 'Unable to load your reports.'
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyReports(true);
    }, [fetchMyReports])
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError('');

      const response = await apiRequest('/issues/my');

      setReports(
        Array.isArray(response?.issues) ? response.issues : []
      );
    } catch (requestError) {
      console.error(
        'My Reports: Refresh failed:',
        requestError.message
      );

      setError(
        requestError.message || 'Unable to refresh your reports.'
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const counts = useMemo(() => {
    return reports.reduce(
      (result, report) => {
        const status = getDisplayStatus(report.status);

        result.total += 1;

        if (status === 'Pending') result.pending += 1;
        if (status === 'In Progress') result.inProgress += 1;
        if (status === 'Resolved') result.resolved += 1;
        if (status === 'Rejected') result.rejected += 1;

        return result;
      },
      {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
      }
    );
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (activeFilter === 'All') return reports;

    return reports.filter(
      (report) => getDisplayStatus(report.status) === activeFilter
    );
  }, [reports, activeFilter]);

  const handleOpenReport = (report) => {
    if (!report?._id) return;

    navigation.navigate('IssueDetails', {
      issueId: report._id,
    });
  };

  const handleNewReport = () => {
    navigation.navigate('ReportIssue');
  };

  const renderSummaryMetric = (label, value, accent, icon) => (
    <View style={styles.metricCard} key={label}>
      <View
        style={[
          styles.metricIcon,
          { backgroundColor: accent.background },
        ]}
      >
        <Text
          style={[
            styles.metricIconText,
            { color: accent.color },
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );

  const renderReportCard = (report) => {
    const status = getStatusConfig(report.status);
    const priority = getPriorityConfig(report.priority);

    return (
      <TouchableOpacity
        key={report._id}
        style={styles.reportCard}
        activeOpacity={0.82}
        onPress={() => handleOpenReport(report)}
        accessibilityRole="button"
        accessibilityLabel={`Open complaint ${report.complaintId || report.title || ''}`}
      >
        <View style={styles.reportCardTop}>
          <View style={styles.categoryContainer}>
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryIconText}>▤</Text>
            </View>

            <Text style={styles.categoryText} numberOfLines={1}>
              {report.category || 'General'}
            </Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: priority.background },
            ]}
          >
            <View
              style={[
                styles.priorityDot,
                { backgroundColor: priority.color },
              ]}
            />
            <Text
              style={[
                styles.priorityText,
                { color: priority.color },
              ]}
            >
              {priority.label}
            </Text>
          </View>
        </View>

        <Text style={styles.reportTitle} numberOfLines={2}>
          {report.title || 'Untitled complaint'}
        </Text>

        <View style={styles.complaintIdBox}>
          <View style={styles.complaintIdTextContainer}>
            <Text style={styles.complaintIdLabel}>COMPLAINT ID</Text>
            <Text style={styles.complaintIdValue} numberOfLines={1}>
              {report.complaintId || 'Not available'}
            </Text>
          </View>

          <Text style={styles.complaintIdSymbol}>#</Text>
        </View>

        <Text style={styles.reportDescription} numberOfLines={3}>
          {report.description || 'No description provided.'}
        </Text>

        <View style={styles.reportMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⌖</Text>
            <Text style={styles.metaText} numberOfLines={2}>
              {report.location || 'Location unavailable'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>◷</Text>
            <Text style={styles.metaText}>
              {formatDate(report.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.reportFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.background },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: status.dot },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: status.color },
              ]}
            >
              {status.label}
            </Text>
          </View>

          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetails}>View details</Text>
            <Text style={styles.viewDetailsArrow}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    const isFiltered = activeFilter !== 'All';

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIllustration}>
          <Text style={styles.emptyIllustrationText}>
            {isFiltered ? '⌕' : '▤'}
          </Text>
        </View>

        <Text style={styles.emptyTitle}>
          {isFiltered
            ? `No ${activeFilter.toLowerCase()} reports`
            : 'Your reports start here'}
        </Text>

        <Text style={styles.emptySubtitle}>
          {isFiltered
            ? `You don't have any ${activeFilter.toLowerCase()} complaints right now. Try another filter to see your other reports.`
            : "You haven't submitted any complaints yet. Report a campus issue and follow its progress here."}
        </Text>

        {!isFiltered && (
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleNewReport}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyButtonText}>
              + Report an Issue
            </Text>
          </TouchableOpacity>
        )}

        {isFiltered && (
          <TouchableOpacity
            style={styles.emptySecondaryButton}
            onPress={() => setActiveFilter('All')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptySecondaryButtonText}>
              View All Reports
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F8F6"
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>
            <Text style={styles.brandName}>CampusSetu</Text>
          </View>

          <Text style={styles.headerTitle}>My Reports</Text>
          <Text style={styles.headerSubtitle}>
            Every report, one place to track.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={handleNewReport}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Create a new complaint"
        >
          <Text style={styles.headerActionText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#176B50"
            colors={['#176B50']}
          />
        }
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroDecorOne} />
          <View style={styles.heroDecorTwo} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>▤</Text>
            </View>

            <View style={styles.heroLiveBadge}>
              <View style={styles.heroLiveDot} />
              <Text style={styles.heroLiveText}>YOUR ACTIVITY</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Your voice matters.</Text>
          <Text style={styles.heroSubtitle}>
            Keep track of the campus issues you've reported and see
            their latest recorded progress.
          </Text>

          <View style={styles.heroBottomRow}>
            <View>
              <Text style={styles.heroCountLabel}>TOTAL REPORTS</Text>
              <Text style={styles.heroCount}>{counts.total}</Text>
            </View>

            <View style={styles.heroCountIcon}>
              <Text style={styles.heroCountIconText}>↗</Text>
            </View>
          </View>
        </View>

        {/* Summary metrics */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionSubtitle}>
              Your complaint status at a glance
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {renderSummaryMetric(
            'Pending',
            counts.pending,
            { color: '#A16207', background: '#FEF3C7' },
            '◷'
          )}

          {renderSummaryMetric(
            'In Progress',
            counts.inProgress,
            { color: '#1D4ED8', background: '#DBEAFE' },
            '↻'
          )}

          {renderSummaryMetric(
            'Resolved',
            counts.resolved,
            { color: '#047857', background: '#D1FAE5' },
            '✓'
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.filterSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Your complaints</Text>
              <Text style={styles.sectionSubtitle}>
                Select a status to filter your reports
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTERS.map((filter) => {
              const selected = activeFilter === filter;
              const count =
                filter === 'All'
                  ? counts.total
                  : filter === 'Pending'
                  ? counts.pending
                  : filter === 'In Progress'
                  ? counts.inProgress
                  : filter === 'Resolved'
                  ? counts.resolved
                  : counts.rejected;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(filter)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>

                  <View
                    style={[
                      styles.filterCount,
                      selected && styles.filterCountSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        selected && styles.filterCountTextSelected,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results header */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsTitleContainer}>
            <Text style={styles.resultsTitle}>
              {activeFilter === 'All'
                ? 'All reports'
                : `${activeFilter} reports`}
            </Text>

            <Text style={styles.resultsSubtitle}>
              {filteredReports.length}{' '}
              {filteredReports.length === 1 ? 'complaint' : 'complaints'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newReportButton}
            onPress={handleNewReport}
            activeOpacity={0.8}
          >
            <Text style={styles.newReportButtonText}>＋ New report</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#176B50" />
            <Text style={styles.stateTitle}>Loading your reports</Text>
            <Text style={styles.stateSubtitle}>
              Fetching your latest complaints...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error ? (
          <View style={styles.stateCard}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>

            <Text style={styles.stateTitle}>
              Couldn't load your reports
            </Text>

            <Text style={styles.stateSubtitle}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchMyReports(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Real report cards */}
        {!loading && !error && filteredReports.length > 0 && (
          <View style={styles.reportsList}>
            {filteredReports.map(renderReportCard)}
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && filteredReports.length === 0
          ? renderEmptyState()
          : null}

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerBrandRow}>
            <View style={styles.footerBrandMark}>
              <Text style={styles.footerBrandMarkText}>C</Text>
            </View>
            <Text style={styles.footerBrandName}>CampusSetu</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
