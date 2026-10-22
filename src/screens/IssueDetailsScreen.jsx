import React, { useCallback, useEffect, useState } from 'react';

import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
  Keyboard,
  StatusBar,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import styles from './IssueDetailsScreen.styles';
import { apiRequest } from '../services/api';

const COLORS = {
  green: '#176B4D',
  darkGreen: '#104B38',
  background: '#F5F7F2',
  text: '#172820',
  muted: '#77847B',
  border: '#E5EAE3',
  white: '#FFFFFF',
};

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    description: 'Your complaint is waiting for review.',
    color: '#B7791F',
    background: '#FFF4D9',
    icon: '◷',
  },
  assigned: {
    label: 'Assigned',
    description: 'An official has been assigned to your complaint.',
    color: '#3567C8',
    background: '#EAF1FF',
    icon: '↗',
  },
  in_progress: {
    label: 'In Progress',
    description: 'Your complaint is currently being addressed.',
    color: '#8B5BC7',
    background: '#F2EAFE',
    icon: '↻',
  },
  resolved: {
    label: 'Resolved',
    description: 'Your complaint has been marked as resolved.',
    color: '#16815D',
    background: '#E0F5EA',
    icon: '✓',
  },
  rejected: {
    label: 'Rejected',
    description: 'Your complaint was not approved for processing.',
    color: '#C24141',
    background: '#FDE8E7',
    icon: '!',
  },
};

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: '#28764E',
    background: '#E4F5E9',
  },
  medium: {
    label: 'Medium',
    color: '#946317',
    background: '#FFF1D3',
  },
  high: {
    label: 'High',
    color: '#BD5A25',
    background: '#FCE8DC',
  },
  critical: {
    label: 'Critical',
    color: '#BD3434',
    background: '#FDE5E5',
  },
};

const getStatus = (status) => {
  if (STATUS_CONFIG[status]) {
    return STATUS_CONFIG[status];
  }

  return {
    label: status
      ? status
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : 'Unknown',
    description: 'The current status is available below.',
    color: '#66736A',
    background: '#EDF0EC',
    icon: '•',
  };
};

const getPriority = (priority) => {
  return (
    PRIORITY_CONFIG[String(priority || '').toLowerCase()] ||
    PRIORITY_CONFIG.medium
  );
};

const formatDateTime = (value) => {
  if (!value) return 'Date not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return `${date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} · ${date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const InfoRow = ({ icon, label, value, last = false }) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return null;
  }

  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <View style={styles.infoIconBox}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{String(value)}</Text>
      </View>
    </View>
  );
};

