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
import styles from './PrincipalDashboardScreen.styles';

/* ----------------------------- CONSTANTS ----------------------------- */

const FILTERS = [
  { label: 'All', value: 'all', icon: '📚' },
  { label: 'Critical', value: 'critical', icon: '🚨' },
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
  critical: { stripe: '#DC2626', label: 'CRITICAL' },
  high: { stripe: '#D97706', label: 'HIGH' },
  medium: { stripe: '#16A34A', label: 'MEDIUM' },
  low: { stripe: '#94A3B8', label: 'LOW' },
};

const PRIORITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };
const SEGMENT_ORDER = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
const DEPT_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
const OVERDUE_MS = 3 * 24 * 60 * 60 * 1000;

const useNow = (intervalMs = 60000) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};

/* ------------------------------ HELPERS ------------------------------ */

const isIssueCritical = (issue) =>
  issue.priority === 'critical' || (issue.escalationLevel || 0) > 0;

const getDept = (issue) =>
  issue.department ||
  issue.reportedBy?.department ||
  issue.category ||
  'General';

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

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ------------------------------ LOGO ------------------------------ */

// To use your real logo file, set e.g.: const LOGO_SOURCE = require('../../assets/logo.png');
const LOGO_SOURCE = null;

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
      <View>
        <Text style={styles.logoWord}>
          Campus<Text style={styles.logoWordAccent}>Setu</Text>
        </Text>
        <Text style={styles.logoTag}>EXECUTIVE GOVERNANCE</Text>
      </View>
    </View>
  );
}

/* ------------------------- COMPLAINT CARD ------------------------- */

