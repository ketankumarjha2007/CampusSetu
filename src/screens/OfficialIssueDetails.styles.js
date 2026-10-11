
import { StyleSheet } from 'react-native';

const colors = {
  page: '#F4F7F5',
  white: '#FFFFFF',
  ink: '#172821',
  muted: '#718078',
  green: '#087F5B',
  greenDark: '#075B43',
  greenSoft: '#E7F5EE',
  border: '#E4EBE6',
};

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 14,
  },

  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.page,
    gap: 12,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerArrow: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.ink,
    marginTop: -3,
  },

  refreshIcon: {
    fontSize: 25,
    color: colors.green,
    marginTop: -2,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '900',
    color: colors.green,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.4,
  },

  heroCard: {
    backgroundColor: '#103D30',
    borderRadius: 25,
    padding: 21,
    overflow: 'hidden',
    shadowColor: '#0A3F2F',
    shadowOpacity: 0.13,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },

  heroMark: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27614E',
    borderWidth: 1,
    borderColor: '#477966',
  },

  heroMarkText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  heroMeta: {
    flex: 1,
  },

  eyebrowLight: {
    color: '#B8D8CA',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  reference: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 15,
  },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 100,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 18,
    marginBottom: 12,
  },

  heroFootnote: {
    color: '#C5DCD2',
    fontSize: 11,
    fontWeight: '600',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 21,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#163A2D',
    shadowOpacity: 0.035,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  sectionKicker: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.45,
    color: colors.green,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: -0.2,
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#526259',
    fontWeight: '500',
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.greenSoft,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 14,
  },

  categoryText: {
    color: colors.greenDark,
    fontSize: 11,
    fontWeight: '800',
  },

  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  avatar: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1F3E9',
  },

  avatarText: {
    color: colors.greenDark,
    fontSize: 19,
    fontWeight: '900',
  },

  studentIdentity: {
    flex: 1,
  },

  studentName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 3,
  },

  muted: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    fontWeight: '500',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EF',
  },

  infoLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    flex: 0.8,
  },

  infoValue: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '800',
    flex: 1.2,
    textAlign: 'right',
  },

  issuePhoto: {
    width: '100%',
    height: 220,
    borderRadius: 15,
    backgroundColor: '#EDF2EE',
    marginTop: 3,
  },

  proofCard: {
    backgroundColor: '#F0FAF4',
    borderRadius: 21,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFE7CF',
    gap: 11,
  },

  proofHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  proofCheck: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#D3F2DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  proofCheckText: {
    color: '#16754B',
    fontSize: 18,
    fontWeight: '900',
  },

  proofHeadingText: {
    flex: 1,
  },

  proofTitle: {
    fontSize: 15,
    color: '#17583D',
    fontWeight: '900',
    marginBottom: 2,
  },

  proofSubtitle: {
    fontSize: 11,
    color: '#5D8270',
    fontWeight: '600',
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CDE8D8',
    shadowColor: '#0A6C4A',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  actionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 5,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greenSoft,
  },

  actionIconText: {
    fontSize: 20,
    color: colors.green,
    fontWeight: '900',
  },

  actionHeading: {
    flex: 1,
  },

  actionDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#68786F',
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 8,
  },

  noteInput: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#DCE7E0',
    borderRadius: 14,
    backgroundColor: '#FAFCFA',
    padding: 13,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },

  characterCount: {
    fontSize: 10,
    color: '#8A9890',
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 12,
  },

  photoSection: {
    marginTop: 4,
    marginBottom: 16,
  },

  photoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  requiredPill: {
    borderRadius: 100,
    backgroundColor: '#FCE8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },

  requiredPillText: {
    color: '#B83232',
    fontSize: 8,
    letterSpacing: 0.8,
    fontWeight: '900',
  },

  photoHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 10,
  },

  photoPicker: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#9CCEB2',
    borderRadius: 17,
    backgroundColor: '#F5FBF7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 22,
  },

  cameraIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#DFF3E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  cameraIconText: {
    fontSize: 25,
    color: colors.green,
    fontWeight: '700',
    marginTop: -2,
  },

  photoPickerTitle: {
    fontSize: 13,
    color: colors.greenDark,
    fontWeight: '900',
    marginBottom: 4,
  },

  photoPickerSubtitle: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },

  previewWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },

  proofPreview: {
    width: '100%',
    height: 190,
    backgroundColor: '#EDF2EE',
  },

  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
  },

  previewNameWrap: {
    flex: 1,
  },

  previewSuccess: {
    fontSize: 11,
    color: '#16754B',
    fontWeight: '900',
    marginBottom: 3,
  },

  previewName: {
    fontSize: 10,
    color: colors.muted,
  },

  removePhotoButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FCE8E8',
  },

  removePhotoText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B83232',
  },

  changePhotoButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },

  changePhotoText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.green,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  actionHint: {
    fontSize: 10,
    lineHeight: 16,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 9,
    marginBottom: 4,
  },

  secondaryButton: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D9E6DE',
    backgroundColor: '#F5F9F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  secondaryButtonText: {
    fontSize: 12,
    color: colors.greenDark,
    fontWeight: '800',
    textAlign: 'center',
  },

  completedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 17,
    borderRadius: 20,
    backgroundColor: '#F0FAF4',
    borderWidth: 1,
    borderColor: '#CBEAD6',
  },

  completedIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#D8F3E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedIconText: {
    color: '#16754B',
    fontSize: 18,
    fontWeight: '900',
  },

  completedBody: {
    flex: 1,
  },

  completedTitle: {
    fontSize: 15,
    color: '#17583D',
    fontWeight: '900',
    marginBottom: 5,
  },

  timelineHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  timelineCountPill: {
    backgroundColor: '#F0F5F1',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  timelineCount: {
    color: '#65746B',
    fontSize: 10,
    fontWeight: '800',
  },

  timelineItem: {
    flexDirection: 'row',
    gap: 11,
    minHeight: 65,
  },

  timelineRail: {
    width: 14,
    alignItems: 'center',
  },

  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    zIndex: 1,
  },

  timelineLine: {
    position: 'absolute',
    top: 14,
    bottom: -2,
    width: 2,
    backgroundColor: '#E2EAE4',
  },

  timelineBody: {
    flex: 1,
    paddingBottom: 18,
  },

  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },

  timelineStatus: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '900',
    flex: 1,
  },

  timelineDate: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'right',
    flexShrink: 1,
  },

  timelineNote: {
    fontSize: 12,
    lineHeight: 18,
    color: '#526259',
    marginTop: 5,
  },

  timelineAuthor: {
    fontSize: 10,
    color: colors.green,
    fontWeight: '700',
    marginTop: 6,
  },

  footer: {
    textAlign: 'center',
    color: '#98A59D',
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 8,
  },

  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },

  centerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
    marginTop: 15,
    marginBottom: 6,
  },

  errorIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FCE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorIcon: {
    fontSize: 28,
    color: '#B83232',
    fontWeight: '900',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 29, 21, 0.48)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#DCE5DE',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 21,
    lineHeight: 27,
    color: colors.ink,
    fontWeight: '900',
    marginBottom: 8,
  },

  modalDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    marginBottom: 16,
  },

  modalInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#DCE7E0',
    borderRadius: 14,
    backgroundColor: '#FAFCFA',
    padding: 13,
    fontSize: 13,
    color: colors.ink,
    textAlignVertical: 'top',
  },

  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  modalSendButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
