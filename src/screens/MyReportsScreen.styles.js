
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
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // SafeAreaView handles the top status-bar inset.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 17,
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: {
    color: COLORS.text,
    fontSize: 34,
    lineHeight: 38,
    marginTop: -4,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },

  brandMark: {
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  brandName: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },

  headerAction: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerActionText: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 30,
    fontWeight: '500',
    marginTop: -2,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },

  // Hero
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    padding: 20,
    marginBottom: 25,
  },

  heroDecorOne: {
    position: 'absolute',
    right: -43,
    top: -60,
    width: 175,
    height: 175,
    borderRadius: 88,
    backgroundColor: 'rgba(255,255,255,0.055)',
  },

  heroDecorTwo: {
    position: 'absolute',
    right: 30,
    bottom: -95,
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },

  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIconText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },

  heroLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  heroLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#86EFAC',
  },

  heroLiveText: {
    color: '#E0F2E8',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  heroSubtitle: {
    color: '#D7EDE2',
    fontSize: 12,
    lineHeight: 20,
    maxWidth: 330,
  },

  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    marginTop: 20,
    paddingTop: 16,
  },

  heroCountLabel: {
    color: '#C5E4D4',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },

  heroCount: {
    color: '#FFFFFF',
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
  },

  heroCountIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCountIconText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },

  // Section headings
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  // Summary metrics
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 27,
  },

  metricCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  metricIconText: {
    fontSize: 18,
    fontWeight: '900',
  },

  metricValue: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },

  metricLabel: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 4,
  },

  // Filters
  filterSection: {
    marginBottom: 22,
  },

  filterScroll: {
    gap: 8,
    paddingRight: 8,
    paddingBottom: 2,
  },

  filterChip: {
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 7,
    paddingHorizontal: 5,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterCountSelected: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  filterCountText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
  },

  filterCountTextSelected: {
    color: '#FFFFFF',
  },

  // Results heading
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },

  resultsTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  resultsTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },

  resultsSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  newReportButton: {
    minHeight: 39,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  newReportButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  // Report cards
  reportsList: {
    gap: 13,
  },

  reportCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 21,
    padding: 17,
    shadowColor: '#123B2B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  reportCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 13,
  },

  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },

  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryIconText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  categoryText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    flexShrink: 1,
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
  },

  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  priorityText: {
    fontSize: 10,
    fontWeight: '900',
  },

  reportTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 13,
  },

  complaintIdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: '#F7FAF8',
    borderWidth: 1,
    borderColor: '#E9F0EB',
    marginBottom: 12,
  },

  complaintIdTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  complaintIdLabel: {
    color: COLORS.secondary,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '900',
    marginBottom: 5,
  },

  complaintIdValue: {
    color: COLORS.primary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  complaintIdSymbol: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#E6F1EA',
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 29,
  },

  reportDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 20,
  },

  reportMeta: {
    gap: 10,
    marginTop: 15,
    marginBottom: 14,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  metaIcon: {
    width: 17,
    color: COLORS.primary,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
  },

  metaText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 18,
  },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 13,
  },

  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    maxWidth: '65%',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '900',
    flexShrink: 1,
  },

  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  viewDetails: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  viewDetailsArrow: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  // Loading, error and empty states
  stateCard: {
    minHeight: 220,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  stateTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 15,
  },

  stateSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
    maxWidth: 300,
  },

  errorIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorIconText: {
    color: '#B91C1C',
    fontSize: 25,
    fontWeight: '900',
  },

  retryButton: {
    minHeight: 43,
    minWidth: 120,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 18,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 23,
    paddingVertical: 30,
    alignItems: 'center',
    marginTop: 2,
  },

  emptyIllustration: {
    width: 67,
    height: 67,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyIllustrationText: {
    color: COLORS.primary,
    fontSize: 34,
    fontWeight: '700',
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptySubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },

  emptyButton: {
    minHeight: 47,
    paddingHorizontal: 19,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  emptySecondaryButton: {
    minHeight: 44,
    paddingHorizontal: 17,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  emptySecondaryButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 8,
  },

  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },

  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  footerBrandMark: {
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerBrandMarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  footerBrandName: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 7,
  },
});

export default styles;
