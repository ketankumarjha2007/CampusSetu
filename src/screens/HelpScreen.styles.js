import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: '#F7F9FC',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 38,
    color: '#172033',
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#172033',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#7A8496',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172033',
    borderRadius: 22,
    padding: 20,
    marginBottom: 26,
  },

  heroIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  heroIcon: {
    fontSize: 28,
    fontWeight: '900',
    color: '#172033',
  },

  heroTextContainer: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 5,
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#D9DFEA',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 12,
  },

  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },

  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  guideNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  guideNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3447D8',
  },

  guideText: {
    flex: 1,
  },

  guideTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
  },

  guideDescription: {
    fontSize: 12,
    color: '#7A8496',
    marginTop: 3,
  },

  guideLine: {
    width: 1,
    height: 18,
    backgroundColor: '#E1E6EF',
    marginLeft: 19,
    marginVertical: 5,
  },

  faqContainer: {
    marginBottom: 24,
  },

  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },

  faqCardOpen: {
    borderColor: '#CBD2FF',
  },

  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  questionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F0F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  questionIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3447D8',
  },

  question: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#172033',
  },

  arrow: {
    width: 26,
    textAlign: 'right',
    fontSize: 24,
    fontWeight: '500',
    color: '#6C7587',
    marginLeft: 8,
  },

  answer: {
    fontSize: 13,
    lineHeight: 20,
    color: '#667085',
    marginTop: 13,
    marginLeft: 46,
    paddingRight: 8,
  },

  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  supportIcon: {
    fontSize: 27,
    marginRight: 14,
  },

  supportContent: {
    flex: 1,
  },

  supportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 4,
  },

  supportText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#9A5B36',
  },

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#98A2B3',
    marginTop: 22,
  },
});

export default styles;