
import { StyleSheet } from 'react-native';

const COLORS = {
  primary: '#176B50',
  primaryDark: '#10533E',
  primaryLight: '#E8F5EE',
  background: '#F5F8F6',
  surface: '#FFFFFF',
  text: '#172B25',
  secondary: '#64748B',
  muted: '#94A3B8',
  border: '#E2E8F0',
  divider: '#EDF2EF',
  green: '#15803D',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  // Safe-area spacing is handled by SafeAreaView.
  // These values create additional breathing room below the status bar.
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },

  containerCompact: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
    paddingTop: 8,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    fontSize: 34,
    lineHeight: 38,
    color: COLORS.text,
    marginTop: -4,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },

  brandMark: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  brandName: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  // Intro
  introCard: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    backgroundColor: COLORS.primary,
    borderRadius: 23,
    padding: 19,
    marginBottom: 18,
  },

  introDecorCircle: {
    position: 'absolute',
    right: -35,
    top: -55,
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },

  introIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  introIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },

  introTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  introEyebrow: {
    color: '#BFE8D2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  introTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
    marginBottom: 6,
  },

  introDescription: {
    color: '#E1F2E9',
    fontSize: 12,
    lineHeight: 19,
  },

  // Search
  searchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    marginBottom: 22,
    shadowColor: '#102E23',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 21,
  },

  sectionNumber: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionNumberText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  searchHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  searchTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 4,
  },

  searchSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
  },

  inputLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '900',
    marginBottom: 9,
  },

  input: {
    width: '100%',
    minHeight: 55,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D7E2DC',
    backgroundColor: '#FAFCFB',
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  trackButton: {
    minHeight: 55,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginTop: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  trackButtonDisabled: {
    opacity: 0.7,
  },

  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  trackButtonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 25,
  },

  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 13,
  },

  privacyIcon: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  privacyText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
  },

  // Results
  resultsContainer: {
    width: '100%',
    gap: 15,
  },

  statusOverviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    overflow: 'hidden',
  },

  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statusIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIcon: {
    fontSize: 23,
    fontWeight: '900',
  },

  statusOverviewText: {
    flex: 1,
    minWidth: 0,
  },

  statusOverline: {
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '900',
    marginBottom: 4,
  },

  statusOverviewTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    maxWidth: 120,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },

  statusDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 15,
  },

  statusDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 17,
  },

  complaintIdResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  complaintIdResultText: {
    flex: 1,
    minWidth: 0,
  },

  resultSmallLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '900',
    marginBottom: 6,
  },

  complaintId: {
    color: COLORS.primary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  referenceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  referenceIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
  },

  // Overview cards
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flexShrink: 1,
  },

  cardHeadingAccent: {
    width: 4,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '900',
    flexShrink: 1,
  },

  issueTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '900',
    marginTop: 19,
    marginBottom: 9,
  },

  issueDescription: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 21,
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },

  categoryTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  categoryTagText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '800',
  },

  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  priorityTagText: {
    fontSize: 11,
    fontWeight: '900',
  },

  // Location
  locationGrid: {
    marginTop: 12,
  },

  locationItem: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  locationItemLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '900',
    marginBottom: 6,
  },

  locationItemValue: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '800',
  },

  noLocationText: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 13,
  },

  // Information rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  infoLabel: {
    flex: 0.9,
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
  },

  infoValue: {
    flex: 1.1,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'right',
  },

  // Resolution
  resolutionCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 23,
    padding: 19,
  },

  resolutionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 15,
  },

  resolutionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resolutionIconText: {
    color: COLORS.green,
    fontSize: 24,
    fontWeight: '900',
  },

  resolutionHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  resolutionTitle: {
    color: '#166534',
    fontSize: 17,
    fontWeight: '900',
  },

  resolutionSubtitle: {
    color: '#4D7C5A',
    fontSize: 11,
    marginTop: 3,
  },

  resolutionNote: {
    color: '#166534',
    fontSize: 13,
    lineHeight: 21,
  },

  resolvedDate: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
  },

  rejectionCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 18,
  },

  rejectionTitle: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },

  rejectionNote: {
    color: '#7F1D1D',
    fontSize: 13,
    lineHeight: 21,
  },

  // Timeline
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
  },

  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  historyCountBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyCountText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  timelineSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 22,
  },

  timeline: {
    width: '100%',
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 13,
  },

  timelineLeft: {
    width: 16,
    alignItems: 'center',
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
    borderWidth: 2,
    borderColor: '#F1F5F9',
    marginTop: 4,
    zIndex: 1,
  },

  timelineDotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderColor: '#D1FAE5',
  },

  timelineDotResolved: {
    backgroundColor: COLORS.green,
    borderColor: '#BBF7D0',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
    backgroundColor: '#DCE8E1',
    marginTop: 3,
  },

  timelineContent: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 24,
  },

  timelineContentLast: {
    paddingBottom: 0,
  },

  timelineHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  timelineStatus: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
    flexShrink: 1,
  },

  latestBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  latestBadgeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  timelineDate: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  timelineNote: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
  },

  timelineChangedBy: {
    color: COLORS.primary,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '800',
    marginTop: 8,
  },

  emptyTimeline: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 12,
  },

  emptyTimelineIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTimelineSymbol: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: '800',
  },

  emptyTimelineTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 6,
  },

  emptyTimelineText: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 270,
  },

  // Bottom actions
  trackAnotherButton: {
    minHeight: 53,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B9D8C7',
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
  },

  trackAnotherIcon: {
    color: COLORS.primary,
    fontSize: 21,
    fontWeight: '800',
  },

  trackAnotherText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 3,
  },
});

export default styles;