const SectionHeading = ({ eyebrow, title, right }) => (
  <View style={styles.sectionHeading}>
    <View style={styles.sectionHeadingText}>
      {eyebrow ? (
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>{title}</Text>
    </View>

    {right || null}
  </View>
);

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

export default function IssueDetailsScreen({ navigation, route }) {
  const issueId = route?.params?.issueId;

  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Reopen dialog (works on both iOS and Android)
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Full-screen viewer for the proof photo.
  const [previewUri, setPreviewUri] = useState(null);

  // Track the keyboard so the reopen dialog can move out of its way.
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardOpen(true)
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardOpen(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const fetchIssue = useCallback(
    async (showLoader = true) => {
      try {
        if (!issueId) {
          throw new Error('Complaint information is missing.');
        }

        if (showLoader) {
          setLoading(true);
        }

        setError('');

        const response = await apiRequest(`/issues/${issueId}`);

        if (response?.success && response?.issue) {
          setIssue(response.issue);
        } else {
          throw new Error(
            response?.message || 'Unable to load this complaint.'
          );
        }
      } catch (requestError) {
        console.error('Issue details fetch failed:', requestError);

        setError(
          requestError?.message ||
            'Unable to load this complaint. Please try again.'
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [issueId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchIssue(true);
    }, [fetchIssue])
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchIssue(false);
    } finally {
      setRefreshing(false);
    }
  }, [fetchIssue]);

  const submitFeedback = async () => {
    if (!feedbackRating || submittingFeedback || !issueId) return;

    try {
      setSubmittingFeedback(true);
      const response = await apiRequest(`/issues/${issueId}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment.trim(),
        }),
      });

      if (!response?.success || !response?.issue?.feedback) {
        throw new Error(response?.message || 'Unable to submit your feedback.');
      }

      setIssue((currentIssue) => ({
        ...currentIssue,
        feedback: response.issue.feedback,
      }));
      setFeedbackComment('');
    } catch (feedbackError) {
      console.error('Submit feedback failed:', feedbackError);
      Alert.alert(
        'Feedback not submitted',
        feedbackError?.message || 'Please try again.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDeleteIssue = () => {
    if (!issueId || !issue) return;

    if (issue.status !== 'pending') {
      Alert.alert(
        'Cannot delete complaint',
        'Only pending complaints can be deleted.'
      );
      return;
    }

    Alert.alert(
      'Delete complaint?',
      `Are you sure you want to delete ${
        issue.complaintId || 'this complaint'
      }? This action cannot be undone.`,
      [
        {
          text: 'Keep complaint',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);

              const response = await apiRequest(`/issues/${issueId}`, {
                method: 'DELETE',
              });

              if (!response?.success) {
                throw new Error(
                  response?.message || 'Unable to delete the complaint.'
                );
              }

              Alert.alert(
                'Complaint deleted',
                'Your complaint has been deleted successfully.',
                [
                  {
                    text: 'Done',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (deleteError) {
              console.error('Delete complaint failed:', deleteError);

              Alert.alert(
                'Delete failed',
                deleteError?.message ||
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

  /* ------------------------- REOPEN -------------------------
   * Alert.prompt does nothing on Android, so we use our own modal
   * with a TextInput. While the keyboard is open the dialog moves to
   * the top of the screen so it can never be covered by the keyboard.
   * ----------------------------------------------------------- */

  const openReopenDialog = () => {
    if (!issue?._id || reopening) return;
    setReopenReason('');
    setReopenOpen(true);
  };

  const closeReopenDialog = () => {
    if (reopening) return;
    Keyboard.dismiss();
    setReopenOpen(false);
    setReopenReason('');
  };

  const submitReopen = async () => {
    const reason = reopenReason.trim();

    if (reason.length < MIN_REASON_LENGTH) {
      Alert.alert(
        'Reason required',
        `Please explain why you are reopening this complaint (at least ${MIN_REASON_LENGTH} characters).`
      );
      return;
    }

    if (!issue?._id || reopening) return;

    try {
      setReopening(true);
      Keyboard.dismiss();

      const res = await apiRequest(`/issues/${issue._id}/reopen`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (res && res.success === false) {
        throw new Error(res.message || 'Failed to reopen complaint.');
      }

      setReopenOpen(false);
      setReopenReason('');

      Alert.alert(
        'Complaint reopened',
        res?.message || 'The complaint has been reopened.'
      );

      await fetchIssue(false);
    } catch (err) {
      console.error('Reopen complaint failed:', err);
      Alert.alert(
        'Reopen failed',
        err?.message || 'Failed to reopen complaint. Please try again.'
      );
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="dark-content"
          translucent={false}
        />

        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="large" color={COLORS.green} />
          </View>

          <Text style={styles.loadingTitle}>Loading your complaint</Text>
          <Text style={styles.loadingSubtitle}>
            Getting the latest status..
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !issue) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          backgroundColor={COLORS.background}
          barStyle="dark-content"
          translucent={false}
        />

        <View style={styles.errorContainer}>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.errorBackArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.errorIllustration}>
            <Text style={styles.errorIllustrationText}>!</Text>
          </View>

          <Text style={styles.errorTitle}>We could not load this</Text>
          <Text style={styles.errorSubtitle}>
            {error || 'The requested complaint could not be found.'}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => fetchIssue(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Try again</Text>
            <Text style={styles.primaryButtonArrow}>↻</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = getStatus(issue.status);
  const priority = getPriority(issue.priority);

  const history = Array.isArray(issue.history)
    ? [...issue.history].sort((a, b) => {
        const aTime = new Date(a.changedAt || 0).getTime();
        const bTime = new Date(b.changedAt || 0).getTime();
        return aTime - bTime;
      })
    : [];

  const complaintId = issue.complaintId || 'Generating...';

  const isResolved = issue.status === 'resolved';

  const showResolution =
    isResolved &&
    Boolean(
      issue.resolutionNote ||
        issue.resolvedAt ||
        issue.resolutionPhotoUrl
    );

  const reasonLength = reopenReason.trim().length;
  const reasonValid = reasonLength >= MIN_REASON_LENGTH;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        backgroundColor={COLORS.background}
        barStyle="dark-content"
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerBackArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerEyebrow}>CampusSetu</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Complaint details
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerRefreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Refresh complaint"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.green} />
          ) : (
            <Text style={styles.headerRefreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isSmall && styles.contentSmall,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.green}
            colors={[COLORS.green]}
          />
        }
      >
        <View style={styles.contentInner}>
          {/* Complaint overview */}
          <View style={styles.heroCard}>
            <View style={styles.heroDecorCircle} />

            <View style={styles.heroTopRow}>
              <View style={styles.heroBrandMark}>
                <Text style={styles.heroBrandMarkText}>C</Text>
              </View>

              <View style={styles.heroTopText}>
                <Text style={styles.heroEyebrow} numberOfLines={1}>
                  YOUR CAMPUS · YOUR VOICE
                </Text>
                <Text style={styles.heroHeading} numberOfLines={1}>
                  Complaint overview
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: status.background },
                ]}
              >
                <View
                  style={[
                    styles.statusBadgeDot,
                    { backgroundColor: status.color },
                  ]}
                />
                <Text
                  style={[styles.statusBadgeText, { color: status.color }]}
                  numberOfLines={1}
                >
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <Text style={styles.complaintIdLabel}>COMPLAINT REFERENCE</Text>

            <View style={styles.complaintIdRow}>
              <Text
                style={[
                  styles.complaintIdValue,
                  isSmall && styles.complaintIdValueSmall,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {complaintId}
              </Text>
              <View style={styles.referenceIcon}>
                <Text style={styles.referenceIconText}>#</Text>
              </View>
            </View>

            <Text style={styles.heroDescription}>
              Keep this reference handy when following up on your complaint.
            </Text>

            <View style={styles.heroBottomRow}>
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaIcon}>▦</Text>
                <Text style={styles.heroMetaText}>
                  {issue.category || 'General'}
                </Text>
              </View>

              <View style={styles.heroMetaDivider} />

              <View style={styles.heroMeta}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priority.color },
                  ]}
                />
                <Text style={styles.heroMetaText}>
                  {priority.label} priority
                </Text>
              </View>
            </View>
          </View>

          {/* Status summary */}
          <View style={styles.statusSummaryCard}>
            <View
              style={[
                styles.statusSummaryIcon,
                { backgroundColor: status.background },
              ]}
            >
              <Text
                style={[
                  styles.statusSummaryIconText,
                  { color: status.color },
                ]}
              >
                {status.icon}
              </Text>
            </View>

            <View style={styles.statusSummaryContent}>
              <Text style={styles.statusSummaryEyebrow}>CURRENT STATUS</Text>
              <Text style={styles.statusSummaryTitle}>{status.label}</Text>
              <Text style={styles.statusSummaryDescription}>
                {status.description}
              </Text>
            </View>

            <View
              style={[
                styles.statusSummaryAccent,
                { backgroundColor: status.color },
              ]}
            />
          </View>

          {/* Issue description */}
          <View style={styles.section}>
            <SectionHeading eyebrow="THE DETAILS" title="What happened?" />

            <View style={styles.card}>
              <Text style={styles.issueTitle}>
                {issue.title || 'Untitled complaint'}
              </Text>

              <Text style={styles.description}>
                {issue.description || 'No description was provided.'}
              </Text>

              <View style={styles.descriptionFooter}>
                <View style={styles.descriptionCategory}>
                  <Text style={styles.descriptionCategoryIcon}>▦</Text>
                  <Text style={styles.descriptionCategoryText}>
                    {issue.category || 'General'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: priority.background },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityBadgeText,
                      { color: priority.color },
                    ]}
                  >
                    {priority.label} priority
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <SectionHeading
              eyebrow="WHERE IT HAPPENED"
              title="Location details"
            />

            <View style={styles.card}>
              <InfoRow
                icon="⌖"
                label="Reported location"
                value={issue.location}
              />

              {issue.building ? (
                <InfoRow icon="▤" label="Building" value={issue.building} />
              ) : null}

              {issue.floor ? (
                <InfoRow icon="↕" label="Floor" value={issue.floor} />
              ) : null}

              {issue.roomNumber ? (
                <InfoRow
                  icon="▣"
                  label="Room number"
                  value={issue.roomNumber}
                  last
                />
              ) : null}

              {!issue.building && !issue.floor && !issue.roomNumber ? (
                <View style={styles.locationNote}>
                  <Text style={styles.locationNoteText}>
                    Additional building details were not provided.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Complaint information */}
          <View style={styles.section}>
            <SectionHeading
              eyebrow="RECORD INFORMATION"
              title="Complaint information"
            />

            <View style={styles.card}>
              <InfoRow
                icon="#"
                label="Complaint reference"
                value={complaintId}
              />

              <InfoRow
                icon="▦"
                label="Category"
                value={issue.category || 'General'}
              />

              <InfoRow
                icon="◷"
                label="Reported on"
                value={formatDateTime(issue.createdAt)}
              />

              <InfoRow
                icon="↻"
                label="Last updated"
                value={formatDateTime(issue.updatedAt)}
              />

              {issue.assignedTo ? (
                <InfoRow
                  icon="♙"
                  label="Assigned official"
                  value={
                    issue.assignedTo.name ||
                    issue.assignedTo.email ||
                    'Assigned official'
                  }
                  last
                />
              ) : null}
            </View>
          </View>

          {/* Student's original photo */}
          {issue.photoUrl ? (
            <View style={styles.section}>
              <SectionHeading
                eyebrow="VISUAL EVIDENCE"
                title="Attached photo"
              />

              <View style={styles.photoCard}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setPreviewUri(issue.photoUrl)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel="View complaint photo full screen"
                >
                  <Image
                    source={{ uri: issue.photoUrl }}
                    style={styles.issuePhoto}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View style={styles.photoCaption}>
                  <View style={styles.photoCaptionIcon}>
                    <Text style={styles.photoCaptionIconText}>✓</Text>
                  </View>

                  <View style={styles.photoCaptionContent}>
                    <Text style={styles.photoCaptionTitle}>
                      Submitted evidence
                    </Text>
                    <Text style={styles.photoCaptionDescription}>
                      Photo attached to the original complaint.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* Official Rejection Card */}
          {issue.status === 'rejected' ? (
            <View style={styles.section}>
              <SectionHeading
                eyebrow="OFFICIAL DECISION"
                title="Rejection details"
              />

              <View style={{
                backgroundColor: '#FEF2F2',
                borderRadius: 20,
                padding: 18,
                borderWidth: 1.5,
                borderColor: '#FECACA',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: '#FEE2E2',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: '900', color: '#DC2626' }}>✕</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#991B1B' }}>
                    Complaint Rejected
                  </Text>
                </View>

                <Text style={{ fontSize: 11, fontWeight: '800', color: '#B91C1C', letterSpacing: 0.8, marginBottom: 4 }}>
                  OFFICIAL RATIONALE
                </Text>
                <Text style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 20, fontWeight: '500' }}>
                  {issue.rejectionReason || issue.resolutionNote || 'No specific rationale was provided by administration.'}
                </Text>

                <Text style={{ fontSize: 11, color: '#991B1B', marginTop: 12, lineHeight: 16 }}>
                  If you feel this decision was made in error or have further information, you can reopen this complaint using the button below.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Resolution (with the teacher's proof photo) */}
          {showResolution ? (
            <View style={styles.section}>
              <SectionHeading
                eyebrow="OFFICIAL UPDATE"
                title="Resolution details"
              />

              <View style={styles.resolutionCard}>
                <View style={styles.resolutionHeader}>
                  <View style={styles.resolutionIcon}>
                    <Text style={styles.resolutionIconText}>✓</Text>
                  </View>

                  <View style={styles.resolutionHeaderContent}>
                    <Text style={styles.resolutionTitle}>
                      Complaint resolved
                    </Text>

                    {issue.resolvedAt ? (
                      <Text style={styles.resolutionDate}>
                        {formatDateTime(issue.resolvedAt)}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.resolutionDivider} />

                {issue.resolutionPhotoUrl ? (
                  <>
                    <Text style={styles.resolutionLabel}>
                      PROOF OF COMPLETION
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() =>
                        setPreviewUri(issue.resolutionPhotoUrl)
                      }
                      accessibilityRole="imagebutton"
                      accessibilityLabel="View resolution proof full screen"
                    >
                      <Image
                        source={{ uri: issue.resolutionPhotoUrl }}
                        style={styles.resolutionPhoto}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>

                    <Text style={styles.resolutionPhotoHint}>
                      Tap the photo to view it full screen.
                    </Text>
                  </>
                ) : null}

                <Text
                  style={[
                    styles.resolutionLabel,
                    issue.resolutionPhotoUrl && styles.resolutionLabelSpaced,
                  ]}
                >
                  OFFICIAL NOTE
                </Text>
                <Text style={styles.resolutionText}>
                  {issue.resolutionNote ||
                    'No resolution note has been provided yet.'}
                </Text>
              </View>

              <View style={styles.feedbackCard}>
                <View style={styles.feedbackHeading}>
                  <View style={styles.feedbackIcon}>
                    <Text style={styles.feedbackIconText}>★</Text>
                  </View>
                  <View style={styles.feedbackHeadingText}>
                    <Text style={styles.feedbackTitle}>
                      {issue.feedback?.submittedAt
                        ? 'Thanks for your feedback'
                        : 'How was the resolution?'}
                    </Text>
                    <Text style={styles.feedbackSubtitle}>
                      {issue.feedback?.submittedAt
                        ? 'Your response helps improve campus services.'
                        : 'Rate how well this complaint was resolved.'}
                    </Text>
                  </View>
                </View>

                {issue.feedback?.submittedAt ? (
                  <View style={styles.feedbackSubmitted}>
                    <Text style={styles.feedbackStars}>
                      {'★'.repeat(issue.feedback.rating || 0)}
                      <Text style={styles.feedbackStarsMuted}>
                        {'★'.repeat(5 - (issue.feedback.rating || 0))}
                      </Text>
                    </Text>
                    {issue.feedback.comment ? (
                      <Text style={styles.feedbackSubmittedComment}>
                        “{issue.feedback.comment}”
                      </Text>
                    ) : null}
                    <Text style={styles.feedbackSubmittedDate}>
                      Submitted {formatDateTime(issue.feedback.submittedAt)}
                    </Text>
                  </View>
                ) : (
                  <>
                    <View
                      style={styles.feedbackRatingRow}
                      accessibilityLabel="Rate the complaint resolution from 1 to 5 stars"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <TouchableOpacity
                          key={rating}
                          style={styles.feedbackStarButton}
                          onPress={() => setFeedbackRating(rating)}
                          accessibilityRole="button"
                          accessibilityLabel={`${rating} out of 5 stars`}
                          accessibilityState={{ selected: feedbackRating === rating }}
                        >
                          <Text
                            style={[
                              styles.feedbackStar,
                              rating <= feedbackRating &&
                                styles.feedbackStarSelected,
                            ]}
                          >
                            ★
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <Text style={styles.feedbackRatingHint}>
                        {feedbackRating ? `${feedbackRating} / 5` : 'Tap to rate'}
                      </Text>
                    </View>

                    <TextInput
                      style={styles.feedbackInput}
                      value={feedbackComment}
                      onChangeText={setFeedbackComment}
                      placeholder="Add a note (optional)"
                      placeholderTextColor="#839187"
                      multiline
                      maxLength={500}
                      textAlignVertical="top"
                      accessibilityLabel="Optional resolution feedback"
                    />
                    <View style={styles.feedbackFooter}>
                      <Text style={styles.feedbackCharacterCount}>
                        {feedbackComment.length}/500
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.feedbackSubmitButton,
                          (!feedbackRating || submittingFeedback) &&
                            styles.feedbackSubmitDisabled,
                        ]}
                        onPress={submitFeedback}
                        disabled={!feedbackRating || submittingFeedback}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                      >
                        {submittingFeedback ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.feedbackSubmitText}>
                            Send feedback
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          ) : null}

          {/* Timeline */}
          <View style={styles.section}>
            <SectionHeading
              eyebrow="FOLLOW THE PROGRESS"
              title="Status timeline"
              right={
                <View style={styles.eventCountBadge}>
                  <Text style={styles.eventCountText}>
                    {history.length}{' '}
                    {history.length === 1 ? 'UPDATE' : 'UPDATES'}
                  </Text>
                </View>
              }
            />

            <View style={styles.timelineCard}>
              {history.length === 0 ? (
                <View style={styles.timelineEmpty}>
                  <View style={styles.timelineEmptyIcon}>
                    <Text style={styles.timelineEmptyIconText}>◷</Text>
                  </View>

                  <Text style={styles.timelineEmptyTitle}>
                    No status updates yet
                  </Text>

                  <Text style={styles.timelineEmptyDescription}>
                    Updates will appear here as your complaint moves through
                    the process.
                  </Text>
                </View>
              ) : (
                history.map((entry, index) => {
                  const entryStatus = getStatus(entry.status);
                  const isLast = index === history.length - 1;

                  return (
                    <View
                      key={
                        entry._id ||
                        `${entry.status || 'status'}-${
                          entry.changedAt || index
                        }`
                      }
                      style={styles.timelineItem}
                    >
                      <View style={styles.timelineRail}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: entryStatus.color },
                            isLast && styles.timelineDotLatest,
                          ]}
                        >
                          {isLast ? (
                            <View style={styles.timelineDotInner} />
                          ) : null}
                        </View>

                        {!isLast ? (
                          <View style={styles.timelineConnector} />
                        ) : null}
                      </View>

                      <View
                        style={[
                          styles.timelineEntry,
                          isLast && styles.timelineEntryLast,
                        ]}
                      >
                        <View style={styles.timelineEntryTop}>
                          <Text style={styles.timelineTitle}>
                            {entryStatus.label}
                          </Text>

                          {isLast ? (
                            <View style={styles.latestBadge}>
                              <Text style={styles.latestBadgeText}>
                                LATEST
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        {entry.note ? (
                          <Text style={styles.timelineNote}>
                            {entry.note}
                          </Text>
                        ) : null}

                        <Text style={styles.timelineDate}>
                          {formatDateTime(entry.changedAt)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Reopen resolved or rejected complaint */}
          {['resolved', 'rejected'].includes(issue.status) ? (
            <View style={styles.deleteCard}>
              <View style={styles.deleteHeader}>
                <View
                  style={[styles.deleteIcon, { backgroundColor: '#E0F2FE' }]}
                >
                  <Text style={[styles.deleteIconText, { color: '#0369A1' }]}>
                    ↻
                  </Text>
                </View>

                <View style={styles.deleteHeaderContent}>
                  <Text style={styles.deleteTitle}>Issue not solved?</Text>
                  <Text style={styles.deleteSubtitle}>
                    If the problem persists or was not adequately resolved,
                    you can reopen this complaint.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  { backgroundColor: '#0284C7' },
                  reopening && styles.deleteButtonDisabled,
                ]}
                onPress={openReopenDialog}
                disabled={reopening}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Reopen complaint"
              >
                {reopening ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteButtonIcon}>↻</Text>
                )}
                <Text style={styles.deleteButtonText}>
                  {reopening ? 'Reopening...' : 'Reopen Complaint'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Delete pending complaint */}
          {issue.status === 'pending' ? (
            <View style={styles.deleteCard}>
              <View style={styles.deleteHeader}>
                <View style={styles.deleteIcon}>
                  <Text style={styles.deleteIconText}>!</Text>
                </View>

                <View style={styles.deleteHeaderContent}>
                  <Text style={styles.deleteTitle}>
                    Need to withdraw this?
                  </Text>
                  <Text style={styles.deleteSubtitle}>
                    Pending complaints can be deleted. Once processing begins,
                    deletion may no longer be available.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  deleting && styles.deleteButtonDisabled,
                ]}
                onPress={handleDeleteIssue}
                disabled={deleting}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Delete complaint"
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteButtonIcon}>⌫</Text>
                )}

                <Text style={styles.deleteButtonText}>
                  {deleting ? 'Deleting complaint...' : 'Delete complaint'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Closing note */}
          <View style={styles.closingCard}>
            <View style={styles.closingMark}>
              <Text style={styles.closingMarkText}>C</Text>
            </View>

            <Text style={styles.closingTitle}>Your voice matters.</Text>

            <Text style={styles.closingDescription}>
              CampusSetu helps bring your concerns and campus solutions closer
              together.
            </Text>
          </View>

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>

      {/* Reopen dialog */}
      <Modal
        visible={reopenOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeReopenDialog}
      >
        <View style={reopenStyles.overlay}>
          {/* Tap outside: first dismiss the keyboard, then close */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => {
              if (keyboardOpen) Keyboard.dismiss();
              else closeReopenDialog();
            }}
          />

          <ScrollView
            style={reopenStyles.scroll}
            contentContainerStyle={[
              reopenStyles.scrollContent,
              keyboardOpen
                ? reopenStyles.scrollContentTop
                : reopenStyles.scrollContentCenter,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={reopenStyles.card}>
              <View style={reopenStyles.headerRow}>
                <View style={reopenStyles.iconCircle}>
                  <Text style={reopenStyles.iconText}>↻</Text>
                </View>

                <View style={reopenStyles.headerText}>
                  <Text style={reopenStyles.title}>Reopen complaint</Text>
                  {!keyboardOpen ? (
                    <Text style={reopenStyles.subtitle}>
                      Tell the faculty why this issue is not solved so they
                      can take further action.
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={reopenStyles.closeButton}
                  onPress={closeReopenDialog}
                  disabled={reopening}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={reopenStyles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={reopenStyles.inputLabel}>REASON</Text>

              <TextInput
                style={reopenStyles.input}
                placeholder="e.g. The leak is still happening after repair"
                placeholderTextColor="#94A3B8"
                value={reopenReason}
                onChangeText={setReopenReason}
                multiline
                maxLength={MAX_REASON_LENGTH}
                textAlignVertical="top"
                editable={!reopening}
                autoFocus
              />

              <View style={reopenStyles.counterRow}>
                <Text
                  style={[
                    reopenStyles.hint,
                    reasonValid && reopenStyles.hintOk,
                  ]}
                >
                  {reasonValid
                    ? '✓ Looks good'
                    : `Minimum ${MIN_REASON_LENGTH} characters`}
                </Text>
                <Text style={reopenStyles.counter}>
                  {reasonLength}/{MAX_REASON_LENGTH}
                </Text>
              </View>

              <View style={reopenStyles.buttonRow}>
                <TouchableOpacity
                  style={reopenStyles.cancelButton}
                  onPress={closeReopenDialog}
                  disabled={reopening}
                  activeOpacity={0.85}
                >
                  <Text style={reopenStyles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    reopenStyles.confirmButton,
                    (reopening || !reasonValid) &&
                      reopenStyles.confirmDisabled,
                  ]}
                  onPress={submitReopen}
                  disabled={reopening || !reasonValid}
                  activeOpacity={0.85}
                >
                  {reopening ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={reopenStyles.confirmText}>
                      Reopen complaint
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Full-screen photo viewer */}
      <Modal
        visible={Boolean(previewUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <View style={styles.viewerOverlay}>
          <TouchableOpacity
            style={styles.viewerBackdrop}
            activeOpacity={1}
            onPress={() => setPreviewUri(null)}
          />

          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          ) : null}

          <TouchableOpacity
            style={styles.viewerClose}
            onPress={() => setPreviewUri(null)}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
          >
            <Text style={styles.viewerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const reopenStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 20, 15, 0.6)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  // Keyboard closed: dialog centered
  scrollContentCenter: {
    justifyContent: 'center',
    paddingVertical: 24,
  },
  // Keyboard open: dialog pinned to the top so it is never covered
  scrollContentTop: {
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingBottom: 12,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#0369A1',
    fontSize: 22,
    fontWeight: '900',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    minHeight: 44,
  },
  title: {
    color: '#172820',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#77847B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  closeText: {
    color: '#47554C',
    fontSize: 14,
    fontWeight: '800',
  },
  inputLabel: {
    color: '#176B4D',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    minHeight: 90,
    maxHeight: 130,
    backgroundColor: '#F5F7F2',
    borderWidth: 1,
    borderColor: '#E5EAE3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#172820',
    fontSize: 14,
    lineHeight: 20,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  hint: {
    color: '#94A3B8',
    fontSize: 11,
  },
  hintOk: {
    color: '#16815D',
    fontWeight: '700',
  },
  counter: {
    color: '#94A3B8',
    fontSize: 11,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#47554C',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmButton: {
    flex: 1.6,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});