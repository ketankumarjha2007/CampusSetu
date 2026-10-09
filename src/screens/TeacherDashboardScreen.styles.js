import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },

  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#16845B',
    marginBottom: 8,
  },

  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16372B',
    letterSpacing: -0.7,
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#75857D',
    marginTop: 5,
    lineHeight: 19,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: '#DDF3E6',
    borderWidth: 1,
    borderColor: '#C4E9D3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16845B',
  },

  welcomeCard: {
    backgroundColor: '#176B4D',
    borderRadius: 22,
    padding: 21,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 27,
    overflow: 'hidden',
  },

  welcomeCardContent: {
    flex: 1,
    paddingRight: 8,
  },

  welcomeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#BDEBD1',
    marginBottom: 9,
  },

  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 28,
    letterSpacing: -0.4,
  },

  welcomeDescription: {
    color: '#D9F1E4',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
  },

  welcomeIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#398968',
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcomeIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1B3429',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#839088',
    marginTop: 5,
    lineHeight: 17,
  },

  refreshText: {
    color: '#16845B',
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 8,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  statCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8EFEA',
    marginBottom: 12,
    minHeight: 139,
  },

  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  statIconGreen: {
    backgroundColor: '#E0F5E9',
  },

  statIconOrange: {
    backgroundColor: '#FFF0DA',
  },

  statIconBlue: {
    backgroundColor: '#E2EDFF',
  },

  statIconPurple: {
    backgroundColor: '#EEE6FF',
  },

  statIconText: {
    fontSize: 20,
    color: '#245B43',
    fontWeight: '800',
  },

  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B3429',
    letterSpacing: -0.6,
  },

  statLabel: {
    fontSize: 11,
    color: '#829087',
    marginTop: 4,
    fontWeight: '600',
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#DFF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  countBadgeText: {
    color: '#16845B',
    fontSize: 13,
    fontWeight: '800',
  },

  filterContainer: {
    paddingBottom: 17,
    paddingRight: 5,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E0E9E3',
    backgroundColor: '#FFFFFF',
  },

  filterButtonActive: {
    backgroundColor: '#176B4D',
    borderColor: '#176B4D',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718078',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  issueList: {
    gap: 13,
  },

  issueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7EEE9',
  },

  issueTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 11,
  },

  complaintId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#718078',
    flex: 1,
  },

  priorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  priority_low: {
    backgroundColor: '#E5F5EA',
  },

  priority_medium: {
    backgroundColor: '#E7F0FF',
  },

  priority_high: {
    backgroundColor: '#FFF0D9',
  },

  priority_critical: {
    backgroundColor: '#FDE6E6',
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },

  priorityText_low: {
    color: '#277A48',
  },

  priorityText_medium: {
    color: '#3569B5',
  },

  priorityText_high: {
    color: '#A96810',
  },

  priorityText_critical: {
    color: '#C13F3F',
  },

  issueTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: '#20382D',
  },

  issueDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#7B8981',
    marginTop: 7,
  },

  issueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },

  issueCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#537361',
    backgroundColor: '#F0F6F2',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: '55%',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  status_pending: {
    color: '#C27B17',
  },

  status_assigned: {
    color: '#3569B5',
  },

  status_in_progress: {
    color: '#8A5AC5',
  },

  status_resolved: {
    color: '#24804C',
  },

  status_rejected: {
    color: '#C13F3F',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 13,
  },

  locationIcon: {
    color: '#16845B',
    fontSize: 17,
    marginRight: 7,
    fontWeight: '700',
  },

  locationText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#74837A',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF1EE',
    marginTop: 15,
    paddingTop: 13,
  },

  reportedBy: {
    flex: 1,
    fontSize: 10,
    color: '#87948C',
  },

  viewDetails: {
    fontSize: 11,
    color: '#16845B',
    fontWeight: '800',
  },

  centerState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 230,
    borderWidth: 1,
    borderColor: '#E7EEE9',
  },

  stateIcon: {
    fontSize: 28,
    fontWeight: '800',
    color: '#C27B17',
    marginBottom: 12,
  },

  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#243B2F',
    textAlign: 'center',
    marginTop: 12,
  },

  stateDescription: {
    fontSize: 12,
    color: '#7B8981',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#176B4D',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E7EEE9',
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 225,
  },

  emptyIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 19,
    backgroundColor: '#E0F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 26,
    fontWeight: '800',
    color: '#16845B',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#243B2F',
  },

  emptyDescription: {
    fontSize: 12,
    color: '#7B8981',
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 12,
  },

  footerTitle: {
    color: '#315541',
    fontSize: 12,
    fontWeight: '800',
  },

  footerText: {
    color: '#98A49C',
    fontSize: 10,
    marginTop: 5,
  },
});

export default styles;