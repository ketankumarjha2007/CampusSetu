import React, {
  useEffect,
  useState,
} from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';

import styles from './IssueDetailsScreen.styles';

import { apiRequest } from '../services/api';


// ==========================================
// DISPLAY STATUS
// ==========================================

const getDisplayStatus = (status) => {
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
      return status || 'Unknown';
  }
};


// ==========================================
// FORMAT DATE
// ==========================================

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


// ==========================================
// FORMAT DATE + TIME
// ==========================================

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return 'Date unavailable';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return `${date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )} • ${date.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )}`;
};


// ==========================================
// PRIORITY STYLING
// ==========================================

const getPriorityStyle = (priority) => {
  switch (priority) {
    case 'high':
      return {
        background:
          styles.priorityHigh,
        text:
          styles.priorityHighText,
      };

    case 'critical':
      return {
        background:
          styles.priorityCritical,
        text:
          styles.priorityCriticalText,
      };

    case 'low':
      return {
        background:
          styles.priorityLow,
        text:
          styles.priorityLowText,
      };

    default:
      return {
        background:
          styles.priorityMedium,
        text:
          styles.priorityMediumText,
      };
  }
};


// ==========================================
// TIMELINE STYLING
// ==========================================

const getTimelineStyle = (status) => {
  switch (status) {
    case 'pending':
      return {
        dot:
          styles.timelineDotPending,
        line:
          styles.timelineLine,
        title:
          styles.timelineTitlePending,
      };

    case 'assigned':
      return {
        dot:
          styles.timelineDotAssigned,
        line:
          styles.timelineLine,
        title:
          styles.timelineTitleAssigned,
      };

    case 'in_progress':
      return {
        dot:
          styles.timelineDotProgress,
        line:
          styles.timelineLine,
        title:
          styles.timelineTitleProgress,
      };

    case 'resolved':
      return {
        dot:
          styles.timelineDotResolved,
        line:
          styles.timelineLine,
        title:
          styles.timelineTitleResolved,
      };

    case 'rejected':
      return {
        dot:
          styles.timelineDotRejected,
        line:
          styles.timelineLine,
        title:
          styles.timelineTitleRejected,
      };

    default:
      return {
        dot:
          styles.timelineDotPending,
        line:
          styles.timelineLine,
        title:
          styles.timelineTitlePending,
      };
  }
};


// ==========================================
// SCREEN
// ==========================================

