import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { auth } from '../config/firebase';
import { apiRequest, getCurrentUser } from '../services/api';
import { logoutAndClearPushToken } from '../services/notificationService';
import styles from './ClusterHeadDashboardScreen.styles';

/* ----------------------------- CONSTANTS ----------------------------- */

const FILTERS = [
  { label: 'All', value: 'all', icon: '📚' },
  { label: 'Escalated', value: 'escalated', icon: '🚨' },
  { label: 'Pending', value: 'pending', icon: '⏳' },
  { label: 'Assigned', value: 'assigned', icon: '👤' },
  { label: 'In Progress', value: 'in_progress', icon: '⚙️' },
  { label: 'Resolved', value: 'resolved', icon: '✅' },
];

const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Priority', value: 'priority' },
];

const STATUS_BADGE = {
  pending: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', label: 'Pending', dot: '#F59E0B' },
  assigned: { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE', label: 'Assigned', dot: '#6366F1' },
  in_progress: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'In Progress', dot: '#3B82F6' },
  resolved: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: 'Resolved', dot: '#10B981' },
  rejected: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', label: 'Rejected', dot: '#EF4444' },
};

const PRIORITY_BADGE = {
  critical: { stripe: '#DC2626', label: 'CRITICAL', bg: '#FEF2F2', text: '#DC2626' },
  high: { stripe: '#D97706', label: 'HIGH', bg: '#FFFBEB', text: '#B45309' },
  medium: { stripe: '#14B8A6', label: 'MEDIUM', bg: '#F0FDFA', text: '#0F766E' },
  low: { stripe: '#94A3B8', label: 'LOW', bg: '#F1F5F9', text: '#475569' },
};

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
const OVERDUE_MS = 3 * 24 * 60 * 60 * 1000;
const WORKLOAD_CAPACITY = 5;

// To use your real logo file: const LOGO_SOURCE = require('../../assets/logo.png');
const LOGO_SOURCE = null;

const useNow = (intervalMs = 60000) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};

/* ------------------------------ HELPERS ------------------------------ */

const getId = (value) => {
  if (!value) return '';
  return typeof value === 'object' ? value._id || '' : String(value);
};

const isEscalatedIssue = (issue) =>
  Number(issue.escalationLevel || 0) > 0 || issue.priority === 'critical';

