import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import styles from './MyReportsScreen.styles';

import { apiRequest } from '../services/api';

const FILTERS = [
  'All',
  'Pending',
  'In Progress',
  'Resolved',
];

const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Date unavailable';
  }

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

const getDisplayStatus = (status) => {
  switch (status) {
    case 'pending':
      return 'Pending';

    case 'assigned':
      return 'In Progress';

    case 'in_progress':
      return 'In Progress';

    case 'resolved':
      return 'Resolved';

    case 'rejected':
      return 'Rejected';

    default:
      return 'Pending';
  }
};

const getDisplayPriority = (priority) => {
  if (!priority) {
    return 'Medium';
  }

  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
};

export default function MyReportsScreen({
  navigation,
}) {
  const [reports, setReports] = useState([]);

  const [activeFilter, setActiveFilter] =
    useState('All');

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
   * Fetch real complaints from MongoDB.
   */
  const fetchMyReports = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError('');

        console.log(
          'My Reports: Fetching real issues...'
        );

        const response =
          await apiRequest('/issues/my');

        console.log(
          'My Reports: API response:',
          response
        );

        setReports(
          response.issues || []
        );
      } catch (requestError) {
        console.error(
          'My Reports: Fetch failed:',
          requestError.message
        );

        setError(
          requestError.message ||
            'Unable to load your reports.'
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  /*
   * Refresh whenever this screen
   * becomes active.
   */
  useFocusEffect(
    useCallback(() => {
      fetchMyReports(true);
    }, [fetchMyReports])
  );

  /*
   * Pull-to-refresh.
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');

      const response =
        await apiRequest('/issues/my');

      setReports(
        response.issues || []
      );
    } catch (requestError) {
      console.error(
        'My Reports: Refresh failed:',
        requestError.message
      );

      setError(
        requestError.message ||
          'Unable to refresh your reports.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  /*
   * Filter complaints by status.
   */
  const filteredReports = useMemo(() => {
    if (activeFilter === 'All') {
      return reports;
    }

    return reports.filter(
      (report) =>
        getDisplayStatus(
          report.status
        ) === activeFilter
    );
  }, [reports, activeFilter]);

  /*
   * Status badge styling.
   */
  const getStatusStyle = (status) => {
    if (status === 'Resolved') {
      return {
        badge: styles.statusResolved,
        text: styles.statusResolvedText,
      };
    }

    if (status === 'In Progress') {
      return {
        badge: styles.statusProgress,
        text: styles.statusProgressText,
      };
    }

    return {
      badge: styles.statusPending,
      text: styles.statusPendingText,
    };
  };

  /*
   * Priority badge styling.
   */
  const getPriorityStyle = (priority) => {
    if (priority === 'High') {
      return styles.priorityHigh;
    }

    if (priority === 'Medium') {
      return styles.priorityMedium;
    }

    return styles.priorityLow;
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ================= HEADER ================= */}

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

        <View style={styles.headerContent}>
          <Text style={styles.headerEyebrow}>
            CAMPUSSETU
          </Text>

          <Text style={styles.headerTitle}>
            My Reports
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>


      {/* ================= CONTENT ================= */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        {/* ================= SUMMARY ================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text
              style={styles.summaryNumber}
            >
              {reports.length}
            </Text>

            <View>
              <Text
                style={styles.summaryTitle}
              >
                Total reports
              </Text>

              <Text
                style={styles.summarySubtitle}
              >
                Issues you've submitted
              </Text>
            </View>
          </View>

          <View style={styles.summaryStatus}>
            <View
              style={styles.summaryDot}
            />

            <Text
              style={
                styles.summaryStatusText
              }
            >
              Campus team notified
            </Text>
          </View>
        </View>


        {/* ================= FILTERS ================= */}

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>
            FILTER BY STATUS
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterScroll
            }
          >
            {FILTERS.map((filter) => {
              const selected =
                activeFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selected &&
                      styles.filterChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setActiveFilter(filter)
                  }
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.filterTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>


        {/* ================= RESULTS HEADER ================= */}

        <View style={styles.resultsHeader}>
          <View>
            <Text
              style={styles.resultsTitle}
            >
              {activeFilter === 'All'
                ? 'All reports'
                : `${activeFilter} reports`}
            </Text>

            <Text
              style={
                styles.resultsSubtitle
              }
            >
              {filteredReports.length}{' '}
              {filteredReports.length === 1
                ? 'issue'
                : 'issues'}{' '}
              found
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.newReportButton
            }
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'ReportIssue'
              )
            }
          >
            <Text
              style={
                styles.newReportButtonText
              }
            >
              + New
            </Text>
          </TouchableOpacity>
        </View>


        {/* ================= LOADING ================= */}

        {loading && (
          <View style={styles.emptyState}>
            <ActivityIndicator
              size="large"
            />

            <Text
              style={styles.emptyTitle}
            >
              Loading your reports...
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Fetching your latest issues.
            </Text>
          </View>
        )}


        {/* ================= ERROR ================= */}

        {!loading && error ? (
          <View style={styles.emptyState}>
            <View
              style={styles.emptyIcon}
            >
              <Text
                style={styles.emptyIconText}
              >
                !
              </Text>
            </View>

            <Text
              style={styles.emptyTitle}
            >
              Couldn't load reports
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              {error}
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={() =>
                fetchMyReports(true)
              }
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}


        {/* ================= REAL REPORT CARDS ================= */}

        {!loading &&
          !error &&
          filteredReports.map((report) => {
            const displayStatus =
              getDisplayStatus(
                report.status
              );

            const displayPriority =
              getDisplayPriority(
                report.priority
              );

            const statusStyle =
              getStatusStyle(
                displayStatus
              );

            return (
              <TouchableOpacity
                key={report._id}
                style={
                  styles.reportCard
                }
                activeOpacity={0.85}
                onPress={() => {
                  console.log(
                    'Opening issue details:',
                    report._id
                  );

                  navigation.navigate(
                    'IssueDetails',
                    {
                      issueId:
                        report._id,
                    },
                  );
                }}
              >

                {/* ---------- TOP ---------- */}

                <View
                  style={styles.reportTop}
                >
                  <View
                    style={
                      styles.categoryBadge
                    }
                  >
                    <Text
                      style={
                        styles.categoryBadgeText
                      }
                    >
                      {report.category}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.priorityBadge,
                      getPriorityStyle(
                        displayPriority
                      ),
                    ]}
                  >
                    <Text
                      style={
                        styles.priorityText
                      }
                    >
                      {displayPriority}
                    </Text>
                  </View>
                </View>


                {/* ---------- TITLE ---------- */}

                <Text
                  style={
                    styles.reportTitle
                  }
                >
                  {report.title}
                </Text>


                {/* =================================================
                    COMPLAINT TRACKING ID
                    ================================================= */}

                <View
                  style={{
                    marginTop: 8,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      letterSpacing: 0.8,
                      opacity: 0.5,
                      textTransform:
                        'uppercase',
                      marginRight: 7,
                    }}
                  >
                    Complaint ID
                  </Text>

                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '800',
                      letterSpacing: 0.6,
                    }}
                  >
                    {report.complaintId ||
                      'Generating...'}
                  </Text>
                </View>


                {/* ---------- DESCRIPTION ---------- */}

                <Text
                  style={
                    styles.reportDescription
                  }
                  numberOfLines={2}
                >
                  {report.description}
                </Text>


                {/* ---------- META ---------- */}

                <View
                  style={styles.metaRow}
                >
                  <Text
                    style={styles.metaText}
                  >
                    📍 {report.location}
                  </Text>

                  <Text
                    style={styles.metaText}
                  >
                    {formatDate(
                      report.createdAt
                    )}
                  </Text>
                </View>


                {/* ---------- FOOTER ---------- */}

                <View
                  style={
                    styles.reportFooter
                  }
                >
                  <View
                    style={[
                      styles.statusBadge,
                      statusStyle.badge,
                    ]}
                  >
                    <View
                      style={styles.statusDot}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        statusStyle.text,
                      ]}
                    >
                      {displayStatus}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.viewDetails
                    }
                  >
                    View details →
                  </Text>
                </View>

              </TouchableOpacity>
            );
          })}


        {/* ================= EMPTY STATE ================= */}

        {!loading &&
          !error &&
          filteredReports.length === 0 && (
            <View
              style={styles.emptyState}
            >
              <View
                style={styles.emptyIcon}
              >
                <Text
                  style={
                    styles.emptyIconText
                  }
                >
                  ≡
                </Text>
              </View>

              <Text
                style={styles.emptyTitle}
              >
                No reports here
              </Text>

              <Text
                style={styles.emptySubtitle}
              >
                {reports.length === 0
                  ? "You haven't submitted any issues yet."
                  : `There are no ${activeFilter.toLowerCase()} reports right now.`}
              </Text>

              <TouchableOpacity
                style={
                  styles.emptyButton
                }
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate(
                    'ReportIssue'
                  )
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Report an Issue
                </Text>
              </TouchableOpacity>
            </View>
          )}


        <View
          style={styles.bottomSpace}
        />

      </ScrollView>
    </SafeAreaView>
  );
}