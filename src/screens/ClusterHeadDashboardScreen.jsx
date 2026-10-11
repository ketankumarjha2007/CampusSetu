
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../config/firebase';
import { apiRequest, getCurrentUser } from '../services/api';

const COLORS = {
  background: '#F4F7F5',
  white: '#FFFFFF',
  green: '#137A52',
  greenDark: '#075E40',
  greenLight: '#E5F5EC',
  text: '#15251D',
  muted: '#718078',
  border: '#E2EAE5',
  orange: '#B45309',
  red: '#B91C1C',
  blue: '#1D4ED8',
};

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Escalated', value: 'escalated' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  assigned: { bg: '#E0E7FF', text: '#3730A3' },
  in_progress: { bg: '#DBEAFE', text: '#1D4ED8' },
  resolved: { bg: '#DCFCE7', text: '#166534' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date unavailable';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getIssueId = (issue) =>
  issue?.complaintId || issue?._id?.slice(-6) || 'Complaint';

export default function ClusterHeadDashboardScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [user, setUser] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const [escalatingId, setEscalatingId] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const [issuesRes, teachersRes, userRes] = await Promise.all([
        apiRequest('/issues/admin/all'),
        apiRequest('/issues/admin/teachers'),
        getCurrentUser().catch(() => null),
      ]);

      if (issuesRes?.success === false) {
        throw new Error(issuesRes.message || 'Could not load complaints.');
      }

      if (teachersRes?.success === false) {
        throw new Error(teachersRes.message || 'Could not load teachers.');
      }

      setIssues(Array.isArray(issuesRes?.issues) ? issuesRes.issues : []);
      setTeachers(
        Array.isArray(teachersRes?.teachers) ? teachersRes.teachers : []
      );
      setUser(userRes?.user || userRes || null);
    } catch (err) {
      console.error('Cluster Head dashboard load error:', err);
      setError(err?.message || 'Failed to load cluster records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      `Signed in as ${user?.name || 'Cluster Head'}. Do you want to sign out?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              Alert.alert('Sign-out error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEscalate = (issue) => {
    if (escalatingId) return;

    Alert.alert(
      'Escalate complaint?',
      `Escalate ${getIssueId(issue)} and increase its escalation level?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          style: 'destructive',
          onPress: async () => {
            setEscalatingId(issue._id);

            try {
              const response = await apiRequest(
                `/issues/${issue._id}/escalate`,
                {
                  method: 'POST',
                  body: JSON.stringify({
                    note: 'Escalated by Cluster Head via mobile portal',
                  }),
                }
              );

              if (!response?.success) {
                throw new Error(
                  response?.message || 'Escalation failed.'
                );
              }

              Alert.alert('Escalated', 'The complaint was escalated.');
              await loadData(false);
            } catch (err) {
              Alert.alert('Escalation failed', err.message);
            } finally {
              setEscalatingId(null);
            }
          },
        },
      ]
    );
  };

  const openAssignModal = (issue) => {
    setSelectedIssue(issue);
    setSelectedTeacherId(issue.assignedTo?._id || '');
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    if (submittingAssign) return;

    setAssignModalOpen(false);
    setSelectedIssue(null);
    setSelectedTeacherId('');
  };

  const handleAssignSubmit = async () => {
    if (!selectedIssue || !selectedTeacherId || submittingAssign) return;

    setSubmittingAssign(true);

    try {
      const response = await apiRequest(
        `/issues/${selectedIssue._id}/assign`,
        {
          method: 'PATCH',
          body: JSON.stringify({ teacherId: selectedTeacherId }),
        }
      );

      if (!response?.success) {
        throw new Error(response?.message || 'Assignment failed.');
      }

      setAssignModalOpen(false);
      setSelectedIssue(null);
      setSelectedTeacherId('');

      Alert.alert(
        'Assignment saved',
        'The complaint was assigned to the selected teacher.'
      );

      await loadData(false);
    } catch (err) {
      Alert.alert('Assignment failed', err.message);
    } finally {
      setSubmittingAssign(false);
    }
  };

  const stats = useMemo(() => {
    const pending = issues.filter(
      (item) => item.status === 'pending'
    ).length;

    const assigned = issues.filter(
      (item) => item.status === 'assigned'
    ).length;

    const inProgress = issues.filter(
      (item) => item.status === 'in_progress'
    ).length;

    const resolved = issues.filter(
      (item) => item.status === 'resolved'
    ).length;

    const escalated = issues.filter(
      (item) =>
        Number(item.escalationLevel || 0) > 0 ||
        item.priority === 'critical'
    ).length;

    const resolutionRate = issues.length
      ? Math.round((resolved / issues.length) * 100)
      : 0;

    return {
      total: issues.length,
      pending,
      assigned,
      inProgress,
      resolved,
      escalated,
      resolutionRate,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const isEscalated =
        Number(issue.escalationLevel || 0) > 0 ||
        issue.priority === 'critical';

      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'escalated'
            ? isEscalated
            : issue.status === activeFilter;

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchable = [
        issue.complaintId,
        issue.title,
        issue.description,
        issue.category,
        issue.location,
        issue.building,
        issue.floor,
        issue.roomNumber,
        issue.assignedTo?.name,
        issue.reportedBy?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [issues, activeFilter, search]);

  const userName = user?.name || 'Cluster Head';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const renderStat = (label, value, symbol, color, background) => (
    <View style={styles.statCard} key={label}>
      <View style={[styles.statIcon, { backgroundColor: background }]}>
        <Text style={[styles.statSymbol, { color }]}>{symbol}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderIssue = (issue) => {
    const statusColor = STATUS_COLORS[issue.status] || {
      bg: '#F1F5F9',
      text: '#475569',
    };

    const isEscalated =
      Number(issue.escalationLevel || 0) > 0 ||
      issue.priority === 'critical';

    return (
      <View
        key={issue._id}
        style={[
          styles.issueCard,
          isEscalated && styles.escalatedIssueCard,
        ]}
      >
        <View style={styles.issueTopRow}>
          <Text style={styles.complaintId}>{getIssueId(issue)}</Text>

          <View style={styles.badgeRow}>
            {isEscalated && (
              <View style={styles.escalatedBadge}>
                <Text style={styles.escalatedBadgeText}>
                  {issue.priority === 'critical'
                    ? 'CRITICAL'
                    : `ESCALATED L${issue.escalationLevel || 1}`}
                </Text>
              </View>
            )}

            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>
                {STATUS_LABELS[issue.status] || issue.status || 'Unknown'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.issueTitle}>{issue.title || 'Untitled complaint'}</Text>

        <Text style={styles.issueDescription} numberOfLines={3}>
          {issue.description || 'No description provided.'}
        </Text>

        <View style={styles.issueMeta}>
          <Text style={styles.metaText}>
            {'📍 '}
            {issue.building || issue.location || 'Campus'}
            {issue.roomNumber ? ` • Room ${issue.roomNumber}` : ''}
          </Text>

          <Text style={styles.metaText}>
            {'👤 '}
            {issue.reportedBy?.name || 'Student'}
          </Text>

          <Text style={styles.metaText}>
            {'🧑‍🏫 '}
            {issue.assignedTo?.name
              ? `Assigned: ${issue.assignedTo.name}`
              : 'Not assigned'}
          </Text>

          <Text style={styles.metaText}>
            {'📅 '}
            {formatDate(issue.createdAt)}
          </Text>
        </View>

        {/* Complaint Images Preview (Student Photo & Teacher Resolution Proof) */}
        {(issue.photoUrl || issue.resolutionPhotoUrl) ? (
          <View style={{ flexDirection: 'row', gap: 8, marginVertical: 10 }}>
            {issue.photoUrl ? (
              <TouchableOpacity
                style={{ flex: 1, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('OfficialIssueDetails', { issueId: issue._id })}
              >
                <Image
                  source={{ uri: issue.photoUrl }}
                  style={{ width: '100%', height: 110 }}
                  resizeMode="cover"
                />
                <View style={{ paddingVertical: 4, paddingHorizontal: 6, backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>📷 Student Photo</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {issue.resolutionPhotoUrl ? (
              <TouchableOpacity
                style={{ flex: 1, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('OfficialIssueDetails', { issueId: issue._id })}
              >
                <Image
                  source={{ uri: issue.resolutionPhotoUrl }}
                  style={{ width: '100%', height: 110 }}
                  resizeMode="cover"
                />
                <View style={{ paddingVertical: 4, paddingHorizontal: 6, backgroundColor: 'rgba(21, 128, 61, 0.85)' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>✓ Teacher Proof</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={() => openAssignModal(issue)}
          >
            <Text style={styles.secondaryButtonText}>
              {issue.assignedTo ? 'Reassign' : 'Assign teacher'}
            </Text>
          </TouchableOpacity>

          {!isEscalated && issue.status !== 'resolved' && issue.status !== 'rejected' && (
            <TouchableOpacity
              style={styles.escalateButton}
              activeOpacity={0.8}
              disabled={escalatingId === issue._id}
              onPress={() => handleEscalate(issue)}
            >
              {escalatingId === issue._id ? (
                <ActivityIndicator size="small" color={COLORS.orange} />
              ) : (
                <Text style={styles.escalateButtonText}>Escalate</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.reviewButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('OfficialIssueDetails', {
                issueId: issue._id,
              })
            }
          >
            <Text style={styles.reviewButtonText}>Review →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.green}
            colors={[COLORS.green]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>CAMPUSSETU  /  OPERATIONS</Text>
            <Text style={styles.greeting}>Hello, {userName.split(' ')[0]} 👋</Text>
            <Text style={styles.headerSubtitle}>
              {user?.department
                ? `${user.department} cluster overview`
                : 'Your campus complaint overview'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatar}
            onPress={handleSignOut}
            activeOpacity={0.8}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.avatarText}>{initials || 'CH'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroPill}>
              <View style={styles.onlineDot} />
              <Text style={styles.heroPillText}>CLUSTER CONTROL CENTER</Text>
            </View>
            <Text style={styles.heroEmoji}>⚡</Text>
          </View>

          <Text style={styles.heroTitle}>
            Keep every complaint moving.
          </Text>
          <Text style={styles.heroDescription}>
            Coordinate faculty, monitor resolution progress, and act quickly on
            complaints that need extra attention.
          </Text>

          <View style={styles.heroFooter}>
            <View>
              <Text style={styles.heroFooterLabel}>RESOLUTION RATE</Text>
              <Text style={styles.heroFooterValue}>{stats.resolutionRate}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.resolutionRate}%` },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Cluster metrics</Text>
            <Text style={styles.sectionSubtitle}>Live data from your API</Text>
          </View>

          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            <Text style={styles.refreshText}>
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {renderStat('Total issues', stats.total, 'Σ', COLORS.green, '#E5F5EC')}
          {renderStat('Escalated', stats.escalated, '!', COLORS.orange, '#FFF1DD')}
          {renderStat('Pending', stats.pending, '◷', COLORS.orange, '#FEF3C7')}
          {renderStat('In progress', stats.inProgress, '↗', COLORS.blue, '#DBEAFE')}
          {renderStat('Assigned', stats.assigned, '↗', '#5B4ACB', '#EDE9FE')}
          {renderStat('Resolved', stats.resolved, '✓', COLORS.green, '#DCFCE7')}
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Complaint management</Text>
            <Text style={styles.sectionSubtitle}>
              Search, assign, review, and escalate
            </Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search complaint, student, teacher…"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearSearch}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.value;

            return (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  active && styles.filterButtonActive,
                ]}
                onPress={() => setActiveFilter(filter.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Complaints</Text>
          <Text style={styles.resultsCount}>
            {filteredIssues.length} found
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.green} />
            <Text style={styles.stateText}>Loading complaints…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load dashboard</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadData(true)}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredIssues.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptyDescription}>
              {search
                ? 'Try a different search term or clear your search.'
                : 'There are no complaints matching this filter.'}
            </Text>
            {(search || activeFilter !== 'all') && (
              <TouchableOpacity
                onPress={() => {
                  setSearch('');
                  setActiveFilter('all');
                }}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredIssues.map(renderIssue)
        )}

        <View style={styles.footer}>
          <View style={styles.footerMark}>
            <Text style={styles.footerMarkText}>C</Text>
          </View>
          <View>
            <Text style={styles.footerTitle}>CampusSetu</Text>
            <Text style={styles.footerText}>
              Better coordination. Faster resolution.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={assignModalOpen}
        transparent
        animationType="slide"
        onRequestClose={closeAssignModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalEyebrow}>FACULTY ALLOCATION</Text>
                <Text style={styles.modalTitle}>
                  {selectedIssue?.assignedTo ? 'Reassign complaint' : 'Assign complaint'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeAssignModal}
                disabled={submittingAssign}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Select an active teacher for complaint {getIssueId(selectedIssue)}.
            </Text>

            <ScrollView
              style={styles.teacherList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {teachers.length === 0 ? (
                <View style={styles.emptyTeacher}>
                  <Text style={styles.emptyTitle}>No active teachers</Text>
                  <Text style={styles.emptyDescription}>
                    Check whether your backend has active teacher accounts.
                  </Text>
                </View>
              ) : (
                teachers.map((teacher) => {
                  const selected = selectedTeacherId === teacher._id;

                  return (
                    <TouchableOpacity
                      key={teacher._id}
                      style={[
                        styles.teacherOption,
                        selected && styles.teacherOptionSelected,
                      ]}
                      onPress={() => setSelectedTeacherId(teacher._id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.teacherAvatar,
                          selected && styles.teacherAvatarSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.teacherAvatarText,
                            selected && styles.teacherAvatarTextSelected,
                          ]}
                        >
                          {(teacher.name || 'T').charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.teacherInfo}>
                        <Text style={styles.teacherName}>
                          {teacher.name || 'Unnamed teacher'}
                        </Text>
                        <Text style={styles.teacherMeta}>
                          {teacher.department || 'General faculty'}
                        </Text>
                        <Text style={styles.teacherEmail}>
                          {teacher.email || 'No email available'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeAssignModal}
                disabled={submittingAssign}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!selectedTeacherId || submittingAssign) &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleAssignSubmit}
                disabled={!selectedTeacherId || submittingAssign}
              >
                {submittingAssign ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save assignment →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 7,
  },
  greeting: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#D7F0E1',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  heroCard: {
    backgroundColor: COLORS.greenDark,
    borderRadius: 25,
    padding: 21,
    marginBottom: 26,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.13)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  onlineDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: '#86EFAC',
    marginRight: 7,
  },
  heroPillText: {
    color: '#D1FAE5',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    marginTop: 22,
    maxWidth: 280,
  },
  heroDescription: {
    color: '#D4E9DE',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  heroFooter: {
    marginTop: 24,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  heroFooterLabel: {
    color: '#C7E7D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroFooterValue: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 3,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 10,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  refreshText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    width: '31.5%',
    minHeight: 125,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },
  statSymbol: {
    fontSize: 18,
    fontWeight: '900',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: '900',
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 13,
    marginTop: 2,
    marginBottom: 13,
    minHeight: 51,
  },
  searchIcon: {
    color: '#94A3B8',
    fontSize: 25,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 12,
  },
  clearSearch: {
    color: COLORS.muted,
    fontSize: 24,
    paddingHorizontal: 5,
  },
  filterContainer: {
    paddingBottom: 18,
    paddingRight: 6,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  filterText: {
    color: '#52635A',
    fontSize: 11,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
  },
  resultsCount: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  issueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 12,
  },
  escalatedIssueCard: {
    borderColor: '#FDBA74',
  },
  issueTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  complaintId: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '900',
    paddingTop: 4,
    marginRight: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    flexShrink: 1,
    gap: 5,
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  escalatedBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  escalatedBadgeText: {
    color: '#B91C1C',
    fontSize: 8,
    fontWeight: '900',
  },
  issueTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    marginBottom: 6,
  },
  issueDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  issueMeta: {
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
    paddingTop: 12,
    marginBottom: 13,
    gap: 8,
  },
  metaText: {
    color: '#5D6B63',
    fontSize: 10,
    lineHeight: 15,
  },
  proofNotice: {
    backgroundColor: '#ECFDF5',
    borderRadius: 9,
    padding: 9,
    marginBottom: 12,
  },
  proofNoticeText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 7,
    paddingTop: 3,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  secondaryButtonText: {
    color: '#34483D',
    fontSize: 10,
    fontWeight: '800',
  },
  escalateButton: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
    justifyContent: 'center',
    minWidth: 65,
    alignItems: 'center',
  },
  escalateButtonText: {
    color: '#C2410C',
    fontSize: 10,
    fontWeight: '800',
  },
  reviewButton: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    justifyContent: 'center',
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  centerState: {
    paddingVertical: 42,
    alignItems: 'center',
  },
  stateText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 17,
    padding: 18,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '900',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    padding: 26,
    marginBottom: 15,
  },
  emptyEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.greenLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 15,
  },
  clearFiltersText: {
    color: COLORS.greenDark,
    fontSize: 11,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    marginTop: 15,
  },
  footerMark: {
    width: 37,
    height: 37,
    backgroundColor: COLORS.green,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  footerMarkText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  footerTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10, 24, 16, 0.52)',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D7E0DA',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalEyebrow: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    marginTop: 5,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: COLORS.text,
    fontSize: 25,
    lineHeight: 28,
  },
  modalDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  teacherList: {
    flexGrow: 0,
    maxHeight: 360,
  },
  teacherOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 12,
    marginBottom: 9,
  },
  teacherOptionSelected: {
    borderColor: COLORS.green,
    backgroundColor: '#F0FBF4',
  },
  teacherAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EDF2EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  teacherAvatarSelected: {
    backgroundColor: '#D1FAE5',
  },
  teacherAvatarText: {
    color: '#53645A',
    fontSize: 15,
    fontWeight: '900',
  },
  teacherAvatarTextSelected: {
    color: COLORS.greenDark,
  },
  teacherInfo: {
    flex: 1,
    paddingRight: 6,
  },
  teacherName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
  },
  teacherMeta: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  teacherEmail: {
    color: '#849188',
    fontSize: 9,
    marginTop: 3,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B8C5BC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.green,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },
  emptyTeacher: {
    paddingVertical: 25,
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 17,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F3',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#42544A',
    fontSize: 12,
    fontWeight: '900',
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: COLORS.green,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
