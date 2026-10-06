import React, { useMemo, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import styles from './MyReportsScreen.styles';

const REPORTS = [
  {
    id: '1',
    title: 'Water leakage in Block A',
    category: 'Water',
    location: 'Block A • 2nd Floor',
    date: '06 Oct 2026',
    status: 'Pending',
    priority: 'High',
    description:
      'Water is leaking near the corridor and making the floor slippery.',
  },
  {
    id: '2',
    title: 'Wi-Fi not working in Lab 204',
    category: 'Internet',
    location: 'Computer Lab • Block B',
    date: '05 Oct 2026',
    status: 'In Progress',
    priority: 'Medium',
    description:
      'The campus Wi-Fi connection is unavailable in the computer lab.',
  },
  {
    id: '3',
    title: 'Broken classroom light',
    category: 'Electricity',
    location: 'Room 301 • Block A',
    date: '02 Oct 2026',
    status: 'Resolved',
    priority: 'Low',
    description:
      'One of the tube lights in the classroom was not working.',
  },
];

const FILTERS = [
  'All',
  'Pending',
  'In Progress',
  'Resolved',
];

export default function MyReportsScreen({ navigation }) {

  const [activeFilter, setActiveFilter] = useState('All');

  const filteredReports = useMemo(() => {

    if (activeFilter === 'All') {
      return REPORTS;
    }

    return REPORTS.filter(
      report => report.status === activeFilter
    );

  }, [activeFilter]);


  const getStatusStyle = (status) => {

    if (status === 'Resolved') {
      return {
        badge: styles.statusResolved,
        text: styles.statusResolvedText,
      };
    }

    if (status === 'In Progress') {
      return {
        badge: styles.statusProgress,
        text: styles.statusProgressText,
      };
    }

    return {
      badge: styles.statusPending,
      text: styles.statusPendingText,
    };
  };


  const getPriorityStyle = (priority) => {

    if (priority === 'High') {
      return styles.priorityHigh;
    }

    if (priority === 'Medium') {
      return styles.priorityMedium;
    }

    return styles.priorityLow;
  };


  return (
    <SafeAreaView style={styles.safeArea}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>
            ‹
          </Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>

          <Text style={styles.headerEyebrow}>
            CAMPUSSETU
          </Text>

          <Text style={styles.headerTitle}>
            My Reports
          </Text>

        </View>

        <View style={styles.headerSpacer} />

      </View>


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* SUMMARY */}
        <View style={styles.summaryCard}>

          <View style={styles.summaryMain}>

            <Text style={styles.summaryNumber}>
              {REPORTS.length}
            </Text>

            <View>
              <Text style={styles.summaryTitle}>
                Total reports
              </Text>

              <Text style={styles.summarySubtitle}>
                Issues you've submitted
              </Text>
            </View>

          </View>

          <View style={styles.summaryStatus}>

            <View style={styles.summaryDot} />

            <Text style={styles.summaryStatusText}>
              Campus team notified
            </Text>

          </View>

        </View>


        {/* FILTERS */}
        <View style={styles.filterSection}>

          <Text style={styles.filterLabel}>
            FILTER BY STATUS
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >

            {FILTERS.map((filter) => {

              const selected = activeFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );

            })}

          </ScrollView>

        </View>


        {/* REPORT COUNT */}
        <View style={styles.resultsHeader}>

          <View>

            <Text style={styles.resultsTitle}>
              {activeFilter === 'All'
                ? 'All reports'
                : `${activeFilter} reports`}
            </Text>

            <Text style={styles.resultsSubtitle}>
              {filteredReports.length}{' '}
              {filteredReports.length === 1
                ? 'issue'
                : 'issues'} found
            </Text>

          </View>

          <TouchableOpacity
            style={styles.newReportButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ReportIssue')}
          >
            <Text style={styles.newReportButtonText}>
              + New
            </Text>
          </TouchableOpacity>

        </View>


        {/* REPORT CARDS */}
        {filteredReports.map((report) => {

          const statusStyle =
            getStatusStyle(report.status);

          return (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              activeOpacity={0.85}
            >

              {/* TOP */}
              <View style={styles.reportTop}>

                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {report.category}
                  </Text>
                </View>

                <View
                  style={[
                    styles.priorityBadge,
                    getPriorityStyle(report.priority),
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {report.priority}
                  </Text>
                </View>

              </View>


              {/* TITLE */}
              <Text style={styles.reportTitle}>
                {report.title}
              </Text>


              {/* DESCRIPTION */}
              <Text
                style={styles.reportDescription}
                numberOfLines={2}
              >
                {report.description}
              </Text>


              {/* META */}
              <View style={styles.metaRow}>

                <Text style={styles.metaText}>
                  📍 {report.location}
                </Text>

                <Text style={styles.metaText}>
                  {report.date}
                </Text>

              </View>


              {/* FOOTER */}
              <View style={styles.reportFooter}>

                <View
                  style={[
                    styles.statusBadge,
                    statusStyle.badge,
                  ]}
                >
                  <View style={styles.statusDot} />

                  <Text
                    style={[
                      styles.statusText,
                      statusStyle.text,
                    ]}
                  >
                    {report.status}
                  </Text>

                </View>

                <Text style={styles.viewDetails}>
                  View details →
                </Text>

              </View>

            </TouchableOpacity>
          );

        })}


        {/* EMPTY STATE */}
        {filteredReports.length === 0 && (

          <View style={styles.emptyState}>

            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                ≡
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No reports here
            </Text>

            <Text style={styles.emptySubtitle}>
              There are no {activeFilter.toLowerCase()}{' '}
              reports right now.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ReportIssue')
              }
            >
              <Text style={styles.emptyButtonText}>
                Report an Issue
              </Text>
            </TouchableOpacity>

          </View>

        )}

        <View style={styles.bottomSpace} />

      </ScrollView>

    </SafeAreaView>
  );
}