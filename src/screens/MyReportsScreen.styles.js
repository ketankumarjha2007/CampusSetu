import { StyleSheet } from 'react-native';

const COLORS = {
  background: '#F7F9FC',
  white: '#FFFFFF',

  text: '#0F172A',
  secondary: '#64748B',
  muted: '#94A3B8',

  primary: '#2563EB',
  primarySoft: '#EFF6FF',

  green: '#16A34A',
  greenSoft: '#F0FDF4',

  orange: '#EA580C',
  orangeSoft: '#FFF7ED',

  red: '#DC2626',
  redSoft: '#FEF2F2',

  purple: '#7C3AED',

  border: '#E2E8F0',
};

export default StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },


  // =========================
  // HEADER
  // =========================

  header: {
    height: 76,

    paddingHorizontal: 20,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  backArrow: {
    color: COLORS.text,

    fontSize: 31,

    fontWeight: '300',

    marginTop: -3,
  },

  headerContent: {
    flex: 1,
  },

  headerEyebrow: {
    color: COLORS.primary,

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 1.2,

    marginBottom: 3,
  },

  headerTitle: {
    color: COLORS.text,

    fontSize: 24,

    fontWeight: '800',

    letterSpacing: -0.6,
  },

  headerSpacer: {
    width: 42,
  },


  // =========================
  // SCROLL
  // =========================

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 35,
  },


  // =========================
  // SUMMARY
  // =========================

  summaryCard: {
    backgroundColor: COLORS.primary,

    borderRadius: 19,

    padding: 17,

    marginBottom: 22,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.16,

    shadowRadius: 15,

    elevation: 6,
  },

  summaryMain: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  summaryNumber: {
    color: COLORS.white,

    fontSize: 34,

    fontWeight: '800',

    marginRight: 12,
  },

  summaryTitle: {
    color: COLORS.white,

    fontSize: 12,

    fontWeight: '800',

    marginBottom: 3,
  },

  summarySubtitle: {
    color: '#BFDBFE',

    fontSize: 8.5,

    fontWeight: '500',
  },

  summaryStatus: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 13,

    paddingTop: 11,

    borderTopWidth: 1,

    borderTopColor: 'rgba(255,255,255,0.15)',
  },

  summaryDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: '#86EFAC',

    marginRight: 7,
  },

  summaryStatusText: {
    color: '#DCFCE7',

    fontSize: 8,

    fontWeight: '700',
  },


  // =========================
  // FILTER
  // =========================

  filterSection: {
    marginBottom: 22,
  },

  filterLabel: {
    color: COLORS.secondary,

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 1,

    marginBottom: 10,
  },

  filterScroll: {
    paddingRight: 10,
  },

  filterChip: {
    minHeight: 36,

    paddingHorizontal: 14,

    borderRadius: 11,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 8,
  },

  filterChipSelected: {
    backgroundColor: COLORS.primary,

    borderColor: COLORS.primary,
  },

  filterText: {
    color: COLORS.secondary,

    fontSize: 9,

    fontWeight: '700',
  },

  filterTextSelected: {
    color: COLORS.white,

    fontWeight: '800',
  },


  // =========================
  // RESULTS HEADER
  // =========================

  resultsHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 13,
  },

  resultsTitle: {
    color: COLORS.text,

    fontSize: 16,

    fontWeight: '800',

    letterSpacing: -0.3,
  },

  resultsSubtitle: {
    color: COLORS.muted,

    fontSize: 8.5,

    fontWeight: '500',

    marginTop: 3,
  },

  newReportButton: {
    height: 34,

    paddingHorizontal: 12,

    borderRadius: 10,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  newReportButtonText: {
    color: COLORS.primary,

    fontSize: 9,

    fontWeight: '800',
  },


  // =========================
  // REPORT CARD
  // =========================

  reportCard: {
    backgroundColor: COLORS.white,

    borderRadius: 18,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 15,

    marginBottom: 11,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.035,

    shadowRadius: 8,

    elevation: 1,
  },

  reportTop: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 10,
  },

  categoryBadge: {
    paddingHorizontal: 9,

    minHeight: 24,

    borderRadius: 8,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryBadgeText: {
    color: COLORS.primary,

    fontSize: 7.5,

    fontWeight: '800',
  },

  priorityBadge: {
    paddingHorizontal: 8,

    minHeight: 23,

    borderRadius: 7,

    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityHigh: {
    backgroundColor: COLORS.redSoft,
  },

  priorityMedium: {
    backgroundColor: COLORS.orangeSoft,
  },

  priorityLow: {
    backgroundColor: COLORS.greenSoft,
  },

  priorityText: {
    color: COLORS.secondary,

    fontSize: 7.5,

    fontWeight: '800',
  },

  reportTitle: {
    color: COLORS.text,

    fontSize: 13,

    fontWeight: '800',

    lineHeight: 18,

    marginBottom: 5,
  },

  reportDescription: {
    color: COLORS.secondary,

    fontSize: 9,

    lineHeight: 14,

    fontWeight: '500',

    marginBottom: 11,
  },

  metaRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingBottom: 11,

    borderBottomWidth: 1,

    borderBottomColor: '#F1F5F9',
  },

  metaText: {
    color: COLORS.muted,

    fontSize: 7.5,

    fontWeight: '600',

    maxWidth: '55%',
  },

  reportFooter: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingTop: 11,
  },

  statusBadge: {
    minHeight: 25,

    paddingHorizontal: 9,

    borderRadius: 8,

    flexDirection: 'row',

    alignItems: 'center',
  },

  statusPending: {
    backgroundColor: COLORS.orangeSoft,
  },

  statusProgress: {
    backgroundColor: COLORS.primarySoft,
  },

  statusResolved: {
    backgroundColor: COLORS.greenSoft,
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.orange,

    marginRight: 5,
  },

  statusText: {
    fontSize: 7.5,

    fontWeight: '800',
  },

  statusPendingText: {
    color: COLORS.orange,
  },

  statusProgressText: {
    color: COLORS.primary,
  },

  statusResolvedText: {
    color: COLORS.green,
  },

  viewDetails: {
    color: COLORS.primary,

    fontSize: 8,

    fontWeight: '800',
  },


  // =========================
  // EMPTY
  // =========================

  emptyState: {
    backgroundColor: COLORS.white,

    borderRadius: 19,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 25,

    alignItems: 'center',
  },

  emptyIcon: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },

  emptyIconText: {
    color: COLORS.primary,

    fontSize: 22,

    fontWeight: '800',
  },

  emptyTitle: {
    color: COLORS.text,

    fontSize: 14,

    fontWeight: '800',

    marginBottom: 5,
  },

  emptySubtitle: {
    color: COLORS.muted,

    fontSize: 9,

    lineHeight: 14,

    textAlign: 'center',
  },

  emptyButton: {
    height: 38,

    paddingHorizontal: 15,

    borderRadius: 11,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 15,
  },

  emptyButtonText: {
    color: COLORS.white,

    fontSize: 9,

    fontWeight: '800',
  },

  bottomSpace: {
    height: 10,
  },

});