import React, { useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import styles from './HelpScreen.styles';

const FAQS = [
  {
    question: 'How do I report a complaint?',
    answer:
      'Go to the Student Home screen and tap Report Issue. Select a category, enter the complaint details and location, optionally attach a photo, and submit the complaint.',
  },
  {
    question: 'How can I track my complaint?',
    answer:
      'Open Track Complaint from the Student Home screen and enter your Complaint ID, for example CS-2026-000001.',
  },
  {
    question: 'What do the complaint statuses mean?',
    answer:
      'Pending means your complaint has been submitted. Assigned means it has been assigned to an official. In Progress means the issue is being worked on. Resolved means the issue has been completed. Rejected means the complaint was not accepted.',
  },
  {
    question: 'Can I add a photo to my complaint?',
    answer:
      'Yes. You can take a photo using the camera or choose an existing photo from your gallery while reporting an issue.',
  },
  {
    question: 'Can I delete a complaint?',
    answer:
      'You can delete your own complaint while it is still pending. Once processing has started, the complaint cannot be deleted from the student side.',
  },
  {
    question: 'Where can I see my previous complaints?',
    answer:
      'Open My Reports from the Student Home screen. You can view your complaints and filter them by status.',
  },
  {
    question: 'How do notifications work?',
    answer:
      'CampusSetu shows updates about your complaints in the Notifications section. Tap a notification to open the related complaint details.',
  },
  {
    question: 'What should I do if I submit the wrong information?',
    answer:
      'If the complaint is still pending, you can delete it and submit a new complaint with the correct information.',
  },
];

export default function HelpScreen({ navigation }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(
      openIndex === index ? null : index
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9FC"
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Help Center
          </Text>

          <Text style={styles.headerSubtitle}>
            We're here to help you
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Text style={styles.heroIcon}>?</Text>
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              Need some help?
            </Text>

            <Text style={styles.heroDescription}>
              Find answers to common questions
              about reporting and tracking
              campus complaints.
            </Text>
          </View>
        </View>

        {/* QUICK GUIDE */}
        <Text style={styles.sectionTitle}>
          Quick Guide
        </Text>

        <View style={styles.guideCard}>
          <View style={styles.guideItem}>
            <View style={styles.guideNumber}>
              <Text style={styles.guideNumberText}>
                1
              </Text>
            </View>

            <View style={styles.guideText}>
              <Text style={styles.guideTitle}>
                Report
              </Text>

              <Text style={styles.guideDescription}>
                Tell us about the campus issue.
              </Text>
            </View>
          </View>

          <View style={styles.guideLine} />

          <View style={styles.guideItem}>
            <View style={styles.guideNumber}>
              <Text style={styles.guideNumberText}>
                2
              </Text>
            </View>

            <View style={styles.guideText}>
              <Text style={styles.guideTitle}>
                Track
              </Text>

              <Text style={styles.guideDescription}>
                Follow your complaint status.
              </Text>
            </View>
          </View>

          <View style={styles.guideLine} />

          <View style={styles.guideItem}>
            <View style={styles.guideNumber}>
              <Text style={styles.guideNumberText}>
                3
              </Text>
            </View>

            <View style={styles.guideText}>
              <Text style={styles.guideTitle}>
                Resolve
              </Text>

              <Text style={styles.guideDescription}>
                Get notified when your issue is resolved.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqContainer}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <TouchableOpacity
                key={faq.question}
                style={[
                  styles.faqCard,
                  isOpen && styles.faqCardOpen,
                ]}
                activeOpacity={0.85}
                onPress={() => toggleFAQ(index)}
              >
                <View style={styles.questionRow}>
                  <View style={styles.questionIcon}>
                    <Text style={styles.questionIconText}>
                      ?
                    </Text>
                  </View>

                  <Text style={styles.question}>
                    {faq.question}
                  </Text>

                  <Text style={styles.arrow}>
                    {isOpen ? '−' : '+'}
                  </Text>
                </View>

                {isOpen && (
                  <Text style={styles.answer}>
                    {faq.answer}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SUPPORT */}
        <View style={styles.supportCard}>
          <Text style={styles.supportIcon}>
            🆘
          </Text>

          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>
              Still need help?
            </Text>

            <Text style={styles.supportText}>
              If you are facing a problem with
              CampusSetu, contact your college
              administration.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          CampusSetu • Bridging Students and Solutions
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}