export default function IssueDetailsScreen({
  navigation,
  route,
}) {
  const issueId =
    route?.params?.issueId;

  const [issue, setIssue] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [deleting, setDeleting] =
    useState(false);


  // ==========================================
  // FETCH ISSUE
  // ==========================================

  const fetchIssue = async (
    showLoader = true
  ) => {
    try {
      if (!issueId) {
        throw new Error(
          'Issue information is missing.'
        );
      }

      if (showLoader) {
        setLoading(true);
      }

      setError('');

      console.log(
        'Issue Details: Fetching issue:',
        issueId
      );

      const response =
        await apiRequest(
          `/issues/${issueId}`
        );

      console.log(
        'Issue Details: API response:',
        response
      );

      if (
        response?.success &&
        response?.issue
      ) {
        setIssue(
          response.issue
        );
      } else {
        throw new Error(
          response?.message ||
            'Unable to load this issue.'
        );
      }

    } catch (requestError) {
      console.error(
        'Issue Details: Fetch failed:',
        requestError.message
      );

      setError(
        requestError.message ||
          'Unable to load this issue.'
      );

    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };


  // ==========================================
  // LOAD ISSUE
  // ==========================================

  useEffect(() => {
    fetchIssue(true);
  }, [issueId]);


  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchIssue(false);

    } finally {
      setRefreshing(false);
    }
  };


  // ==========================================
  // DELETE ISSUE
  // ==========================================

  const handleDeleteIssue = () => {
    if (!issueId || !issue) {
      return;
    }

    if (issue.status !== 'pending') {
      Alert.alert(
        'Cannot Delete',
        'Only pending complaints can be deleted.'
      );

      return;
    }

    Alert.alert(
      'Delete Complaint?',
      `Are you sure you want to delete ${
        issue.complaintId ||
        'this complaint'
      }? This action cannot be undone.`,

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              setDeleting(true);

              console.log(
                'Issue Details: Deleting issue:',
                issueId
              );

              const response =
                await apiRequest(
                  `/issues/${issueId}`,
                  {
                    method: 'DELETE',
                  }
                );

              console.log(
                'Issue Details: Delete response:',
                response
              );

              if (!response?.success) {
                throw new Error(
                  response?.message ||
                    'Failed to delete complaint'
                );
              }

              Alert.alert(
                'Complaint Deleted',
                'Your complaint has been deleted successfully.',
                [
                  {
                    text: 'OK',

                    onPress: () => {
                      navigation.goBack();
                    },
                  },
                ]
              );

            } catch (deleteError) {
              console.error(
                'Delete complaint error:',
                deleteError
              );

              Alert.alert(
                'Delete Failed',
                deleteError.message ||
                  'Unable to delete this complaint. Please try again.'
              );

            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerState}
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text
            style={styles.centerTitle}
          >
            Loading issue...
          </Text>

          <Text
            style={
              styles.centerSubtitle
            }
          >
            Fetching the latest issue
            details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error || !issue) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.centerState}
        >
          <View
            style={styles.errorIcon}
          >
            <Text
              style={
                styles.errorIconText
              }
            >
              !
            </Text>
          </View>

          <Text
            style={styles.centerTitle}
          >
            Unable to load issue
          </Text>

          <Text
            style={
              styles.centerSubtitle
            }
          >
            {error ||
              'The requested issue could not be found.'}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            activeOpacity={0.8}
            onPress={() =>
              fetchIssue(true)
            }
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.backFromErrorButton
            }
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.backFromErrorText
              }
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  // ==========================================
  // DATA
  // ==========================================

  const priorityStyle =
    getPriorityStyle(
      issue.priority
    );

  const currentStatus =
    getDisplayStatus(
      issue.status
    );


  // ==========================================
  // HISTORY
  // ==========================================

  const history =
    Array.isArray(issue.history)
      ? [...issue.history].sort(
          (a, b) =>
            new Date(
              a.changedAt
            ).getTime() -
            new Date(
              b.changedAt
            ).getTime()
        )
      : [];


  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
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

        <View
          style={styles.headerContent}
        >
          <Text
            style={
              styles.headerEyebrow
            }
          >
            CAMPUSSETU
          </Text>

          <Text
            style={
              styles.headerTitle
            }
          >
            Issue Details
          </Text>
        </View>

        <View
          style={styles.headerSpacer}
        />
      </View>


      {/* ======================================
          CONTENT
      ====================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        {/* ====================================
            ISSUE HERO
        ==================================== */}

        <View
          style={styles.heroCard}
        >

          <View
            style={styles.heroTop}
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
                {issue.category}
              </Text>
            </View>

            <View
              style={[
                styles.priorityBadge,
                priorityStyle.background,
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  priorityStyle.text,
                ]}
              >
                {issue.priority
                  ? issue.priority
                      .charAt(0)
                      .toUpperCase() +
                    issue.priority.slice(
                      1
                    )
                  : 'Medium'}
              </Text>
            </View>

          </View>


          {/* ==================================
              COMPLAINT ID
          ================================== */}

          <View
            style={{
              marginTop: 16,
              marginBottom: 10,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor:
                'rgba(37, 99, 235, 0.08)',
              borderWidth: 1,
              borderColor:
                'rgba(37, 99, 235, 0.15)',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1,
                opacity: 0.55,
                marginBottom: 4,
              }}
            >
              COMPLAINT ID
            </Text>

            <Text
              style={{
                fontSize: 19,
                fontWeight: '800',
                letterSpacing: 0.8,
              }}
            >
              {issue.complaintId ||
                'Generating...'}
            </Text>
          </View>


          {/* ==================================
              TITLE
          ================================== */}

          <Text
            style={styles.issueTitle}
          >
            {issue.title}
          </Text>


          {/* ==================================
              CURRENT STATUS
          ================================== */}

          <View
            style={
              styles.currentStatusRow
            }
          >
            <View
              style={
                styles.currentStatusDot
              }
            />

            <Text
              style={
                styles.currentStatusLabel
              }
            >
              {currentStatus}
            </Text>
          </View>

        </View>


        {/* ====================================
            DESCRIPTION
        ==================================== */}

        <View
          style={styles.sectionCard}
        >
          <Text
            style={styles.sectionLabel}
          >
            DESCRIPTION
          </Text>

          <Text
            style={styles.description}
          >
            {issue.description}
          </Text>
        </View>


        {/* ====================================
            ISSUE INFORMATION
        ==================================== */}

        <View
          style={styles.sectionCard}
        >
          <Text
            style={styles.sectionLabel}
          >
            ISSUE INFORMATION
          </Text>


          {/* Complaint ID */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Complaint ID
            </Text>

            <Text
              style={
                styles.complaintIdInfoValue
              }
            >
              {issue.complaintId ||
                'Generating...'}
            </Text>
          </View>


          <View
            style={styles.infoDivider}
          />


          {/* Location */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Location
            </Text>

            <Text
              style={styles.infoValue}
            >
              {issue.location}
            </Text>
          </View>


          <View
            style={styles.infoDivider}
          />


          {/* Reported */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Reported
            </Text>

            <Text
              style={styles.infoValue}
            >
              {formatDate(
                issue.createdAt
              )}
            </Text>
          </View>


          <View
            style={styles.infoDivider}
          />


          {/* Last Updated */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Last updated
            </Text>

            <Text
              style={styles.infoValue}
            >
              {formatDate(
                issue.updatedAt
              )}
            </Text>
          </View>


          {/* Assigned Person */}

          {issue.assignedTo && (
            <>
              <View
                style={
                  styles.infoDivider
                }
              />

              <View
                style={styles.infoRow}
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Assigned to
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {issue.assignedTo.name ||
                    issue.assignedTo.email}
                </Text>
              </View>
            </>
          )}

        </View>


        {/* ====================================
            ATTACHED PHOTO
        ==================================== */}

        {issue.photoUrl ? (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              shadowColor: '#000000',
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >

            <Text
              style={{
                fontSize: 11,
                fontWeight: '900',
                letterSpacing: 1,
                color: '#64748B',
                marginBottom: 12,
              }}
            >
              ATTACHED PHOTO
            </Text>

            <Image
              source={{
                uri: issue.photoUrl,
              }}
              style={{
                width: '100%',
                height: 240,
                borderRadius: 14,
                backgroundColor:
                  '#F1F5F9',
              }}
              resizeMode="cover"
            />

            <Text
              style={{
                marginTop: 10,
                fontSize: 11,
                color: '#64748B',
                lineHeight: 16,
              }}
            >
              Photo submitted with this
              complaint.
            </Text>

          </View>
        ) : null}


        {/* ====================================
            RESOLUTION
        ==================================== */}

        {issue.resolutionNote ? (
          <View
            style={
              styles.resolutionCard
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              RESOLUTION
            </Text>

            <Text
              style={
                styles.resolutionText
              }
            >
              {issue.resolutionNote}
            </Text>

            {issue.resolvedAt && (
              <Text
                style={
                  styles.resolutionDate
                }
              >
                Resolved on{' '}
                {formatDate(
                  issue.resolvedAt
                )}
              </Text>
            )}
          </View>
        ) : null}


        {/* ====================================
            STATUS TIMELINE
        ==================================== */}

        <View
          style={styles.timelineCard}
        >
          <Text
            style={styles.sectionLabel}
          >
            STATUS TIMELINE
          </Text>

          {history.length === 0 ? (
            <View
              style={styles.noHistory}
            >
              <Text
                style={
                  styles.noHistoryText
                }
              >
                No status history
                available.
              </Text>
            </View>
          ) : (
            history.map(
              (entry, index) => {
                const timelineStyle =
                  getTimelineStyle(
                    entry.status
                  );

                const isLast =
                  index ===
                  history.length - 1;

                return (
                  <View
                    key={
                      entry._id ||
                      `${entry.status}-${index}`
                    }
                    style={
                      styles.timelineItem
                    }
                  >

                    <View
                      style={
                        styles.timelineLeft
                      }
                    >
                      <View
                        style={
                          timelineStyle.dot
                        }
                      />

                      {!isLast && (
                        <View
                          style={
                            timelineStyle.line
                          }
                        />
                      )}
                    </View>


                    <View
                      style={
                        styles.timelineContent
                      }
                    >
                      <Text
                        style={[
                          styles.timelineTitle,
                          timelineStyle.title,
                        ]}
                      >
                        {getDisplayStatus(
                          entry.status
                        )}
                      </Text>

                      {entry.note ? (
                        <Text
                          style={
                            styles.timelineNote
                          }
                        >
                          {entry.note}
                        </Text>
                      ) : null}

                      <Text
                        style={
                          styles.timelineDate
                        }
                      >
                        {formatDateTime(
                          entry.changedAt
                        )}
                      </Text>
                    </View>

                  </View>
                );
              }
            )
          )}
        </View>


        {/* ====================================
            DELETE COMPLAINT
        ==================================== */}

        {issue.status === 'pending' && (
          <View
            style={{
              marginTop: 18,
              marginBottom: 10,
              padding: 16,
              borderRadius: 18,
              backgroundColor:
                '#FEF2F2',
              borderWidth: 1,
              borderColor:
                '#FECACA',
            }}
          >

            <Text
              style={{
                fontSize: 12,
                fontWeight: '900',
                color: '#991B1B',
                marginBottom: 5,
              }}
            >
              Need to remove this
              complaint?
            </Text>

            <Text
              style={{
                fontSize: 11,
                lineHeight: 17,
                color: '#B91C1C',
                marginBottom: 14,
              }}
            >
              Pending complaints can be
              deleted. Once an official
              starts processing the
              complaint, it can no longer
              be deleted.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={deleting}
              onPress={
                handleDeleteIssue
              }
              style={{
                height: 50,
                borderRadius: 14,
                backgroundColor:
                  deleting
                    ? '#FCA5A5'
                    : '#DC2626',
                alignItems: 'center',
                justifyContent:
                  'center',
                flexDirection: 'row',
              }}
            >

              {deleting ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={{
                      marginLeft: 9,
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: '900',
                    }}
                  >
                    Deleting...
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 18,
                      fontWeight: '900',
                      marginRight: 8,
                    }}
                  >
                    🗑
                  </Text>

                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: '900',
                      letterSpacing: 0.2,
                    }}
                  >
                    Delete Complaint
                  </Text>
                </>
              )}

            </TouchableOpacity>

          </View>
        )}


        {/* ====================================
            BOTTOM SPACE
        ==================================== */}

        <View
          style={styles.bottomSpace}
        />

      </ScrollView>

    </SafeAreaView>
  );
}