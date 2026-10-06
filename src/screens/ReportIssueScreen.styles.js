import { StyleSheet } from 'react-native';

const COLORS = {
  background: '#F7F9FC',
  white: '#FFFFFF',

  text: '#0F172A',
  secondary: '#64748B',
  muted: '#94A3B8',

  primary: '#2563EB',
  primarySoft: '#EFF6FF',

  border: '#E2E8F0',

  green: '#16A34A',
};

export default StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 35,
  },


  // =========================
  // HEADER
  // =========================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
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

  headerTextContainer: {
    flex: 1,
  },

  headerEyebrow: {
    color: COLORS.primary,

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 1.2,

    marginBottom: 4,
  },

  headerTitle: {
    color: COLORS.text,

    fontSize: 24,

    fontWeight: '800',

    letterSpacing: -0.6,
  },


  // =========================
  // INTRO
  // =========================

  intro: {
    marginBottom: 23,
  },

  introTitle: {
    color: COLORS.text,

    fontSize: 20,

    fontWeight: '800',

    marginBottom: 6,
  },

  introSubtitle: {
    color: COLORS.secondary,

    fontSize: 11,

    lineHeight: 17,

    fontWeight: '500',
  },


  // =========================
  // FIELDS
  // =========================

  fieldContainer: {
    marginBottom: 21,
  },

  label: {
    color: COLORS.secondary,

    fontSize: 8,

    fontWeight: '900',

    letterSpacing: 1,

    marginBottom: 9,
  },

  input: {
    minHeight: 54,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 14,

    paddingHorizontal: 14,

    color: COLORS.text,

    fontSize: 12,

    fontWeight: '600',
  },

  descriptionInput: {
    minHeight: 125,

    paddingTop: 14,

    paddingBottom: 14,
  },


  // =========================
  // CATEGORY
  // =========================

  categoryGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 8,
  },

  categoryChip: {
    paddingHorizontal: 13,

    minHeight: 36,

    borderRadius: 11,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryChipSelected: {
    backgroundColor: COLORS.primarySoft,

    borderColor: COLORS.primary,
  },

  categoryText: {
    color: COLORS.secondary,

    fontSize: 9,

    fontWeight: '700',
  },

  categoryTextSelected: {
    color: COLORS.primary,

    fontWeight: '800',
  },


  // =========================
  // PHOTO
  // =========================

  photoCard: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: COLORS.white,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 13,

    marginBottom: 20,
  },

  photoIcon: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: COLORS.primarySoft,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  photoIconText: {
    color: COLORS.primary,

    fontSize: 23,

    fontWeight: '300',
  },

  photoContent: {
    flex: 1,
  },

  photoTitle: {
    color: COLORS.text,

    fontSize: 11,

    fontWeight: '800',

    marginBottom: 3,
  },

  photoSubtitle: {
    color: COLORS.muted,

    fontSize: 8.5,

    lineHeight: 13,
  },


  // =========================
  // SUBMIT
  // =========================

  submitButton: {
    minHeight: 68,

    borderRadius: 17,

    backgroundColor: COLORS.primary,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingLeft: 17,

    paddingRight: 9,

    shadowColor: COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 9,
    },

    shadowOpacity: 0.2,

    shadowRadius: 15,

    elevation: 7,
  },

  submitEyebrow: {
    color: '#BFDBFE',

    fontSize: 7,

    fontWeight: '900',

    letterSpacing: 1,

    marginBottom: 4,
  },

  submitText: {
    color: COLORS.white,

    fontSize: 14,

    fontWeight: '800',
  },

  submitArrow: {
    width: 49,
    height: 49,

    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.14)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  submitArrowText: {
    color: COLORS.white,

    fontSize: 22,

    fontWeight: '400',
  },


  footerText: {
    color: COLORS.muted,

    textAlign: 'center',

    fontSize: 7.5,

    fontWeight: '700',

    marginTop: 22,
  },

});