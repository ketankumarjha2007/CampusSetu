import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import { apiRequest } from '../services/api';
import styles from './StudentHomeScreen.styles';

export default function StudentHomeScreen({
  navigation,
}) {
  const [recentReports, setRecentReports] = useState([]);
  const [reportsLoading, setReportsLoading] =
    useState(true);
  const [reportsError, setReportsError] =
    useState('');

  const hour = new Date().getHours();

  let greeting = 'GOOD MORNING';

  if (hour >= 12 && hour < 17) {
    greeting = 'GOOD AFTERNOON';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'GOOD EVENING';
  } else if (hour >= 21 || hour < 5) {
    greeting = 'GOOD NIGHT';
  }

  const loadRecentReports = async () => {
    try {
      setReportsError('');

      const response = await apiRequest(
        '/issues/my'
      );

      if (
        response?.success &&
        Array.isArray(response?.issues)
      ) {
        const sortedReports = [
          ...response.issues,
        ].sort((a, b) => {
          const dateA = new Date(
            a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

        setRecentReports(
          sortedReports.slice(0, 3)
        );
      } else {
        throw new Error(
          response?.message ||
            'Unable to load recent activity'
        );
      }
    } catch (error) {
      console.error(
        'Recent activity loading error:',
        error
      );

      setReportsError(
        error.message ||
          'Unable to load recent activity.'
      );

      setRecentReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setReportsLoading(true);
      loadRecentReports();
    }, [])
  );

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Date unavailable';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';

      case 'assigned':
        return 'Assigned';

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

  const getStatusColors = (status) => {
    switch (status) {
      case 'resolved':
        return {
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
          textColor: '#15803D',
        };

      case 'in_progress':
      case 'assigned':
        return {
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          textColor: '#2563EB',
        };

      case 'rejected':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          textColor: '#DC2626',
        };

      case 'pending':
      default:
        return {
          backgroundColor: '#FFF7ED',
          borderColor: '#FED7AA',
          textColor: '#EA580C',
        };
    }
  };

  const renderRecentReport = (report) => {
    const statusColors =
      getStatusColors(report.status);

    return (
      <TouchableOpacity
        key={report._id}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate(
            'IssueDetails',
            {
              issueId: report._id,
            }
          )
        }
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          padding: 16,
          marginBottom: 12,
        }}
      >
        {/* TOP ROW */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flex: 1,
              paddingRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '900',
                color: '#111827',
                lineHeight: 21,
              }}
              numberOfLines={2}
            >
              {report.title ||
                'Untitled complaint'}
            </Text>

            <Text
              style={{
                marginTop: 5,
                fontSize: 11,
                fontWeight: '700',
                color: '#94A3B8',
              }}
              numberOfLines={1}
            >
              {report.category ||
                'General'}
              {'  •  '}
              {formatDate(
                report.createdAt
              )}
            </Text>
          </View>

          {/* STATUS */}

          <View
            style={{
              backgroundColor:
                statusColors.backgroundColor,
              borderWidth: 1,
              borderColor:
                statusColors.borderColor,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                color:
                  statusColors.textColor,
                fontSize: 10,
                fontWeight: '900',
              }}
            >
              {getStatusLabel(
                report.status
              )}
            </Text>
          </View>
        </View>

        {/* COMPLAINT ID */}

        <View
          style={{
            marginTop: 13,
            paddingTop: 11,
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: '900',
                letterSpacing: 0.8,
                color: '#94A3B8',
                textTransform: 'uppercase',
              }}
            >
              Complaint ID
            </Text>

            <Text
              style={{
                marginTop: 3,
                fontSize: 11,
                fontWeight: '800',
                color: '#2563EB',
                letterSpacing: 0.5,
              }}
            >
              {report.complaintId ||
                'Generating...'}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 20,
              color: '#94A3B8',
              fontWeight: '400',
            }}
          >
            →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greeting}
            </Text>

            <Text style={styles.title}>
              Hello, Ketan 👋
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.notificationButton
            }
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'Notifications'
              )
            }
          >
            <Text
              style={
                styles.notificationIcon
              }
            >
              🔔
            </Text>

            <View
              style={
                styles.notificationDot
              }
            />
          </TouchableOpacity>
        </View>

        {/* CAMPUS STATUS */}

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text
              style={styles.statusIconText}
            >
              ✓
            </Text>
          </View>

          <View
            style={styles.statusContent}
          >
            <Text style={styles.statusTitle}>
              Campus is running smoothly
            </Text>

            <Text
              style={
                styles.statusSubtitle
              }
            >
              No major campus alerts right now.
            </Text>
          </View>

          <View
            style={styles.statusIndicator}
          />
        </View>

        {/* REPORT ISSUE */}

        <TouchableOpacity
          style={styles.reportCard}
          activeOpacity={0.88}
          onPress={() =>
            navigation.navigate(
              'ReportIssue'
            )
          }
        >
          <View
            style={styles.reportContent}
          >
            <Text
              style={styles.reportEyebrow}
            >
              NEED HELP?
            </Text>

            <Text
              style={styles.reportTitle}
            >
              Report an Issue
            </Text>

            <Text
              style={styles.reportSubtitle}
            >
              Tell us what is wrong on campus
              and we'll help get it resolved.
            </Text>

            <View
              style={styles.reportButton}
            >
              <Text
                style={
                  styles.reportButtonText
                }
              >
                Report now
              </Text>

              <Text
                style={styles.reportArrow}
              >
                →
              </Text>
            </View>
          </View>

          <View
            style={styles.reportDecoration}
          >
            <Text
              style={
                styles.reportDecorationText
              }
            >
              +
            </Text>
          </View>
        </TouchableOpacity>

        {/* QUICK ACTIONS */}

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={styles.sectionTitle}
          >
            Quick actions
          </Text>

          <Text
            style={styles.sectionHint}
          >
            Get things done faster
          </Text>
        </View>

        <View style={styles.quickGrid}>

          {/* MY REPORTS */}

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'MyReports'
              )
            }
          >
            <View
              style={
                styles.quickIconBlue
              }
            >
              <Text
                style={styles.quickIconText}
              >
                ≡
              </Text>
            </View>

            <Text
              style={styles.quickTitle}
            >
              My Reports
            </Text>

            <Text
              style={styles.quickSubtitle}
            >
              View your complaints
            </Text>
          </TouchableOpacity>

          {/* TRACK COMPLAINT */}

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'TrackComplaint'
              )
            }
          >
            <View
              style={
                styles.quickIconBlue
              }
            >
              <Text
                style={styles.quickIconText}
              >
                🔍
              </Text>
            </View>

            <Text
              style={styles.quickTitle}
            >
              Track Complaint
            </Text>

            <Text
              style={styles.quickSubtitle}
            >
              Check complaint status
            </Text>
          </TouchableOpacity>

          {/* RESOLVED */}

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'MyReports'
              )
            }
          >
            <View
              style={
                styles.quickIconGreen
              }
            >
              <Text
                style={styles.quickIconText}
              >
                ✓
              </Text>
            </View>

            <Text
              style={styles.quickTitle}
            >
              Resolved
            </Text>

            <Text
              style={styles.quickSubtitle}
            >
              View completed issues
            </Text>
          </TouchableOpacity>

          {/* PENDING */}

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                'MyReports'
              )
            }
          >
            <View
              style={
                styles.quickIconOrange
              }
            >
              <Text
                style={styles.quickIconText}
              >
                !
              </Text>
            </View>

            <Text
              style={styles.quickTitle}
            >
              Pending
            </Text>

            <Text
              style={styles.quickSubtitle}
            >
              Issues being handled
            </Text>
          </TouchableOpacity>

          {/* HELP */}

          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Help')
            }
          >
            <View
              style={
                styles.quickIconPurple
              }
            >
              <Text
                style={styles.quickIconText}
              >
                ?
              </Text>
            </View>

            <Text
              style={styles.quickTitle}
            >
              Help
            </Text>

            <Text
              style={styles.quickSubtitle}
            >
              Campus support
            </Text>
          </TouchableOpacity>
        </View>

        {/* RECENT ACTIVITY */}

        <View
          style={
            styles.sectionHeaderRecent
          }
        >
          <View>
            <Text
              style={styles.sectionTitle}
            >
              Recent activity
            </Text>

            <Text
              style={styles.sectionHint}
            >
              Your latest campus reports
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'MyReports'
              )
            }
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        {/* RECENT ACTIVITY CONTENT */}

        {reportsLoading ? (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingVertical: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />

            <Text
              style={{
                marginTop: 10,
                fontSize: 12,
                fontWeight: '600',
                color: '#94A3B8',
              }}
            >
              Loading your reports...
            </Text>
          </View>
        ) : reportsError ? (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#FECACA',
              padding: 18,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '900',
                color: '#991B1B',
              }}
            >
              Couldn't load recent activity
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 12,
                lineHeight: 18,
                color: '#B91C1C',
              }}
            >
              {reportsError}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setReportsLoading(true);
                loadRecentReports();
              }}
              style={{
                marginTop: 13,
                alignSelf: 'flex-start',
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#FCA5A5',
                borderRadius: 10,
                paddingHorizontal: 13,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '900',
                  color: '#DC2626',
                }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : recentReports.length > 0 ? (
          <View>
            {recentReports.map(
              renderRecentReport
            )}
          </View>
        ) : (
          /* EMPTY STATE */

          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
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
              No reports yet
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Your reported campus issues will
              appear here.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
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
                Report your first issue
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>

        {/* HOME */}

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Text
            style={styles.navIconActive}
          >
            ⌂
          </Text>

          <Text
            style={styles.navLabelActive}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* REPORTS */}

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              'MyReports'
            )
          }
        >
          <Text style={styles.navIcon}>
            ≡
          </Text>

          <Text style={styles.navLabel}>
            Reports
          </Text>
        </TouchableOpacity>

        {/* ADD / REPORT */}

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              'ReportIssue'
            )
          }
        >
          <Text
            style={styles.addButtonText}
          >
            +
          </Text>
        </TouchableOpacity>

        {/* ALERTS */}

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              'Notifications'
            )
          }
        >
          <Text style={styles.navIcon}>
            🔔
          </Text>

          <Text style={styles.navLabel}>
            Alerts
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('Profile')
          }
        >
          <Text style={styles.navIcon}>
            ●
          </Text>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}