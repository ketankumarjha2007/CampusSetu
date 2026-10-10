
import { StyleSheet, Platform } from 'react-native';

const C = {
  page: '#F3F6FB',
  white: '#FFFFFF',
  navy: '#101B35',
  navyLight: '#1C2C4D',
  ink: '#17233D',
  muted: '#71809A',
  mutedLight: '#94A0B4',
  border: '#E4EAF2',
  teal: '#0DAD9B',
  tealDark: '#087F75',
  tealPale: '#E2F8F4',
  blue: '#4778E8',
  bluePale: '#EBF1FF',
  amber: '#C58A24',
  amberPale: '#FFF4DB',
  purple: '#8960C9',
  purplePale: '#F2EBFC',
  red: '#D84D5C',
  redPale: '#FFF0F1',
  green: '#168461',
  greenPale: '#E4F7EE',
};

const shadow = Platform.select({
  ios: {
    shadowColor: '#1B2B48',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.055,
    shadowRadius: 18,
  },
  android: { elevation: 3 },
  default: {},
});

const card = {
  backgroundColor: C.white,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#E9EEF5',
  padding: 20,
  marginBottom: 16,
  ...shadow,
};

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.page,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 36,
  },

  // ─── HEADER ─────────────────────────────────────
  header: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.page,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
    gap: 13,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },

  headerArrow: {
    color: C.ink,
    fontSize: 31,
    lineHeight: 34,
    marginTop: -3,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: C.tealDark,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.ink,
    letterSpacing: -0.5,
  },

  refreshIcon: {
    color: C.tealDark,
    fontSize: 26,
    fontWeight: '600',
  },

  // ─── COMPLAINT HERO ─────────────────────────────
  heroCard: {
    backgroundColor: C.navy,
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#273858',
    ...Platform.select({
      ios: {
        shadowColor: C.navy,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.19,
        shadowRadius: 20,
      },
      android: { elevation: 7 },
      default: {},
    }),
  },

  eyebrowLight: {
    color: '#9FE6DA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 13,
  },

  reference: {
    color: C.white,
    fontSize: 25,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginBottom: 17,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 9,
    marginBottom: 19,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  heroFootnote: {
    color: '#B6C4DD',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.13)',
  },

  // ─── GENERAL CARDS ──────────────────────────────
  card: {
    ...card,
  },

  sectionTitle: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '850',
    letterSpacing: -0.3,
    marginBottom: 16,
  },

  issueTitle: {
    color: C.ink,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: '850',
    letterSpacing: -0.55,
    marginBottom: 11,
  },

  description: {
    color: '#59677F',
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '400',
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: C.tealPale,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 17,
    borderWidth: 1,
    borderColor: '#C7EEE6',
  },

  categoryText: {
    color: C.tealDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.35,
    textTransform: 'capitalize',
  },

  // ─── STUDENT PROFILE ────────────────────────────
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    backgroundColor: '#F6F9FD',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#EAF0F7',
    marginBottom: 16,
  },

  avatar: {
    width: 51,
    height: 51,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.navy,
    borderWidth: 3,
    borderColor: '#E3EAF8',
  },

  avatarText: {
    color: C.white,
    fontSize: 21,
    fontWeight: '900',
  },

  studentIdentity: {
    flex: 1,
  },

  studentName: {
    color: C.ink,
    fontSize: 15,
    fontWeight: '850',
    marginBottom: 5,
  },

  // ─── INFORMATION ROWS ──────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F6',
  },

  infoLabel: {
    flex: 0.8,
    color: C.muted,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '600',
  },

  infoValue: {
    flex: 1.2,
    color: C.ink,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'right',
  },

  muted: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
  },

  // ─── ATTACHMENT ─────────────────────────────────
  issuePhoto: {
    width: '100%',
    height: 230,
    borderRadius: 17,
    backgroundColor: '#E9EEF5',
    marginTop: 2,
  },

  // ─── ACTION PANEL ───────────────────────────────
  actionCard: {
    backgroundColor: C.white,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#BFEAE1',
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: C.teal,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },

  actionDescription: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: -6,
    marginBottom: 19,
  },

  inputLabel: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 9,
  },

  noteInput: {
    minHeight: 125,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    backgroundColor: '#F8FAFD',
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    lineHeight: 22,
    color: C.ink,
  },

  characterCount: {
    color: C.mutedLight,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 7,
    marginBottom: 16,
  },

  primaryButton: {
    minHeight: 53,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: C.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: C.tealDark,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },

  primaryButtonText: {
    color: C.white,
    fontSize: 13,
    fontWeight: '850',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  disabledButton: {
    opacity: 0.55,
  },

  actionHint: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },

  backButton: {
    minHeight: 46,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#F8FAFD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ─── COMPLETED STATE ────────────────────────────
  completedCard: {
    backgroundColor: C.greenPale,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#C8EBDD',
    padding: 20,
    marginBottom: 16,
  },

  completedTitle: {
    color: C.green,
    fontSize: 16,
    fontWeight: '850',
    marginBottom: 10,
  },

  // ─── ACTIVITY TIMELINE ──────────────────────────
  timelineHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  timelineCount: {
    color: C.tealDark,
    backgroundColor: C.tealPale,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    overflow: 'hidden',
    fontSize: 10,
    fontWeight: '800',
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 13,
    paddingBottom: 21,
  },

  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginTop: 5,
    borderWidth: 2,
    borderColor: C.white,
    ...shadow,
  },

  timelineBody: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EAF0F6',
  },

  timelineStatus: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '850',
    marginBottom: 5,
  },

  timelineDate: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 8,
  },

  timelineNote: {
    color: '#52617A',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 8,
  },

  timelineAuthor: {
    color: C.tealDark,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '700',
  },

  // ─── LOADING / ERROR STATES ─────────────────────
  centerState: {
    flex: 1,
    backgroundColor: C.page,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 30,
  },

  centerTitle: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '850',
    textAlign: 'center',
    marginTop: 17,
    marginBottom: 9,
  },

  errorIcon: {
    width: 62,
    height: 62,
    lineHeight: 62,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: C.redPale,
    color: C.red,
    fontSize: 29,
    fontWeight: '900',
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  // ─── FOOTER ─────────────────────────────────────
  footer: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 5,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
});
