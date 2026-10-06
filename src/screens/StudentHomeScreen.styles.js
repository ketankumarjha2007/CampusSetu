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

  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',

  border: '#E2E8F0',
};

export default StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
  },


  // ============================
  // HEADER
  // ============================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  greeting: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 5,
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  notificationIcon: {
    fontSize: 18,
  },

  notificationDot: {
    position: 'absolute',

    width: 7,
    height: 7,

    borderRadius: 4,

    backgroundColor: '#EF4444',

    top: 9,
    right: 9,

    borderWidth: 1.5,
    borderColor: COLORS.white,
  },


  // ============================
  // CAMPUS STATUS
  // ============================

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.greenSoft,

    borderWidth: 1,
    borderColor: '#DCFCE7',

    borderRadius: 16,

    padding: 13,

    marginBottom: 16,
  },

  statusIcon: {
    width: 34,
    height: 34,

    borderRadius: 11,

    backgroundColor: COLORS.white,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  statusIconText: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: '900',
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: '#166534',
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 2,
  },

  statusSubtitle: {
    color: '#4D7C5A',
    fontSize: 8.5,
    fontWeight: '500',
  },

  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,

    backgroundColor: COLORS.green,
  },


  // ============================
  // REPORT CARD
  // ============================

  reportCard: {
    minHeight: 205,

    borderRadius: 22,

    backgroundColor: COLORS.primary,

    padding: 20,

    overflow: 'hidden',

    position: 'relative',

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.22,

    shadowRadius: 18,

    elevation: 7,

    marginBottom: 25,
  },

  reportContent: {
    width: '78%',
    zIndex: 2,
  },

  reportEyebrow: {
    color: '#BFDBFE',

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 1.2,

    marginBottom: 8,
  },

  reportTitle: {
    color: COLORS.white,

    fontSize: 25,

    lineHeight: 30,

    fontWeight: '800',

    letterSpacing: -0.7,
  },

  reportSubtitle: {
    color: '#DBEAFE',

    fontSize: 11,

    lineHeight: 17,

    fontWeight: '500',

    marginTop: 8,

    maxWidth: 250,
  },

  reportButton: {
    height: 39,

    alignSelf: 'flex-start',

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: 12,

    paddingLeft: 13,

    paddingRight: 7,

    marginTop: 17,
  },

  reportButtonText: {
    color: COLORS.primary,

    fontSize: 10,

    fontWeight: '800',

    marginRight: 8,
  },

  reportArrow: {
    width: 25,
    height: 25,

    borderRadius: 8,

    backgroundColor: COLORS.primarySoft,

    color: COLORS.primary,

    textAlign: 'center',

    lineHeight: 23,

    fontSize: 16,

    fontWeight: '500',
  },

  reportDecoration: {
    position: 'absolute',

    width: 160,
    height: 160,

    borderRadius: 80,

    right: -55,
    bottom: -55,

    backgroundColor: 'rgba(255,255,255,0.08)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  reportDecorationText: {
    color: 'rgba(255,255,255,0.15)',

    fontSize: 100,

    fontWeight: '200',

    marginTop: -10,
  },


  // ============================
  // SECTION HEADERS
  // ============================

  sectionHeader: {
    marginBottom: 13,
  },

  sectionHeaderRecent: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 13,

    marginTop: 5,
  },

  sectionTitle: {
    color: COLORS.text,

    fontSize: 16,

    fontWeight: '800',

    letterSpacing: -0.3,
  },

  sectionHint: {
    color: COLORS.muted,

    fontSize: 9,

    fontWeight: '500',

    marginTop: 3,
  },

  viewAll: {
    color: COLORS.primary,

    fontSize: 9,

    fontWeight: '800',
  },


  // ============================
  // QUICK ACTIONS
  // ============================

  quickGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 10,

    marginBottom: 25,
  },

  quickCard: {
    width: '48.5%',

    minHeight: 116,

    backgroundColor: COLORS.white,

    borderRadius: 17,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 13,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.035,

    shadowRadius: 8,

    elevation: 1,
  },

  quickIconBlue: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 9,
  },

  quickIconGreen: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: COLORS.greenSoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 9,
  },

  quickIconOrange: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: COLORS.orangeSoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 9,
  },

  quickIconPurple: {
    width: 32,
    height: 32,

    borderRadius: 10,

    backgroundColor: COLORS.purpleSoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 9,
  },

  quickIconText: {
    color: COLORS.text,

    fontSize: 14,

    fontWeight: '900',
  },

  quickTitle: {
    color: COLORS.text,

    fontSize: 11,

    fontWeight: '800',

    marginBottom: 3,
  },

  quickSubtitle: {
    color: COLORS.muted,

    fontSize: 8,

    fontWeight: '500',

    lineHeight: 12,
  },


  // ============================
  // EMPTY STATE
  // ============================

  emptyCard: {
    backgroundColor: COLORS.white,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 22,

    alignItems: 'center',
  },

  emptyIcon: {
    width: 50,
    height: 50,

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

    fontSize: 9.5,

    lineHeight: 15,

    textAlign: 'center',

    maxWidth: 250,
  },

  emptyButton: {
    height: 38,

    paddingHorizontal: 15,

    borderRadius: 11,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 15,
  },

  emptyButtonText: {
    color: COLORS.primary,

    fontSize: 9,

    fontWeight: '800',
  },


  bottomSpace: {
    height: 10,
  },


  // ============================
  // BOTTOM NAVIGATION
  // ============================

  bottomNav: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height: 74,

    backgroundColor: COLORS.white,

    borderTopWidth: 1,

    borderTopColor: COLORS.border,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    paddingHorizontal: 8,

    paddingBottom: 5,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.05,

    shadowRadius: 12,

    elevation: 10,
  },

  navItem: {
    width: 58,

    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: COLORS.muted,

    fontSize: 18,

    marginBottom: 3,
  },

  navLabel: {
    color: COLORS.muted,

    fontSize: 7.5,

    fontWeight: '700',
  },

  navIconActive: {
    color: COLORS.primary,

    fontSize: 19,

    marginBottom: 3,
  },

  navLabelActive: {
    color: COLORS.primary,

    fontSize: 7.5,

    fontWeight: '800',
  },

  addButton: {
    width: 48,
    height: 48,

    borderRadius: 16,

    backgroundColor: COLORS.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -22,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.25,

    shadowRadius: 10,

    elevation: 6,
  },

  addButtonText: {
    color: COLORS.white,

    fontSize: 27,

    fontWeight: '300',

    marginTop: -2,
  },

});