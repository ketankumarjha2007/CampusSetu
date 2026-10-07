import React, {
    useEffect,
    useState,
} from 'react';

import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';

import styles from './IssueDetailsScreen.styles';

import { apiRequest } from '../services/api';


/*
 * Convert backend status into
 * user-friendly status text.
 */
const getDisplayStatus = (status) => {
    switch (status) {
        case 'pending':
            return 'Pending';

        case 'assigned':
            return 'Assigned';

        case 'in_progress':
            return 'In Progress';

        case 'resolved':
            return 'Resolved';

        case 'rejected':
            return 'Rejected';

        default:
            return status || 'Unknown';
    }
};


/*
 * Format date.
 */
const formatDate = (dateValue) => {
    if (!dateValue) {
        return 'Date unavailable';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable';
    }

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};


/*
 * Format date + time.
 */
const formatDateTime = (dateValue) => {
    if (!dateValue) {
        return 'Date unavailable';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable';
    }

    return `${date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })} • ${date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
};


/*
 * Priority styling.
 */
const getPriorityStyle = (priority) => {
    switch (priority) {
        case 'high':
            return {
                background: styles.priorityHigh,
                text: styles.priorityHighText,
            };

        case 'critical':
            return {
                background: styles.priorityCritical,
                text: styles.priorityCriticalText,
            };

        case 'low':
            return {
                background: styles.priorityLow,
                text: styles.priorityLowText,
            };

        default:
            return {
                background: styles.priorityMedium,
                text: styles.priorityMediumText,
            };
    }
};


/*
 * Timeline styling.
 */
const getTimelineStyle = (status) => {
    switch (status) {
        case 'pending':
            return {
                dot: styles.timelineDotPending,
                line: styles.timelineLine,
                title: styles.timelineTitlePending,
            };

        case 'assigned':
            return {
                dot: styles.timelineDotAssigned,
                line: styles.timelineLine,
                title: styles.timelineTitleAssigned,
            };

        case 'in_progress':
            return {
                dot: styles.timelineDotProgress,
                line: styles.timelineLine,
                title: styles.timelineTitleProgress,
            };

        case 'resolved':
            return {
                dot: styles.timelineDotResolved,
                line: styles.timelineLine,
                title: styles.timelineTitleResolved,
            };

        case 'rejected':
            return {
                dot: styles.timelineDotRejected,
                line: styles.timelineLine,
                title: styles.timelineTitleRejected,
            };

        default:
            return {
                dot: styles.timelineDotPending,
                line: styles.timelineLine,
                title: styles.timelineTitlePending,
            };
    }
};


export default function IssueDetailsScreen({
    navigation,
    route,
}) {
    const issueId = route?.params?.issueId;

    const [issue, setIssue] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');


    /*
     * Fetch one real complaint.
     */
    const fetchIssue = async (
        showLoader = true
    ) => {
        try {
            if (!issueId) {
                throw new Error(
                    'Issue information is missing.'
                );
            }

            if (showLoader) {
                setLoading(true);
            }

            setError('');

            console.log(
                'Issue Details: Fetching issue:',
                issueId
            );

            const response =
                await apiRequest(
                    `/issues/${issueId}`
                );

            console.log(
                'Issue Details: API response:',
                response
            );

            setIssue(response.issue);
        } catch (requestError) {
            console.error(
                'Issue Details: Fetch failed:',
                requestError.message
            );

            setError(
                requestError.message ||
                'Unable to load this issue.'
            );
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    };


    /*
     * Load issue when screen opens.
     */
    useEffect(() => {
        fetchIssue(true);
    }, [issueId]);


    /*
     * Pull-to-refresh.
     */
    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            await fetchIssue(false);
        } finally {
            setRefreshing(false);
        }
    };


    /*
     * Loading state.
     */
    if (loading) {
        return (
            <SafeAreaView
                style={styles.safeArea}
            >
                <View style={styles.centerState}>
                    <ActivityIndicator
                        size="large"
                        color="#2563EB"
                    />

                    <Text
                        style={styles.centerTitle}
                    >
                        Loading issue...
                    </Text>

                    <Text
                        style={styles.centerSubtitle}
                    >
                        Fetching the latest issue details.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    /*
     * Error state.
     */
    if (error || !issue) {
        return (
            <SafeAreaView
                style={styles.safeArea}
            >
                <View style={styles.centerState}>
                    <View style={styles.errorIcon}>
                        <Text
                            style={styles.errorIconText}
                        >
                            !
                        </Text>
                    </View>

                    <Text
                        style={styles.centerTitle}
                    >
                        Unable to load issue
                    </Text>

                    <Text
                        style={styles.centerSubtitle}
                    >
                        {error ||
                            'The requested issue could not be found.'}
                    </Text>

                    <TouchableOpacity
                        style={styles.retryButton}
                        activeOpacity={0.8}
                        onPress={() =>
                            fetchIssue(true)
                        }
                    >
                        <Text
                            style={styles.retryButtonText}
                        >
                            Try Again
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={
                            styles.backFromErrorButton
                        }
                        activeOpacity={0.8}
                        onPress={() =>
                            navigation.goBack()
                        }
                    >
                        <Text
                            style={
                                styles.backFromErrorText
                            }
                        >
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }


    const priorityStyle =
        getPriorityStyle(
            issue.priority
        );

    const currentStatus =
        getDisplayStatus(
            issue.status
        );


    /*
     * Sort history from oldest to newest.
     */
    const history = Array.isArray(
        issue.history
    )
        ? [...issue.history].sort(
            (a, b) =>
                new Date(
                    a.changedAt
                ).getTime() -
                new Date(
                    b.changedAt
                ).getTime()
        )
        : [];


    return (
        <SafeAreaView
            style={styles.safeArea}
        >

            {/* ================= HEADER ================= */}

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    activeOpacity={0.8}
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Text
                        style={styles.backArrow}
                    >
                        ‹
                    </Text>
                </TouchableOpacity>

                <View
                    style={styles.headerContent}
                >
                    <Text
                        style={styles.headerEyebrow}
                    >
                        CAMPUSSETU
                    </Text>

                    <Text
                        style={styles.headerTitle}
                    >
                        Issue Details
                    </Text>
                </View>

                <View
                    style={styles.headerSpacer}
                />
            </View>


            {/* ================= CONTENT ================= */}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={
                    styles.container
                }
                showsVerticalScrollIndicator={
                    false
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >

                {/* ================= ISSUE HERO ================= */}

                <View style={styles.heroCard}>

                    <View style={styles.heroTop}>
                        <View
                            style={styles.categoryBadge}
                        >
                            <Text
                                style={
                                    styles.categoryBadgeText
                                }
                            >
                                {issue.category}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.priorityBadge,
                                priorityStyle.background,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.priorityText,
                                    priorityStyle.text,
                                ]}
                            >
                                {issue.priority
                                    ? issue.priority
                                        .charAt(0)
                                        .toUpperCase() +
                                    issue.priority.slice(1)
                                    : 'Medium'}
                            </Text>
                        </View>
                    </View>


                    {/* ================= COMPLAINT ID ================= */}

                    <View
                        style={{
                            marginTop: 16,
                            marginBottom: 10,
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            borderRadius: 12,
                            backgroundColor:
                                'rgba(37, 99, 235, 0.08)',
                            borderWidth: 1,
                            borderColor:
                                'rgba(37, 99, 235, 0.15)',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: '700',
                                letterSpacing: 1,
                                opacity: 0.55,
                                marginBottom: 4,
                            }}
                        >
                            COMPLAINT ID
                        </Text>

                        <Text
                            style={{
                                fontSize: 19,
                                fontWeight: '800',
                                letterSpacing: 0.8,
                            }}
                        >
                            {issue.complaintId ||
                                'Generating...'}
                        </Text>
                    </View>


                    {/* ================= TITLE ================= */}

                    <Text
                        style={styles.issueTitle}
                    >
                        {issue.title}
                    </Text>


                    {/* ================= CURRENT STATUS ================= */}

                    <View
                        style={
                            styles.currentStatusRow
                        }
                    >
                        <View
                            style={
                                styles.currentStatusDot
                            }
                        />

                        <Text
                            style={
                                styles.currentStatusLabel
                            }
                        >
                            {currentStatus}
                        </Text>
                    </View>

                </View>


                {/* ================= DESCRIPTION ================= */}

                <View
                    style={styles.sectionCard}
                >
                    <Text
                        style={styles.sectionLabel}
                    >
                        DESCRIPTION
                    </Text>

                    <Text
                        style={styles.description}
                    >
                        {issue.description}
                    </Text>
                </View>


                {/* ================= DETAILS ================= */}

                <View
                    style={styles.sectionCard}
                >
                    <Text
                        style={styles.sectionLabel}
                    >
                        ISSUE INFORMATION
                    </Text>


                    {/* Complaint ID */}

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Complaint ID
                        </Text>

                        <Text style={styles.complaintIdInfoValue}>
                            {issue.complaintId || 'Generating...'}
                        </Text>
                    </View>


                    <View
                        style={styles.infoDivider}
                    />


                    {/* Location */}

                    <View
                        style={styles.infoRow}
                    >
                        <Text
                            style={styles.infoLabel}
                        >
                            Location
                        </Text>

                        <Text
                            style={styles.infoValue}
                        >
                            {issue.location}
                        </Text>
                    </View>


                    <View
                        style={styles.infoDivider}
                    />


                    {/* Reported */}

                    <View
                        style={styles.infoRow}
                    >
                        <Text
                            style={styles.infoLabel}
                        >
                            Reported
                        </Text>

                        <Text
                            style={styles.infoValue}
                        >
                            {formatDate(
                                issue.createdAt
                            )}
                        </Text>
                    </View>


                    <View
                        style={styles.infoDivider}
                    />


                    {/* Last updated */}

                    <View
                        style={styles.infoRow}
                    >
                        <Text
                            style={styles.infoLabel}
                        >
                            Last updated
                        </Text>

                        <Text
                            style={styles.infoValue}
                        >
                            {formatDate(
                                issue.updatedAt
                            )}
                        </Text>
                    </View>


                    {/* Assigned person */}

                    {issue.assignedTo && (
                        <>
                            <View
                                style={styles.infoDivider}
                            />

                            <View
                                style={styles.infoRow}
                            >
                                <Text
                                    style={styles.infoLabel}
                                >
                                    Assigned to
                                </Text>

                                <Text
                                    style={styles.infoValue}
                                >
                                    {issue.assignedTo.name ||
                                        issue.assignedTo.email}
                                </Text>
                            </View>
                        </>
                    )}

                </View>


                {/* ================= RESOLUTION ================= */}

                {issue.resolutionNote ? (
                    <View
                        style={styles.resolutionCard}
                    >
                        <Text
                            style={styles.sectionLabel}
                        >
                            RESOLUTION
                        </Text>

                        <Text
                            style={
                                styles.resolutionText
                            }
                        >
                            {issue.resolutionNote}
                        </Text>

                        {issue.resolvedAt && (
                            <Text
                                style={
                                    styles.resolutionDate
                                }
                            >
                                Resolved on{' '}
                                {formatDate(
                                    issue.resolvedAt
                                )}
                            </Text>
                        )}
                    </View>
                ) : null}


                {/* ================= STATUS TIMELINE ================= */}

                <View
                    style={styles.timelineCard}
                >
                    <Text
                        style={styles.sectionLabel}
                    >
                        STATUS TIMELINE
                    </Text>

                    {history.length === 0 ? (
                        <View
                            style={styles.noHistory}
                        >
                            <Text
                                style={
                                    styles.noHistoryText
                                }
                            >
                                No status history available.
                            </Text>
                        </View>
                    ) : (
                        history.map(
                            (entry, index) => {
                                const timelineStyle =
                                    getTimelineStyle(
                                        entry.status
                                    );

                                const isLast =
                                    index ===
                                    history.length - 1;

                                return (
                                    <View
                                        key={
                                            entry._id ||
                                            `${entry.status}-${index}`
                                        }
                                        style={
                                            styles.timelineItem
                                        }
                                    >
                                        <View
                                            style={
                                                styles.timelineLeft
                                            }
                                        >
                                            <View
                                                style={
                                                    timelineStyle.dot
                                                }
                                            />

                                            {!isLast && (
                                                <View
                                                    style={
                                                        timelineStyle.line
                                                    }
                                                />
                                            )}
                                        </View>


                                        <View
                                            style={
                                                styles.timelineContent
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.timelineTitle,
                                                    timelineStyle.title,
                                                ]}
                                            >
                                                {getDisplayStatus(
                                                    entry.status
                                                )}
                                            </Text>

                                            {entry.note ? (
                                                <Text
                                                    style={
                                                        styles.timelineNote
                                                    }
                                                >
                                                    {entry.note}
                                                </Text>
                                            ) : null}

                                            <Text
                                                style={
                                                    styles.timelineDate
                                                }
                                            >
                                                {formatDateTime(
                                                    entry.changedAt
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }
                        )
                    )}
                </View>


                <View
                    style={styles.bottomSpace}
                />

            </ScrollView>
        </SafeAreaView>
    );
}