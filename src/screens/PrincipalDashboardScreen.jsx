import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { auth } from '../config/firebase';
import { apiRequest, getCurrentUser } from '../services/api';
import styles from './TeacherDashboardScreen.styles';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Critical / Escalated', value: 'critical' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

const STATUS_BADGE = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  assigned: { bg: '#E0E7FF', text: '#3730A3', label: 'Assigned' },
  in_progress: { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' },
  resolved: { bg: '#DCFCE7', text: '#166534', label: 'Resolved' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' },
};

export default function PrincipalDashboardScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Escalate / Action state
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const [issuesRes, teachersRes, userRes] = await Promise.all([
        apiRequest('/issues/admin/all'),
        apiRequest('/issues/admin/teachers'),
        getCurrentUser().catch(() => null),
      ]);

      if (Array.isArray(issuesRes?.issues)) {
        setIssues(issuesRes.issues);
      }
      if (Array.isArray(teachersRes?.teachers)) {
        setTeachers(teachersRes.teachers);
      }
      if (userRes?.user) {
        setUser(userRes.user);
      }
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

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
              await auth.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              Alert.alert('Sign out error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEscalate = async (issue) => {
    if (actionLoadingId) return;

    Alert.alert(
      'Principal Priority Escalation',
      `Mark complaint ${issue.complaintId || issue._id} as Critical Priority and increase its escalation level?`,
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
                body: JSON.stringify({ note: 'Directly escalated by Principal via executive portal' }),
              });

              if (!res?.success) throw new Error(res?.message || 'Escalation failed');

              Alert.alert('Escalated', 'Complaint has been escalated to Critical.');
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
  };

  const handleAssignSubmit = async () => {
    if (!selectedIssue || !selectedTeacherId || submittingAssign) return;

    setSubmittingAssign(true);
    try {
      const res = await apiRequest(`/issues/${selectedIssue._id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });

      if (!res?.success) throw new Error(res?.message || 'Assignment failed');

      Alert.alert('Success', 'Complaint assigned to teacher.');
      setAssignModalOpen(false);
      setSelectedIssue(null);
      setSelectedTeacherId('');
      await loadData(false);
    } catch (err) {
      Alert.alert('Assignment Error', err.message);
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Comprehensive Campus-wide Analytics
  const stats = useMemo(() => {
    let pending = 0;
    let assigned = 0;
    let inProgress = 0;
    let resolved = 0;
    let critical = 0;
    let agingCount = 0; // > 3 days unresolved

    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    const deptMap = {};

    issues.forEach((item) => {
      if (item.status === 'pending') pending += 1;
      else if (item.status === 'assigned') assigned += 1;
      else if (item.status === 'in_progress') inProgress += 1;
      else if (item.status === 'resolved') resolved += 1;

      if (item.priority === 'critical' || (item.escalationLevel || 0) > 0) {
        critical += 1;
      }

      const createdTime = new Date(item.createdAt || 0).getTime();
      if (!['resolved', 'rejected'].includes(item.status) && (now - createdTime > threeDaysMs)) {
        agingCount += 1;
      }

      const dept = item.reportedBy?.department || item.category || 'General';
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });

    const resolutionRate = issues.length
      ? Math.round((resolved / issues.length) * 100)
      : 0;

    const topDepartments = Object.entries(deptMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      total: issues.length,
      pending,
      assigned,
      inProgress,
      resolved,
      critical,
      agingCount,
      resolutionRate,
      topDepartments,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const isCritical = issue.priority === 'critical' || (issue.escalationLevel || 0) > 0;
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'critical'
            ? isCritical
            : issue.status === activeFilter;

      if (!matchesFilter) return false;

      if (!q) return true;

      const searchable = [
        issue.complaintId,
        issue.title,
        issue.description,
        issue.category,
        issue.building,
        issue.roomNumber,
        issue.reportedBy?.name,
        issue.assignedTo?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [issues, activeFilter, search]);

  const userName = user?.name || 'Principal';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F6" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#16845B"
            colors={['#16845B']}
          />
        }
      >
        {/* Executive Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>CAMPUSSETU • EXECUTIVE LEADERSHIP</Text>
            <Text style={styles.greeting}>{userName}</Text>
            <Text style={styles.headerSubtitle}>College-wide Grievance &amp; Operations Oversight</Text>
          </View>

          <TouchableOpacity
            style={styles.avatar}
            onPress={handleSignOut}
            activeOpacity={0.8}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </TouchableOpacity>
        </View>

        {/* Executive Banner */}
        <View style={[styles.welcomeCard, { backgroundColor: '#0F291E' }]}>
          <View style={styles.welcomeCardContent}>
            <Text style={[styles.welcomeLabel, { color: '#86EFAC' }]}>COLLEGE EXECUTIVE DASHBOARD</Text>
            <Text style={styles.welcomeTitle}>Institutional Accountability</Text>
            <Text style={styles.welcomeDescription}>
              Real-time monitoring across all departments, tracking complaint ageing and faculty resolution speed.
            </Text>
          </View>
          <View style={[styles.welcomeIcon, { backgroundColor: '#1E4636' }]}>
            <Text style={styles.welcomeIconText}>🏛</Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Institutional Health</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Text style={styles.refreshText}>Refresh ↻</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconGreen]}>
              <Text style={styles.statIconText}>Σ</Text>
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Complaints</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.statIconText, { color: '#DC2626' }]}>🔥</Text>
            </View>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>{stats.critical}</Text>
            <Text style={styles.statLabel}>Critical / Escalated</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconOrange]}>
              <Text style={styles.statIconText}>⏳</Text>
            </View>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.agingCount}</Text>
            <Text style={styles.statLabel}>Ageing (&gt;3 days)</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.statIconText, { color: '#16A34A' }]}>✓</Text>
            </View>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.resolutionRate}%</Text>
            <Text style={styles.statLabel}>Resolution Rate</Text>
          </View>
        </View>

        {/* Department Volume Pill View */}
        {stats.topDepartments.length > 0 && (
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              padding: 16,
              marginTop: 14,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 8 }}>
              TOP INQUIRY CATEGORIES / DEPARTMENTS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {stats.topDepartments.map(([name, count]) => (
                <View
                  key={name}
                  style={{
                    backgroundColor: '#F1F5F9',
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>{name}</Text>
                  <View style={{ backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>{count}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 14,
            paddingHorizontal: 14,
            marginTop: 18,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 16, color: '#94A3B8', marginRight: 8 }}>⌕</Text>
          <TextInput
            style={{ flex: 1, paddingVertical: 10, fontSize: 13, color: '#0F172A' }}
            placeholder="Search all college complaints, USNs, teachers..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ fontSize: 18, color: '#94A3B8', paddingHorizontal: 4 }}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTERS.map((f) => {
            const active = activeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterButton, active && styles.filterButtonActive]}
                onPress={() => setActiveFilter(f.value)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Issues List */}
        <View style={styles.issueList}>
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#16845B" />
              <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>
                Loading college records...
              </Text>
            </View>
          ) : error ? (
            <View style={{ padding: 20, backgroundColor: '#FEF2F2', borderRadius: 14, marginTop: 12 }}>
              <Text style={{ color: '#991B1B', fontWeight: '700' }}>Access or network issue</Text>
              <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: 4 }}>{error}</Text>
              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() => loadData(true)}
              >
                <Text style={{ color: '#16845B', fontWeight: '700' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredIssues.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, color: '#CBD5E1', marginBottom: 8 }}>🏛</Text>
              <Text style={{ fontWeight: '700', color: '#334155', fontSize: 15 }}>
                No complaints found
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
                No active complaints match the selected filter.
              </Text>
            </View>
          ) : (
            filteredIssues.map((issue) => {
              const badge = STATUS_BADGE[issue.status] || { bg: '#F1F5F9', text: '#475569', label: issue.status };
              const isCritical = issue.priority === 'critical' || (issue.escalationLevel || 0) > 0;

              return (
                <View
                  key={issue._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isCritical ? '#FCA5A5' : '#E2E8F0',
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 3,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#16845B' }}>
                      {issue.complaintId || issue._id.slice(-6)}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {isCritical && (
                        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#DC2626' }}>
                            CRITICAL {issue.escalationLevel ? `(L${issue.escalationLevel})` : ''}
                          </Text>
                        </View>
                      )}
                      <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: badge.text }}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>
                    {issue.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>
                    {issue.description}
                  </Text>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>
                      📍 {issue.building || issue.location || 'Campus'} {issue.roomNumber ? `• Rm ${issue.roomNumber}` : ''}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>
                      👨‍🏫 {issue.assignedTo?.name ? `Teacher: ${issue.assignedTo.name}` : 'Unassigned'}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>
                      🎓 {issue.reportedBy?.name || 'Student'}
                    </Text>
                  </View>

                  {/* Principal Direct Actions */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: '#F1F5F9',
                      }}
                      onPress={() => {
                        setSelectedIssue(issue);
                        setSelectedTeacherId(issue.assignedTo?._id || '');
                        setAssignModalOpen(true);
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#334155' }}>
                        {issue.assignedTo ? 'Reassign' : 'Assign'}
                      </Text>
                    </TouchableOpacity>

                    {!isCritical && issue.status !== 'resolved' && (
                      <TouchableOpacity
                        style={{
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#FEF2F2',
                          borderWidth: 1,
                          borderColor: '#FECACA',
                        }}
                        onPress={() => handleEscalate(issue)}
                        disabled={actionLoadingId === issue._id}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
                          {actionLoadingId === issue._id ? 'Escalating...' : 'Escalate'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={{
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: '#16845B',
                      }}
                      onPress={() =>
                        navigation.navigate('OfficialIssueDetails', {
                          issueId: issue._id,
                        })
                      }
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                        Full Review →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>CampusSetu</Text>
          <Text style={styles.footerText}>Office of the Principal • Executive Governance</Text>
        </View>
      </ScrollView>

      {/* Assignment Modal */}
      <Modal
        visible={assignModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!submittingAssign) setAssignModalOpen(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              padding: 22,
              maxHeight: '80%',
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#16845B', letterSpacing: 1 }}>
              PRINCIPAL ALLOCATION
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 4, marginBottom: 8 }}>
              Direct Faculty Assignment
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
              Assign complaint <strong>{selectedIssue?.complaintId}</strong> directly to a faculty member.
            </Text>

            <ScrollView style={{ maxHeight: 260, marginBottom: 16 }}>
              {teachers.map((teacher) => {
                const selected = selectedTeacherId === teacher._id;
                return (
                  <TouchableOpacity
                    key={teacher._id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? '#16845B' : '#E2E8F0',
                      backgroundColor: selected ? '#ECFDF5' : '#FFFFFF',
                      marginBottom: 8,
                    }}
                    onPress={() => setSelectedTeacherId(teacher._id)}
                  >
                    <Text style={{ fontWeight: '700', color: selected ? '#065F46' : '#1E293B' }}>
                      {teacher.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {teacher.department || 'General Faculty'} • {teacher.email}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  backgroundColor: '#F1F5F9',
                }}
                onPress={() => setAssignModalOpen(false)}
                disabled={submittingAssign}
              >
                <Text style={{ fontWeight: '600', color: '#475569' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 10,
                  backgroundColor: '#16845B',
                }}
                onPress={handleAssignSubmit}
                disabled={submittingAssign || !selectedTeacherId}
              >
                {submittingAssign ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Confirm Assignment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
