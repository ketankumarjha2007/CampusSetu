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
  { label: 'Escalated', value: 'escalated' },
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const STATUS_BADGE = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  assigned: { bg: '#E0E7FF', text: '#3730A3' },
  in_progress: { bg: '#DBEAFE', text: '#1E40AF' },
  resolved: { bg: '#DCFCE7', text: '#166534' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function ClusterHeadDashboardScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Reassignment Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Escalate state
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
      console.error('Cluster Head dashboard load error:', err);
      setError(err?.message || 'Failed to load cluster oversight records.');
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
      `Signed in as ${user?.name || 'Cluster Head'}. Do you wish to sign out?`,
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
    if (escalatingId) return;

    Alert.alert(
      'Escalate Complaint',
      `Escalate complaint ${issue.complaintId || issue._id} to high priority and raise its escalation level?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          style: 'destructive',
          onPress: async () => {
            setEscalatingId(issue._id);
            try {
              const res = await apiRequest(`/issues/${issue._id}/escalate`, {
                method: 'POST',
                body: JSON.stringify({ note: 'Escalated by Cluster Head via mobile portal' }),
              });

              if (!res?.success) throw new Error(res?.message || 'Escalation failed');

              Alert.alert('Escalated', 'Complaint has been escalated successfully.');
              await loadData(false);
            } catch (err) {
              Alert.alert('Escalation Failed', err.message);
            } finally {
              setEscalatingId(null);
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

      Alert.alert('Assigned', 'Complaint assigned to teacher successfully.');
      setAssignModalOpen(false);
      setSelectedIssue(null);
      setSelectedTeacherId('');
      await loadData(false);
    } catch (err) {
      Alert.alert('Assignment Failed', err.message);
    } finally {
      setSubmittingAssign(false);
    }
  };

  // Compute metrics
  const stats = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;
    let escalated = 0;

    issues.forEach((item) => {
      if (item.status === 'pending' || item.status === 'assigned') pending += 1;
      else if (item.status === 'in_progress') inProgress += 1;
      else if (item.status === 'resolved') resolved += 1;

      if ((item.escalationLevel || 0) > 0 || item.priority === 'critical') {
        escalated += 1;
      }
    });

    const resolutionRate = issues.length
      ? Math.round((resolved / issues.length) * 100)
      : 0;

    return {
      total: issues.length,
      pending,
      inProgress,
      resolved,
      escalated,
      resolutionRate,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'escalated'
            ? (issue.escalationLevel || 0) > 0 || issue.priority === 'critical'
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
        issue.assignedTo?.name,
        issue.reportedBy?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }, [issues, activeFilter, search]);

  const userName = user?.name || 'Cluster Head';
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
        {/* Top bar */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>CAMPUSSETU • CLUSTER LEADERSHIP</Text>
            <Text style={styles.greeting}>{userName.split(' ')[0]}</Text>
            <Text style={styles.headerSubtitle}>
              {user?.department ? `${user.department} Cluster` : 'Multi-Department Oversight'}
            </Text>
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

        {/* Hero banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeCardContent}>
            <Text style={styles.welcomeLabel}>CLUSTER OVERVIEW</Text>
            <Text style={styles.welcomeTitle}>Coordinating Faculty &amp; Resolution</Text>
            <Text style={styles.welcomeDescription}>
              Track cluster complaints, verify teacher workloads, and expedite escalations.
            </Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Text style={styles.welcomeIconText}>⚡</Text>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cluster metrics</Text>
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
            <Text style={styles.statLabel}>Total Issues</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconOrange]}>
              <Text style={styles.statIconText}>!</Text>
            </View>
            <Text style={[styles.statValue, { color: '#B45309' }]}>{stats.escalated}</Text>
            <Text style={styles.statLabel}>Escalated / Critical</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.statIconText, { color: '#1E40AF' }]}>◷</Text>
            </View>
            <Text style={styles.statValue}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.statIconText, { color: '#15803D' }]}>✓</Text>
            </View>
            <Text style={[styles.statValue, { color: '#15803D' }]}>{stats.resolutionRate}%</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

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
            placeholder="Search complaint, student, or teacher..."
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

        {/* Complaints List */}
        <View style={styles.issueList}>
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#16845B" />
              <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13 }}>
                Loading cluster complaints...
              </Text>
            </View>
          ) : error ? (
            <View style={{ padding: 20, backgroundColor: '#FEF2F2', borderRadius: 14, marginTop: 12 }}>
              <Text style={{ color: '#991B1B', fontWeight: '700' }}>Unable to load data</Text>
              <Text style={{ color: '#B91C1C', fontSize: 12, marginTop: 4 }}>{error}</Text>
              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() => loadData(true)}
              >
                <Text style={{ color: '#16845B', fontWeight: '700' }}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredIssues.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 28, color: '#CBD5E1', marginBottom: 8 }}>📋</Text>
              <Text style={{ fontWeight: '700', color: '#334155', fontSize: 15 }}>
                No complaints found
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
                {search ? 'Try clearing your search query.' : 'All issues matching this filter are cleared.'}
              </Text>
            </View>
          ) : (
            filteredIssues.map((issue) => {
              const badge = STATUS_BADGE[issue.status] || { bg: '#F1F5F9', text: '#475569' };
              const isEscalated = (issue.escalationLevel || 0) > 0;

              return (
                <View
                  key={issue._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isEscalated ? '#FED7AA' : '#E2E8F0',
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
                      {isEscalated && (
                        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#DC2626' }}>
                            ESCALATED L{issue.escalationLevel}
                          </Text>
                        </View>
                      )}
                      <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: badge.text }}>
                          {STATUS_LABELS[issue.status] || issue.status}
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
                      👤 {issue.assignedTo?.name ? `Assigned: ${issue.assignedTo.name}` : 'Unassigned'}
                    </Text>
                  </View>

                  {/* Actions */}
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

                    {!isEscalated && issue.status !== 'resolved' && (
                      <TouchableOpacity
                        style={{
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#FFF7ED',
                          borderWidth: 1,
                          borderColor: '#FED7AA',
                        }}
                        onPress={() => handleEscalate(issue)}
                        disabled={escalatingId === issue._id}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#C2410C' }}>
                          {escalatingId === issue._id ? 'Escalating...' : 'Escalate'}
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
                        Review →
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
          <Text style={styles.footerText}>Cluster Head Administrative Oversight</Text>
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
              FACULTY ALLOCATION
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 4, marginBottom: 8 }}>
              Assign Teacher
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
              Select an active teacher to investigate and resolve complaint{' '}
              <strong>{selectedIssue?.complaintId}</strong>.
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
                  <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Save Assignment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
