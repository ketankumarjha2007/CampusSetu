import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiDownload } from '../services/api';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monthly', detail: 'A focused month-by-month review' },
  { value: 'yearly', label: 'Yearly', detail: 'A complete annual performance view' },
  { value: 'all', label: 'All time', detail: 'The full campus grievance record' },
];

const COLORS = {
  ink: '#15342A',
  forest: '#0B3027',
  green: '#176B4D',
  background: '#F4F7F3',
  muted: '#718078',
  border: '#E2E9E2',
  white: '#FFFFFF',
  lime: '#C8F36A',
};

const getFileName = (type, year, month) => {
  const period =
    type === 'monthly'
      ? `${MONTHS[month - 1]}-${year}`
      : type === 'yearly'
        ? `Year-${year}`
        : 'All-Time';
  return `CampusSetu-Executive-Report-${period}.pdf`;
};

export default function ReportsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 700;
  const now = new Date();
  const [reportType, setReportType] = useState('monthly');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [downloading, setDownloading] = useState(false);
  const [readyFileName, setReadyFileName] = useState('');

  const periodLabel = useMemo(() => {
    if (reportType === 'monthly') return `${MONTHS[month - 1]} ${year}`;
    if (reportType === 'yearly') return `Calendar year ${year}`;
    return 'All recorded complaints';
  }, [month, reportType, year]);

  const adjustYear = (amount) => {
    setYear((currentYear) => Math.max(2000, Math.min(2100, currentYear + amount)));
  };

  const downloadReport = async () => {
    if (downloading) return;

    setDownloading(true);
    setReadyFileName('');

    try {
      const query = [`type=${reportType}`];
      if (reportType !== 'all') query.push(`year=${year}`);
      if (reportType === 'monthly') query.push(`month=${month}`);

      const bytes = await apiDownload(
        `/issues/reports/download?${query.join('&')}`
      );
      const fileName = getFileName(reportType, year, month);
      const file = new File(Paths.cache, fileName);
      file.create({ intermediates: true, overwrite: true });
      file.write(bytes);

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error(
          'PDF sharing is not available on this device. Please try on a supported mobile device.'
        );
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `CampusSetu report · ${periodLabel}`,
      });
      setReadyFileName(fileName);
    } catch (error) {
      console.error('Report download failed:', error);
      Alert.alert(
        'Could not prepare report',
        error?.message || 'Please check your connection and try again.'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.forest} />
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.topBarTitle}>
          <Text style={styles.topBarEyebrow}>CAMPUSSETU · LEADERSHIP</Text>
          <Text style={styles.topBarHeading}>Reports & insights</Text>
        </View>
        <View style={styles.pdfBadge}>
          <Text style={styles.pdfBadgeText}>PDF</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 28 },
          isWide && styles.contentWide,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View pointerEvents="none" style={styles.heroGlow} />
          <View style={styles.heroCopy}>
            <View style={styles.heroEyebrowRow}>
              <View style={styles.heroEyebrowDot} />
              <Text style={styles.heroEyebrow}>EXECUTIVE REPORT STUDIO</Text>
            </View>
            <Text style={styles.heroTitle}>The whole picture,{"\n"}beautifully clear.</Text>
            <Text style={styles.heroDescription}>
              Turn campus activity into a polished, decision-ready report for
              leadership and review meetings.
            </Text>
          </View>
          <View style={[styles.heroDocument, isWide && styles.heroDocumentWide]}>
            <View style={styles.documentTopLine} />
            <View style={styles.documentHeader}>
              <View style={styles.documentMark}><Text style={styles.documentMarkText}>C</Text></View>
              <View style={styles.documentBrandLines}>
                <View style={styles.documentBrandLine} />
                <View style={[styles.documentBrandLine, styles.documentBrandLineShort]} />
              </View>
              <View style={styles.documentStamp}><Text style={styles.documentStampText}>LIVE</Text></View>
            </View>
            <View style={styles.documentRule} />
            <View style={styles.documentMetricRow}>
              <View style={styles.documentMetric}>
                <View style={[styles.documentMetricValue, { width: 35 }]} />
                <View style={styles.documentMetricLabel} />
              </View>
              <View style={styles.documentMetric}>
                <View style={[styles.documentMetricValue, { width: 24, backgroundColor: '#77C69A' }]} />
                <View style={styles.documentMetricLabel} />
              </View>
              <View style={styles.documentMetric}>
                <View style={[styles.documentMetricValue, { width: 29, backgroundColor: '#E6B95C' }]} />
                <View style={styles.documentMetricLabel} />
              </View>
            </View>
            <View style={styles.documentBars}>
              <View style={[styles.documentBar, { width: '88%' }]} />
              <View style={[styles.documentBar, { width: '62%' }]} />
              <View style={[styles.documentBar, { width: '74%' }]} />
            </View>
            <View style={styles.documentFooter}>
              <Text style={styles.documentFooterText}>CAMPUS HEALTH · PERIOD REVIEW</Text>
              <Text style={styles.documentFooterArrow}>↗</Text>
            </View>
          </View>
        </View>

        <View style={[styles.builderCard, isWide && styles.builderCardWide]}>
          <View style={styles.sectionIntro}>
            <View>
              <Text style={styles.sectionEyebrow}>BUILD YOUR REPORT</Text>
              <Text style={styles.sectionTitle}>Choose a time range</Text>
            </View>
            <View style={styles.securePill}>
              <Text style={styles.securePillText}>●  PRIVATE EXPORT</Text>
            </View>
          </View>

          <View style={[styles.typeGrid, isWide && styles.typeGridWide]}>
            {REPORT_TYPES.map((type, index) => {
              const active = reportType === type.value;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    isWide && styles.typeCardWide,
                    active && styles.typeCardActive,
                    index > 0 && isWide && styles.typeCardGap,
                  ]}
                  onPress={() => {
                    setReportType(type.value);
                    setReadyFileName('');
                  }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={[styles.typeIcon, active && styles.typeIconActive]}>
                    <Text style={[styles.typeIconText, active && styles.typeIconTextActive]}>
                      {type.value === 'monthly' ? 'M' : type.value === 'yearly' ? 'Y' : '∞'}
                    </Text>
                  </View>
                  <View style={styles.typeCardCopy}>
                    <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                      {type.label}
                    </Text>
                    <Text style={styles.typeDetail}>{type.detail}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {reportType !== 'all' ? (
            <View style={styles.periodControls}>
              <View style={styles.periodTitleRow}>
                <Text style={styles.periodTitle}>
                  {reportType === 'monthly' ? 'REPORT MONTH' : 'REPORT YEAR'}
                </Text>
                <View style={styles.yearStepper}>
                  <TouchableOpacity
                    style={styles.yearButton}
                    onPress={() => adjustYear(-1)}
                    disabled={year <= 2000}
                    accessibilityRole="button"
                    accessibilityLabel="Previous year"
                  >
                    <Text style={styles.yearButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.yearValue}>{year}</Text>
                  <TouchableOpacity
                    style={styles.yearButton}
                    onPress={() => adjustYear(1)}
                    disabled={year >= 2100}
                    accessibilityRole="button"
                    accessibilityLabel="Next year"
                  >
                    <Text style={styles.yearButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {reportType === 'monthly' ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.monthList}
                >
                  {MONTHS.map((monthName, index) => {
                    const monthValue = index + 1;
                    const active = month === monthValue;
                    return (
                      <TouchableOpacity
                        key={monthName}
                        style={[styles.monthChip, active && styles.monthChipActive]}
                        onPress={() => {
                          setMonth(monthValue);
                          setReadyFileName('');
                        }}
                        activeOpacity={0.82}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>
                          {monthName.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}
            </View>
          ) : (
            <View style={styles.allTimeNotice}>
              <View style={styles.allTimeIcon}><Text style={styles.allTimeIconText}>∞</Text></View>
              <View style={styles.allTimeCopy}>
                <Text style={styles.allTimeTitle}>Every record, one clear view</Text>
                <Text style={styles.allTimeDescription}>
                  Includes all complaints recorded in CampusSetu.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.previewCard}>
            <View style={styles.previewTop}>
              <View style={styles.previewIcon}><Text style={styles.previewIconText}>▤</Text></View>
              <View style={styles.previewCopy}>
                <Text style={styles.previewLabel}>YOUR REPORT</Text>
                <Text style={styles.previewPeriod}>{periodLabel}</Text>
              </View>
              <View style={styles.previewFormat}><Text style={styles.previewFormatText}>PDF</Text></View>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewIncludes}>
              <Text style={styles.previewIncludesTitle}>INSIDE THE REPORT</Text>
              <View style={styles.previewTagRow}>
                {['Executive summary', 'Status & priority mix', 'Complaint register', 'Resolution feedback'].map((item) => (
                  <View key={item} style={styles.previewTag}>
                    <Text style={styles.previewTagCheck}>✓</Text>
                    <Text style={styles.previewTagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {readyFileName ? (
            <View style={styles.readyBanner}>
              <View style={styles.readyMark}><Text style={styles.readyMarkText}>✓</Text></View>
              <View style={styles.readyCopy}>
                <Text style={styles.readyTitle}>Report prepared</Text>
                <Text style={styles.readyFile} numberOfLines={1}>{readyFileName}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.downloadButton, downloading && styles.downloadButtonBusy]}
            onPress={downloadReport}
            disabled={downloading}
            activeOpacity={0.88}
            accessibilityRole="button"
          >
            {downloading ? (
              <>
                <ActivityIndicator color={COLORS.forest} />
                <Text style={styles.downloadButtonText}>Building your report…</Text>
              </>
            ) : (
              <>
                <View style={styles.downloadIcon}><Text style={styles.downloadIconText}>↓</Text></View>
                <Text style={styles.downloadButtonText}>Generate & share PDF</Text>
                <Text style={styles.downloadArrow}>↗</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.downloadHint}>
            Your report opens in the secure system share sheet. Choose “Save to Files” to keep a copy.
          </Text>
        </View>

        <View style={styles.footnote}>
          <View style={styles.footnoteMark}><Text style={styles.footnoteMarkText}>✓</Text></View>
          <Text style={styles.footnoteText}>
            Reports are generated on demand and are only available to authorized campus leadership.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.forest,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  backArrow: { color: COLORS.white, fontSize: 31, lineHeight: 34, marginTop: -3 },
  topBarTitle: { flex: 1, marginLeft: 12 },
  topBarEyebrow: { color: '#A4C6B5', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  topBarHeading: { color: COLORS.white, fontSize: 16, fontWeight: '900', marginTop: 3 },
  pdfBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(200,243,106,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(200,243,106,0.26)',
  },
  pdfBadgeText: { color: COLORS.lime, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  scrollView: { flex: 1 },
  content: { padding: 18, paddingTop: 16, maxWidth: 820, width: '100%', alignSelf: 'center' },
  contentWide: { paddingTop: 24 },
  hero: {
    minHeight: 306,
    overflow: 'hidden',
    borderRadius: 26,
    padding: 22,
    backgroundColor: COLORS.forest,
  },
  heroWide: { minHeight: 270, flexDirection: 'row', alignItems: 'center', padding: 30 },
  heroGlow: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    top: -105,
    right: -42,
    backgroundColor: 'rgba(200,243,106,0.10)',
  },
  heroCopy: { flex: 1, zIndex: 1 },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroEyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.lime, marginRight: 8 },
  heroEyebrow: { color: '#A9C9B8', fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  heroTitle: { color: COLORS.white, fontSize: 27, fontWeight: '900', lineHeight: 32, letterSpacing: -0.8 },
  heroDescription: { maxWidth: 440, color: '#C4D7CD', fontSize: 12, lineHeight: 19, marginTop: 10 },
  heroDocument: {
    alignSelf: 'flex-end',
    width: 205,
    height: 116,
    marginTop: 20,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  heroDocumentWide: { alignSelf: 'center', marginTop: 0, marginLeft: 22 },
  documentTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: COLORS.lime },
  documentHeader: { flexDirection: 'row', alignItems: 'center' },
  documentMark: { width: 20, height: 20, borderRadius: 7, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  documentMarkText: { color: COLORS.white, fontSize: 11, fontWeight: '900' },
  documentBrandLines: { flex: 1, marginLeft: 7 },
  documentBrandLine: { width: 47, height: 4, borderRadius: 2, backgroundColor: COLORS.ink },
  documentBrandLineShort: { width: 31, height: 3, marginTop: 3, backgroundColor: '#9BAC9F' },
  documentStamp: { paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, backgroundColor: '#EFF8EC' },
  documentStampText: { color: COLORS.green, fontSize: 6, fontWeight: '900', letterSpacing: 0.5 },
  documentRule: { height: 1, backgroundColor: '#E7ECE7', marginTop: 8 },
  documentMetricRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  documentMetric: { width: '30%' },
  documentMetricValue: { height: 9, borderRadius: 4, backgroundColor: COLORS.green },
  documentMetricLabel: { width: 37, height: 3, borderRadius: 2, backgroundColor: '#CFD8D0', marginTop: 4 },
  documentBars: { marginTop: 7, gap: 4 },
  documentBar: { height: 3, borderRadius: 2, backgroundColor: '#E6ECE6' },
  documentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  documentFooterText: { color: '#8B9990', fontSize: 5, fontWeight: '800', letterSpacing: 0.6 },
  documentFooterArrow: { color: COLORS.green, fontSize: 10, fontWeight: '900' },
  builderCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#102E22',
    shadowOpacity: 0.04,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  builderCardWide: { padding: 26 },
  sectionIntro: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  sectionEyebrow: { color: COLORS.green, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  sectionTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.4, marginTop: 5 },
  securePill: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, backgroundColor: '#F1F7F1' },
  securePillText: { color: COLORS.green, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },
  typeGrid: { marginTop: 17, gap: 9 },
  typeGridWide: { flexDirection: 'row', alignItems: 'stretch' },
  typeCard: {
    minHeight: 72,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  typeCardWide: { flex: 1, minWidth: 0 },
  typeCardGap: { marginLeft: 8 },
  typeCardActive: { borderColor: COLORS.green, backgroundColor: '#F2F8F2' },
  typeIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F4F1' },
  typeIconActive: { backgroundColor: COLORS.green },
  typeIconText: { color: '#76857B', fontSize: 16, fontWeight: '900' },
  typeIconTextActive: { color: COLORS.white },
  typeCardCopy: { flex: 1, minWidth: 0, marginLeft: 11 },
  typeLabel: { color: COLORS.ink, fontSize: 13, fontWeight: '900' },
  typeLabelActive: { color: COLORS.green },
  typeDetail: { color: COLORS.muted, fontSize: 10, lineHeight: 14, marginTop: 4 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#CCD6CD', marginLeft: 6, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.green },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.green },
  periodControls: { marginTop: 20, paddingTop: 17, borderTopWidth: 1, borderTopColor: '#EDF1ED' },
  periodTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodTitle: { color: COLORS.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  yearStepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yearButton: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F1' },
  yearButtonText: { color: COLORS.ink, fontSize: 19, fontWeight: '800', marginTop: -2 },
  yearValue: { minWidth: 40, textAlign: 'center', color: COLORS.ink, fontSize: 14, fontWeight: '900' },
  monthList: { paddingTop: 14, paddingBottom: 2, gap: 7 },
  monthChip: { minWidth: 48, height: 38, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F5F2' },
  monthChipActive: { backgroundColor: COLORS.green },
  monthChipText: { color: '#64746A', fontSize: 11, fontWeight: '800' },
  monthChipTextActive: { color: COLORS.white },
  allTimeNotice: { flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 15, borderRadius: 16, backgroundColor: '#F3F8F3' },
  allTimeIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#E0F0E3', alignItems: 'center', justifyContent: 'center' },
  allTimeIconText: { color: COLORS.green, fontSize: 25, fontWeight: '700' },
  allTimeCopy: { flex: 1, marginLeft: 12 },
  allTimeTitle: { color: COLORS.ink, fontSize: 12, fontWeight: '900' },
  allTimeDescription: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  previewCard: { marginTop: 19, padding: 15, borderRadius: 18, backgroundColor: '#F7F9F6', borderWidth: 1, borderColor: '#E9EEE8' },
  previewTop: { flexDirection: 'row', alignItems: 'center' },
  previewIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4F1E5' },
  previewIconText: { color: COLORS.green, fontSize: 21, fontWeight: '900' },
  previewCopy: { flex: 1, marginLeft: 11 },
  previewLabel: { color: COLORS.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  previewPeriod: { color: COLORS.ink, fontSize: 13, fontWeight: '900', marginTop: 3 },
  previewFormat: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E9F3E8' },
  previewFormatText: { color: COLORS.green, fontSize: 8, fontWeight: '900' },
  previewDivider: { height: 1, backgroundColor: '#E5EAE4', marginVertical: 13 },
  previewIncludes: {},
  previewIncludesTitle: { color: COLORS.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  previewTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 9 },
  previewTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 9, backgroundColor: COLORS.white },
  previewTagCheck: { color: COLORS.green, fontSize: 10, fontWeight: '900', marginRight: 5 },
  previewTagText: { color: '#506057', fontSize: 9, fontWeight: '700' },
  readyBanner: { flexDirection: 'row', alignItems: 'center', marginTop: 13, padding: 12, borderRadius: 14, backgroundColor: '#EFF8EF', borderWidth: 1, borderColor: '#D6EBD9' },
  readyMark: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D8F0DB' },
  readyMarkText: { color: COLORS.green, fontSize: 15, fontWeight: '900' },
  readyCopy: { flex: 1, marginLeft: 10 },
  readyTitle: { color: COLORS.green, fontSize: 11, fontWeight: '900' },
  readyFile: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  downloadButton: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 16, borderRadius: 17, backgroundColor: COLORS.lime },
  downloadButtonBusy: { backgroundColor: '#DDE8D3' },
  downloadIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,48,39,0.1)', marginRight: 9 },
  downloadIconText: { color: COLORS.forest, fontSize: 18, fontWeight: '900', marginTop: -2 },
  downloadButtonText: { color: COLORS.forest, fontSize: 13, fontWeight: '900' },
  downloadArrow: { color: COLORS.forest, fontSize: 18, fontWeight: '900', marginLeft: 9 },
  downloadHint: { color: COLORS.muted, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 10, paddingHorizontal: 8 },
  footnote: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginTop: 16 },
  footnoteMark: { width: 18, height: 18, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2EFE3', marginRight: 8 },
  footnoteMarkText: { color: COLORS.green, fontSize: 10, fontWeight: '900' },
  footnoteText: { flex: 1, color: COLORS.muted, fontSize: 10, lineHeight: 15 },
});
