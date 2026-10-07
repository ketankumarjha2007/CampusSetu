import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 32,
    color: '#0F172A',
    marginTop: -2,
  },

  headerText: {
    flex: 1,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#2563EB',
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  listContent: {
    padding: 18,
    paddingBottom: 30,
  },

  introCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 4,
  },

  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  iconText: {
    fontSize: 22,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginLeft: 8,
  },

  statusDotResolved: {
    backgroundColor: '#16A34A',
  },

  notificationMessage: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },

  notificationIssue: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },

  notificationDate: {
    marginTop: 5,
    fontSize: 10,
    color: '#94A3B8',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },

  emptyIcon: {
    fontSize: 46,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },

  emptyMessage: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 310,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  reportButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },

  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});

export default styles;