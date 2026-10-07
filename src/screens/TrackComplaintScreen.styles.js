import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
  },

  backButtonText: {
    fontSize: 32,
    color: '#111827',
    lineHeight: 34,
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  searchTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  searchSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginBottom: 16,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: 14,
  },

  trackButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  trackButtonDisabled: {
    opacity: 0.7,
  },

  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },

  complaintIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  complaintId: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2563EB',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusPending: {
    backgroundColor: '#FEF3C7',
  },

  statusAssigned: {
    backgroundColor: '#E0E7FF',
  },

  statusProgress: {
    backgroundColor: '#DBEAFE',
  },

  statusResolved: {
    backgroundColor: '#DCFCE7',
  },

  statusRejected: {
    backgroundColor: '#FEE2E2',
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },

  issueTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },

  issueDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  infoLabel: {
    flex: 0.42,
    fontSize: 13,
    color: '#6B7280',
  },

  infoValue: {
    flex: 0.58,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },

  resolutionCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  resolutionNote: {
    fontSize: 14,
    lineHeight: 21,
    color: '#065F46',
  },

  resolvedDate: {
    marginTop: 10,
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },

  timeline: {
    marginTop: 2,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 82,
  },

  timelineLeft: {
    width: 26,
    alignItems: 'center',
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    marginTop: 3,
  },

  timelineDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
  },

  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 3,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 22,
  },

  timelineStatus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  timelineDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },

  timelineNote: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginTop: 6,
  },

  timelineChangedBy: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 5,
  },

  emptyTimeline: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  emptyTimelineText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default styles;