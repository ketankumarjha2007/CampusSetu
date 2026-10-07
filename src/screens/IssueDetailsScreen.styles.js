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

    red: '#DC2626',
    redSoft: '#FEF2F2',

    purple: '#7C3AED',
    purpleSoft: '#F5F3FF',

    border: '#E2E8F0',
};

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // =========================
    // HEADER
    // =========================

    header: {
        height: 76,

        paddingHorizontal: 20,

        flexDirection: 'row',

        alignItems: 'center',

        backgroundColor: COLORS.background,
    },

    complaintIdInfoValue: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.4,
        flex: 1,
        textAlign: 'right',
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

    headerContent: {
        flex: 1,
    },

    headerEyebrow: {
        color: COLORS.primary,

        fontSize: 8,

        fontWeight: '900',

        letterSpacing: 1.2,

        marginBottom: 3,
    },

    headerTitle: {
        color: COLORS.text,

        fontSize: 24,

        fontWeight: '800',

        letterSpacing: -0.6,
    },

    headerSpacer: {
        width: 42,
    },

    // =========================
    // SCROLL
    // =========================

    scrollView: {
        flex: 1,
    },

    container: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 35,
    },

    // =========================
    // HERO
    // =========================

    heroCard: {
        backgroundColor: COLORS.white,

        borderRadius: 19,

        borderWidth: 1,
        borderColor: COLORS.border,

        padding: 17,

        marginBottom: 13,

        shadowColor: '#0F172A',

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.04,

        shadowRadius: 10,

        elevation: 2,
    },

    heroTop: {
        flexDirection: 'row',

        alignItems: 'center',

        justifyContent: 'space-between',

        marginBottom: 12,
    },

    categoryBadge: {
        paddingHorizontal: 10,

        minHeight: 25,

        borderRadius: 8,

        backgroundColor: COLORS.primarySoft,

        alignItems: 'center',
        justifyContent: 'center',
    },

    categoryBadgeText: {
        color: COLORS.primary,

        fontSize: 7.5,

        fontWeight: '800',
    },

    priorityBadge: {
        paddingHorizontal: 9,

        minHeight: 25,

        borderRadius: 8,

        alignItems: 'center',
        justifyContent: 'center',
    },

    priorityHigh: {
        backgroundColor: COLORS.redSoft,
    },

    priorityHighText: {
        color: COLORS.red,
    },

    priorityCritical: {
        backgroundColor: '#FEE2E2',
    },

    priorityCriticalText: {
        color: '#991B1B',
    },

    priorityMedium: {
        backgroundColor: COLORS.orangeSoft,
    },

    priorityMediumText: {
        color: COLORS.orange,
    },

    priorityLow: {
        backgroundColor: COLORS.greenSoft,
    },

    priorityLowText: {
        color: COLORS.green,
    },

    priorityText: {
        fontSize: 7.5,

        fontWeight: '800',
    },

    // =========================
    // COMPLAINT ID
    // =========================

    complaintIdCard: {
        marginTop: 4,

        marginBottom: 13,

        paddingHorizontal: 14,

        paddingVertical: 12,

        borderRadius: 12,

        backgroundColor: COLORS.primarySoft,

        borderWidth: 1,

        borderColor: '#DBEAFE',
    },

    complaintIdLabel: {
        color: COLORS.secondary,

        fontSize: 7.5,

        fontWeight: '900',

        letterSpacing: 1,

        marginBottom: 5,
    },

    complaintIdValue: {
        color: COLORS.primary,

        fontSize: 17,

        fontWeight: '900',

        letterSpacing: 0.7,
    },

    complaintIdHint: {
        color: COLORS.muted,

        fontSize: 7.5,

        fontWeight: '600',

        marginTop: 4,
    },

    // =========================
    // ISSUE TITLE
    // =========================

    issueTitle: {
        color: COLORS.text,

        fontSize: 19,

        lineHeight: 25,

        fontWeight: '800',

        letterSpacing: -0.4,

        marginBottom: 12,
    },

    currentStatusRow: {
        flexDirection: 'row',

        alignItems: 'center',

        paddingTop: 11,

        borderTopWidth: 1,

        borderTopColor: '#F1F5F9',
    },

    currentStatusDot: {
        width: 8,
        height: 8,

        borderRadius: 4,

        backgroundColor: COLORS.orange,

        marginRight: 7,
    },

    currentStatusLabel: {
        color: COLORS.orange,

        fontSize: 9,

        fontWeight: '800',
    },

    // =========================
    // SECTION CARDS
    // =========================

    sectionCard: {
        backgroundColor: COLORS.white,

        borderRadius: 18,

        borderWidth: 1,

        borderColor: COLORS.border,

        padding: 16,

        marginBottom: 13,
    },

    sectionLabel: {
        color: COLORS.secondary,

        fontSize: 8,

        fontWeight: '900',

        letterSpacing: 1,

        marginBottom: 11,
    },

    description: {
        color: COLORS.secondary,

        fontSize: 10,

        lineHeight: 17,

        fontWeight: '500',
    },

    // =========================
    // INFORMATION
    // =========================

    infoRow: {
        flexDirection: 'row',

        justifyContent: 'space-between',

        alignItems: 'flex-start',

        gap: 15,
    },

    infoLabel: {
        color: COLORS.muted,

        fontSize: 8.5,

        fontWeight: '600',
    },

    infoValue: {
        flex: 1,

        color: COLORS.text,

        fontSize: 9,

        fontWeight: '700',

        textAlign: 'right',
    },

    infoDivider: {
        height: 1,

        backgroundColor: '#F1F5F9',

        marginVertical: 11,
    },

    // =========================
    // RESOLUTION
    // =========================

    resolutionCard: {
        backgroundColor: COLORS.greenSoft,

        borderRadius: 18,

        borderWidth: 1,

        borderColor: '#BBF7D0',

        padding: 16,

        marginBottom: 13,
    },

    resolutionText: {
        color: '#166534',

        fontSize: 10,

        lineHeight: 17,

        fontWeight: '600',
    },

    resolutionDate: {
        color: COLORS.green,

        fontSize: 8,

        fontWeight: '700',

        marginTop: 10,
    },

    // =========================
    // TIMELINE
    // =========================

    timelineCard: {
        backgroundColor: COLORS.white,

        borderRadius: 18,

        borderWidth: 1,

        borderColor: COLORS.border,

        padding: 16,

        marginBottom: 13,
    },

    timelineItem: {
        flexDirection: 'row',

        minHeight: 70,
    },

    timelineLeft: {
        width: 24,

        alignItems: 'center',

        position: 'relative',
    },

    timelineDotPending: {
        width: 11,
        height: 11,

        borderRadius: 6,

        backgroundColor: COLORS.orange,

        borderWidth: 3,

        borderColor: COLORS.orangeSoft,

        zIndex: 2,
    },

    timelineDotAssigned: {
        width: 11,
        height: 11,

        borderRadius: 6,

        backgroundColor: COLORS.purple,

        borderWidth: 3,

        borderColor: COLORS.purpleSoft,

        zIndex: 2,
    },

    timelineDotProgress: {
        width: 11,
        height: 11,

        borderRadius: 6,

        backgroundColor: COLORS.primary,

        borderWidth: 3,

        borderColor: COLORS.primarySoft,

        zIndex: 2,
    },

    timelineDotResolved: {
        width: 11,
        height: 11,

        borderRadius: 6,

        backgroundColor: COLORS.green,

        borderWidth: 3,

        borderColor: COLORS.greenSoft,

        zIndex: 2,
    },

    timelineDotRejected: {
        width: 11,
        height: 11,

        borderRadius: 6,

        backgroundColor: COLORS.red,

        borderWidth: 3,

        borderColor: COLORS.redSoft,

        zIndex: 2,
    },

    timelineLine: {
        position: 'absolute',

        top: 11,

        bottom: 0,

        width: 1,

        backgroundColor: COLORS.border,
    },

    timelineContent: {
        flex: 1,

        paddingLeft: 10,

        paddingBottom: 20,
    },

    timelineTitle: {
        fontSize: 10,

        fontWeight: '800',

        marginBottom: 4,
    },

    timelineTitlePending: {
        color: COLORS.orange,
    },

    timelineTitleAssigned: {
        color: COLORS.purple,
    },

    timelineTitleProgress: {
        color: COLORS.primary,
    },

    timelineTitleResolved: {
        color: COLORS.green,
    },

    timelineTitleRejected: {
        color: COLORS.red,
    },

    timelineNote: {
        color: COLORS.secondary,

        fontSize: 8.5,

        lineHeight: 14,

        fontWeight: '500',

        marginBottom: 4,
    },

    timelineDate: {
        color: COLORS.muted,

        fontSize: 7.5,

        fontWeight: '600',
    },

    noHistory: {
        paddingVertical: 10,
    },

    noHistoryText: {
        color: COLORS.muted,

        fontSize: 9,

        fontWeight: '500',
    },

    // =========================
    // LOADING / ERROR
    // =========================

    centerState: {
        flex: 1,

        alignItems: 'center',

        justifyContent: 'center',

        paddingHorizontal: 30,
    },

    centerTitle: {
        color: COLORS.text,

        fontSize: 15,

        fontWeight: '800',

        marginTop: 15,

        marginBottom: 6,
    },

    centerSubtitle: {
        color: COLORS.muted,

        fontSize: 9,

        lineHeight: 14,

        textAlign: 'center',
    },

    errorIcon: {
        width: 54,
        height: 54,

        borderRadius: 17,

        backgroundColor: COLORS.redSoft,

        alignItems: 'center',
        justifyContent: 'center',
    },

    errorIconText: {
        color: COLORS.red,

        fontSize: 23,

        fontWeight: '900',
    },

    retryButton: {
        height: 40,

        paddingHorizontal: 18,

        borderRadius: 11,

        backgroundColor: COLORS.primary,

        alignItems: 'center',
        justifyContent: 'center',

        marginTop: 18,
    },

    retryButtonText: {
        color: COLORS.white,

        fontSize: 9,

        fontWeight: '800',
    },

    backFromErrorButton: {
        height: 40,

        paddingHorizontal: 18,

        borderRadius: 11,

        backgroundColor: COLORS.white,

        borderWidth: 1,

        borderColor: COLORS.border,

        alignItems: 'center',
        justifyContent: 'center',

        marginTop: 9,
    },

    backFromErrorText: {
        color: COLORS.secondary,

        fontSize: 9,

        fontWeight: '800',
    },

    bottomSpace: {
        height: 10,
    },
});