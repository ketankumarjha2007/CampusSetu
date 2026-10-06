import {
  StyleSheet,
  Platform,
} from 'react-native';

const COLORS = {
  background: '#F7F9FC',

  white: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',

  green: '#16A34A',
  greenSoft: '#F0FDF4',

  border: '#E2E8F0',

  dashboard: '#111827',
  dashboardBorder: '#1E293B',

  graph: '#3B82F6',
};

export default StyleSheet.create({

  // =====================================================
  // ROOT
  // =====================================================

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,

    paddingHorizontal: 20,

    paddingTop:
      Platform.OS === 'android'
        ? 25
        : 16,

    paddingBottom: 28,

    overflow: 'hidden',
  },

  smallPhoneContainer: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 20,
  },

  mediumPhoneContainer: {
    paddingHorizontal: 19,
  },

  largePhoneContainer: {
    paddingHorizontal: 24,
  },

  shortScreenContainer: {
    paddingTop: 15,
    paddingBottom: 18,
  },

  veryShortScreenContainer: {
    paddingTop: 12,
    paddingBottom: 14,
  },

  // =====================================================
  // BACKGROUND
  // =====================================================

  backgroundGlowTop: {
    position: 'absolute',

    width: 290,
    height: 290,

    borderRadius: 145,

    top: -190,
    right: -145,

    backgroundColor: '#DBEAFE',

    opacity: 0.48,
  },

  backgroundGlowBottom: {
    position: 'absolute',

    width: 260,
    height: 260,

    borderRadius: 130,

    bottom: -170,
    left: -145,

    backgroundColor: '#DCFCE7',

    opacity: 0.38,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    width: '100%',

    minHeight: 46,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    zIndex: 20,
  },

  brandRow: {
    flexDirection: 'row',

    alignItems: 'center',

    flexShrink: 1,
  },

  brandIcon: {
    width: 43,
    height: 43,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primary,

    marginRight: 10,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.18,

    shadowRadius: 12,

    elevation: 5,
  },

  brandIconText: {
    color: COLORS.white,

    fontSize: 22,

    fontWeight: '900',

    letterSpacing: -1,
  },

  brandTextContainer: {
    justifyContent: 'center',

    flexShrink: 1,
  },

  brandName: {
    color: COLORS.text,

    fontSize: 17,

    fontWeight: '800',

    letterSpacing: -0.45,
  },

  brandCaption: {
    color: COLORS.textMuted,

    fontSize: 7.2,

    fontWeight: '800',

    letterSpacing: 1.15,

    marginTop: 2,
  },

  liveBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 10,

    paddingVertical: 7,

    borderRadius: 20,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.045,

    shadowRadius: 8,

    elevation: 2,
  },

  liveIndicator: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: COLORS.green,

    marginRight: 6,
  },

  liveText: {
    color: COLORS.textSecondary,

    fontSize: 8.5,

    fontWeight: '800',

    letterSpacing: 0.8,
  },

  // =====================================================
  // HERO
  // =====================================================

  hero: {
    marginTop: 36,

    zIndex: 5,
  },

  shortHero: {
    marginTop: 25,
  },

  heroEyebrowRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 11,
  },

  heroEyebrowLine: {
    width: 22,
    height: 2,

    borderRadius: 2,

    backgroundColor: COLORS.primary,

    marginRight: 8,
  },

  heroEyebrow: {
    color: COLORS.primary,

    fontSize: 9,

    fontWeight: '800',

    letterSpacing: 1.2,
  },

  heroTitle: {
    color: COLORS.text,

    fontSize: 42,

    lineHeight: 44,

    fontWeight: '800',

    letterSpacing: -2.15,
  },

  smallHeroTitle: {
    fontSize: 34,

    lineHeight: 37,

    letterSpacing: -1.65,
  },

  mediumHeroTitle: {
    fontSize: 39,

    lineHeight: 42,

    letterSpacing: -1.9,
  },

  largeHeroTitle: {
    fontSize: 45,

    lineHeight: 47,

    letterSpacing: -2.3,
  },

  heroAccent: {
    color: COLORS.primary,
  },

  heroDescription: {
    color: COLORS.textSecondary,

    fontSize: 13.5,

    lineHeight: 20.5,

    fontWeight: '500',

    maxWidth: 370,

    marginTop: 14,
  },

  smallHeroDescription: {
    fontSize: 13,

    lineHeight: 19,

    marginTop: 12,
  },

  // =====================================================
  // VISUAL SECTION
  // =====================================================

  visualSection: {
    flex: 1,

    minHeight: 305,

    width: '100%',

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',

    marginTop: 20,

    marginBottom: 17,
  },

  shortVisualSection: {
    minHeight: 260,

    marginTop: 10,

    marginBottom: 10,
  },

  veryShortVisualSection: {
    minHeight: 225,

    marginTop: 6,

    marginBottom: 7,
  },

  // =====================================================
  // VISUAL GLOW
  // =====================================================

  visualGlow: {
    position: 'absolute',

    width: 235,
    height: 235,

    borderRadius: 118,

    backgroundColor: '#DBEAFE',

    opacity: 0.6,
  },

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  mainVisual: {
    minHeight: 238,

    borderRadius: 24,

    backgroundColor: COLORS.dashboard,

    paddingHorizontal: 18,

    paddingVertical: 17,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: COLORS.dashboardBorder,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 18,
    },

    shadowOpacity: 0.18,

    shadowRadius: 28,

    elevation: 12,
  },

  visualHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 17,
  },

  visualLabel: {
    color: '#64748B',

    fontSize: 7.5,

    fontWeight: '800',

    letterSpacing: 1.35,

    marginBottom: 4,
  },

  visualTitle: {
    color: COLORS.white,

    fontSize: 15.5,

    fontWeight: '700',

    letterSpacing: -0.3,
  },

  pulseIcon: {
    width: 31,
    height: 31,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#172554',

    position: 'relative',
  },

  pulseRing: {
    position: 'absolute',

    width: 17,
    height: 17,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: '#3B82F6',

    opacity: 0.35,
  },

  pulseDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: '#60A5FA',
  },

  // =====================================================
  // METRIC
  // =====================================================

  metricSection: {
    flexDirection: 'row',

    alignItems: 'flex-end',

    justifyContent: 'space-between',

    marginBottom: 16,
  },

  metricNumber: {
    color: COLORS.white,

    fontSize: 29,

    lineHeight: 32,

    fontWeight: '800',

    letterSpacing: -1.25,
  },

  metricLabel: {
    color: '#64748B',

    fontSize: 7,

    fontWeight: '800',

    letterSpacing: 0.75,

    marginTop: 3,
  },

  metricChange: {
    alignItems: 'flex-end',
  },

  changePill: {
    paddingHorizontal: 7,

    paddingVertical: 4,

    borderRadius: 7,

    backgroundColor: '#052E16',

    marginBottom: 3,
  },

  metricChangeText: {
    color: '#4ADE80',

    fontSize: 10,

    fontWeight: '800',
  },

  metricChangeLabel: {
    color: '#64748B',

    fontSize: 6.5,

    fontWeight: '700',

    letterSpacing: 0.6,
  },

  // =====================================================
  // GRAPH
  // =====================================================

  activityGraph: {
    height: 51,

    width: '100%',

    flexDirection: 'row',

    alignItems: 'flex-end',

    paddingHorizontal: 2,

    marginBottom: 17,
  },

  graphBar: {
    flex: 1,

    minWidth: 4,

    marginHorizontal: 2,

    borderTopLeftRadius: 4,

    borderTopRightRadius: 4,

    backgroundColor: COLORS.graph,
  },

  graphBarOne: {
    height: '32%',

    opacity: 0.28,
  },

  graphBarTwo: {
    height: '46%',

    opacity: 0.38,
  },

  graphBarThree: {
    height: '39%',

    opacity: 0.46,
  },

  graphBarFour: {
    height: '63%',

    opacity: 0.56,
  },

  graphBarFive: {
    height: '52%',

    opacity: 0.64,
  },

  graphBarSix: {
    height: '76%',

    opacity: 0.73,
  },

  graphBarSeven: {
    height: '67%',

    opacity: 0.84,
  },

  graphBarEight: {
    height: '92%',

    opacity: 1,
  },

  // =====================================================
  // MINI STATS
  // =====================================================

  miniStats: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    paddingTop: 12,

    borderTopWidth: 1,

    borderTopColor: '#263244',
  },

  miniStat: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    minWidth: 0,
  },

  miniStatText: {
    flexShrink: 1,
  },

  miniIconBlue: {
    width: 28,
    height: 28,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#172554',

    marginRight: 8,
  },

  miniIconGreen: {
    width: 28,
    height: 28,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#052E16',

    marginRight: 8,
  },

  miniIconText: {
    color: COLORS.white,

    fontSize: 12,

    fontWeight: '900',
  },

  miniNumber: {
    color: COLORS.white,

    fontSize: 12.5,

    fontWeight: '800',
  },

  miniLabel: {
    color: '#64748B',

    fontSize: 6.2,

    fontWeight: '800',

    letterSpacing: 0.4,

    marginTop: 2,
  },

  statDivider: {
    width: 1,

    height: 27,

    backgroundColor: '#263244',

    marginHorizontal: 9,
  },

  // =====================================================
  // FLOATING STATUS CARDS
  // =====================================================

  floatingStatus: {
    position: 'absolute',

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: 14,

    paddingHorizontal: 10,

    paddingVertical: 9,

    minWidth: 145,

    maxWidth: 180,

    borderWidth: 1,

    borderColor: '#E8EDF4',

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.11,

    shadowRadius: 16,

    elevation: 7,

    zIndex: 10,
  },

  floatingStatusTop: {
    top: 12,

    right: -2,
  },

  floatingStatusBottom: {
    bottom: 8,

    left: -2,
  },

  statusIconBlue: {
    width: 29,
    height: 29,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primarySoft,

    marginRight: 8,
  },

  statusIconGreen: {
    width: 29,
    height: 29,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.greenSoft,

    marginRight: 8,
  },

  statusIconText: {
    color: COLORS.primary,

    fontSize: 11,

    fontWeight: '900',
  },

  statusTextContainer: {
    flexShrink: 1,
  },

  statusTitle: {
    color: COLORS.text,

    fontSize: 10.5,

    fontWeight: '800',

    marginBottom: 2,
  },

  statusSubtitle: {
    color: COLORS.textMuted,

    fontSize: 8.2,

    fontWeight: '600',
  },

  // =====================================================
  // CTA
  // =====================================================

  ctaSection: {
    width: '100%',

    marginTop: 2,
  },

  primaryButton: {
    width: '100%',

    minHeight: 68,

    borderRadius: 18,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingLeft: 18,

    paddingRight: 9,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 9,
    },

    shadowOpacity: 0.2,

    shadowRadius: 15,

    elevation: 8,
  },

  buttonTextContainer: {
    flex: 1,

    justifyContent: 'center',
  },

  buttonEyebrow: {
    color: '#BFDBFE',

    fontSize: 7.5,

    fontWeight: '800',

    letterSpacing: 1.05,

    marginBottom: 4,
  },

  buttonTitle: {
    color: COLORS.white,

    fontSize: 16,

    fontWeight: '800',

    letterSpacing: -0.35,
  },

  buttonArrow: {
    width: 49,
    height: 49,

    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  buttonArrowText: {
    color: COLORS.white,

    fontSize: 23,

    fontWeight: '500',

    marginTop: -2,
  },

  bottomCaption: {
    color: COLORS.textMuted,

    textAlign: 'center',

    fontSize: 7.2,

    fontWeight: '800',

    letterSpacing: 1.25,

    marginTop: 12,
  },
});