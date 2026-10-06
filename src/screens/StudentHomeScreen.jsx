import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import styles from './StudentHomeScreen.styles';

export default function StudentHomeScreen({ navigation }) {

  const hour = new Date().getHours();

  let greeting = 'GOOD MORNING';

  if (hour >= 12 && hour < 17) {
    greeting = 'GOOD AFTERNOON';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'GOOD EVENING';
  } else if (hour >= 21 || hour < 5) {
    greeting = 'GOOD NIGHT';
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADER */}
        <View style={styles.header}>

          <View>
            <Text style={styles.greeting}>
              {greeting}
            </Text>

            <Text style={styles.title}>
              Hello, Ketan 👋
            </Text>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>
              🔔
            </Text>

            <View style={styles.notificationDot} />
          </TouchableOpacity>

        </View>


        {/* CAMPUS STATUS */}
        <View style={styles.statusCard}>

          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>
              ✓
            </Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              Campus is running smoothly
            </Text>

            <Text style={styles.statusSubtitle}>
              No major campus alerts right now.
            </Text>
          </View>

          <View style={styles.statusIndicator} />

        </View>


        {/* REPORT ISSUE */}
        <TouchableOpacity
          style={styles.reportCard}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('ReportIssue')}
        >

          <View style={styles.reportContent}>

            <Text style={styles.reportEyebrow}>
              NEED HELP?
            </Text>

            <Text style={styles.reportTitle}>
              Report an Issue
            </Text>

            <Text style={styles.reportSubtitle}>
              Tell us what is wrong on campus and
              we'll help get it resolved.
            </Text>

            <View style={styles.reportButton}>

              <Text style={styles.reportButtonText}>
                Report now
              </Text>

              <Text style={styles.reportArrow}>
                →
              </Text>

            </View>

          </View>

          <View style={styles.reportDecoration}>
            <Text style={styles.reportDecorationText}>
              +
            </Text>
          </View>

        </TouchableOpacity>


        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Quick actions
          </Text>

          <Text style={styles.sectionHint}>
            Get things done faster
          </Text>

        </View>


        <View style={styles.quickGrid}>

          {/* MY REPORTS */}
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyReports')}
          >

            <View style={styles.quickIconBlue}>
              <Text style={styles.quickIconText}>
                ≡
              </Text>
            </View>

            <Text style={styles.quickTitle}>
              My Reports
            </Text>

            <Text style={styles.quickSubtitle}>
              Track your issues
            </Text>

          </TouchableOpacity>


          {/* RESOLVED */}
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyReports')}
          >

            <View style={styles.quickIconGreen}>
              <Text style={styles.quickIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.quickTitle}>
              Resolved
            </Text>

            <Text style={styles.quickSubtitle}>
              View completed issues
            </Text>

          </TouchableOpacity>


          {/* PENDING */}
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyReports')}
          >

            <View style={styles.quickIconOrange}>
              <Text style={styles.quickIconText}>
                !
              </Text>
            </View>

            <Text style={styles.quickTitle}>
              Pending
            </Text>

            <Text style={styles.quickSubtitle}>
              Issues being handled
            </Text>

          </TouchableOpacity>


          {/* HELP */}
          <TouchableOpacity
            style={styles.quickCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Help')}
          >

            <View style={styles.quickIconPurple}>
              <Text style={styles.quickIconText}>
                ?
              </Text>
            </View>

            <Text style={styles.quickTitle}>
              Help
            </Text>

            <Text style={styles.quickSubtitle}>
              Campus support
            </Text>

          </TouchableOpacity>

        </View>


        {/* RECENT ACTIVITY */}
        <View style={styles.sectionHeaderRecent}>

          <View>

            <Text style={styles.sectionTitle}>
              Recent activity
            </Text>

            <Text style={styles.sectionHint}>
              Your latest campus reports
            </Text>

          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyReports')}
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>

        </View>


        {/* EMPTY STATE */}
        <View style={styles.emptyCard}>

          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              ≡
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            No reports yet
          </Text>

          <Text style={styles.emptySubtitle}>
            Your reported campus issues will
            appear here.
          </Text>

          <TouchableOpacity
            style={styles.emptyButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ReportIssue')}
          >
            <Text style={styles.emptyButtonText}>
              Report your first issue
            </Text>
          </TouchableOpacity>

        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>


      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>

        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Text style={styles.navIconActive}>
            ⌂
          </Text>

          <Text style={styles.navLabelActive}>
            Home
          </Text>
        </TouchableOpacity>


        {/* REPORTS */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyReports')}
        >
          <Text style={styles.navIcon}>
            ≡
          </Text>

          <Text style={styles.navLabel}>
            Reports
          </Text>
        </TouchableOpacity>


        {/* ADD / REPORT */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReportIssue')}
        >
          <Text style={styles.addButtonText}>
            +
          </Text>
        </TouchableOpacity>


        {/* ALERTS */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.navIcon}>
            🔔
          </Text>

          <Text style={styles.navLabel}>
            Alerts
          </Text>
        </TouchableOpacity>


        {/* PROFILE */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>
            ●
          </Text>

          <Text style={styles.navLabel}>
            Profile
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}