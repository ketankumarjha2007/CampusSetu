import { StyleSheet } from 'react-native';

const COLORS = {
    background: '#F6F8FC',
    white: '#FFFFFF',
    primary: '#2563EB',
    primarySoft: '#EFF6FF',
    text: '#111827',
    secondary: '#475569',
    muted: '#94A3B8',
    border: '#E5E7EB',
    success: '#16A34A',
    successSoft: '#F0FDF4',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
};

export default StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    content: {
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 40,
    },

    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: COLORS.background,
    },

    loadingText: {
        marginTop: 14,
        color: COLORS.secondary,
        fontSize: 14,
        fontWeight: '600',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 13,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    backArrow: {
        color: COLORS.text,
        fontSize: 30,
        lineHeight: 32,
        marginTop: -2,
    },

    headerTitle: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.5,
    },

    headerSubtitle: {
        color: COLORS.muted,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 3,
    },

    profileCard: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 3,
    },

    avatar: {
        width: 78,
        height: 78,
        borderRadius: 26,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    avatarText: {
        color: COLORS.white,
        fontSize: 27,
        fontWeight: '900',
    },

    name: {
        color: COLORS.text,
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
    },

    email: {
        color: COLORS.muted,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 5,
        textAlign: 'center',
    },

    roleBadge: {
        marginTop: 14,
        paddingHorizontal: 13,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: COLORS.primarySoft,
    },

    roleBadgeText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },

    section: {
        marginTop: 26,
    },

    sectionTitle: {
        color: COLORS.muted,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.2,
        marginBottom: 10,
    },

    infoCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: 17,
        borderWidth: 1,
        borderColor: COLORS.border,
    },

    infoRow: {
        minHeight: 66,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    infoLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    infoIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: COLORS.primarySoft,
        color: COLORS.primary,
        textAlign: 'center',
        textAlignVertical: 'center',
        paddingTop: 8,
        fontSize: 11,
        fontWeight: '900',
        marginRight: 11,
    },

    infoLabel: {
        color: COLORS.secondary,
        fontSize: 13,
        fontWeight: '700',
    },

    infoValue: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '800',
        maxWidth: '52%',
        textAlign: 'right',
        textTransform: 'capitalize',
    },

    emailValue: {
        textTransform: 'none',
    },

    usnValue: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 0.6,
        maxWidth: '52%',
        textAlign: 'right',
    },

    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },

    statusCard: {
        marginTop: 18,
        padding: 16,
        borderRadius: 18,
        backgroundColor: COLORS.successSoft,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    statusDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: COLORS.success,
        marginTop: 5,
        marginRight: 11,
    },

    statusContent: {
        flex: 1,
    },

    statusTitle: {
        color: COLORS.success,
        fontSize: 13,
        fontWeight: '900',
    },

    statusText: {
        color: COLORS.secondary,
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 17,
        marginTop: 3,
    },

    errorIcon: {
        width: 58,
        height: 58,
        borderRadius: 20,
        backgroundColor: COLORS.dangerSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },

    errorIconText: {
        color: COLORS.danger,
        fontSize: 25,
        fontWeight: '900',
    },

    errorTitle: {
        color: COLORS.text,
        fontSize: 19,
        fontWeight: '900',
        textAlign: 'center',
    },

    errorText: {
        color: COLORS.secondary,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        marginTop: 7,
        marginBottom: 18,
    },

    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
    },

    retryButtonText: {
        color: COLORS.white,
        fontSize: 13,
        fontWeight: '800',
    },
    editButton: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
        marginBottom: 26,
    },

    editButtonIcon: {
        fontSize: 18,
        color: '#2563EB',
        marginRight: 8,
        fontWeight: '800',
    },

    editButtonText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#2563EB',
        letterSpacing: 0.2,
    },
    logoutButton: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
        marginBottom: 20,
    },

    logoutIcon: {
        fontSize: 20,
        color: '#DC2626',
        marginRight: 9,
        fontWeight: '800',
    },

    logoutText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#DC2626',
    },
    footer: {
        color: COLORS.muted,
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 1.2,
        textAlign: 'center',
        marginTop: 28,
    },
});