import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SMALL = SCREEN_WIDTH < 360;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F2',
  },

  scroll: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: SMALL ? 17 : 22,
    paddingTop: 13,
    paddingBottom: 23,
    overflow: 'hidden',
  },

  smallContainer: {
    paddingHorizontal: 15,
    paddingTop: 9,
  },

  largeContainer: {
    paddingHorizontal: 28,
    paddingTop: 18,
  },

  shortContainer: {
    paddingTop: 7,
    paddingBottom: 15,
  },

  // BACKGROUND
  backgroundOrb: {
    position: 'absolute',
    top: 105,
    right: -145,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: '#E6F0E5',
    opacity: 0.65,
  },

  backgroundOrbSmall: {
    position: 'absolute',
    top: 380,
    left: -150,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E9F0E8',
    opacity: 0.6,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 31,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 7,
  },

  brandMark: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#174F36',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    position: 'relative',
    shadowColor: '#174F36',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.17,
    shadowRadius: 9,
    elevation: 4,
  },

  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -1,
  },

  brandMarkDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B8ED8B',
    right: 5,
    top: 5,
    borderWidth: 1.5,
    borderColor: '#174F36',
  },

  brandCopy: {
    flexShrink: 1,
  },

  brandName: {
    color: '#183426',
    fontSize: SMALL ? 20 : 22,
    fontWeight: '900',
    letterSpacing: -0.8,
  },

  brandTagline: {
    color: '#829087',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.65,
    marginTop: 4,
  },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8DD',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  headerBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3C9661',
    marginRight: 6,
  },

  headerBadgeText: {
    color: '#557260',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.45,
  },

  // HERO
  hero: {
    marginBottom: 25,
  },

  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#E8F1E5',
    borderWidth: 1,
    borderColor: '#DCE9D9',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 15,
  },

  eyebrowStar: {
    width: 17,
    height: 17,
    borderRadius: 6,
    backgroundColor: '#D2E8C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  eyebrowStarText: {
    color: '#286342',
    fontSize: 11,
    fontWeight: '900',
  },

  eyebrowText: {
    color: '#326748',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.85,
  },

  heroTitle: {
    color: '#173A28',
    fontSize: SMALL ? 39 : 44,
    lineHeight: SMALL ? 44 : 50,
    fontWeight: '900',
    letterSpacing: -2,
  },

  heroTitleSmall: {
    fontSize: 35,
    lineHeight: 40,
    letterSpacing: -1.6,
  },

  heroTitleLarge: {
    fontSize: 48,
    lineHeight: 54,
  },

  heroAccent: {
    color: '#338255',
  },

  heroDescription: {
    color: '#718078',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 330,
  },

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
  },

  trustCheck: {
    width: 17,
    height: 17,
    borderRadius: 6,
    backgroundColor: '#DDEEDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  trustCheckText: {
    color: '#287348',
    fontSize: 10,
    fontWeight: '900',
  },

  trustText: {
    color: '#5F7164',
    fontSize: 10,
    fontWeight: '800',
  },

  trustSeparator: {
    width: 1,
    height: 14,
    backgroundColor: '#D9E1D7',
    marginHorizontal: 12,
  },

  // SHOWCASE
  showcase: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 17,
    paddingBottom: 19,
    marginBottom: 5,
  },

  showcaseShort: {
    paddingTop: 13,
    paddingBottom: 14,
  },

  halo: {
    position: 'absolute',
    width: '94%',
    height: '82%',
    borderRadius: 38,
    backgroundColor: '#E1EDE0',
    opacity: 0.9,
  },

  dashboard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E4EAE1',
    padding: SMALL ? 14 : 17,
    shadowColor: '#244B32',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.11,
    shadowRadius: 22,
    elevation: 6,
    zIndex: 1,
  },

  // DASHBOARD HEADER
  dashboardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dashboardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  dashboardMiniMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#174F36',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  dashboardMiniMarkText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },

  dashboardOverline: {
    color: '#7E9384',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.15,
    marginBottom: 4,
  },

  dashboardHeading: {
    color: '#213A2A',
    fontSize: SMALL ? 11 : 12,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  dashboardMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: '#F3F6F1',
    marginLeft: 8,
  },

  menuDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#708477',
    marginHorizontal: 1.5,
  },

  // FEATURED PANEL
  featuredPanel: {
    backgroundColor: '#174F36',
    borderRadius: 20,
    padding: SMALL ? 13 : 16,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 171,
  },

  featuredGlow: {
    position: 'absolute',
    right: -48,
    top: -52,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 26,
    borderColor: 'rgba(255,255,255,0.055)',
  },

  featuredTextBlock: {
    zIndex: 1,
    alignItems: 'flex-start',
  },

  featuredEyebrow: {
    color: '#B7E2C3',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.25,
    marginBottom: 8,
  },

  featuredTitle: {
    color: '#FFFFFF',
    fontSize: SMALL ? 18 : 21,
    lineHeight: SMALL ? 22 : 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  featuredDescription: {
    color: '#D5E8DA',
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
    maxWidth: 215,
  },

  featuredIcon: {
    position: 'absolute',
    top: 17,
    right: 16,
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  featuredIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  featuredButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8F09D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    zIndex: 1,
  },

  featuredButtonText: {
    color: '#234B30',
    fontSize: 9,
    fontWeight: '900',
  },

  featuredButtonArrow: {
    color: '#234B30',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 9,
  },

  // WORKFLOW
  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 19,
    marginBottom: 12,
  },

  workflowTitle: {
    color: '#263D2D',
    fontSize: SMALL ? 12 : 13,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  workflowCaption: {
    color: '#89988C',
    fontSize: 8,
    fontWeight: '700',
  },

  workflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 43,
  },

  workflowIcon: {
    width: 33,
    height: 33,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  workflowIconGreen: {
    backgroundColor: '#E5F2E3',
  },

  workflowIconBlue: {
    backgroundColor: '#E8F0FD',
  },

  workflowIconGold: {
    backgroundColor: '#FBF0D9',
  },

  workflowIconText: {
    color: '#365B40',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  workflowCopy: {
    flex: 1,
    paddingRight: 6,
  },

  workflowStepTitle: {
    color: '#304234',
    fontSize: 10,
    fontWeight: '900',
  },

  workflowStepDescription: {
    color: '#89958C',
    fontSize: 8,
    lineHeight: 13,
    marginTop: 3,
  },

  workflowArrow: {
    color: '#8EA494',
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 3,
  },

  workflowLine: {
    height: 1,
    backgroundColor: '#EEF2EC',
    marginVertical: 5,
  },

  // DASHBOARD FOOTER
  dashboardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF1EB',
  },

  footerSpark: {
    width: 19,
    height: 19,
    borderRadius: 7,
    backgroundColor: '#E7F2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  footerSparkText: {
    color: '#367B4D',
    fontSize: 11,
    fontWeight: '900',
  },

  dashboardFooterText: {
    color: '#6F8374',
    fontSize: 8,
    fontWeight: '800',
  },

  footerLine: {
    height: 3,
    width: 22,
    borderRadius: 2,
    backgroundColor: '#D4E6CD',
    marginLeft: 'auto',
  },

  // FLOATING CARDS
  floatCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6ECE3',
    paddingHorizontal: 10,
    paddingVertical: 9,
    shadowColor: '#203F2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 3,
  },

  floatCardTop: {
    top: 1,
    right: -2,
  },

  floatCardBottom: {
    bottom: 3,
    left: -2,
  },

  floatIconGreen: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#E3F3E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  floatIconBlue: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#E6EEFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  floatIconText: {
    color: '#28734A',
    fontSize: 16,
    fontWeight: '900',
  },

  floatIconTextBlue: {
    color: '#3765AE',
    fontSize: 16,
    fontWeight: '900',
  },

  floatCopy: {
    flexShrink: 1,
  },

  floatTitle: {
    color: '#2A3E30',
    fontSize: 9,
    fontWeight: '900',
  },

  floatSubtitle: {
    color: '#89958C',
    fontSize: 7,
    marginTop: 3,
  },

  // CTA
  ctaSection: {
    marginTop: 7,
  },

  primaryButton: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#174F36',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 13,
    shadowColor: '#174F36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 5,
  },

  buttonCopy: {
    flex: 1,
    paddingRight: 12,
  },

  buttonEyebrow: {
    color: '#B7E2C3',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  buttonTitle: {
    color: '#FFFFFF',
    fontSize: SMALL ? 16 : 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  buttonArrowCircle: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#D8F09D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonArrowText: {
    color: '#234B30',
    fontSize: 23,
    fontWeight: '700',
  },

  bottomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 19,
  },

  bottomMetaLine: {
    flex: 1,
    maxWidth: 37,
    height: 1,
    backgroundColor: '#DDE5DA',
  },

  bottomMetaText: {
    color: '#91A094',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
    marginHorizontal: 10,
    textAlign: 'center',
  },
});

export default styles;