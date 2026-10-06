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
  primarySoft: '#EFF6FF',

  border: '#E2E8F0',

  green: '#16A34A',
  greenSoft: '#F0FDF4',
};

export default StyleSheet.create({

  // --------------------------------------------------
  // SCREEN
  // --------------------------------------------------

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,

    paddingTop:
      Platform.OS === 'android'
        ? 22
        : 12,

    paddingBottom: 40,
  },

  smallPhoneContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 30,
  },

  // --------------------------------------------------
  // BACKGROUND DECOR
  // --------------------------------------------------

  backgroundCircle: {
    position: 'absolute',

    width: 310,
    height: 310,

    borderRadius: 155,

    top: -195,
    right: -150,

    backgroundColor: '#DBEAFE',

    opacity: 0.48,
  },

  backgroundCircleSmall: {
    position: 'absolute',

    width: 220,
    height: 220,

    borderRadius: 110,

    bottom: -145,
    left: -125,

    backgroundColor: '#DCFCE7',

    opacity: 0.3,
  },

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  header: {
    width: '100%',
    height: 46,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  backArrow: {
    color: COLORS.text,

    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',

    marginTop: -3,
  },

  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerLogo: {
    width: 31,
    height: 31,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primary,

    marginRight: 8,
  },

  headerLogoText: {
    color: COLORS.white,

    fontSize: 16,
    fontWeight: '900',
  },

  headerBrandText: {
    color: COLORS.text,

    fontSize: 14,
    fontWeight: '800',

    letterSpacing: -0.3,
  },

  headerSpacer: {
    width: 42,
  },

  // --------------------------------------------------
  // HERO
  // --------------------------------------------------

  hero: {
    marginTop: 30,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 11,
  },

  eyebrowDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.primary,

    marginRight: 7,
  },

  eyebrow: {
    color: COLORS.primary,

    fontSize: 9,
    fontWeight: '800',

    letterSpacing: 1.2,
  },

  title: {
    color: COLORS.text,

    fontSize: 38,
    lineHeight: 40,

    fontWeight: '800',

    letterSpacing: -1.8,
  },

  titleAccent: {
    color: COLORS.primary,
  },

  subtitle: {
    color: COLORS.textSecondary,

    fontSize: 13.5,
    lineHeight: 20,

    fontWeight: '500',

    maxWidth: 380,

    marginTop: 13,
  },

  // --------------------------------------------------
  // STUDENT BADGE
  // --------------------------------------------------

  studentBadge: {
    marginTop: 18,

    minHeight: 63,

    borderRadius: 17,

    backgroundColor: COLORS.primarySoft,

    borderWidth: 1,
    borderColor: '#DBEAFE',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 11,
  },

  studentBadgeIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primary,

    marginRight: 10,
  },

  studentBadgeIconText: {
    color: COLORS.white,

    fontSize: 13,
    fontWeight: '900',
  },

  studentBadgeContent: {
    flex: 1,
  },

  studentBadgeTitle: {
    color: COLORS.text,

    fontSize: 10.5,
    fontWeight: '800',

    marginBottom: 3,
  },

  studentBadgeSubtitle: {
    color: COLORS.textSecondary,

    fontSize: 8.5,
    fontWeight: '500',

    lineHeight: 12,
  },

  badgeCheck: {
    width: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor: COLORS.greenSoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 7,
  },

  badgeCheckText: {
    color: COLORS.green,

    fontSize: 11,
    fontWeight: '900',
  },

  // --------------------------------------------------
  // FORM CARD
  // --------------------------------------------------

  formCard: {
    marginTop: 16,

    padding: 18,

    borderRadius: 22,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.07,
    shadowRadius: 24,

    elevation: 4,
  },

  // --------------------------------------------------
  // FIELD
  // --------------------------------------------------

  fieldContainer: {
    marginBottom: 16,
  },

  fieldLabel: {
    color: COLORS.textSecondary,

    fontSize: 8,
    fontWeight: '800',

    letterSpacing: 1,

    marginBottom: 8,
  },

  // --------------------------------------------------
  // INPUT CONTAINER
  // --------------------------------------------------

  inputContainer: {
    width: '100%',

    height: 54,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: COLORS.border,

    paddingHorizontal: 11,
  },

  inputContainerFocused: {
    borderColor: COLORS.primary,

    backgroundColor: '#FBFDFF',
  },

  // --------------------------------------------------
  // INPUT ICON
  // --------------------------------------------------

  inputIcon: {
    width: 31,
    height: 31,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.primarySoft,

    marginRight: 9,

    flexShrink: 0,
  },

  inputIconText: {
    color: COLORS.primary,

    fontSize: 10,
    fontWeight: '900',
  },

  lockIcon: {
    color: COLORS.primary,

    fontSize: 8,
    fontWeight: '900',

    letterSpacing: -1,
  },

  // --------------------------------------------------
  // NATIVE TEXT INPUT
  // --------------------------------------------------

  input: {
    flex: 1,

    height: 52,

    color: COLORS.text,

    fontSize: 13,
    fontWeight: '600',

    paddingTop: 0,
    paddingBottom: 0,

    paddingLeft: 0,
    paddingRight: 0,

    margin: 0,

    includeFontPadding: false,

    textAlignVertical: 'center',
  },

  // --------------------------------------------------
  // PASSWORD TOGGLE
  // --------------------------------------------------

  passwordToggle: {
    width: 48,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 3,

    flexShrink: 0,
  },

  passwordToggleText: {
    color: COLORS.primary,

    fontSize: 8,
    fontWeight: '800',

    letterSpacing: 0.7,
  },

  // --------------------------------------------------
  // CREATE ACCOUNT BUTTON
  // --------------------------------------------------

  createButton: {
    width: '100%',
    minHeight: 60,

    borderRadius: 17,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 18,

    marginTop: 3,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.20,
    shadowRadius: 12,

    elevation: 5,
  },

  createButtonLoading: {
    opacity: 0.72,
  },

  createEyebrow: {
    color: 'rgba(255,255,255,0.72)',

    fontSize: 7.5,
    fontWeight: '800',

    letterSpacing: 1.1,

    marginBottom: 3,
  },

  createText: {
    color: COLORS.white,

    fontSize: 14,
    fontWeight: '800',

    letterSpacing: 0.1,
  },

  createArrow: {
    width: 36,
    height: 36,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  createArrowText: {
    color: COLORS.white,

    fontSize: 21,
    fontWeight: '400',

    marginTop: -2,
  },

  // --------------------------------------------------
  // SECURITY
  // --------------------------------------------------

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 16,

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },

  securityIcon: {
    width: 29,
    height: 29,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: COLORS.greenSoft,

    marginRight: 9,
  },

  securityIconText: {
    color: COLORS.green,

    fontSize: 12,
    fontWeight: '900',
  },

  securityTextContainer: {
    flex: 1,
  },

  securityTitle: {
    color: COLORS.text,

    fontSize: 9.5,
    fontWeight: '700',

    marginBottom: 2,
  },

  securitySubtitle: {
    color: COLORS.textMuted,

    fontSize: 8.2,
    fontWeight: '500',

    lineHeight: 12,
  },

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  loginSection: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 20,
  },

  loginText: {
    color: COLORS.textSecondary,

    fontSize: 11,
    fontWeight: '500',

    marginRight: 4,
  },

  loginLink: {
    color: COLORS.primary,

    fontSize: 11,
    fontWeight: '800',
  },

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------

  footer: {
    color: COLORS.textMuted,

    textAlign: 'center',

    fontSize: 7,
    fontWeight: '800',

    letterSpacing: 1.15,

    marginTop: 16,
  },
});