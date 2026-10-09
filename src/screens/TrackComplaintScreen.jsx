
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiRequest } from '../services/api';
import styles from './TrackComplaintScreen.styles';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#A16207',
    background: '#FEF3C7',
    description: 'Your complaint has been received and is waiting for review.',
    symbol: '◷',
  },
  assigned: {
    label: 'Assigned',
    color: '#1D4ED8',
    background: '#DBEAFE',
    description: 'Your complaint has been assigned to the responsible team.',
    symbol: '↗',
  },
  in_progress: {
    label: 'In Progress',
    color: '#6D28D9',
    background: '#EDE9FE',
    description: 'The responsible team is working on your complaint.',
    symbol: '↻',
  },
  resolved: {
    label: 'Resolved',
    color: '#047857',
    background: '#D1FAE5',
    description: 'Your complaint has been resolved.',
    symbol: '✓',
  },
  rejected: {
    label: 'Rejected',
    color: '#B91C1C',
    background: '#FEE2E2',
    description: 'Your complaint was rejected. Review the details below.',
    symbol: '!',
  },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#15803D', background: '#DCFCE7' },
  medium: { label: 'Medium', color: '#A16207', background: '#FEF3C7' },
  high: { label: 'High', color: '#C2410C', background: '#FFEDD5' },
  critical: { label: 'Critical', color: '#B91C1C', background: '#FEE2E2' },
};

const getDisplayStatus = (status) => {
  if (!status) return 'Unknown';

  return (
    STATUS_CONFIG[status]?.label ||
    status.replace(/_/g, ' ').replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
  );
};

