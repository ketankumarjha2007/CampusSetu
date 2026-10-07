import React, { useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import styles from './ReportIssueScreen.styles';
import { apiRequest } from '../services/api';

const CATEGORIES = [
  'Infrastructure',
  'Cleanliness',
  'Electricity',
  'Water',
  'Internet',
  'Safety',
  'Other',
];

export default function ReportIssueScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    if (!title.trim()) {
      Alert.alert(
        'Missing title',
        'Please enter a title for the issue.'
      );
      return;
    }

    if (!category) {
      Alert.alert(
        'Select category',
        'Please select an issue category.'
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        'Missing description',
        'Please describe the issue.'
      );
      return;
    }

    if (!location.trim()) {
      Alert.alert(
        'Missing location',
        'Please enter where the issue is located.'
      );
      return;
    }

    setSubmitting(true);

    try {
      console.log(
        'Report Issue: Submitting issue...'
      );

      const response = await apiRequest('/issues', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          description: description.trim(),
          location: location.trim(),
          photoUrl: '',
          priority: 'medium',
        }),
      });

      console.log(
        'Report Issue: Issue created successfully:',
        response.issue
      );

      Alert.alert(
        'Issue reported',
        'Your issue has been submitted successfully.',
        [
          {
            text: 'View My Reports',
            onPress: () => {
              navigation.replace('MyReports');
            },
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Report Issue: Submission failed:',
        error.message
      );

      Alert.alert(
        'Submission failed',
        error.message ||
          'Unable to submit your issue. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              disabled={submitting}
            >
              <Text style={styles.backArrow}>
                ‹
              </Text>
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerEyebrow}>
                CampusSetu
              </Text>

              <Text style={styles.headerTitle}>
                Report an Issue
              </Text>
            </View>
          </View>

          {/* INTRO */}
          <View style={styles.intro}>
            <Text style={styles.introTitle}>
              What's happening?
            </Text>

            <Text style={styles.introSubtitle}>
              Give us a few details so the right campus
              team can take action.
            </Text>
          </View>

          {/* TITLE */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              ISSUE TITLE
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Water leakage in Block A"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              editable={!submitting}
            />
          </View>

          {/* CATEGORY */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              CATEGORY
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((item) => {
                const selected = category === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryChip,
                      selected &&
                        styles.categoryChipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setCategory(item)}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected &&
                          styles.categoryTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              DESCRIPTION
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.descriptionInput,
              ]}
              placeholder="Describe the problem in detail..."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              editable={!submitting}
            />
          </View>

          {/* LOCATION */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              LOCATION
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Block A, 2nd Floor"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
              editable={!submitting}
            />
          </View>

          {/* PHOTO */}
          <TouchableOpacity
            style={styles.photoCard}
            activeOpacity={0.8}
            disabled={submitting}
            onPress={() =>
              Alert.alert(
                'Photo upload',
                'Photo upload will be connected after the core issue reporting flow is complete.'
              )
            }
          >
            <View style={styles.photoIcon}>
              <Text style={styles.photoIconText}>
                +
              </Text>
            </View>

            <View style={styles.photoContent}>
              <Text style={styles.photoTitle}>
                Add a photo
              </Text>

              <Text style={styles.photoSubtitle}>
                A photo can help the resolution team
                understand the issue faster.
              </Text>
            </View>
          </TouchableOpacity>

          {/* SUBMIT */}
          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View>
              <Text style={styles.submitEyebrow}>
                {submitting
                  ? 'SUBMITTING...'
                  : 'READY TO REPORT?'}
              </Text>

              <Text style={styles.submitText}>
                {submitting
                  ? 'Submitting Issue'
                  : 'Submit Issue'}
              </Text>
            </View>

            <View style={styles.submitArrow}>
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={styles.submitArrowText}
                >
                  →
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            CampusSetu • Bridging Students and Solutions.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}