const ComplaintCard = memo(function ComplaintCard({
  issue,
  width,
  actionLoadingId,
  now,
  onAssign,
  onEscalate,
  onReview,
  onPreview,
}) {
  const statusCfg = STATUS_BADGE[issue.status] || STATUS_BADGE.pending;
  const prioCfg = PRIORITY_BADGE[issue.priority] || PRIORITY_BADGE.medium;
  const critical = isIssueCritical(issue);
  const complaintId = issue.complaintId || issue._id?.slice(-6) || 'N/A';
  const teacher = issue.assignedTo;
  const closed = ['resolved', 'rejected'].includes(issue.status);
  const createdAtMs = issue.createdAt ? new Date(issue.createdAt).getTime() : 0;
  const overdue = !closed && createdAtMs > 0 && now - createdAtMs > OVERDUE_MS;
  const busy = actionLoadingId === issue._id;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onReview(issue)}
      style={[styles.complaintCard, width ? { width } : null]}
    >
      <View
        style={[
          styles.priorityStripe,
          { backgroundColor: critical ? '#DC2626' : prioCfg.stripe },
        ]}
      />

      <View style={styles.cardTopRow}>
        <View style={styles.cardIdPill}>
          <Text style={styles.cardIdText}>#{complaintId}</Text>
        </View>
        <View style={styles.cardBadgesRight}>
          {critical ? (
            <View style={[styles.priorityBadge, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.priorityText, { color: '#DC2626' }]}>🚨 Critical</Text>
            </View>
          ) : null}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusCfg.bg, borderColor: statusCfg.border },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusCfg.dot }]} />
            <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.complaintTitle} numberOfLines={2}>
        {issue.title || 'Untitled Complaint'}
      </Text>
      {issue.description ? (
        <Text style={styles.complaintDesc} numberOfLines={2}>
          {issue.description}
        </Text>
      ) : null}

      <View style={styles.metaChipsWrap}>
        {issue.building || issue.roomNumber ? (
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText} numberOfLines={1}>
              📍 {[issue.building, issue.roomNumber && `Room ${issue.roomNumber}`]
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
          <Text style={styles.assignedAvatarText}>
            {teacher ? (teacher.name || 'S').charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.assignedInfo}>
          <Text style={[styles.assignedLabel, !teacher && { color: '#B45309' }]}>
            {teacher ? 'ASSIGNED STAFF' : 'STAFF UNASSIGNED'}
          </Text>
          <Text style={styles.assignedName} numberOfLines={1}>
            {teacher?.name || 'No staff assigned yet'}
          </Text>
          {teacher?.department ? (
            <Text style={styles.assignedDept} numberOfLines={1}>
              {teacher.department}
              {teacher.email ? ` • ${teacher.email}` : ''}
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
            >
              <Image
                source={{ uri: issue.resolutionPhotoUrl }}
                style={styles.photoThumb}
                resizeMode="cover"
              />
              <View style={[styles.photoBadge, { backgroundColor: 'rgba(5,150,105,0.9)' }]}>
                <Text style={styles.photoBadgeText}>✓ Proof</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.btnReassign}
          onPress={() => onAssign(issue)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnReassignText}>
            {issue.assignedTo ? '🔄 Reassign' : '👤 Assign'}
          </Text>
        </TouchableOpacity>

        {!critical && !closed ? (
          <TouchableOpacity
            style={styles.btnEscalate}
            onPress={() => onEscalate(issue)}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <Text style={styles.btnEscalateText}>🚨 Escalate</Text>
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.btnReview}
          onPress={() => onReview(issue)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnReviewText}>Full Review →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

/* ------------------------------ SCREEN ------------------------------ */

export default function PrincipalDashboardScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1100;
  const insets = useSafeAreaInsets();
  const now = useNow();

  const [issues, setIssues] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState('staff');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  // Escalate
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Animations
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

      if (Array.isArray(issuesRes?.issues)) setIssues(issuesRes.issues);
      if (Array.isArray(teachersRes?.teachers)) setTeachers(teachersRes.teachers);
      if (userRes?.user) setUser(userRes.user);
    } catch (err) {
      console.error('Principal dashboard load error:', err);
      setError(err?.message || 'Failed to load college-wide records.');
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
      `Signed in as Principal ${user?.name || ''}. Are you sure you wish to sign out?`,
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
              Alert.alert('Sign out error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEscalate = useCallback(
    (issue) => {
      if (actionLoadingId) return;

      Alert.alert(
        'Priority Escalation',
        `Escalate complaint ${issue.complaintId || issue._id} to CRITICAL priority?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Escalate to Critical',
            style: 'destructive',
            onPress: async () => {
              setActionLoadingId(issue._id);
              try {
                const res = await apiRequest(`/issues/${issue._id}/escalate`, {
                  method: 'POST',
                  body: JSON.stringify({
                    note: 'Directly escalated by Principal via executive portal',
                  }),
                });
                if (!res?.success) throw new Error(res?.message || 'Escalation failed');

                Alert.alert('Escalated', 'Complaint has been escalated to Critical Priority.');
                await loadData(false);
              } catch (err) {
                Alert.alert('Escalation Failed', err.message);
              } finally {
                setActionLoadingId(null);
              }
            },
          },
        ]
      );
    },
    [actionLoadingId, loadData]
  );

  const openAssignModal = useCallback((issue) => {
    setSelectedIssue(issue);
    setSelectedTeacherId(issue.assignedTo?._id || issue.assignedTo || '');
    setFacultySearch('');
    setAssignModalOpen(true);
  }, []);

  const openReview = useCallback(
    (issue) => navigation.navigate('OfficialIssueDetails', { issueId: issue._id }),
    [navigation]
  );

  const handleAssignSubmit = async () => {
    if (!selectedIssue || !selectedTeacherId || submittingAssign) return;

    setSubmittingAssign(true);
    try {
      const res = await apiRequest(`/issues/${selectedIssue._id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });
      if (!res?.success) throw new Error(res?.message || 'Assignment failed');

      const assigned = teachers.find((t) => t._id === selectedTeacherId);
      Alert.alert(
        'Assignment Successful',
        `Complaint ${selectedIssue.complaintId || ''} is now assigned to ${
          assigned?.name || 'Selected Staff Member'
        }.`
      );

      setAssignModalOpen(false);
      setSelectedIssue(null);
      setSelectedTeacherId('');
      await loadData(false);
    } catch (err) {
      Alert.alert('Assignment Error', err.message || 'Failed to assign complaint.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleInviteSubmit = async () => {
    if (submittingInvite) return;
    if (!inviteName.trim() || !inviteEmail.trim()) {
      Alert.alert('Missing Details', 'Please provide full name and college email.');
      return;
    }
    if ((inviteRole === 'teacher' || inviteRole === 'staff') && !inviteDept.trim()) {
      Alert.alert(
        'Department required',
        'Choose or enter the department this staff member will serve.'
      );
      return;
    }
    if (!isValidEmail(inviteEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid college email address.');
      return;
    }

    setSubmittingInvite(true);
    try {
      const res = await apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify({
          role: inviteRole,
          name: inviteName.trim(),
          email: inviteEmail.trim().toLowerCase(),
          department: inviteDept.trim(),
          phone: invitePhone.trim(),
        }),
      });

      if (!res?.success && res?.error) throw new Error(res?.message || 'Failed to send invitation');

      Alert.alert(
        'Invitation Sent! ✉️',
        `An onboarding invitation email has been sent to ${inviteEmail
          .trim()
          .toLowerCase()}. They can configure their password and sign in.`
      );

      setInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      setInviteDept('');
      setInvitePhone('');
      await loadData(false);
    } catch (err) {
      Alert.alert('Invitation Failed', err.message || 'Could not send invitation.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  /* ---------------------------- ANALYTICS ---------------------------- */

  const stats = useMemo(() => {
    const counts = { pending: 0, assigned: 0, in_progress: 0, resolved: 0, rejected: 0 };
    let critical = 0;
    let agingCount = 0;
    let unassigned = 0;
    const deptMap = {};

    issues.forEach((item) => {
      if (counts[item.status] !== undefined) counts[item.status] += 1;
      if (isIssueCritical(item)) critical += 1;

      const closed = ['resolved', 'rejected'].includes(item.status);
      const created = new Date(item.createdAt || 0).getTime();
      if (!closed && created && now - created > OVERDUE_MS) agingCount += 1;
      if (!closed && !item.assignedTo) unassigned += 1;

      const dept = getDept(item);
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const total = issues.length;
    const resolutionRate = total ? Math.round((counts.resolved / total) * 100) : 0;
    const topDepartments = Object.entries(deptMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      total,
      ...counts,
      inProgress: counts.in_progress,
      critical,
      agingCount,
      unassigned,
      resolutionRate,
      topDepartments,
      maxDept: topDepartments[0]?.[1] || 1,
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

  const filterCounts = useMemo(
    () => ({
      all: stats.total,
      critical: stats.critical,
      pending: stats.pending,
      assigned: stats.assigned,
      in_progress: stats.inProgress,
      resolved: stats.resolved,
    }),
    [stats]
  );

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = issues.filter((issue) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'critical'
            ? isIssueCritical(issue)
            : issue.status === activeFilter;
      if (!matchesFilter) return false;

      if (selectedDeptFilter && getDept(issue).toLowerCase() !== selectedDeptFilter.toLowerCase()) {
        return false;
      }
      if (!q) return true;

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

      return searchable.includes(q);
    });

    const time = (i) => new Date(i.createdAt || 0).getTime();
    const rank = (i) => (isIssueCritical(i) ? 5 : PRIORITY_RANK[i.priority] || 2);

    return [...list].sort((a, b) => {
      if (sortBy === 'oldest') return time(a) - time(b);
      if (sortBy === 'priority') return rank(b) - rank(a) || time(b) - time(a);
      return time(b) - time(a);
    });
  }, [issues, activeFilter, selectedDeptFilter, search, sortBy]);

  const filteredFaculty = useMemo(() => {
    const term = facultySearch.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(term) ||
        t.department?.toLowerCase().includes(term) ||
        t.email?.toLowerCase().includes(term)
    );
  }, [teachers, facultySearch]);

  /* ----------------------------- LAYOUT ----------------------------- */

  const contentWidth = Math.min(width, 1240) - 32;
  const kpiCols = isTablet ? 4 : 2;
  const kpiTileWidth = Math.floor((contentWidth - 10 * (kpiCols - 1)) / kpiCols);
  const cardCols = isDesktop ? 2 : 1;
  const cardWidth = cardCols === 2 ? Math.floor((contentWidth - 14) / 2) : undefined;
  const analyticsRow = isTablet;

  const userName = user?.name || 'Principal';
  const initial = userName.charAt(0).toUpperCase();

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const modalSheetExtra = isTablet
    ? { alignSelf: 'center', width: 600, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, marginBottom: 24 }
    : null;
  const modalBackdropExtra = isTablet ? { justifyContent: 'center' } : null;

  const hasActiveFilters =
    activeFilter !== 'all' || !!selectedDeptFilter || !!search.trim();

  const resetFilters = () => {
    setActiveFilter('all');
    setSelectedDeptFilter('');
    setSearch('');
  };

  const kpiTiles = [
    { key: 'critical', icon: '🚨', label: 'Critical / Escalated', value: stats.critical, color: '#DC2626', bg: '#FEE2E2', tag: stats.critical > 0 ? 'ACTION REQ' : null },
    { key: 'pending', icon: '⏳', label: 'Pending Allocation', value: stats.pending, color: '#D97706', bg: '#FEF3C7', tag: stats.unassigned > 0 ? `${stats.unassigned} UNASSIGNED` : null },
    { key: 'in_progress', icon: '⚙️', label: 'In Active Progress', value: stats.inProgress, color: '#2563EB', bg: '#DBEAFE', tag: null },
    { key: 'resolved', icon: '✅', label: 'Successfully Closed', value: stats.resolved, color: '#059669', bg: '#DCFCE7', tag: null },
  ];

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#062B1F" translucent={false} />

      {/* Dark top safe area + app bar so the status bar never blends with content */}
      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <View style={styles.appBar}>
          <CampusSetuLogo />
          <View style={styles.pulsePill}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>Live</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingBottom: 56 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={['#10B981']}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ======================= EXECUTIVE HEADER ======================= */}
          <View style={styles.execHeader}>
            <View style={styles.execHeaderDecor} />
            <View style={styles.execHeaderDecor2} />

            <View style={isTablet ? styles.headerBodyWide : null}>
              <View style={isTablet ? { flex: 1 } : null}>
                <Text style={styles.greetingText}>
                  {greeting()} • {todayLabel()}
                </Text>
                <Text style={styles.principalName} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.execSubtitle}>
                  Office of the Principal • College-wide Operations &amp; Grievance Redressal
                </Text>
              </View>

              {stats.critical > 0 || stats.agingCount > 0 ? (
                <View style={[styles.alertStrip, isTablet && { marginTop: 0, maxWidth: 320 }]}>
                  <Text style={styles.alertStripTitle}>Needs your attention</Text>
                  <Text style={styles.alertStripText}>
                    {stats.critical} critical • {stats.agingCount} overdue • {stats.unassigned} unassigned
                  </Text>
                </View>
              ) : (
                <View style={[styles.alertStrip, styles.alertStripOk, isTablet && { marginTop: 0, maxWidth: 320 }]}>
                  <Text style={styles.alertStripTitle}>All clear</Text>
                  <Text style={styles.alertStripText}>No overdue or critical grievances.</Text>
                </View>
              )}
            </View>

            <View style={styles.execActionRow}>
              <TouchableOpacity
                style={styles.inviteFacultyBtn}
                activeOpacity={0.8}
                onPress={() => setInviteModalOpen(true)}
              >
                <Text style={styles.inviteFacultyText}>＋ Invite Faculty</Text>
              </TouchableOpacity>

              <View style={styles.avatarGroup}>
                <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
                  <Text style={styles.signOutBtnText}>Sign Out</Text>
                </TouchableOpacity>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarBadgeText}>{initial}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* QUICK ACTIONS: REPORT ISSUE & MY REPORTS & REPORTS */}
          <View style={{ marginTop: 12, gap: 10 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#176B4D',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 16,
                shadowColor: '#176B4D',
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
                  backgroundColor: 'rgba(255,255,255,0.2)',
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
                <Text style={{ color: '#D4F5EC', fontSize: 11, marginTop: 2 }}>
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
                  backgroundColor: '#F0F8F1',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#D5E7D9',
                }}
                onPress={() => navigation.navigate('Reports')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open leadership PDF reports"
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>📊</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#176B4D', fontSize: 12, fontWeight: '700' }} numberOfLines={1}>
                    PDF Reports
                  </Text>
                  <Text style={{ color: '#718078', fontSize: 10 }}>Export metrics</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================= ERROR BANNER ======================= */}
          {error ? (
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

          {/* ======================= HEALTH + STATUS MIX ======================= */}
          <View style={analyticsRow ? styles.analyticsRow : null}>
            <View style={[styles.heroMetricCard, analyticsRow && { flex: 1, marginBottom: 18 }]}>
              <View style={styles.heroMetricRow}>
                <Text style={styles.heroMetricTitle}>Campus Grievance Health</Text>
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
                <Text style={styles.progressMetaLabel}>grievances resolved</Text>
                <Text
                  style={[
                    styles.progressMetaVal,
                    { color: stats.agingCount > 0 ? '#B45309' : '#059669' },
                  ]}
                >
                  {stats.agingCount > 0 ? `⚠️ ${stats.agingCount} Overdue (>72h)` : '✓ SLA On Track'}
                </Text>
              </View>
            </View>

            <View style={[styles.heroMetricCard, analyticsRow && { flex: 1, marginLeft: 14, marginBottom: 18 }]}>
              <View style={styles.heroMetricRow}>
                <Text style={styles.heroMetricTitle}>Status Distribution</Text>
                <Text style={styles.sectionSubtitle}>{stats.total} total</Text>
              </View>

              <View style={styles.segmentBar}>
                {stats.total === 0 ? (
                  <View style={[styles.segment, { flex: 1, backgroundColor: '#E2E8F0' }]} />
                ) : (
                  SEGMENT_ORDER.filter((s) => stats[s] > 0).map((s) => (
                    <View
                      key={s}
                      style={[styles.segment, { flex: stats[s], backgroundColor: STATUS_BADGE[s].dot }]}
                    />
                  ))
                )}
              </View>

              <View style={styles.legendWrap}>
                {SEGMENT_ORDER.map((s) => (
                  <View key={s} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: STATUS_BADGE[s].dot }]} />
                    <Text style={styles.legendText}>
                      {STATUS_BADGE[s].label} <Text style={styles.legendCount}>{stats[s]}</Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* ======================= KPI GRID ======================= */}
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
              >
                <View style={styles.kpiTileTop}>
                  <View style={[styles.kpiIconBox, { backgroundColor: tile.bg }]}>
                    <Text style={styles.kpiIconText}>{tile.icon}</Text>
                  </View>
                  {tile.tag ? (
                    <View style={[styles.priorityBadge, { backgroundColor: tile.bg }]}>
                      <Text style={[styles.priorityText, { color: tile.color }]}>{tile.tag}</Text>
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

          {/* ======================= DEPARTMENTS ======================= */}
          {stats.topDepartments.length > 0 ? (
            <View style={styles.panelCard}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>Department Overview</Text>
                  <Text style={styles.sectionSubtitle}>Tap a department to filter</Text>
                </View>
                {selectedDeptFilter ? (
                  <TouchableOpacity onPress={() => setSelectedDeptFilter('')} style={styles.linkBtn}>
                    <Text style={styles.linkBtnText}>Clear</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={isTablet ? styles.deptGrid : null}>
                {stats.topDepartments.map(([dept, count], idx) => {
                  const selected = selectedDeptFilter.toLowerCase() === dept.toLowerCase();
                  const color = DEPT_COLORS[idx % DEPT_COLORS.length];
                  return (
                    <TouchableOpacity
                      key={dept}
                      activeOpacity={0.8}
                      style={[
                        styles.deptRow,
                        isTablet && { width: '48.5%' },
                        selected && styles.deptRowSelected,
                      ]}
                      onPress={() => setSelectedDeptFilter(selected ? '' : dept)}
                    >
                      <View style={styles.deptRowTop}>
                        <View style={styles.deptNameWrap}>
                          <View style={[styles.deptColorDot, { backgroundColor: color }]} />
                          <Text style={[styles.deptChipName, selected && { color: '#065F46' }]} numberOfLines={1}>
                            {dept}
                          </Text>
                        </View>
                        <Text style={styles.deptChipCount}>{count}</Text>
                      </View>
                      <View style={styles.deptBarTrack}>
                        <View
                          style={[
                            styles.deptBarFill,
                            { width: `${Math.max(6, (count / stats.maxDept) * 100)}%`, backgroundColor: color },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* ======================= SEARCH ======================= */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, title, student..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search ? (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setSearch('')}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* ======================= FILTERS ======================= */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.filterRowContent}
          >
            {FILTERS.map((item) => {
              const active = activeFilter === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setActiveFilter(item.value)}
                  activeOpacity={0.85}
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
                  <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{s.label}</Text>
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
            <View>
              <Text style={styles.sectionTitle}>College Grievances ({filteredIssues.length})</Text>
              <Text style={styles.sectionSubtitle}>Tap a card for the complete trail</Text>
            </View>
          </View>

          {loading ? (
            <View style={[styles.emptyCard, { paddingVertical: 50 }]}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={[styles.emptyTitle, { marginTop: 14 }]}>Loading grievances…</Text>
            </View>
          ) : filteredIssues.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Complaints Match</Text>
              <Text style={styles.emptyDesc}>
                No grievances found for the selected filter or search keyword.
              </Text>
              {hasActiveFilters ? (
                <TouchableOpacity style={styles.emptyBtn} onPress={resetFilters}>
                  <Text style={styles.emptyBtnText}>Clear filters</Text>
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
                  actionLoadingId={actionLoadingId}
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
        onRequestClose={() => {
          if (!submittingAssign) setAssignModalOpen(false);
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalBackdrop, modalBackdropExtra]}>
            <View
              style={[
                styles.modalCard,
                modalSheetExtra,
                !isTablet && { paddingBottom: 22 + insets.bottom },
              ]}
            >
              {!isTablet ? <View style={styles.modalHandle} /> : null}

              <View style={styles.modalHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalEyebrow}>STAFF WORKLOAD ALLOCATION</Text>
                  <Text style={styles.modalTitle}>
                    {selectedIssue?.assignedTo ? 'Reassign Complaint' : 'Assign Staff'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setAssignModalOpen(false)}
                  disabled={submittingAssign}
                >
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalComplaintContext}>
                <View style={styles.modalContextRow}>
                  <Text style={styles.modalContextId}>
                    #{selectedIssue?.complaintId || selectedIssue?._id?.slice(-6)}
                  </Text>
                  <Text style={styles.modalContextAssignee} numberOfLines={1}>
                    {selectedIssue?.assignedTo
                      ? `Current: ${selectedIssue.assignedTo.name || 'Assigned'}`
                      : 'Currently Unassigned'}
                  </Text>
                </View>
                <Text style={styles.modalContextTitle} numberOfLines={1}>
                  {selectedIssue?.title}
                </Text>
              </View>

              <TextInput
                style={styles.facultySearchInput}
                placeholder="Search staff by name, department or email…"
                placeholderTextColor="#94A3B8"
                value={facultySearch}
                onChangeText={setFacultySearch}
                autoCorrect={false}
              />

              <ScrollView
                style={styles.facultyList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredFaculty.length === 0 ? (
                  <View style={styles.facultyEmpty}>
                    <Text style={styles.facultyEmptyText}>No staff found matching search.</Text>
                  </View>
                ) : (
                  filteredFaculty.map((teacher) => {
                    const selected = selectedTeacherId === teacher._id;
                    return (
                      <TouchableOpacity
                        key={teacher._id}
                        style={[styles.facultyOption, selected && styles.facultyOptionSelected]}
                        onPress={() => setSelectedTeacherId(teacher._id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.facultyAvatar, selected && styles.facultyAvatarSelected]}>
                          <Text style={[styles.facultyAvatarText, selected && styles.facultyAvatarTextSelected]}>
                            {(teacher.name || 'S').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.facultyMetaCol}>
                          <Text style={styles.facultyName} numberOfLines={1}>
                            {teacher.name}
                          </Text>
                          <Text style={styles.facultyDept} numberOfLines={1}>
                            {teacher.department || 'Staff'} • {teacher.email}
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
                  onPress={() => setAssignModalOpen(false)}
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
                      {selectedIssue?.assignedTo ? 'Confirm Reassignment →' : 'Confirm Assignment →'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================= INVITE MODAL ======================= */}
      <Modal
        visible={inviteModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!submittingInvite) setInviteModalOpen(false);
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalBackdrop, modalBackdropExtra]}>
            <View
              style={[
                styles.modalCard,
                modalSheetExtra,
                !isTablet && { paddingBottom: 22 + insets.bottom },
              ]}
            >
              {!isTablet ? <View style={styles.modalHandle} /> : null}

              <View style={styles.modalHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalEyebrow}>FACULTY ONBOARDING</Text>
                  <Text style={styles.modalTitle}>Invite Campus Member</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setInviteModalOpen(false)}
                  disabled={submittingInvite}
                >
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Select Role *</Text>
                  <View style={styles.rolePickerRow}>
                    {[
                      { value: 'staff', label: '🛠️ Staff' },
                      { value: 'cluster_head', label: '🏛️ Cluster Head' },
                    ].map((r) => {
                      const active = inviteRole === r.value;
                      return (
                        <TouchableOpacity
                          key={r.value}
                          style={[styles.roleOptionBtn, active && styles.roleOptionBtnActive]}
                          onPress={() => setInviteRole(r.value)}
                        >
                          <Text style={[styles.roleOptionText, active && styles.roleOptionTextActive]}>
                            {r.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    placeholderTextColor="#94A3B8"
                    value={inviteName}
                    onChangeText={setInviteName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>College Email *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. rsharma@college.edu"
                    placeholderTextColor="#94A3B8"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Department / Work Division{inviteRole === 'staff' || inviteRole === 'teacher' ? ' *' : ''}
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Computer Science & Engineering"
                    placeholderTextColor="#94A3B8"
                    value={inviteDept}
                    onChangeText={setInviteDept}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Contact Phone (Optional)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#94A3B8"
                    value={invitePhone}
                    onChangeText={setInvitePhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={[styles.modalBtnRow, { marginTop: 14 }]}>
                  <TouchableOpacity
                    style={styles.btnModalCancel}
                    onPress={() => setInviteModalOpen(false)}
                    disabled={submittingInvite}
                  >
                    <Text style={styles.btnModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btnModalConfirm, submittingInvite && styles.btnModalConfirmDisabled]}
                    onPress={handleInviteSubmit}
                    disabled={submittingInvite}
                  >
                    {submittingInvite ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnModalConfirmText}>Send Invitation ✉️</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================= IMAGE PREVIEW ======================= */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.imageModalBackdrop}>
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setPreviewImage(null)}>
            <Text style={styles.closeImageBtnText}>✕</Text>
          </TouchableOpacity>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.fullImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}