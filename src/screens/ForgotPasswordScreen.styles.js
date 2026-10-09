import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SMALL = width < 360;

const COLORS = {
  background: '#F5F7F2',
  white: '#FFFFFF',
  green: '#176B4D',
  darkGreen: '#104B38',
  text: '#172820',
  muted: '#77847B',
  border: '#E3EAE1',
  paleGreen: '#E7F2E8',
  red: '#B93838',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: SMALL ? 19 : 25,
    paddingTop: 12,
    paddingBottom: 20,
  },

  smallContainer: {
    paddingHorizontal: 16,
  },

  // Navigation
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: 43,
    paddingRight: 14,
    marginBottom: 25,
  },

  backArrow: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 35,
    marginRight: 8,
    marginTop: -3,
  },

  backText: {
    color: '#58675C',
    fontSize: 12,
    fontWeight: '700',
  },

  // Brand
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  brandMarkText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },

  brandName: {
    color: COLORS.darkGreen,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  brandTagline: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },

  // Hero
  hero: {
    alignItems: 'flex-start',
    marginBottom: 23,
  },

  illustration: {
    width: 118,
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 22,
  },

  illustrationCircle: {
    width: 91,
    height: 91,
    borderRadius: 32,
    backgroundColor: '#DFEDE0',
    borderWidth: 1,
    borderColor: '#D0E4D2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationEmoji: {
    color: COLORS.green,
    fontSize: 39,
    fontWeight: '700',
  },

  illustrationLock: {
    position: 'absolute',
    right: 4,
    bottom: 0,
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    borderWidth: 4,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationLockText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
  },

  illustrationSparkOne: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#D9A95B',
    top: 5,
    right: 10,
  },

  illustrationSparkTwo: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8BB99A',
    top: 31,
    left: 5,
  },

  eyebrow: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },

  title: {
    color: COLORS.text,
    fontSize: SMALL ? 35 : 40,
    lineHeight: SMALL ? 40 : 45,
    fontWeight: '900',
    letterSpacing: -1.8,
  },

  titleAccent: {
    color: COLORS.green,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 22,
    marginTop: 13,
    maxWidth: 350,
  },

  // Form
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SMALL ? 17 : 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#1D432C',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.055,
    shadowRadius: 18,
    elevation: 3,
  },

  fieldLabel: {
    color: '#526357',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  inputContainer: {
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBF8',
    borderWidth: 1,
    borderColor: '#E0E8DF',
    borderRadius: 16,
    paddingHorizontal: 11,
  },

  inputFocused: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.white,
  },

  inputError: {
    borderColor: '#E6A4A0',
    backgroundColor: '#FFF9F8',
  },

  inputIconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  inputIcon: {
    color: COLORS.green,
    fontSize: 17,
    fontWeight: '800',
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 53,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 10,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF0EF',
    borderRadius: 12,
    padding: 11,
    marginTop: 10,
  },

  errorIcon: {
    width: 18,
    height: 18,
    lineHeight: 18,
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 9,
    backgroundColor: '#F5D4D1',
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '900',
    marginRight: 8,
  },

  errorText: {
    flex: 1,
    color: COLORS.red,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
  },

  submitButton: {
    minHeight: 56,
    backgroundColor: COLORS.green,
    borderRadius: 16,
    marginTop: 19,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.green,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.17,
    shadowRadius: 9,
    elevation: 3,
  },

  submitButtonDisabled: {
    opacity: 0.72,
  },

  submitButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.1,
  },

  submitButtonArrow: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '600',
    marginLeft: 12,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F7F1',
    borderRadius: 13,
    padding: 12,
    marginTop: 16,
  },

  securityIcon: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '900',
    marginRight: 8,
    marginTop: 1,
  },

  securityText: {
    flex: 1,
    color: '#6B7A6D',
    fontSize: 10,
    lineHeight: 17,
  },

  // Success
  successHero: {
    alignItems: 'center',
    paddingTop: 17,
  },

  successIconOuter: {
    width: 112,
    height: 112,
    borderRadius: 38,
    backgroundColor: '#E1F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 21,
  },

  successIconInner: {
    width: 75,
    height: 75,
    borderRadius: 27,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successCheck: {
    color: COLORS.white,
    fontSize: 39,
    fontWeight: '800',
  },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F3E7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 17,
  },

  successBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 7,
  },

  successBadgeText: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  successTitle: {
    color: COLORS.text,
    fontSize: SMALL ? 35 : 40,
    lineHeight: SMALL ? 40 : 45,
    fontWeight: '900',
    letterSpacing: -1.6,
    textAlign: 'center',
  },

  successSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 21,
    maxWidth: 330,
  },

  emailPreview: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  emailPreviewIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  emailPreviewIconText: {
    color: COLORS.green,
    fontSize: 21,
  },

  emailPreviewContent: {
    flex: 1,
    minWidth: 0,
  },

  emailPreviewLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  emailPreviewValue: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },

  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 4,
  },

  nextStepsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 16,
  },

  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0EB',
  },

  stepRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },

  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  stepNumberText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '900',
  },

  stepText: {
    flex: 1,
    color: '#526357',
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '600',
  },

  spamNote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 16,
  },

  tryAnotherButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 5,
  },

  tryAnotherText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '800',
  },

  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 28,
    alignItems: 'center',
  },

  footerDivider: {
    width: 38,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C9DCCB',
    marginBottom: 12,
  },

  footerText: {
    color: '#96A197',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
});

export default styles;