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
  Image,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

import { File } from 'expo-file-system';

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

export default function ReportIssueScreen({
  navigation,
}) {
  const [title, setTitle] =
    useState('');

  const [category, setCategory] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [location, setLocation] =
    useState('');

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================
  // SAVE SELECTED IMAGE
  // ==========================================

  const saveSelectedImage = (asset) => {
    if (!asset) {
      return;
    }

    console.log(
      'Photo selected:',
      asset.uri
    );

    setSelectedImage({
      uri: asset.uri,

      fileName:
        asset.fileName ||
        `campussetu-${Date.now()}.jpg`,

      mimeType:
        asset.mimeType ||
        'image/jpeg',

      width: asset.width,

      height: asset.height,
    });
  };

  // ==========================================
  // PICK IMAGE FROM GALLERY
  // ==========================================

  const handlePickImage = async () => {
    if (submitting) {
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo library access so you can attach a photo to your complaint.'
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      if (
        result.assets &&
        result.assets.length > 0
      ) {
        const asset =
          result.assets[0];

        saveSelectedImage(asset);
      }
    } catch (error) {
      console.error(
        'Photo picker error:',
        error
      );

      Alert.alert(
        'Unable to select photo',
        'Something went wrong while selecting the photo. Please try again.'
      );
    }
  };

  // ==========================================
  // TAKE PHOTO USING LIVE CAMERA
  // ==========================================

  const handleTakePhoto = async () => {
    if (submitting) {
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Camera permission required',
          'Please allow camera access so you can take a photo of the issue.'
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      if (
        result.assets &&
        result.assets.length > 0
      ) {
        const asset =
          result.assets[0];

        saveSelectedImage(asset);
      }
    } catch (error) {
      console.error(
        'Camera error:',
        error
      );

      Alert.alert(
        'Unable to take photo',
        'Something went wrong while opening the camera. Please try again.'
      );
    }
  };

  // ==========================================
  // ADD PHOTO OPTIONS
  // ==========================================

  const handleAddPhoto = () => {
    if (submitting) {
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },

        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
      ]
    );
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const handleRemoveImage = () => {
    if (submitting) {
      return;
    }

    setSelectedImage(null);
  };

  // ==========================================
  // DUPLICATE COMPLAINT
  // ==========================================

  const showDuplicateComplaint = (
    existingIssue
  ) => {
    if (!existingIssue) {
      Alert.alert(
        'Similar complaint exists',
        'A similar active complaint already exists for this location.'
      );

      return;
    }

    const complaintId =
      existingIssue.complaintId ||
      'Not available';

    const status =
      existingIssue.status || 'pending';

    const formattedStatus =
      status === 'pending'
        ? 'Pending'
        : status === 'assigned'
        ? 'Assigned'
        : status === 'in_progress'
        ? 'In Progress'
        : status === 'resolved'
        ? 'Resolved'
        : status === 'rejected'
        ? 'Rejected'
        : status;

    Alert.alert(
      '⚠️ Similar Complaint Already Exists',
      `You already reported a similar issue for this location.\n\nComplaint ID\n${complaintId}\n\nStatus\n${formattedStatus}`,
      [
        {
          text: 'Close',
          style: 'cancel',
        },

        {
          text: 'View Complaint',
          onPress: () => {
            if (!existingIssue._id) {
              Alert.alert(
                'Unable to open complaint',
                'The existing complaint ID could not be found.'
              );

              return;
            }

            navigation.navigate(
              'IssueDetails',
              {
                issueId:
                  existingIssue._id,
              }
            );
          },
        },
      ]
    );
  };

  // ==========================================
  // SUBMIT ISSUE
  // ==========================================

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

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
        'Report Issue: Creating FormData...'
      );

      // ========================================
      // CREATE FORM DATA
      // ========================================

      const formData =
        new FormData();

      // ========================================
      // TEXT FIELDS
      // ========================================

      formData.append(
        'title',
        title.trim()
      );

      formData.append(
        'category',
        category.trim()
      );

      formData.append(
        'description',
        description.trim()
      );

      formData.append(
        'location',
        location.trim()
      );

      formData.append(
        'priority',
        'medium'
      );

      // ========================================
      // PHOTO
      // ========================================

      if (
        selectedImage &&
        selectedImage.uri
      ) {
        console.log(
          'Report Issue: Preparing image...'
        );

        console.log(
          'Image URI:',
          selectedImage.uri
        );

        // --------------------------------------
        // Convert Expo URI into File
        // --------------------------------------

        const imageFile =
          new File(
            selectedImage.uri
          );

        console.log(
          'Image file created'
        );

        // --------------------------------------
        // Append File to FormData
        // --------------------------------------

        formData.append(
          'photo',
          imageFile
        );

        console.log(
          'Photo added to FormData'
        );
      }

      // ========================================
      // SEND REQUEST
      // ========================================

      console.log(
        'Report Issue: Sending request...'
      );

      const response =
        await apiRequest(
          '/issues',
          {
            method: 'POST',
            body: formData,
          }
        );

      // ========================================
      // SUCCESS
      // ========================================

      console.log(
        'Report Issue: Issue created:',
        response.issue
      );

      Alert.alert(
        'Issue reported',

        selectedImage
          ? 'Your issue and photo have been submitted successfully.'
          : 'Your issue has been submitted successfully.',

        [
          {
            text: 'View My Reports',

            onPress: () => {
              navigation.replace(
                'MyReports'
              );
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
        error
      );

      // ========================================
      // DUPLICATE COMPLAINT
      // ========================================

      if (
        error?.status === 409 &&
        error?.data?.duplicate === true &&
        error?.data?.existingIssue
      ) {
        showDuplicateComplaint(
          error.data.existingIssue
        );

        return;
      }

      // ========================================
      // NORMAL ERROR
      // ========================================

      Alert.alert(
        'Submission failed',
        error.message ||
          'Unable to submit your issue. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
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
          contentContainerStyle={
            styles.container
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.goBack()
              }
              activeOpacity={0.8}
              disabled={submitting}
            >
              <Text
                style={styles.backArrow}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <View
              style={
                styles.headerTextContainer
              }
            >
              <Text
                style={
                  styles.headerEyebrow
                }
              >
                CampusSetu
              </Text>

              <Text
                style={styles.headerTitle}
              >
                Report an Issue
              </Text>
            </View>
          </View>

          {/* INTRO */}

          <View style={styles.intro}>
            <Text
              style={styles.introTitle}
            >
              What's happening?
            </Text>

            <Text
              style={styles.introSubtitle}
            >
              Give us a few details so the
              right campus team can take
              action.
            </Text>
          </View>

          {/* TITLE */}

          <View
            style={
              styles.fieldContainer
            }
          >
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

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              CATEGORY
            </Text>

            <View
              style={
                styles.categoryGrid
              }
            >
              {CATEGORIES.map(
                (item) => {
                  const selected =
                    category === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.categoryChip,

                        selected &&
                          styles.categoryChipSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() =>
                        setCategory(item)
                      }
                      disabled={
                        submitting
                      }
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
                }
              )}
            </View>
          </View>

          {/* DESCRIPTION */}

          <View
            style={
              styles.fieldContainer
            }
          >
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
              onChangeText={
                setDescription
              }
              multiline
              textAlignVertical="top"
              editable={!submitting}
            />
          </View>

          {/* LOCATION */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              LOCATION
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Block A, 2nd Floor"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={
                setLocation
              }
              editable={!submitting}
            />
          </View>

          {/* PHOTO */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text style={styles.label}>
              PHOTO
            </Text>

            {selectedImage ? (
              <View
                style={{
                  backgroundColor:
                    '#FFFFFF',

                  borderRadius: 18,

                  borderWidth: 1,

                  borderColor:
                    '#E2E8F0',

                  overflow: 'hidden',
                }}
              >
                <Image
                  source={{
                    uri:
                      selectedImage.uri,
                  }}
                  style={{
                    width: '100%',
                    height: 220,
                  }}
                  resizeMode="cover"
                />

                <View
                  style={{
                    padding: 14,

                    flexDirection:
                      'row',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      paddingRight: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: '#111827',
                      }}
                      numberOfLines={1}
                    >
                      Photo selected
                    </Text>

                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: '#64748B',
                      }}
                      numberOfLines={1}
                    >
                      {
                        selectedImage.fileName
                      }
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={
                      handleRemoveImage
                    }
                    disabled={
                      submitting
                    }
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 13,

                      paddingVertical: 9,

                      borderRadius: 10,

                      backgroundColor:
                        '#FEF2F2',

                      borderWidth: 1,

                      borderColor:
                        '#FECACA',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,

                        fontWeight: '800',

                        color: '#DC2626',
                      }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={
                  styles.photoCard
                }
                activeOpacity={0.8}
                disabled={submitting}
                onPress={
                  handleAddPhoto
                }
              >
                <View
                  style={
                    styles.photoIcon
                  }
                >
                  <Text
                    style={
                      styles.photoIconText
                    }
                  >
                    +
                  </Text>
                </View>

                <View
                  style={
                    styles.photoContent
                  }
                >
                  <Text
                    style={
                      styles.photoTitle
                    }
                  >
                    Add a photo
                  </Text>

                  <Text
                    style={
                      styles.photoSubtitle
                    }
                  >
                    Take a live photo or choose one from your gallery.
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* CHANGE PHOTO */}

            {selectedImage && (
              <TouchableOpacity
                onPress={
                  handleAddPhoto
                }
                disabled={
                  submitting
                }
                activeOpacity={0.8}
                style={{
                  marginTop: 10,

                  alignSelf:
                    'flex-start',

                  paddingHorizontal: 14,

                  paddingVertical: 9,

                  borderRadius: 10,

                  backgroundColor:
                    '#EFF6FF',

                  borderWidth: 1,

                  borderColor:
                    '#BFDBFE',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,

                    fontWeight: '800',

                    color: '#2563EB',
                  }}
                >
                  Change photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SUBMIT */}

          <TouchableOpacity
            style={
              styles.submitButton
            }
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View>
              <Text
                style={
                  styles.submitEyebrow
                }
              >
                {submitting
                  ? 'SUBMITTING...'
                  : 'READY TO REPORT?'}
              </Text>

              <Text
                style={styles.submitText}
              >
                {submitting
                  ? 'Submitting Issue'
                  : 'Submit Issue'}
              </Text>
            </View>

            <View
              style={
                styles.submitArrow
              }
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.submitArrowText
                  }
                >
                  →
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* FOOTER */}

          <Text
            style={styles.footerText}
          >
            CampusSetu • Bridging Students
            and Solutions.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}