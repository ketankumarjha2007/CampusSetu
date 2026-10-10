
import React, { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
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

import { apiRequest } from '../services/api';
import styles from './OfficialIssueDetails.styles';

const STATUS = {
  pending: { label: 'Pending', color: '#A56A08', bg: '#FFF2D3' },
  assigned: { label: 'Assigned', color: '#315FC4', bg: '#E9F0FF' },
  in_progress: { label: 'In Progress', color: '#8052B6', bg: '#F0E8FC' },
  resolved: { label: 'Resolved', color: '#147A52', bg: '#DFF5E9' },
  rejected: { label: 'Rejected', color: '#B83232', bg: '#FCE6E6' },
};

const PRIORITY = {
  low: { label: 'Low', color: '#28764E', bg: '#E4F5E9' },
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
        err?.message || 'Unable to load this complaint. Please try again.'
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

  const handleUpdate = async () => {
    if (!issue || !nextStatus || updating) return;

    if (nextStatus === 'resolved' && !note.trim()) {
      Alert.alert(
        'Resolution note required',
        'Explain what was done to resolve this complaint before submitting.'
      );
      return;
    }

    setUpdating(true);

    try {
      const response = await apiRequest(
        `/issues/${issue._id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
            note: note.trim(),
          }),
        }
      );

      if (!response?.success || !response?.issue) {
        throw new Error(
          response?.message || 'Unable to update complaint status.'
        );
      }

      setIssue(response.issue);
      setNote('');

      Alert.alert(
        'Complaint updated',
        `Status changed to ${STATUS[nextStatus].label}.`
      );
    } catch (err) {
      console.error('Complaint status update error:', err);

      Alert.alert(
        'Update failed',
        err?.message || 'Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7F2" />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#176B4D" />
          <Text style={styles.centerTitle}>Loading complaint</Text>
          <Text style={styles.muted}>Fetching the latest information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !issue) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F7F2" />

        <View style={styles.centerState}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.centerTitle}>Couldn't load complaint</Text>
          <Text style={styles.muted}>
            {error || 'Complaint details are unavailable.'}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => fetchIssue(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = STATUS[issue.status] || {
    label: issue.status || 'Unknown',
    color: '#66736A',
    bg: '#EDF0EC',
  };

  const priority = PRIORITY[issue.priority] || PRIORITY.medium;

  const student = issue.reportedBy || {};
  const assignedTeacher = issue.assignedTo || {};

  const history = Array.isArray(issue.history)
    ? [...issue.history].sort(
        (a, b) =>
          new Date(b.changedAt || 0).getTime() -
          new Date(a.changedAt || 0).getTime()
      )
    : [];

  const isResolved = issue.status === 'resolved';
  const isRejected = issue.status === 'rejected';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7F2" />

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
          <Text style={styles.eyebrow}>CAMPUSSETU · FACULTY</Text>
          <Text style={styles.headerTitle}>Complaint details</Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleRefresh}
          disabled={refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh complaint"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#176B4D" />
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
            tintColor="#176B4D"
            colors={['#176B4D']}
          />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrowLight}>COMPLAINT REFERENCE</Text>
          <Text style={styles.reference}>
            {issue.complaintId || issue._id}
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.badgeText, { color: priority.color }]}>
                {priority.label} priority
              </Text>
            </View>
          </View>

          <Text style={styles.heroFootnote}>
            Submitted {prettyDate(issue.createdAt)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Issue description</Text>
          <Text style={styles.issueTitle}>
            {issue.title || 'Untitled complaint'}
          </Text>
          <Text style={styles.description}>
            {issue.description || 'No description provided.'}
          </Text>

          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>
              {issue.category || 'General'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reported by student</Text>

          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(student.name || 'S').trim().charAt(0).toUpperCase()}
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

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location details</Text>

          <InfoRow label="Location" value={issue.location} />
          <InfoRow label="Building" value={issue.building} />
          <InfoRow label="Floor" value={issue.floor} />
          <InfoRow label="Room" value={issue.roomNumber} />

          {!issue.location &&
          !issue.building &&
          !issue.floor &&
          !issue.roomNumber ? (
            <Text style={styles.muted}>No location details provided.</Text>
          ) : null}
        </View>

        {issue.photoUrl ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Attached photo</Text>
            <Image
              source={{ uri: issue.photoUrl }}
              style={styles.issuePhoto}
              resizeMode="cover"
              accessibilityLabel="Complaint photo"
            />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assignment information</Text>

          <InfoRow
            label="Assigned official"
            value={assignedTeacher.name || assignedTeacher.email}
          />
          <InfoRow
            label="Last updated"
            value={prettyDate(issue.updatedAt)}
          />
        </View>

        {!isResolved && !isRejected && nextStatus ? (
          <View style={styles.actionCard}>
            <Text style={styles.sectionTitle}>Update complaint</Text>

            <Text style={styles.actionDescription}>
              {nextStatus === 'in_progress'
                ? 'Begin working on this complaint and optionally add a progress note.'
                : 'Confirm the work completed and explain the resolution. The student will be able to see this note.'}
            </Text>

            <Text style={styles.inputLabel}>
              {nextStatus === 'resolved'
                ? 'Resolution note *'
                : 'Progress note (optional)'}
            </Text>

            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder={
                nextStatus === 'resolved'
                  ? 'Describe the fix or action taken...'
                  : 'Add a brief progress update...'
              }
              placeholderTextColor="#8A968E"
              multiline
              textAlignVertical="top"
              maxLength={1500}
              editable={!updating}
            />

            <Text style={styles.characterCount}>
              {note.length}/1500 characters
            </Text>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                updating && styles.disabledButton,
              ]}
              onPress={handleUpdate}
              disabled={updating}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              {updating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {nextStatus === 'in_progress'
                    ? 'Start working on complaint'
                    : 'Mark as resolved'}
                </Text>
              )}
            </TouchableOpacity>

            {nextStatus === 'resolved' ? (
              <Text style={styles.actionHint}>
                A resolution note is required to complete this action.
              </Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>
              {isResolved
                ? '✓ Complaint resolved'
                : isRejected
                  ? 'Complaint rejected'
                  : 'No status update available'}
            </Text>

            {issue.resolutionNote ? (
              <Text style={styles.description}>
                {issue.resolutionNote}
              </Text>
            ) : (
              <Text style={styles.muted}>
                {isResolved
                  ? 'No resolution note was recorded.'
                  : 'This complaint cannot be updated from this screen.'}
              </Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.timelineHeading}>
            <Text style={styles.sectionTitle}>Activity timeline</Text>
            <Text style={styles.timelineCount}>
              {history.length} {history.length === 1 ? 'update' : 'updates'}
            </Text>
          </View>

          {history.length === 0 ? (
            <Text style={styles.muted}>No status history is available.</Text>
          ) : (
            history.map((entry, index) => {
              const entryStatus = STATUS[entry.status] || {
                label: entry.status || 'Update',
                color: '#66736A',
                bg: '#EDF0EC',
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
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: entryStatus.color },
                    ]}
                  />

                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineStatus}>
                      {entryStatus.label}
                    </Text>

                    <Text style={styles.timelineDate}>
                      {prettyDate(entry.changedAt)}
                    </Text>

                    {entry.note ? (
                      <Text style={styles.timelineNote}>{entry.note}</Text>
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
          CampusSetu · Your actions help build a better campus.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
