
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { apiRequest } from '../services/api';
import styles from './OfficialIssueDetails.styles';

const STATUS = {
  pending: { label: 'Pending', color: '#9A6700', bg: '#FFF4D6' },
  assigned: { label: 'Assigned', color: '#2859B8', bg: '#E8F0FF' },
  in_progress: { label: 'In progress', color: '#7542A6', bg: '#F1E8FC' },
  resolved: { label: 'Resolved', color: '#147A52', bg: '#DDF7E9' },
  rejected: { label: 'Rejected', color: '#B83232', bg: '#FCE8E8' },
};

const PRIORITY = {
  low: { label: 'Low', color: '#26734D', bg: '#E4F5E9' },
  medium: { label: 'Medium', color: '#946317', bg: '#FFF1D3' },
  high: { label: 'High', color: '#BD5A25', bg: '#FCE8DC' },
  critical: { label: 'Critical', color: '#BD3434', bg: '#FDE5E5' },
};

const prettyDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InfoRow = ({ label, value }) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ''
  ) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
};

export default function OfficialIssueDetails({ navigation, route }) {
  const issueId = route?.params?.issueId;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoPrompt, setInfoPrompt] = useState('');
  const [requestingInfo, setRequestingInfo] = useState(false);

  const fetchIssue = useCallback(async (showLoader = true) => {
    if (!issueId) {
      setError('Complaint ID is missing.');
      setLoading(false);
      return;
    }

    if (showLoader) setLoading(true);
    setError('');

    try {
      const response = await apiRequest(`/issues/${issueId}`);

      if (!response?.success || !response?.issue) {
        throw new Error(
          response?.message || 'Unable to load complaint details.'
        );
      }

      setIssue(response.issue);
    } catch (err) {
      console.error('Official issue details error:', err);
      setError(
        err?.message ||
          'Unable to load this complaint. Please try again.'
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [issueId]);

  useFocusEffect(
    useCallback(() => {
      fetchIssue(true);
    }, [fetchIssue])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await fetchIssue(false);
    } finally {
      setRefreshing(false);
    }
  }, [fetchIssue]);

  const nextStatus =
    issue?.status === 'assigned'
      ? 'in_progress'
      : issue?.status === 'in_progress'
        ? 'resolved'
        : null;

  const pickResolutionPhoto = async (source) => {
    try {
      let result;

      if (source === 'camera') {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Camera permission needed',
            'Allow camera access to take a proof photo.'
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Photo permission needed',
            'Allow photo library access to choose proof.'
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      setResolutionPhoto({
        uri: asset.uri,
        fileName:
          asset.fileName || `resolution-proof-${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    } catch (err) {
      console.error('Resolution proof photo picker error:', err);

      Alert.alert(
        'Could not select photo',
        'Please try again.'
      );
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Add resolution proof',
      'Choose how to add a photo showing the completed repair.',
      [
        {
          text: 'Take photo',
          onPress: () => pickResolutionPhoto('camera'),
        },
        {
          text: 'Choose from gallery',
          onPress: () => pickResolutionPhoto('gallery'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!issue || !nextStatus || updating) return;

    if (nextStatus === 'resolved' && !note.trim()) {
      Alert.alert(
        'Resolution note required',
        'Explain what was done before resolving this complaint.'
      );
      return;
    }

    if (nextStatus === 'resolved' && !resolutionPhoto) {
      Alert.alert(
        'Proof photo required',
        'Please take or choose a photo showing that the issue has been corrected.'
      );
      return;
    }

    setUpdating(true);

    try {
      let body;

      if (nextStatus === 'resolved') {
        body = new FormData();
        body.append('status', 'resolved');
        body.append('resolutionNote', note.trim());

        body.append('photo', {
          uri: resolutionPhoto.uri,
          name: resolutionPhoto.fileName,
          type: resolutionPhoto.mimeType,
        });
      } else {
        body = JSON.stringify({
          status: nextStatus,
          resolutionNote: note.trim(),
        });
      }

      const response = await apiRequest(
        `/issues/${issue._id}/status`,
        {
          method: 'PATCH',
          body,
        }
      );

      if (!response?.success || !response?.issue) {
        throw new Error(
          response?.message || 'Unable to update complaint status.'
        );
      }

      setIssue(response.issue);
      setNote('');
      setResolutionPhoto(null);

      Alert.alert(
        'Complaint updated',
        `Status changed to ${STATUS[nextStatus].label}.`
      );
    } catch (err) {
      console.error('Complaint status update error:', err);

      Alert.alert(
        'Update failed',
        err?.message ||
          'Please try again. Confirm that the server supports resolution photo uploads.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!issue || requestingInfo) return;

    if (!infoPrompt.trim()) {
      Alert.alert(
        'Information required',
        'Please enter what details you need from the student.'
      );
      return;
    }

    setRequestingInfo(true);

    try {
      const response = await apiRequest(
        `/issues/${issue._id}/request-info`,
        {
          method: 'POST',
          body: JSON.stringify({
            prompt: infoPrompt.trim(),
          }),
        }
      );

      if (!response?.success) {
        throw new Error(
          response?.message || 'Failed to request information.'
        );
      }

      Alert.alert(
        'Request sent',
        'The student has been notified to provide the requested details.'
      );

      setInfoModalOpen(false);
      setInfoPrompt('');
      await fetchIssue(false);
    } catch (err) {
      console.error('Request info error:', err);

      Alert.alert(
        'Request failed',
        err?.message || 'Please try again.'
      );
    } finally {
      setRequestingInfo(false);
    }
  };

  const history = useMemo(() => {
    return Array.isArray(issue?.history)
      ? [...issue.history].sort(
          (a, b) =>
            new Date(b.changedAt || 0) -
            new Date(a.changedAt || 0)
        )
      : [];
  }, [issue?.history]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F4F7F5"
          translucent={false}
        />

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#087F5B" />
          <Text style={styles.centerTitle}>
            Loading complaint
          </Text>
          <Text style={styles.muted}>
            Fetching the latest information…
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
          barStyle="dark-content"
          backgroundColor="#F4F7F5"
          translucent={false}
        />

        <View style={styles.centerState}>
          <View style={styles.errorIconWrap}>
            <Text style={styles.errorIcon}>!</Text>
          </View>

          <Text style={styles.centerTitle}>
            Couldn’t load complaint
          </Text>

          <Text style={styles.muted}>
            {error || 'Complaint details are unavailable.'}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => fetchIssue(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              Try again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = STATUS[issue.status] || {
    label: issue.status || 'Unknown',
    color: '#59665F',
    bg: '#EDF1EE',
  };

  const priority = PRIORITY[issue.priority] || PRIORITY.medium;
  const student = issue.reportedBy || {};
  const assignedTeacher = issue.assignedTo || {};
  const isResolved = issue.status === 'resolved';
  const isRejected = issue.status === 'rejected';

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F7F5"
        translucent={false}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            CampusSetu · FACULTY
          </Text>
          <Text style={styles.headerTitle}>
            Complaint details
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleRefresh}
          disabled={refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh complaint"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#087F5B" />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#087F5B"
            colors={['#087F5B']}
          />
        }
      >
        {/* Complaint overview */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroMark}>
              <Text style={styles.heroMarkText}>CS</Text>
            </View>

            <View style={styles.heroMeta}>
              <Text style={styles.eyebrowLight}>
                COMPLAINT REFERENCE
              </Text>
              <Text style={styles.reference}>
                {issue.complaintId || issue._id}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {issue.title || 'Untitled complaint'}
          </Text>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: status.bg },
              ]}
            >
              <View
                style={[
                  styles.badgeDot,
                  { backgroundColor: status.color },
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: status.color },
                ]}
              >
                {status.label}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: priority.bg },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: priority.color },
                ]}
              >
                {priority.label} priority
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <Text style={styles.heroFootnote}>
            Submitted {prettyDate(issue.createdAt)}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionKicker}>THE ISSUE</Text>
          <Text style={styles.sectionTitle}>Description</Text>

          <Text style={styles.description}>
            {issue.description || 'No description provided.'}
          </Text>

          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {issue.category || 'General'}
            </Text>
          </View>
        </View>

        {/* Student details */}
        <View style={styles.card}>
          <Text style={styles.sectionKicker}>REPORTER</Text>
          <Text style={styles.sectionTitle}>
            Reported by student
          </Text>

          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(student.name || 'S')
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.studentIdentity}>
              <Text style={styles.studentName}>
                {student.name || 'Student'}
              </Text>
              <Text style={styles.muted}>
                {student.department || 'Department not provided'}
              </Text>
            </View>
          </View>

          <InfoRow label="Email" value={student.email} />
          <InfoRow label="USN" value={student.usn} />
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.sectionKicker}>WHERE TO FIND IT</Text>
          <Text style={styles.sectionTitle}>Location details</Text>

          <InfoRow label="Location" value={issue.location} />
          <InfoRow label="Building" value={issue.building} />
          <InfoRow label="Floor" value={issue.floor} />
          <InfoRow label="Room" value={issue.roomNumber} />

          {!issue.location &&
          !issue.building &&
          !issue.floor &&
          !issue.roomNumber ? (
            <Text style={styles.muted}>
              No location details provided.
            </Text>
          ) : null}
        </View>

        {/* Original student photo */}
        {issue.photoUrl ? (
          <View style={styles.card}>
            <Text style={styles.sectionKicker}>
              ORIGINAL REPORT
            </Text>
            <Text style={styles.sectionTitle}>
              Student’s attached photo
            </Text>

            <Image
              source={{ uri: issue.photoUrl }}
              style={styles.issuePhoto}
              resizeMode="cover"
              accessibilityLabel="Original complaint photo"
            />
          </View>
        ) : null}

        {/* Assignment */}
        <View style={styles.card}>
          <Text style={styles.sectionKicker}>ASSIGNMENT</Text>
          <Text style={styles.sectionTitle}>
            Assignment information
          </Text>

          <InfoRow
            label="Assigned official"
            value={assignedTeacher.name || assignedTeacher.email}
          />
          <InfoRow
            label="Last updated"
            value={prettyDate(issue.updatedAt)}
          />
        </View>

        {/* Saved resolution proof */}
        {issue.resolutionPhotoUrl ? (
          <View style={styles.proofCard}>
            <View style={styles.proofHeading}>
              <View style={styles.proofCheck}>
                <Text style={styles.proofCheckText}>✓</Text>
              </View>

              <View style={styles.proofHeadingText}>
                <Text style={styles.proofTitle}>
                  Resolution proof
                </Text>
                <Text style={styles.proofSubtitle}>
                  Photo submitted by the teacher
                </Text>
              </View>
            </View>

            <Image
              source={{ uri: issue.resolutionPhotoUrl }}
              style={styles.issuePhoto}
              resizeMode="cover"
              accessibilityLabel="Teacher resolution proof photo"
            />

            {issue.resolutionNote ? (
              <Text style={styles.description}>
                {issue.resolutionNote}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Status update / resolve */}
        {!isResolved && !isRejected && nextStatus ? (
          <View style={styles.actionCard}>
            <View style={styles.actionTop}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>
                  {nextStatus === 'resolved' ? '✓' : '↗'}
                </Text>
              </View>

              <View style={styles.actionHeading}>
                <Text style={styles.sectionKicker}>
                  NEXT ACTION
                </Text>
                <Text style={styles.sectionTitle}>
                  {nextStatus === 'resolved'
                    ? 'Resolve complaint'
                    : 'Start working'}
                </Text>
              </View>
            </View>

            <Text style={styles.actionDescription}>
              {nextStatus === 'in_progress'
                ? 'Move this complaint into progress and optionally leave a note for the student.'
                : 'Document the completed repair. A resolution note and proof photo are required before closing this complaint.'}
            </Text>

            <Text style={styles.inputLabel}>
              {nextStatus === 'resolved'
                ? 'Resolution note · Required'
                : 'Progress note · Optional'}
            </Text>

            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder={
                nextStatus === 'resolved'
                  ? 'Describe what you fixed and how it was verified…'
                  : 'Add a short progress update…'
              }
              placeholderTextColor="#8B9891"
              multiline
              textAlignVertical="top"
              maxLength={1500}
              editable={!updating}
            />

            <Text style={styles.characterCount}>
              {note.length}/1500
            </Text>

            {nextStatus === 'resolved' ? (
              <View style={styles.photoSection}>
                <View style={styles.photoLabelRow}>
                  <Text style={styles.inputLabel}>
                    Proof photo · Required
                  </Text>

                  <View style={styles.requiredPill}>
                    <Text style={styles.requiredPillText}>
                      REQUIRED
                    </Text>
                  </View>
                </View>

                <Text style={styles.photoHint}>
                  Take a photo of the corrected issue, such as the
                  repaired fixture, cleaned area, or working equipment.
                </Text>

                {resolutionPhoto ? (
                  <View style={styles.previewWrap}>
                    <Image
                      source={{ uri: resolutionPhoto.uri }}
                      style={styles.proofPreview}
                      resizeMode="cover"
                    />

                    <View style={styles.previewFooter}>
                      <View style={styles.previewNameWrap}>
                        <Text style={styles.previewSuccess}>
                          ✓ Photo attached
                        </Text>
                        <Text
                          style={styles.previewName}
                          numberOfLines={1}
                        >
                          {resolutionPhoto.fileName}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => setResolutionPhoto(null)}
                        disabled={updating}
                        style={styles.removePhotoButton}
                      >
                        <Text style={styles.removePhotoText}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.photoPicker}
                    onPress={showPhotoOptions}
                    disabled={updating}
                    activeOpacity={0.82}
                  >
                    <View style={styles.cameraIcon}>
                      <Text style={styles.cameraIconText}>＋</Text>
                    </View>

                    <Text style={styles.photoPickerTitle}>
                      Add proof photo
                    </Text>
                    <Text style={styles.photoPickerSubtitle}>
                      Take a new photo or choose from gallery
                    </Text>
                  </TouchableOpacity>
                )}

                {resolutionPhoto ? (
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={showPhotoOptions}
                    disabled={updating}
                  >
                    <Text style={styles.changePhotoText}>
                      Change photo
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                updating && styles.disabledButton,
              ]}
              onPress={handleUpdate}
              disabled={updating}
              activeOpacity={0.85}
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {nextStatus === 'in_progress'
                    ? 'Start working on complaint  →'
                    : 'Submit proof & resolve  ✓'}
                </Text>
              )}
            </TouchableOpacity>

            {nextStatus === 'resolved' ? (
              <Text style={styles.actionHint}>
                The status changes only after the note and proof
                photo are uploaded successfully.
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setInfoModalOpen(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>
                ⓘ  Request more details from student
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.completedCard}>
            <View style={styles.completedIcon}>
              <Text style={styles.completedIconText}>
                {isResolved ? '✓' : '!'}
              </Text>
            </View>

            <View style={styles.completedBody}>
              <Text style={styles.completedTitle}>
                {isResolved
                  ? 'Complaint resolved'
                  : isRejected
                    ? 'Complaint rejected'
                    : 'No status update available'}
              </Text>

              <Text style={styles.muted}>
                {isResolved
                  ? 'The complaint has been marked as resolved.'
                  : 'This complaint cannot be updated from this screen.'}
              </Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.card}>
          <View style={styles.timelineHeading}>
            <View>
              <Text style={styles.sectionKicker}>AUDIT TRAIL</Text>
              <Text style={styles.sectionTitle}>
                Activity timeline
              </Text>
            </View>

            <View style={styles.timelineCountPill}>
              <Text style={styles.timelineCount}>
                {history.length}{' '}
                {history.length === 1 ? 'update' : 'updates'}
              </Text>
            </View>
          </View>

          {history.length === 0 ? (
            <Text style={styles.muted}>
              No status history is available yet.
            </Text>
          ) : (
            history.map((entry, index) => {
              const entryStatus = STATUS[entry.status] || {
                label: entry.status || 'Update',
                color: '#59665F',
                bg: '#EDF1EE',
              };

              const changedBy =
                entry.changedBy?.name ||
                entry.changedBy?.email ||
                '';

              return (
                <View
                  key={
                    entry._id ||
                    `${entry.status}-${entry.changedAt || index}`
                  }
                  style={styles.timelineItem}
                >
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: entryStatus.color },
                      ]}
                    />

                    {index < history.length - 1 ? (
                      <View style={styles.timelineLine} />
                    ) : null}
                  </View>

                  <View style={styles.timelineBody}>
                    <View style={styles.timelineTopRow}>
                      <Text style={styles.timelineStatus}>
                        {entryStatus.label}
                      </Text>

                      <Text style={styles.timelineDate}>
                        {prettyDate(entry.changedAt)}
                      </Text>
                    </View>

                    {entry.note ? (
                      <Text style={styles.timelineNote}>
                        {entry.note}
                      </Text>
                    ) : null}

                    {changedBy ? (
                      <Text style={styles.timelineAuthor}>
                        Updated by {changedBy}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Text style={styles.footer}>
          CampusSetu · Better campus, together.
        </Text>
      </ScrollView>

      {/* Request more information modal */}
      <Modal
        visible={infoModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (!requestingInfo) setInfoModalOpen(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <Text style={styles.sectionKicker}>
              STUDENT COMMUNICATION
            </Text>

            <Text style={styles.modalTitle}>
              Request additional information
            </Text>

            <Text style={styles.modalDescription}>
              Ask for clarification, a precise location, or details
              needed to resolve this complaint.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Please share the room number and equipment ID…"
              placeholderTextColor="#94A3A0"
              value={infoPrompt}
              onChangeText={setInfoPrompt}
              multiline
              maxLength={500}
              editable={!requestingInfo}
            />

            <Text style={styles.characterCount}>
              {infoPrompt.length}/500
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setInfoModalOpen(false)}
                disabled={requestingInfo}
              >
                <Text style={styles.secondaryButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSendButton,
                  requestingInfo && styles.disabledButton,
                ]}
                onPress={handleRequestInfo}
                disabled={requestingInfo}
              >
                {requestingInfo ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Send request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
