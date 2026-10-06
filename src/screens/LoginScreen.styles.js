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

  border: '#E2E8F0',

  green: '#16A34A',
  greenSoft: '#F0FDF4',

  dark: '#111827',
};

export default StyleSheet.create({

  // =====================================================
  // ROOT
  // =====================================================

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    width: '100%',

    paddingHorizontal: 20,

    paddingTop:
      Platform.OS === 'android'
        ? 22
        : 12,

    // Extra bottom space allows the ScrollView
    // to move lower inputs above the keyboard.
    paddingBottom: 260,
  },

  smallPhoneContainer: {
    paddingHorizontal: 15,

    paddingTop: 15,

    paddingBottom: 260,
  },


  // =====================================================
  // SCROLL VIEW
  // =====================================================

  scrollView: {
    flex: 1,

    backgroundColor: COLORS.background,
  },


  // =====================================================
  // BACKGROUND
  // =====================================================

  backgroundCircle: {
    position: 'absolute',

    width: 300,
    height: 300,

    borderRadius: 150,

    top: -190,
    right: -145,

    backgroundColor: '#DBEAFE',

    opacity: 0.48,
  },

  backgroundCircleSmall: {
    position: 'absolute',

    width: 210,
    height: 210,

    borderRadius: 105,

    bottom: -140,
    left: -120,

    backgroundColor: '#DCFCE7',

    opacity: 0.30,
  },


  // =====================================================
  // HEADER
  // =====================================================

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


  // =====================================================
  // HERO
  // =====================================================

  hero: {
    marginTop: 34,

    zIndex: 5,
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

    fontSize: 42,

    lineHeight: 43,

    fontWeight: '800',

    letterSpacing: -2,
  },

  titleAccent: {
    color: COLORS.primary,
  },

  subtitle: {
    color: COLORS.textSecondary,

    fontSize: 13.5,

    lineHeight: 20,

    fontWeight: '500',

    maxWidth: 370,

    marginTop: 13,
  },


  // =====================================================
  // ROLE SECTION
  // =====================================================

  roleSection: {
    marginTop: 24,
  },

  sectionHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 10,
  },

  sectionLabel: {
    color: COLORS.textSecondary,

    fontSize: 8,

    fontWeight: '800',

    letterSpacing: 1,
  },

  selectedRoleText: {
    color: COLORS.primary,

    fontSize: 9,

    fontWeight: '800',
  },

  roleGrid: {
    width: '100%',

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 9,
  },

  roleCard: {
    width: '48.5%',

    minHeight: 76,

    borderRadius: 15,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 10,

    flexDirection: 'row',

    alignItems: 'center',

    position: 'relative',

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.035,

    shadowRadius: 8,

    elevation: 1,
  },

  roleCardSelected: {
    borderColor: COLORS.primary,

    backgroundColor: COLORS.primarySoft,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.09,

    shadowRadius: 10,

    elevation: 3,
  },

  roleIcon: {
    width: 35,
    height: 35,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F1F5F9',

    marginRight: 8,

    flexShrink: 0,
  },

  roleIconSelected: {
    backgroundColor: COLORS.primary,
  },

  roleIconText: {
    color: COLORS.textSecondary,

    fontSize: 12,

    fontWeight: '900',
  },

  roleIconTextSelected: {
    color: COLORS.white,
  },

  roleContent: {
    flex: 1,

    minWidth: 0,

    paddingRight: 4,
  },

  roleTitle: {
    color: COLORS.text,

    fontSize: 10.5,

    fontWeight: '800',

    marginBottom: 3,
  },

  roleTitleSelected: {
    color: COLORS.primary,
  },

  roleSubtitle: {
    color: COLORS.textMuted,

    fontSize: 7.5,

    fontWeight: '600',
  },

  roleSubtitleSelected: {
    color: '#4B83E5',
  },

  selectionIndicator: {
    position: 'absolute',

    top: 8,
    right: 8,

    width: 15,
    height: 15,

    borderRadius: 8,

    borderWidth: 1,

    borderColor: '#CBD5E1',

    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionIndicatorSelected: {
    backgroundColor: COLORS.primary,

    borderColor: COLORS.primary,
  },

  selectionCheck: {
    color: COLORS.white,

    fontSize: 8,

    fontWeight: '900',

    marginTop: -1,
  },


  // =====================================================
  // FORM
  // =====================================================

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

    elevation: 5,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  fieldLabel: {
    color: COLORS.textSecondary,

    fontSize: 8,

    fontWeight: '800',

    letterSpacing: 1,

    marginBottom: 8,
  },

  passwordLabelRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginBottom: 8,
  },

  forgotPassword: {
    color: COLORS.primary,

    fontSize: 9,

    fontWeight: '700',
  },


  // =====================================================
  // INPUT
  // =====================================================

  inputContainer: {
    height: 54,

    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: COLORS.border,

    paddingHorizontal: 11,

    overflow: 'hidden',
  },

  inputContainerFocused: {
    borderColor: COLORS.primary,

    backgroundColor: '#FBFDFF',

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,

    shadowRadius: 8,

    elevation: 2,
  },

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

    fontSize: 14,

    fontWeight: '800',
  },

  lockIcon: {
    color: COLORS.primary,

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: -1,
  },

  input: {
    flex: 1,

    height: '100%',

    minWidth: 0,

    color: COLORS.text,

    fontSize: 13,

    fontWeight: '600',

    paddingVertical: 0,

    paddingHorizontal: 0,

    margin: 0,

    includeFontPadding: false,
  },

  passwordToggle: {
    paddingHorizontal: 4,

    paddingVertical: 8,

    flexShrink: 0,
  },

  passwordToggleText: {
    color: COLORS.primary,

    fontSize: 8,

    fontWeight: '800',

    letterSpacing: 0.7,
  },


  // =====================================================
  // SIGN IN
  // =====================================================

  signInButton: {
    minHeight: 66,

    width: '100%',

    borderRadius: 17,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingLeft: 17,

    paddingRight: 9,

    marginTop: 1,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 9,
    },

    shadowOpacity: 0.20,

    shadowRadius: 15,

    elevation: 7,
  },

  signInButtonLoading: {
    opacity: 0.72,
  },

  signInEyebrow: {
    color: '#BFDBFE',

    fontSize: 7,

    fontWeight: '800',

    letterSpacing: 1,

    marginBottom: 4,
  },

  signInText: {
    color: COLORS.white,

    fontSize: 14,

    fontWeight: '800',

    letterSpacing: -0.3,
  },

  signInArrow: {
    width: 48,
    height: 48,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  signInArrowText: {
    color: COLORS.white,

    fontSize: 22,

    fontWeight: '400',

    marginTop: -2,
  },


  // =====================================================
  // SECURITY
  // =====================================================

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

    flexShrink: 0,
  },

  securityIconText: {
    color: COLORS.green,

    fontSize: 12,

    fontWeight: '900',
  },

  securityTextContainer: {
    flex: 1,

    minWidth: 0,
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


  // =====================================================
  // REGISTER
  // =====================================================

  registerSection: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 20,

    paddingHorizontal: 5,
  },

  registerText: {
    color: COLORS.textSecondary,

    fontSize: 11,

    fontWeight: '500',

    marginRight: 4,
  },

  registerLink: {
    color: COLORS.primary,

    fontSize: 11,

    fontWeight: '800',
  },


  // =====================================================
  // FOOTER
  // =====================================================

  footer: {
    color: COLORS.textMuted,

    textAlign: 'center',

    fontSize: 7,

    fontWeight: '800',

    letterSpacing: 1.15,

    marginTop: 16,

    paddingBottom: 5,
  },

});