const formatDate = (date) => {
  if (!date) return 'Not available';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Not available';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (date) => {
  if (!date) return 'Not available';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Not available';

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getLocationDetails = (issue) => {
  const details = [];

  if (issue?.building) {
    details.push({ label: 'Building / Block', value: String(issue.building) });
  }

  if (
    issue?.floor !== undefined &&
    issue?.floor !== null &&
    String(issue.floor).trim() !== ''
  ) {
    details.push({ label: 'Floor', value: String(issue.floor) });
  }

  if (issue?.roomNumber) {
    details.push({ label: 'Room Number', value: String(issue.roomNumber) });
  }

  const location = issue?.location?.trim();

  if (location && details.length === 0) {
    details.push({ label: 'Full Location', value: location });
  } else if (location && details.length > 0) {
    const normalizedLocation = location.toLowerCase();
    const parts = details.map((item) => item.value.toLowerCase());

    // If location is just the combined structured address, don't duplicate it.
    const alreadyRepresented = parts.every((part) =>
      normalizedLocation.includes(part)
    );

    if (!alreadyRepresented) {
      details.push({ label: 'Additional Location', value: location });
    }
  }

  return details;
};

export default function TrackComplaintScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 380;

  const [complaintId, setComplaintId] = useState('');
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrackComplaint = async () => {
    const trimmedId = complaintId.trim().toUpperCase();

    if (!trimmedId) {
      Alert.alert(
        'Complaint ID Required',
        'Please enter the complaint ID you received after submitting your complaint.'
      );
      return;
    }

    try {
      setLoading(true);
      setIssue(null);

      const response = await apiRequest(
        `/issues/track/${encodeURIComponent(trimmedId)}`
      );

      if (!response?.issue) {
        throw new Error('No complaint details were returned.');
      }

      setIssue(response.issue);
    } catch (error) {
      console.error('Track complaint error:', error.message);

      Alert.alert(
        'Unable to Track Complaint',
        error.message ||
          'We could not find this complaint. Check the ID and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setComplaintId('');
    setIssue(null);
  };

  const renderInfoRow = (label, value, last = false) => (
    <View
      key={label}
      style={[styles.infoRow, last && styles.infoRowLast]}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not available'}</Text>
    </View>
  );

  const renderTimeline = () => {
    const history = Array.isArray(issue?.history)
      ? [...issue.history]
      : [];

    history.sort((a, b) => {
      const first = new Date(a.changedAt || 0).getTime();
      const second = new Date(b.changedAt || 0).getTime();

      return (
        (Number.isNaN(first) ? 0 : first) -
        (Number.isNaN(second) ? 0 : second)
      );
    });

    if (history.length === 0) {
      return (
        <View style={styles.emptyTimeline}>
          <View style={styles.emptyTimelineIcon}>
            <Text style={styles.emptyTimelineSymbol}>◷</Text>
          </View>
          <Text style={styles.emptyTimelineTitle}>No updates yet</Text>
          <Text style={styles.emptyTimelineText}>
            Status updates will appear here as your complaint progresses.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timeline}>
        {history.map((item, index) => {
          const isLast = index === history.length - 1;

          return (
            <View
              key={`${item.changedAt || 'event'}-${index}`}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    isLast && styles.timelineDotActive,
                    item.status === 'resolved' && styles.timelineDotResolved,
                  ]}
                />
                {!isLast && <View style={styles.timelineLine} />}
              </View>

              <View
                style={[
                  styles.timelineContent,
                  isLast && styles.timelineContentLast,
                ]}
              >
                <View style={styles.timelineHeading}>
                  <Text style={styles.timelineStatus}>
                    {getDisplayStatus(item.status)}
                  </Text>

                  {isLast && (
                    <View style={styles.latestBadge}>
                      <Text style={styles.latestBadgeText}>LATEST</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.timelineDate}>
                  {formatDateTime(item.changedAt)}
                </Text>

                {item.note ? (
                  <Text style={styles.timelineNote}>{item.note}</Text>
                ) : null}

                {item.changedBy?.name ? (
                  <Text style={styles.timelineChangedBy}>
                    Updated by {item.changedBy.name}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const statusConfig = STATUS_CONFIG[issue?.status] || {
    label: getDisplayStatus(issue?.status),
    color: '#475569',
    background: '#F1F5F9',
    description: 'Check the timeline below for recorded updates.',
    symbol: '•',
  };

  const priorityConfig =
    PRIORITY_CONFIG[String(issue?.priority || '').toLowerCase()] || {
      label: issue?.priority
        ? String(issue.priority).charAt(0).toUpperCase() +
          String(issue.priority).slice(1)
        : 'Not available',
      color: '#475569',
      background: '#F1F5F9',
    };

  const locationDetails = getLocationDetails(issue);

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

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            compact && styles.containerCompact,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Premium header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkText}>C</Text>
                </View>
                <Text style={styles.brandName}>CampusSetu</Text>
              </View>

              <Text style={styles.headerTitle}>Track Complaint</Text>
              <Text style={styles.headerSubtitle}>
                Your campus. Your voice. Your updates.
              </Text>
            </View>
          </View>

          {/* Intro banner */}
          <View style={styles.introCard}>
            <View style={styles.introDecorCircle} />

            <View style={styles.introIcon}>
              <Text style={styles.introIconText}>✓</Text>
            </View>

            <View style={styles.introTextContainer}>
              <Text style={styles.introEyebrow}>STAY INFORMED</Text>
              <Text style={styles.introTitle}>Progress you can follow.</Text>
              <Text style={styles.introDescription}>
                Find your complaint and see its latest status, assignment
                and recorded updates.
              </Text>
            </View>
          </View>

          {/* Search card */}
          <View style={styles.searchCard}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>01</Text>
              </View>

              <View style={styles.searchHeadingText}>
                <Text style={styles.searchTitle}>Find your complaint</Text>
                <Text style={styles.searchSubtitle}>
                  Enter the reference ID generated for your report.
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>COMPLAINT REFERENCE ID</Text>

            <TextInput
              value={complaintId}
              onChangeText={setComplaintId}
              placeholder="CS-2026-000001"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              autoCorrect={false}
              spellCheck={false}
              style={styles.input}
              onSubmitEditing={handleTrackComplaint}
              returnKeyType="search"
              editable={!loading}
              maxLength={60}
              accessibilityLabel="Complaint reference ID"
            />

            <TouchableOpacity
              style={[
                styles.trackButton,
                loading && styles.trackButtonDisabled,
              ]}
              onPress={handleTrackComplaint}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.trackButtonText}>Searching...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.trackButtonText}>
                    Track Complaint
                  </Text>
                  <Text style={styles.trackButtonArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyIcon}>ⓘ</Text>
              <Text style={styles.privacyText}>
                Double-check your reference ID before searching.
              </Text>
            </View>
          </View>

          {/* Complaint results */}
          {issue && (
            <View style={styles.resultsContainer}>
              {/* Status overview */}
              <View style={styles.statusOverviewCard}>
                <View style={styles.statusTopRow}>
                  <View
                    style={[
                      styles.statusIconContainer,
                      { backgroundColor: statusConfig.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusIcon,
                        { color: statusConfig.color },
                      ]}
                    >
                      {statusConfig.symbol}
                    </Text>
                  </View>

                  <View style={styles.statusOverviewText}>
                    <Text style={styles.statusOverline}>CURRENT STATUS</Text>
                    <Text style={styles.statusOverviewTitle}>
                      {statusConfig.label}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusConfig.color },
                      ]}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.statusDescription}>
                  {statusConfig.description}
                </Text>

                <View style={styles.statusDivider} />

                <View style={styles.complaintIdResultRow}>
                  <View style={styles.complaintIdResultText}>
                    <Text style={styles.resultSmallLabel}>
                      COMPLAINT REFERENCE
                    </Text>
                    <Text style={styles.complaintId}>
                      {issue.complaintId || 'Not available'}
                    </Text>
                  </View>

                  <View style={styles.referenceIcon}>
                    <Text style={styles.referenceIconText}>#</Text>
                  </View>
                </View>
              </View>

              {/* Overview */}
              <View style={styles.resultCard}>
                <View style={styles.cardHeading}>
                  <View style={styles.cardHeadingAccent} />
                  <Text style={styles.sectionTitle}>
                    Complaint Overview
                  </Text>
                </View>

                <Text style={styles.issueTitle}>
                  {issue.title || 'Untitled complaint'}
                </Text>

                <Text style={styles.issueDescription}>
                  {issue.description || 'No description provided.'}
                </Text>

                <View style={styles.tagRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>
                      {issue.category || 'Uncategorized'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.priorityTag,
                      { backgroundColor: priorityConfig.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityConfig.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityTagText,
                        { color: priorityConfig.color },
                      ]}
                    >
                      {priorityConfig.label} priority
                    </Text>
                  </View>
                </View>
              </View>

              {/* Structured location */}
              <View style={styles.infoCard}>
                <View style={styles.cardHeading}>
                  <View style={styles.cardHeadingAccent} />
                  <Text style={styles.sectionTitle}>Location Details</Text>
                </View>

                {locationDetails.length > 0 ? (
                  <View style={styles.locationGrid}>
                    {locationDetails.map((item) => (
                      <View key={item.label} style={styles.locationItem}>
                        <Text style={styles.locationItemLabel}>
                          {item.label.toUpperCase()}
                        </Text>
                        <Text style={styles.locationItemValue}>
                          {item.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noLocationText}>
                    Location details are not available for this complaint.
                  </Text>
                )}
              </View>

              {/* Report information */}
              <View style={styles.infoCard}>
                <View style={styles.cardHeading}>
                  <View style={styles.cardHeadingAccent} />
                  <Text style={styles.sectionTitle}>Report Information</Text>
                </View>

                {renderInfoRow('Category', issue.category)}

                {renderInfoRow('Reported On', formatDate(issue.createdAt))}

                {renderInfoRow(
                  'Last Updated',
                  formatDateTime(
                    issue.updatedAt ||
                      (Array.isArray(issue.history) &&
                      issue.history.length > 0
                        ? issue.history[issue.history.length - 1]?.changedAt
                        : null)
                  )
                )}

                {renderInfoRow(
                  'Assigned To',
                  issue.assignedTo?.name || 'Not assigned yet',
                  true
                )}
              </View>

              {/* Resolution */}
              {issue.status === 'resolved' && (
                <View style={styles.resolutionCard}>
                  <View style={styles.resolutionHeadingRow}>
                    <View style={styles.resolutionIcon}>
                      <Text style={styles.resolutionIconText}>✓</Text>
                    </View>

                    <View style={styles.resolutionHeadingText}>
                      <Text style={styles.resolutionTitle}>
                        Issue Resolved
                      </Text>
                      <Text style={styles.resolutionSubtitle}>
                        Resolution information
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.resolutionNote}>
                    {issue.resolutionNote ||
                      'The complaint has been marked as resolved.'}
                  </Text>

                  {issue.resolvedAt ? (
                    <Text style={styles.resolvedDate}>
                      Resolved on {formatDateTime(issue.resolvedAt)}
                    </Text>
                  ) : null}
                </View>
              )}

              {issue.status === 'rejected' && issue.resolutionNote ? (
                <View style={styles.rejectionCard}>
                  <Text style={styles.rejectionTitle}>
                    Rejection Details
                  </Text>
                  <Text style={styles.rejectionNote}>
                    {issue.resolutionNote}
                  </Text>
                </View>
              ) : null}

              {/* History timeline */}
              <View style={styles.timelineCard}>
                <View style={styles.timelineHeader}>
                  <View style={styles.cardHeading}>
                    <View style={styles.cardHeadingAccent} />
                    <Text style={styles.sectionTitle}>
                      Progress Timeline
                    </Text>
                  </View>

                  <View style={styles.historyCountBadge}>
                    <Text style={styles.historyCountText}>
                      {Array.isArray(issue.history) ? issue.history.length : 0}
                    </Text>
                  </View>
                </View>

                <Text style={styles.timelineSubtitle}>
                  Follow the recorded updates to your complaint.
                </Text>

                {renderTimeline()}
              </View>

              {/* Reset search */}
              <TouchableOpacity
                style={styles.trackAnotherButton}
                onPress={handleReset}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.trackAnotherIcon}>↻</Text>
                <Text style={styles.trackAnotherText}>
                  Track Another Complaint
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerText}>
                CampusSetu · Bridging Students and Solutions.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