const timeAgo = (date, now) => {
  if (!date) return '';
  const diff = (now ?? Date.now()) - new Date(date).getTime();
  if (Number.isNaN(diff) || diff < 0) return 'just now';
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ------------------------------ LOGO ------------------------------ */

function CampusSetuLogo() {
  return (
    <View style={styles.logoRow}>
      {LOGO_SOURCE ? (
        <Image source={LOGO_SOURCE} style={styles.logoImg} resizeMode="contain" />
      ) : (
        <View style={styles.logoMark}>
          <View style={styles.logoGlyph}>
            <View style={styles.logoArch} />
            <View style={[styles.logoHanger, { left: 8 }]} />
            <View style={[styles.logoHanger, { left: 15 }]} />
            <View style={styles.logoDeck} />
          </View>
        </View>
      )}
      <View style={{ flexShrink: 1 }}>
        <Text style={styles.logoWord} numberOfLines={1}>
          Campus<Text style={styles.logoWordAccent}>Setu</Text>
        </Text>
        <Text style={styles.logoTag} numberOfLines={1}>
          BRIDGING STUDENTS &amp; SOLUTIONS
        </Text>
      </View>
    </View>
  );
}

/* ------------------------- COMPLAINT CARD ------------------------- */

const ComplaintCard = memo(function ComplaintCard({
  issue,
  width,
  escalatingId,
  now,
  onAssign,
  onEscalate,
  onReview,
  onPreview,
}) {
  const status = STATUS_BADGE[issue.status] || STATUS_BADGE.pending;
  const priority = PRIORITY_BADGE[issue.priority] || PRIORITY_BADGE.medium;
  const critical = isEscalatedIssue(issue);
  const complaintId = issue.complaintId || issue._id?.slice(-6) || 'N/A';
  const teacher =
    issue.assignedTo && typeof issue.assignedTo === 'object' ? issue.assignedTo : null;
  const closed = ['resolved', 'rejected'].includes(issue.status);
  const createdAtMs = issue.createdAt ? new Date(issue.createdAt).getTime() : 0;
  const overdue = !closed && createdAtMs > 0 && now - createdAtMs > OVERDUE_MS;
  const busy = escalatingId === issue._id;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={() => onReview(issue)}
      style={[styles.complaintCard, width ? { width } : null]}
    >
      <View
        style={[styles.priorityStripe, { backgroundColor: critical ? '#DC2626' : priority.stripe }]}
      />

      <View style={styles.cardTopRow}>
        <View style={styles.cardIdPill}>
          <Text style={styles.cardIdText}>#{complaintId}</Text>
        </View>
        <View style={styles.cardBadgesRight}>
          {critical ? (
            <View style={styles.criticalBadge}>
              <Text style={styles.criticalBadgeText}>🚨 ESCALATED</Text>
            </View>
          ) : (
            <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.priorityText, { color: priority.text }]}>{priority.label}</Text>
            </View>
          )}
          <View
            style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}
          >
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.complaintTitle} numberOfLines={2}>
        {issue.title || 'Untitled Complaint'}
      </Text>
      {issue.description ? (
        <Text style={styles.complaintDesc} numberOfLines={3}>
          {issue.description}
        </Text>
      ) : null}

      <View style={styles.metaChipsWrap}>
        {issue.building || issue.roomNumber ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText} numberOfLines={1}>
              📍{' '}
              {[issue.building, issue.roomNumber && `Room ${issue.roomNumber}`]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
        ) : null}
        {issue.category ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>🏷️ {issue.category}</Text>
          </View>
        ) : null}
        {issue.department ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>📨 To: {issue.department}</Text>
          </View>
        ) : null}
        {issue.reportedBy?.name ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText} numberOfLines={1}>
              👤 {issue.reportedBy.name}
              {issue.reportedBy.department ? ` (${issue.reportedBy.department})` : ''}
            </Text>
          </View>
        ) : null}
        <View style={[styles.metaChip, overdue && styles.metaChipOverdue]}>
          <Text style={[styles.metaChipText, overdue && styles.metaChipOverdueText]}>
            {overdue ? '⚠️ Overdue • ' : '🕒 '}
            {timeAgo(issue.createdAt, now)}
          </Text>
        </View>
      </View>

      <View style={[styles.assignedBox, !teacher && styles.assignedBoxEmpty]}>
        <View style={[styles.assignedAvatar, !teacher && styles.assignedAvatarEmpty]}>
          <Text style={[styles.assignedAvatarText, !teacher && { color: '#FFFFFF' }]}>
            {teacher ? (teacher.name || 'T').charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.assignedInfo}>
          <Text style={[styles.assignedLabel, !teacher && { color: '#B45309' }]}>
            {teacher ? 'ASSIGNED STAFF' : 'AWAITING DISPATCH'}
          </Text>
          <Text style={styles.assignedName} numberOfLines={1}>
            {teacher?.name || 'No staff assigned yet'}
          </Text>
          {teacher?.department || teacher?.email ? (
            <Text style={styles.assignedDept} numberOfLines={1}>
              {[teacher.department, teacher.email].filter(Boolean).join(' • ')}
            </Text>
          ) : null}
        </View>
      </View>

      {issue.photoUrl || issue.resolutionPhotoUrl ? (
        <View style={styles.photosRow}>
          {issue.photoUrl ? (
            <TouchableOpacity
              style={styles.photoThumbBtn}
              onPress={() => onPreview(issue.photoUrl)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="View complaint photo"
            >
              <Image source={{ uri: issue.photoUrl }} style={styles.photoThumb} resizeMode="cover" />
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>Report</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {issue.resolutionPhotoUrl ? (
            <TouchableOpacity
              style={styles.photoThumbBtn}
              onPress={() => onPreview(issue.resolutionPhotoUrl)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="View resolution proof"
            >
              <Image
                source={{ uri: issue.resolutionPhotoUrl }}
                style={styles.photoThumb}
                resizeMode="cover"
              />
              <View style={[styles.photoBadge, styles.photoBadgeProof]}>
                <Text style={styles.photoBadgeText}>✓ Proof</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.btnReassign} onPress={() => onAssign(issue)} activeOpacity={0.82}>
          <Text style={styles.btnReassignText}>
            {issue.assignedTo ? '↻ Reassign' : '＋ Assign Faculty'}
          </Text>
        </TouchableOpacity>

        {!critical && !closed ? (
          <TouchableOpacity
            style={styles.btnEscalate}
            onPress={() => onEscalate(issue)}
            disabled={busy}
            activeOpacity={0.82}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text style={styles.btnEscalateText}>🚨 Escalate</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.btnReview} onPress={() => onReview(issue)} activeOpacity={0.82}>
          <Text style={styles.btnReviewText}>Case Review →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

/* ------------------------------ SCREEN ------------------------------ */

export default function ClusterHeadDashboardScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 700;
  const isDesktop = width >= 1000;
  const narrow = width < 340;

  const now = useNow();
  const [issues, setIssues] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');

  const [escalatingId, setEscalatingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const progressAnim = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  /* ------------------------------ DATA ------------------------------ */

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
        throw new Error(teachersRes.message || 'Could not load staff.');
      }

      setIssues(Array.isArray(issuesRes?.issues) ? issuesRes.issues : []);
      setTeachers(Array.isArray(teachersRes?.teachers) ? teachersRes.teachers : []);
      setUser(userRes?.user || userRes || null);
    } catch (err) {
      console.error('Cluster Head dashboard load error:', err);
      setError(err?.message || 'Failed to load cluster records.');
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [loadData])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  /* ----------------------------- ACTIONS ----------------------------- */

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      `Signed in as Cluster Head ${user?.name || ''}. Are you sure you wish to sign out?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutAndClearPushToken(auth);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (err) {
              Alert.alert('Sign out error', err.message || 'Unable to sign out.');
            }
          },
        },
      ]
    );
  };

  const openAssignModal = useCallback((issue) => {
    setSelectedIssue(issue);
    setSelectedTeacherId(getId(issue.assignedTo));
    setFacultySearch('');
    setAssignModalOpen(true);
  }, []);

  const openReview = useCallback(
    (issue) => navigation.navigate('OfficialIssueDetails', { issueId: issue._id }),
    [navigation]
  );

  const closeAssignModal = () => {
    if (!submittingAssign) setAssignModalOpen(false);
  };

  const handleAssignSubmit = async () => {
    if (!selectedIssue || !selectedTeacherId || submittingAssign) return;

    setSubmittingAssign(true);
    try {
      const response = await apiRequest(`/issues/${selectedIssue._id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });
      if (!response?.success) throw new Error(response?.message || 'Assignment failed.');

      const teacher = teachers.find((t) => t._id === selectedTeacherId);
      const complaintLabel = selectedIssue.complaintId || '';

      setAssignModalOpen(false);
      setSelectedIssue(null);
      setSelectedTeacherId('');

      Alert.alert(
        'Assignment Saved',
        `Complaint ${complaintLabel} assigned to ${teacher?.name || 'the selected staff member'}.`
      );
      await loadData(false);
    } catch (err) {
      Alert.alert('Assignment failed', err.message || 'Please try again.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleEscalate = useCallback(
    (issue) => {
      if (escalatingId) return;
      const identifier = issue.complaintId || issue._id?.slice(-6) || 'Complaint';

      Alert.alert(
        'Escalate Grievance?',
        `Escalate ${identifier} to Critical Priority and notify higher governance?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Escalate',
            style: 'destructive',
            onPress: async () => {
              setEscalatingId(issue._id);
              try {
                const response = await apiRequest(`/issues/${issue._id}/escalate`, {
                  method: 'POST',
                  body: JSON.stringify({
                    note: 'Escalated by Cluster Head via mobile operational portal',
                  }),
                });
                if (!response?.success) throw new Error(response?.message || 'Escalation failed.');

                Alert.alert('Escalated', 'Complaint priority was raised successfully.');
                await loadData(false);
              } catch (err) {
                Alert.alert('Escalation failed', err.message || 'Please try again.');
              } finally {
                setEscalatingId(null);
              }
            },
          },
        ]
      );
    },
    [escalatingId, loadData]
  );

  /* ---------------------------- ANALYTICS ---------------------------- */

  const teacherWorkload = useMemo(() => {
    const result = {};
    issues.forEach((issue) => {
      const teacherId = getId(issue.assignedTo);
      if (!teacherId) return;
      if (['assigned', 'in_progress'].includes(issue.status)) {
        result[teacherId] = (result[teacherId] || 0) + 1;
      }
    });
    return result;
  }, [issues]);

  const stats = useMemo(() => {
    let pending = 0;
    let assigned = 0;
    let inProgress = 0;
    let resolved = 0;
    let escalated = 0;
    let overdue = 0;
    let unassigned = 0;

    issues.forEach((i) => {
      if (i.status === 'pending') pending += 1;
      else if (i.status === 'assigned') assigned += 1;
      else if (i.status === 'in_progress') inProgress += 1;
      else if (i.status === 'resolved') resolved += 1;

      if (isEscalatedIssue(i)) escalated += 1;

      const closed = ['resolved', 'rejected'].includes(i.status);
      const created = new Date(i.createdAt || 0).getTime();
      if (!closed && created && now - created > OVERDUE_MS) overdue += 1;
      if (!closed && !getId(i.assignedTo)) unassigned += 1;
    });

    return {
      total: issues.length,
      pending,
      assigned,
      inProgress,
      resolved,
      escalated,
      overdue,
      unassigned,
      resolutionRate: issues.length ? Math.round((resolved / issues.length) * 100) : 0,
    };
  }, [issues, now]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: stats.resolutionRate,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [stats.resolutionRate, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const filterCounts = useMemo(
    () => ({
      all: stats.total,
      escalated: stats.escalated,
      pending: stats.pending,
      assigned: stats.assigned,
      in_progress: stats.inProgress,
      resolved: stats.resolved,
    }),
    [stats]
  );

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();

    const list = issues.filter((issue) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'escalated'
            ? isEscalatedIssue(issue)
            : issue.status === activeFilter;
      if (!matchesFilter) return false;
      if (!term) return true;

      const searchable = [
        issue.complaintId,
        issue.title,
        issue.description,
        issue.category,
        issue.building,
        issue.roomNumber,
        issue.reportedBy?.name,
        issue.reportedBy?.usn,
        issue.assignedTo?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });

    const time = (i) => new Date(i.createdAt || 0).getTime();
    const rank = (i) => (isEscalatedIssue(i) ? 5 : PRIORITY_RANK[i.priority] || 2);

    return [...list].sort((a, b) => {
      if (sortBy === 'oldest') return time(a) - time(b);
      if (sortBy === 'priority') return rank(b) - rank(a) || time(b) - time(a);
      return time(b) - time(a);
    });
  }, [issues, activeFilter, search, sortBy]);

  const filteredFaculty = useMemo(() => {
    const term = facultySearch.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((teacher) =>
      [teacher.name, teacher.department, teacher.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [teachers, facultySearch]);

  const sortedWorkloadTeachers = useMemo(
    () =>
      [...teachers].sort(
        (a, b) => (teacherWorkload[a._id] || 0) - (teacherWorkload[b._id] || 0)
      ),
    [teachers, teacherWorkload]
  );

  /* ----------------------------- LAYOUT ----------------------------- */

  const contentWidth = Math.min(width, 1100) - 36;
  const kpiCols = narrow ? 1 : isTablet ? 4 : 2;
  const kpiTileWidth = Math.floor((contentWidth - 11 * (kpiCols - 1)) / kpiCols);
  const cardCols = isDesktop ? 2 : 1;
  const cardWidth = cardCols === 2 ? Math.floor((contentWidth - 14) / 2) : undefined;

  const userName = user?.name || 'Cluster Head';
  const initial = userName.charAt(0).toUpperCase();

  const hasActiveFilters = activeFilter !== 'all' || !!search.trim();
  const resetFilters = () => {
    setActiveFilter('all');
    setSearch('');
  };

  const kpiTiles = [
    { key: 'escalated', icon: '🚨', label: 'Escalated / Critical', value: stats.escalated, color: '#DC2626', bg: '#FEE2E2', tag: stats.escalated > 0 ? 'URGENT' : null },
    { key: 'pending', icon: '⏳', label: 'Pending Triage', value: stats.pending, color: '#D97706', bg: '#FEF3C7', tag: stats.unassigned > 0 ? `${stats.unassigned} UNASSIGNED` : null },
    { key: 'in_progress', icon: '⚙️', label: 'In Active Progress', value: stats.inProgress, color: '#2563EB', bg: '#DBEAFE', tag: null },
    { key: 'resolved', icon: '✅', label: 'Closed / Resolved', value: stats.resolved, color: '#059669', bg: '#DCFCE7', tag: null },
  ];

  const sheetStyle = [
    styles.modalCard,
    { maxHeight: Math.min(height * 0.9, 760) },
    isTablet
      ? styles.modalCardWide
      : { paddingBottom: 18 + insets.bottom },
  ];

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B2723" translucent={false} />

      {/* Dark top safe area + app bar so the status bar never blends with content */}
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <View style={styles.appBar}>
          <CampusSetuLogo />
          <View style={styles.pulsePill}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>{isTablet ? 'Operations Live' : 'Live'}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingBottom: 48 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
            colors={['#14B8A6']}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ======================= HERO ======================= */}
          <View style={styles.hero}>
            <View pointerEvents="none" style={styles.heroDecor} />
            <View pointerEvents="none" style={styles.heroDecorRing} />

            <View style={isTablet ? styles.heroBodyWide : null}>
              <View style={isTablet ? { flex: 1 } : null}>
                <View style={styles.eyebrowRow}>
                  <View style={styles.eyebrowMark} />
                  <Text style={styles.kicker}>CLUSTER OPERATIONS</Text>
                </View>
                <Text style={styles.greetingText}>{greeting()},</Text>
                <Text style={styles.headTitle} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.heroSubtitle}>
                  Your command centre for cross-department grievance resolution, faculty dispatch
                  and campus accountability.
                </Text>
              </View>

              <View
                style={[
                  styles.alertStrip,
                  stats.escalated === 0 && stats.overdue === 0 && styles.alertStripOk,
                  isTablet && { marginTop: 0, maxWidth: 320 },
                ]}
              >
                <Text style={styles.alertStripTitle}>
                  {stats.escalated > 0 || stats.overdue > 0 ? 'Needs your attention' : 'All clear'}
                </Text>
                <Text style={styles.alertStripText}>
                  {stats.escalated > 0 || stats.overdue > 0
                    ? `${stats.escalated} escalated • ${stats.overdue} overdue • ${stats.unassigned} unassigned`
                    : 'No escalated or overdue grievances.'}
                </Text>
              </View>
            </View>

            <View style={styles.heroActionRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleIcon}>✦</Text>
                <Text style={styles.roleBadgeText}>Cluster Leadership</Text>
              </View>

              <View style={styles.avatarGroup}>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarBadgeText}>{initial}</Text>
                </View>
                <TouchableOpacity
                  style={styles.signOutBtn}
                  onPress={handleSignOut}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                >
                  <Text style={styles.signOutBtnText}>Sign Out</Text>
                  <Text style={styles.signOutArrow}>↗</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* QUICK ACTIONS: REPORT ISSUE & MY REPORTS & REPORTS */}
          <View style={{ marginTop: 12, gap: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1E293B',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 16,
                shadowColor: '#0F172A',
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => navigation.navigate('ReportIssue')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Report a campus issue or grievance"
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>＋</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                  Report an Issue / Grievance
                </Text>
                <Text style={{ color: '#CBD5E1', fontSize: 11, marginTop: 2 }}>
                  Submit a complaint or campus facility request
                </Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900' }}>→</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
                onPress={() => navigation.navigate('MyReports')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="View my reported complaints"
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>📋</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#15233B', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                    My Reports
                  </Text>
                  <Text style={{ color: '#64748B', fontSize: 10 }}>Track your reports</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(17, 96, 83, 0.08)',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(17, 96, 83, 0.2)',
                }}
                onPress={() => navigation.navigate('Reports')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open leadership PDF reports"
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#0F766E', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                    PDF Reports
                  </Text>
                  <Text style={{ color: '#0F766E', fontSize: 10 }}>Export metrics</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================= ERROR (with data) ======================= */}
          {error && !loading && issues.length > 0 ? (
            <View style={styles.errorBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.errorTitle}>Couldn&apos;t refresh data</Text>
                <Text style={styles.errorText} numberOfLines={2}>
                  {error}
                </Text>
              </View>
              <TouchableOpacity style={styles.errorRetryBtn} onPress={() => loadData(true)}>
                <Text style={styles.errorRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ======================= HEALTH ======================= */}
          <View style={styles.heroMetricCard}>
            <View style={styles.heroMetricRow}>
              <View style={styles.metricHeadingCopy}>
                <Text style={styles.heroMetricTitle}>Cluster Grievance Health</Text>
                <Text style={styles.metricCaption}>Resolution performance</Text>
              </View>
              <View style={styles.heroMetricBadge}>
                <Text style={styles.heroMetricBadgeText}>{stats.resolutionRate}% Resolved</Text>
              </View>
            </View>

            <Text style={styles.heroBigNumber}>
              {stats.resolved}
              <Text style={styles.heroBigNumberSub}> / {stats.total}</Text>
            </Text>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.progressMetaRow}>
              <Text style={styles.progressMetaLabel}>complaints resolved</Text>
              <Text
                style={[
                  styles.progressMetaVal,
                  stats.escalated === 0 && styles.progressNormal,
                ]}
              >
                {stats.escalated > 0 ? `🚨 ${stats.escalated} Escalated` : '✓ All Normal'}
              </Text>
            </View>
          </View>

          {/* ======================= KPI ======================= */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Operations Overview</Text>
            <Text style={styles.sectionSubtitle}>Tap any metric to filter the complaints below.</Text>
          </View>

          <View style={styles.kpiGrid}>
            {kpiTiles.map((tile) => (
              <TouchableOpacity
                key={tile.key}
                style={[
                  styles.kpiTile,
                  { width: kpiTileWidth },
                  activeFilter === tile.key && { borderColor: tile.color, borderWidth: 1.5 },
                ]}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(tile.key)}
                accessibilityRole="button"
                accessibilityLabel={`${tile.label}: ${tile.value}. Filter complaints`}
              >
                <View style={styles.kpiTileTop}>
                  <View style={[styles.kpiIconBox, { backgroundColor: tile.bg }]}>
                    <Text style={styles.kpiIconText}>{tile.icon}</Text>
                  </View>
                  {tile.tag ? (
                    <View style={[styles.kpiTag, { backgroundColor: tile.bg }]}>
                      <Text style={[styles.kpiTagText, { color: tile.color }]}>{tile.tag}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.kpiValue, { color: tile.color }]}>{tile.value}</Text>
                <Text style={styles.kpiLabel} numberOfLines={1}>
                  {tile.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ======================= STAFF WORKLOAD ======================= */}
          {teachers.length > 0 ? (
            <View style={styles.workloadSection}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Staff Workload</Text>
                <Text style={styles.sectionSubtitle}>
                  Active tickets per staff member • least busy first.
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.workloadScroll}
                contentContainerStyle={styles.workloadContent}
              >
                {sortedWorkloadTeachers.map((teacher) => {
                  const count = teacherWorkload[teacher._id] || 0;
                  const busy = count > 3;
                  const barColor = count === 0 ? '#10B981' : busy ? '#EF4444' : '#F59E0B';
                  return (
                    <View key={teacher._id} style={styles.workloadCard}>
                      <View style={styles.workloadTop}>
                        <View style={styles.workloadAvatar}>
                          <Text style={styles.workloadAvatarText}>
                            {(teacher.name || 'S').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.workloadNameContainer}>
                          <Text style={styles.workloadName} numberOfLines={1}>
                            {teacher.name || 'Staff'}
                          </Text>
                          <Text style={styles.workloadDepartment} numberOfLines={1}>
                            {teacher.department || 'General Staff'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.workloadBarTrack}>
                        <View
                          style={[
                            styles.workloadBarFill,
                            {
                              width: `${Math.max(count === 0 ? 0 : 8, Math.min(count / WORKLOAD_CAPACITY, 1) * 100)}%`,
                              backgroundColor: barColor,
                            },
                          ]}
                        />
                      </View>

                      <View style={styles.workloadFoot}>
                        <View style={[styles.workloadBadge, busy && styles.workloadBadgeBusy]}>
                          <Text style={[styles.workloadBadgeText, busy && styles.workloadBadgeTextBusy]}>
                            {count === 0 ? '✓ Available' : `${count} active`}
                          </Text>
                        </View>
                        <Text style={styles.workloadCap}>{count}/{WORKLOAD_CAPACITY}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* ======================= SEARCH ======================= */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search ID, title, student..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
              accessibilityLabel="Search complaints"
            />
            {search.length > 0 ? (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => setSearch('')}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Text style={styles.clearBtnText}>×</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* ======================= FILTERS ======================= */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map((item) => {
              const active = activeFilter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setActiveFilter(item.value)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {item.icon} {item.label}
                  </Text>
                  <View style={[styles.filterCountBadge, active && styles.filterCountBadgeActive]}>
                    <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                      {filterCounts[item.value]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ======================= SORT ======================= */}
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>SORT</Text>
            {SORTS.map((s) => {
              const active = sortBy === s.value;
              return (
                <TouchableOpacity
                  key={s.value}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                  onPress={() => setSortBy(s.value)}
                >
                  <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {hasActiveFilters ? (
              <TouchableOpacity onPress={resetFilters} style={[styles.linkBtn, { marginLeft: 'auto' }]}>
                <Text style={styles.linkBtnText}>Reset all</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* ======================= LIST ======================= */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Cluster Workload ({filteredIssues.length})</Text>
            <Text style={styles.sectionSubtitle}>
              Review, dispatch, reassign and escalate complaints.
            </Text>
          </View>

          {loading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator size="large" color="#14B8A6" />
              <Text style={styles.emptyTitle}>Loading cluster records…</Text>
              <Text style={styles.emptyDesc}>Please wait while your dashboard is updated.</Text>
            </View>
          ) : error && issues.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyTitle}>Unable to load records</Text>
              <Text style={styles.emptyDesc}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => loadData(true)}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredIssues.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptyDesc}>No complaints match your current search or filter.</Text>
              {hasActiveFilters ? (
                <TouchableOpacity style={styles.retryButton} onPress={resetFilters}>
                  <Text style={styles.retryButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={[styles.complaintList, cardCols === 2 && styles.complaintListGrid]}>
              {filteredIssues.map((issue) => (
                <ComplaintCard
                  key={issue._id}
                  issue={issue}
                  width={cardWidth}
                  escalatingId={escalatingId}
                  now={now}
                  onAssign={openAssignModal}
                  onEscalate={handleEscalate}
                  onReview={openReview}
                  onPreview={setPreviewImage}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ======================= ASSIGN MODAL ======================= */}
      <Modal
        visible={assignModalOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeAssignModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalBackdrop, isTablet && styles.modalBackdropWide]}>
            <View style={sheetStyle}>
              {!isTablet ? <View style={styles.modalHandle} /> : null}

              <View style={styles.modalHead}>
                <View style={styles.modalHeadingCopy}>
                  <Text style={styles.modalEyebrow}>CAMPUSSETU • DISPATCH CONTROL</Text>
                  <Text style={styles.modalTitle}>
                    {selectedIssue?.assignedTo ? 'Reassign Complaint' : 'Assign Staff'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={closeAssignModal}
                  disabled={submittingAssign}
                  accessibilityRole="button"
                  accessibilityLabel="Close assignment dialog"
                >
                  <Text style={styles.modalCloseBtnText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalComplaintContext}>
                <Text style={styles.modalContextId}>
                  #{selectedIssue?.complaintId || selectedIssue?._id?.slice(-6) || 'N/A'}
                </Text>
                <Text style={styles.modalContextTitle} numberOfLines={2}>
                  {selectedIssue?.title || 'Complaint assignment'}
                </Text>
                <Text style={styles.modalContextAssignee}>
                  {selectedIssue?.assignedTo
                    ? `Current: ${selectedIssue.assignedTo?.name || 'Assigned staff'}`
                    : 'Currently unassigned'}
                </Text>
              </View>

              <TextInput
                style={styles.facultySearchInput}
                placeholder="Search staff by name, email, department…"
                placeholderTextColor="#94A3B8"
                value={facultySearch}
                onChangeText={setFacultySearch}
                returnKeyType="search"
                autoCorrect={false}
              />

              <ScrollView
                style={styles.facultyList}
                contentContainerStyle={styles.facultyListContent}
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {filteredFaculty.length === 0 ? (
                  <View style={styles.noFaculty}>
                    <Text style={styles.noFacultyTitle}>No staff found</Text>
                    <Text style={styles.noFacultyText}>Try a different name or department.</Text>
                  </View>
                ) : (
                  filteredFaculty.map((teacher) => {
                    const selected = selectedTeacherId === teacher._id;
                    const count = teacherWorkload[teacher._id] || 0;
                    return (
                      <TouchableOpacity
                        key={teacher._id}
                        style={[styles.facultyOption, selected && styles.facultyOptionSelected]}
                        onPress={() => setSelectedTeacherId(teacher._id)}
                        activeOpacity={0.82}
                      >
                        <View style={[styles.facultyAvatar, selected && styles.facultyAvatarSelected]}>
                          <Text
                            style={[styles.facultyAvatarText, selected && styles.facultyAvatarTextSelected]}
                          >
                            {(teacher.name || 'S').charAt(0).toUpperCase()}
                          </Text>
                        </View>

                        <View style={styles.facultyMetaCol}>
                          <Text style={styles.facultyName} numberOfLines={1}>
                            {teacher.name || 'Staff Member'}
                          </Text>
                          <Text style={styles.facultyDept} numberOfLines={1}>
                            {[teacher.department, teacher.email].filter(Boolean).join(' • ') ||
                              'General Staff'}
                          </Text>
                          <Text
                            style={[styles.facultyWorkload, count > 3 && styles.facultyWorkloadBusy]}
                          >
                            {count === 0 ? '✓ Available' : `${count} active tickets`}
                          </Text>
                        </View>

                        <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                          {selected ? <View style={styles.radioDot} /> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.btnModalCancel}
                  onPress={closeAssignModal}
                  disabled={submittingAssign}
                >
                  <Text style={styles.btnModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btnModalConfirm,
                    (!selectedTeacherId || submittingAssign) && styles.btnModalConfirmDisabled,
                  ]}
                  onPress={handleAssignSubmit}
                  disabled={!selectedTeacherId || submittingAssign}
                >
                  {submittingAssign ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.btnModalConfirmText}>
                      {selectedIssue?.assignedTo ? 'Confirm Reassignment' : 'Confirm Assignment'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================= IMAGE PREVIEW ======================= */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.imageModalBackdrop}>
          <TouchableOpacity
            style={[styles.closeImageBtn, { top: insets.top + 12 }]}
            onPress={() => setPreviewImage(null)}
            accessibilityRole="button"
            accessibilityLabel="Close photo preview"
          >
            <Text style={styles.closeImageBtnText}>×</Text>
          </TouchableOpacity>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}