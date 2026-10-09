import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_WIDTH < 360;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F6',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: IS_SMALL_SCREEN ? 16 : 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  brandMark: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#168653',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    shadowColor: '#168653',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },

  brandMarkText: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  brandName: {
    fontSize: IS_SMALL_SCREEN ? 19 : 21,
    fontWeight: '900',
    color: '#14271D',
    letterSpacing: -0.6,
  },

  brandTagline: {
    fontSize: 10,
    color: '#75877B',
    fontWeight: '600',
    marginTop: 3,
  },

  notificationButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3EAE5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationIcon: {
    fontSize: 24,
    color: '#26382D',
  },

  notificationBellOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#168653',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBellText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  // WELCOME
  welcomeSection: {
    marginBottom: 20,
  },

  greeting: {
    color: '#168653',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 7,
  },

  welcomeTitle: {
    fontSize: IS_SMALL_SCREEN ? 27 : 31,
    lineHeight: IS_SMALL_SCREEN ? 34 : 39,
    fontWeight: '900',
    color: '#17291F',
    letterSpacing: -0.9,
  },

  welcomeSubtitle: {
    fontSize: 13,
    color: '#728077',
    lineHeight: 20,
    marginTop: 5,
  },

  // INTRO CARD
  campusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F6EE',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D5EBDD',
    padding: 16,
    marginBottom: 20,
  },

  campusCardIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  campusCardIconText: {
    fontSize: 23,
    color: '#168653',
    fontWeight: '900',
  },

  campusCardContent: {
    flex: 1,
  },

  campusCardTitle: {
    color: '#1B4930',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },

  campusCardSubtitle: {
    color: '#557461',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
  },

  // PRIMARY ACTION
  primaryAction: {
    backgroundColor: '#176D46',
    borderRadius: 24,
    padding: IS_SMALL_SCREEN ? 19 : 22,
    marginBottom: 30,
    minHeight: 218,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#145B3B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },

  primaryActionContent: {
    flex: 1,
    zIndex: 1,
    alignItems: 'flex-start',
  },

  primaryEyebrow: {
    color: '#BDE8CC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 10,
  },

  primaryTitle: {
    color: '#FFFFFF',
    fontSize: IS_SMALL_SCREEN ? 23 : 26,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.6,
  },

  primarySubtitle: {
    color: '#D9F0E2',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 245,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 11,
    marginTop: 17,
  },

  primaryButtonText: {
    fontSize: 12,
    color: '#176D46',
    fontWeight: '900',
  },

  primaryButtonArrow: {
    fontSize: 17,
    color: '#176D46',
    marginLeft: 10,
    fontWeight: '800',
  },

  primaryDecoration: {
    position: 'absolute',
    right: -24,
    top: 22,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryDecorationText: {
    fontSize: 95,
    lineHeight: 105,
    color: 'rgba(255,255,255,0.15)',
    fontWeight: '300',
  },

  // SECTION HEADERS
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 19,
    color: '#182A20',
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#87938A',
    marginTop: 4,
    lineHeight: 16,
  },

  // QUICK ACTION GRID
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  quickCard: {
    width: '48.5%',
    minHeight: 158,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E7EDE8',
    padding: IS_SMALL_SCREEN ? 12 : 15,
    marginBottom: 12,
    position: 'relative',
  },

  quickIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  quickIcon: {
    fontSize: 24,
    fontWeight: '900',
  },

  quickTitle: {
    color: '#24342A',
    fontSize: IS_SMALL_SCREEN ? 12 : 13,
    fontWeight: '900',
    marginBottom: 5,
  },

  quickSubtitle: {
    color: '#8A958D',
    fontSize: 10,
    lineHeight: 15,
    paddingRight: 3,
  },

  quickArrow: {
    position: 'absolute',
    right: 13,
    top: 14,
    color: '#B3BEB6',
    fontSize: 17,
    fontWeight: '700',
  },

  // RECENT ACTIVITY
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 10,
  },

  viewAllText: {
    color: '#168653',
    fontSize: 12,
    fontWeight: '900',
  },

  viewAllArrow: {
    color: '#168653',
    fontSize: 16,
    marginLeft: 5,
  },

  reportsList: {
    marginBottom: 6,
  },

  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: IS_SMALL_SCREEN ? 14 : 16,
    marginBottom: 12,
  },

  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  reportTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  reportCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#168653',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 6,
  },

  reportTitle: {
    color: '#1C2B21',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '900',
  },

  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    maxWidth: 112,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },

  reportLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },

  smallIcon: {
    color: '#718078',
    fontSize: 17,
    marginRight: 7,
    marginTop: -2,
  },

  reportLocation: {
    flex: 1,
    color: '#758179',
    fontSize: 11,
    lineHeight: 17,
  },

  reportDivider: {
    height: 1,
    backgroundColor: '#EEF2EF',
    marginVertical: 13,
  },

  reportBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  reportMeta: {
    flex: 1,
    paddingRight: 8,
  },

  metaLabel: {
    color: '#98A39B',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5,
  },

  complaintId: {
    color: '#236A48',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  reportMetaRight: {
    alignItems: 'flex-end',
    flexShrink: 1,
  },

  priorityText: {
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 5,
    textAlign: 'right',
  },

  reportDate: {
    color: '#98A39B',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },

  openDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
    marginTop: 13,
    paddingTop: 11,
  },

  openDetailsText: {
    color: '#168653',
    fontSize: 11,
    fontWeight: '800',
  },

  openDetailsArrow: {
    color: '#168653',
    fontSize: 17,
    fontWeight: '800',
  },

  // LOADING / ERROR / EMPTY STATES
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE7',
    borderRadius: 20,
    minHeight: 155,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    marginBottom: 20,
  },

  loadingText: {
    color: '#718078',
    fontSize: 12,
    marginTop: 13,
    fontWeight: '600',
  },

  errorCard: {
    backgroundColor: '#FFF7F7',
    borderColor: '#F3D6D6',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  errorIcon: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: '#FDE8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  errorIconText: {
    color: '#B91C1C',
    fontSize: 21,
    fontWeight: '900',
  },

  errorTitle: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '900',
  },

  errorMessage: {
    color: '#B45353',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#E8BDBD',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 14,
  },

  retryButtonText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 22,
  },

  emptyIcon: {
    width: 61,
    height: 61,
    borderRadius: 21,
    backgroundColor: '#E9F6EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIconText: {
    color: '#168653',
    fontSize: 32,
    fontWeight: '700',
  },

  emptyTitle: {
    color: '#203127',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptySubtitle: {
    color: '#849087',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 285,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#168653',
    borderRadius: 13,
    paddingHorizontal: 17,
    paddingVertical: 12,
    marginTop: 19,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyButtonArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 9,
    fontWeight: '800',
  },

  // SUPPORT FOOTER
  footerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5ECE7',
    padding: 16,
    marginTop: 8,
  },

  footerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F0E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  footerIconText: {
    color: '#7E22CE',
    fontSize: 21,
    fontWeight: '900',
  },

  footerContent: {
    flex: 1,
  },

  footerTitle: {
    color: '#27382D',
    fontSize: 14,
    fontWeight: '900',
  },

  footerSubtitle: {
    color: '#849087',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 3,
  },

  footerLinkText: {
    color: '#168653',
    fontSize: 11,
    fontWeight: '900',
  },

  footerLinkArrow: {
    color: '#168653',
    fontSize: 16,
    marginLeft: 6,
  },

  bottomNote: {
    textAlign: 'center',
    color: '#A1ACA4',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 22,
    marginBottom: 5,
  },

  // BOTTOM NAVIGATION
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EEE9',
    paddingTop: 9,
    paddingBottom: 7,
    paddingHorizontal: 4,
  },

  navItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },

  navIcon: {
    fontSize: 21,
    color: '#9AA69D',
    marginBottom: 4,
  },

  navIconActive: {
    fontSize: 23,
    color: '#168653',
    marginBottom: 3,
    fontWeight: '900',
  },

  navLabel: {
    color: '#98A39B',
    fontSize: 9,
    fontWeight: '700',
  },

  navLabelActive: {
    color: '#168653',
    fontSize: 9,
    fontWeight: '900',
  },

  navAddItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navAddButton: {
    width: 39,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#168653',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#168653',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },

  navAddText: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 29,
    fontWeight: '500',
  },
});

export default styles;