import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { apiRequest } from '../services/api';
import styles from './TrackComplaintScreen.styles';

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

const formatDate = (date) => {
  if (!date) return 'Not available';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (date) => {
  if (!date) return 'Not available';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'resolved':
      return styles.statusResolved;

    case 'in_progress':
      return styles.statusProgress;

    case 'assigned':
      return styles.statusAssigned;

    case 'rejected':
      return styles.statusRejected;

    default:
      return styles.statusPending;
  }
};

export default function TrackComplaintScreen({ navigation }) {
  const [complaintId, setComplaintId] = useState('');
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrackComplaint = async () => {
    const trimmedId = complaintId.trim().toUpperCase();

    if (!trimmedId) {
      Alert.alert(
        'Complaint ID Required',
        'Please enter your complaint ID.'
      );
      return;
    }

    try {
      setLoading(true);
      setIssue(null);

      const response = await apiRequest(
        `/issues/track/${encodeURIComponent(trimmedId)}`
      );

      setIssue(response.issue);
    } catch (error) {
      console.error(
        'Track complaint error:',
        error.message
      );

      Alert.alert(
        'Complaint Not Found',
        error.message ||
          'We could not find a complaint with this ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = () => {
    if (
      !issue?.history ||
      issue.history.length === 0
    ) {
      return (
        <View style={styles.emptyTimeline}>
          <Text style={styles.emptyTimelineText}>
            No status history available yet.
          </Text>
        </View>
      );
    }

    const sortedHistory = [...issue.history].sort(
      (a, b) =>
        new Date(a.changedAt) -
        new Date(b.changedAt)
    );

    return (
      <View style={styles.timeline}>
        {sortedHistory.map((item, index) => {
          const isLast =
            index === sortedHistory.length - 1;

          return (
            <View
              key={`${item.changedAt}-${index}`}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    index ===
                      sortedHistory.length - 1 &&
                      styles.timelineDotActive,
                  ]}
                />

                {!isLast && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>
                  {getDisplayStatus(item.status)}
                </Text>

                <Text style={styles.timelineDate}>
                  {formatDateTime(item.changedAt)}
                </Text>

                {item.note ? (
                  <Text style={styles.timelineNote}>
                    {item.note}
                  </Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>
              Track Complaint
            </Text>

            <Text style={styles.headerSubtitle}>
              Check your complaint status
            </Text>
          </View>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>
            Enter Complaint ID
          </Text>

          <Text style={styles.searchSubtitle}>
            Use the complaint ID received after submitting
            your complaint.
          </Text>

          <TextInput
            value={complaintId}
            onChangeText={setComplaintId}
            placeholder="e.g. CS-2026-000001"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            onSubmitEditing={handleTrackComplaint}
            returnKeyType="search"
          />

          <TouchableOpacity
            style={[
              styles.trackButton,
              loading && styles.trackButtonDisabled,
            ]}
            onPress={handleTrackComplaint}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.trackButtonText}>
                Track Complaint
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {issue && (
          <>
            {/* Complaint Header */}
            <View style={styles.resultCard}>
              <View style={styles.complaintIdRow}>
                <View>
                  <Text style={styles.smallLabel}>
                    Complaint ID
                  </Text>

                  <Text style={styles.complaintId}>
                    {issue.complaintId ||
                      'Not available'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(issue.status),
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {getDisplayStatus(issue.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.issueTitle}>
                {issue.title}
              </Text>

              <Text style={styles.issueDescription}>
                {issue.description}
              </Text>
            </View>

            {/* Complaint Information */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                Complaint Information
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Category
                </Text>

                <Text style={styles.infoValue}>
                  {issue.category || 'Not available'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Location
                </Text>

                <Text style={styles.infoValue}>
                  {issue.location || 'Not available'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Priority
                </Text>

                <Text style={styles.infoValue}>
                  {issue.priority
                    ? issue.priority
                        .charAt(0)
                        .toUpperCase() +
                      issue.priority.slice(1)
                    : 'Not available'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Reported On
                </Text>

                <Text style={styles.infoValue}>
                  {formatDate(issue.createdAt)}
                </Text>
              </View>

              {issue.assignedTo?.name ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Assigned To
                  </Text>

                  <Text style={styles.infoValue}>
                    {issue.assignedTo.name}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Resolution */}
            {issue.status === 'resolved' &&
              issue.resolutionNote ? (
              <View style={styles.resolutionCard}>
                <Text style={styles.sectionTitle}>
                  Resolution
                </Text>

                <Text style={styles.resolutionNote}>
                  {issue.resolutionNote}
                </Text>

                {issue.resolvedAt ? (
                  <Text style={styles.resolvedDate}>
                    Resolved on{' '}
                    {formatDateTime(
                      issue.resolvedAt
                    )}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {/* Timeline */}
            <View style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>
                Complaint Timeline
              </Text>

              {renderTimeline()}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}