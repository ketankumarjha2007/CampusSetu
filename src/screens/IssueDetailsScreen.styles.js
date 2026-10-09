import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL = SCREEN_WIDTH < 360;

const COLORS = {
  background: '#F5F7F2',
  white: '#FFFFFF',
  green: '#176B4D',
  darkGreen: '#104B38',
  text: '#172820',
  muted: '#77847B',
  border: '#E5EAE3',
  lightGreen: '#E8F3EC',
  softGreen: '#F0F6F0',
  red: '#C24141',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
  },

  loadingTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  loadingSubtitle: {
    marginTop: 9,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  errorBackButton: {
    position: 'absolute',
    top: 18,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  errorBackArrow: {
    fontSize: 34,
    lineHeight: 36,
    color: COLORS.text,
    marginTop: -4,
  },

  errorIllustration: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: '#FCE9E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  errorIllustrationText: {
    color: COLORS.red,
    fontSize: 38,
    fontWeight: '900',
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
  },

  errorSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 28,
    textAlign: 'center',
  },

  primaryButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  primaryButtonArrow: {
    color: COLORS.white,
    fontSize: 20,
    marginLeft: 10,
  },

  secondaryButton: {
    marginTop: 12,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  secondaryButtonText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },

  // Header
  header: {
    minHeight: 76,
    paddingHorizontal: IS_SMALL ? 16 : 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  headerBackButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerBackArrow: {
    fontSize: 34,
    lineHeight: 36,
    color: COLORS.text,
    marginTop: -4,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 13,
    minWidth: 0,
  },

  headerEyebrow: {
    fontSize: 9,
    letterSpacing: 2,
    color: COLORS.green,
    fontWeight: '900',
    marginBottom: 3,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: IS_SMALL ? 17 : 19,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  headerRefreshButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 10,
  },

  headerRefreshIcon: {
    color: COLORS.green,
    fontSize: 26,
    fontWeight: '600',
  },

  // Main scroll area
  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: IS_SMALL ? 15 : 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  // Hero
  heroCard: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 26,
    padding: IS_SMALL ? 17 : 21,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },

  heroDecorCircle: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.045)',
    top: -88,
    right: -56,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroBrandMark: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#D5E9D9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroBrandMarkText: {
    color: COLORS.darkGreen,
    fontSize: 22,
    fontWeight: '900',
  },

  heroTopText: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
  },

  heroEyebrow: {
    color: '#B8D7C4',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  heroHeading: {
    color: COLORS.white,
    fontSize: IS_SMALL ? 14 : 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginLeft: 7,
    maxWidth: 112,
  },

  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    flexShrink: 1,
  },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 21,
    marginBottom: 18,
  },

  complaintIdLabel: {
    color: '#B8D7C4',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  complaintIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  complaintIdValue: {
    flex: 1,
    color: COLORS.white,
    fontSize: IS_SMALL ? 21 : 25,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  referenceIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginLeft: 8,
  },

  referenceIconText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
  },

  heroDescription: {
    color: '#D1E2D6',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
    maxWidth: 290,
  },

  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 21,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
    flexWrap: 'wrap',
  },

  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },

  heroMetaIcon: {
    color: '#C3DFCA',
    fontSize: 15,
    marginRight: 7,
  },

  heroMetaText: {
    color: '#F2F7F3',
    fontSize: 10,
    fontWeight: '700',
    flexShrink: 1,
  },

  heroMetaDivider: {
    height: 17,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 13,
  },

  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  // Status summary
  statusSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 26,
  },

  statusSummaryIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  statusSummaryIconText: {
    fontSize: 25,
    fontWeight: '900',
  },

  statusSummaryContent: {
    flex: 1,
    paddingRight: 5,
  },

  statusSummaryEyebrow: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  statusSummaryTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  statusSummaryDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  statusSummaryAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 5,
    marginLeft: 4,
  },

  // Section layout
  section: {
    marginBottom: 25,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 13,
    minHeight: 43,
  },

  sectionHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 5,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: IS_SMALL ? 20 : 22,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: IS_SMALL ? 15 : 18,
    paddingVertical: 17,
  },

  // Description
  issueTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
    lineHeight: 26,
    letterSpacing: -0.45,
  },

  description: {
    color: '#5E6C62',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 12,
  },

  descriptionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 19,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF0EB',
    gap: 9,
  },

  descriptionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGreen,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  descriptionCategoryIcon: {
    color: COLORS.green,
    fontSize: 13,
    marginRight: 6,
  },

  descriptionCategoryText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
  },

  priorityBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },

  // Information rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0EB',
  },

  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  infoIconBox: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: COLORS.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoIcon: {
    color: COLORS.green,
    fontSize: 19,
    fontWeight: '700',
  },

  infoTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },

  infoValue: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },

  locationNote: {
    backgroundColor: COLORS.softGreen,
    borderRadius: 13,
    padding: 13,
    marginTop: 6,
  },

  locationNoteText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  // Photo
  photoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  issuePhoto: {
    width: '100%',
    height: Math.min(280, Math.max(190, SCREEN_WIDTH * 0.62)),
    borderRadius: 16,
    backgroundColor: '#E8ECE7',
  },

  photoCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
  },

  photoCaptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#E1F4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  photoCaptionIconText: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: '900',
  },

  photoCaptionContent: {
    flex: 1,
  },

  photoCaptionTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  photoCaptionDescription: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  // Resolution
  resolutionCard: {
    backgroundColor: '#F0F8F2',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D8EADD',
  },

  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resolutionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#DDF1E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  resolutionIconText: {
    color: COLORS.green,
    fontSize: 22,
    fontWeight: '900',
  },

  resolutionHeaderContent: {
    flex: 1,
  },

  resolutionTitle: {
    color: COLORS.darkGreen,
    fontSize: 15,
    fontWeight: '900',
  },

  resolutionDate: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
    lineHeight: 15,
  },

  resolutionDivider: {
    height: 1,
    backgroundColor: '#DCEADF',
    marginVertical: 16,
  },

  resolutionLabel: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  resolutionText: {
    color: '#405B49',
    fontSize: 13,
    lineHeight: 22,
  },

  // Timeline
  eventCountBadge: {
    backgroundColor: '#E7EFE7',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginLeft: 8,
  },

  eventCountText: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: IS_SMALL ? 15 : 19,
    paddingTop: 20,
    paddingBottom: 6,
  },

  timelineEmpty: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 8,
  },

  timelineEmptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  timelineEmptyIconText: {
    color: COLORS.green,
    fontSize: 28,
    fontWeight: '800',
  },

  timelineEmptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },

  timelineEmptyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 260,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 94,
  },

  timelineRail: {
    width: 27,
    alignItems: 'center',
    marginRight: 10,
  },

  timelineDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    zIndex: 1,
  },

  timelineDotLatest: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#E1F2E6',
  },

  timelineDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },

  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 57,
    backgroundColor: '#DFE9DF',
    marginTop: 5,
    marginBottom: 0,
  },

  timelineEntry: {
    flex: 1,
    paddingBottom: 23,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0EB',
    marginBottom: 17,
    minWidth: 0,
  },

  timelineEntryLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 17,
  },

  timelineEntryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 7,
  },

  timelineTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '900',
    flexShrink: 1,
  },

  latestBadge: {
    backgroundColor: '#E1F3E7',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  latestBadgeText: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  timelineNote: {
    color: '#5E6C62',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
  },

  timelineDate: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 8,
  },

  // Delete
  deleteCard: {
    backgroundColor: '#FFF7F5',
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: '#F4DEDA',
    marginBottom: 23,
  },

  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  deleteIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#FBE4E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  deleteIconText: {
    color: '#B74235',
    fontSize: 19,
    fontWeight: '900',
  },

  deleteHeaderContent: {
    flex: 1,
  },

  deleteTitle: {
    color: '#8D3029',
    fontSize: 14,
    fontWeight: '900',
  },

  deleteSubtitle: {
    color: '#A15B54',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  deleteButton: {
    minHeight: 49,
    borderRadius: 15,
    backgroundColor: '#BD3D35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
    paddingHorizontal: 15,
  },

  deleteButtonDisabled: {
    opacity: 0.65,
  },

  deleteButtonIcon: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '900',
    marginRight: 9,
  },

  deleteButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },

  // Closing brand card
  closingCard: {
    alignItems: 'center',
    backgroundColor: '#EAF2E9',
    borderRadius: 23,
    paddingHorizontal: 24,
    paddingVertical: 25,
    borderWidth: 1,
    borderColor: '#DDE9DC',
    marginBottom: 10,
  },

  closingMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  closingMarkText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
  },

  closingTitle: {
    color: COLORS.darkGreen,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
  },

  closingDescription: {
    color: '#607465',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 270,
  },

  bottomSpace: {
    height: 20,
  },
});

export default styles;