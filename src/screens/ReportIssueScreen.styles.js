import { StyleSheet } from 'react-native';

const C = {
  ink: '#14213D',
  muted: '#64748B',
  white: '#FFFFFF',
  navy: '#173B68',
  blue: '#2563EB',
  canvas: '#F5F7FB',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.canvas,
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 14,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 22,
    gap: 13,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    marginTop: 2,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#E6EBF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  backArrow: {
    fontSize: 31,
    lineHeight: 34,
    color: C.ink,
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
    gap: 10,
  },

  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },

  brandMarkText: {
    color: C.white,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },

  brandCopy: {
    flex: 1,
    minWidth: 0,
  },

  headerEyebrow: {
    color: C.navy,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.1,
  },

  headerTagline: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
    letterSpacing: 0.15,
  },

  headerTitle: {
    color: C.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  headerSubtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  // Intro card
  intro: {
    backgroundColor: C.navy,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },

  introTitle: {
    color: C.white,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  introSubtitle: {
    color: '#DCE8F7',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    maxWidth: 520,
  },

  // Fields
  fieldContainer: {
    marginBottom: 20,
  },

  label: {
    color: '#34445D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.15,
    marginBottom: 9,
  },

  input: {
    width: '100%',
    minHeight: 52,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: C.ink,
    fontSize: 14,
    lineHeight: 20,
  },

  descriptionInput: {
    minHeight: 132,
    paddingTop: 15,
    textAlignVertical: 'top',
  },

  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  categoryChip: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#DDE5EF',
  },

  categoryChipSelected: {
    backgroundColor: '#EAF2FF',
    borderColor: C.blue,
  },

  categoryText: {
    color: '#52627A',
    fontSize: 12,
    fontWeight: '700',
  },

  categoryTextSelected: {
    color: C.blue,
    fontWeight: '900',
  },

  // Priority
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },

  optionalHint: {
    color: C.muted,
    fontSize: 11,
    marginBottom: 9,
  },

  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  priorityCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 130,
    minHeight: 83,
    padding: 13,
    borderRadius: 15,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#E1E7EF',
  },

  priorityCardCompact: {
    flexBasis: '46%',
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  priorityCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  priorityTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '900',
  },

  priorityRadio: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  priorityDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 8,
  },

  priorityNote: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 9,
  },

  // Responsive location fields
  locationPairRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  locationPairRowCompact: {
    gap: 9,
  },

  locationPairField: {
    flex: 1,
    minWidth: 0,
  },

  // Photo
  selectedPhotoCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  selectedPhoto: {
    width: '100%',
    height: 220,
  },

  selectedPhotoFooter: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  photoContent: {
    flex: 1,
    minWidth: 0,
  },

  selectedPhotoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  selectedPhotoName: {
    marginTop: 4,
    fontSize: 11,
    color: C.muted,
  },

  removePhotoButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  removePhotoText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    minHeight: 94,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#DDE5EF',
    borderStyle: 'dashed',
    backgroundColor: C.white,
  },

  photoIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoIconText: {
    color: C.blue,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '500',
  },

  photoTitle: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '900',
  },

  photoSubtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  changePhotoButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  changePhotoText: {
    fontSize: 12,
    fontWeight: '800',
    color: C.blue,
  },

  // Submit
  submitButton: {
    minHeight: 78,
    borderRadius: 19,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 2,
    marginBottom: 20,
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },

  submitButtonDisabled: {
    opacity: 0.75,
  },

  submitContent: {
    flex: 1,
  },

  submitEyebrow: {
    color: '#B9D0EE',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  submitText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '900',
  },

  submitArrow: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitArrowText: {
    color: C.white,
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '700',
  },

  footerText: {
    color: '#8491A5',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
});

export default styles;