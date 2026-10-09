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
  useWindowDimensions,
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

const PRIORITIES = [
  {
    value: 'low',
    label: 'Low',
    description: 'Minor issue',
    color: '#15803D',
    background: '#F0FDF4',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Normal attention',
    color: '#A16207',
    background: '#FEFCE8',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Needs quick action',
    color: '#C2410C',
    background: '#FFF7ED',
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'Immediate attention',
    color: '#B91C1C',
    background: '#FEF2F2',
  },
];

export default function ReportIssueScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 380;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [location, setLocation] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Save the selected image.
  const saveSelectedImage = (asset) => {
    if (!asset) return;

    setSelectedImage({
      uri: asset.uri,
      fileName:
        asset.fileName || `campussetu-${Date.now()}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
      width: asset.width,
      height: asset.height,
    });
  };

  // Select a photo from the gallery.
  const handlePickImage = async () => {
    if (submitting) return;

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow photo library access to attach a complaint photo.'
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

      if (!result.canceled && result.assets?.length > 0) {
        saveSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Photo picker error:', error);

      Alert.alert(
        'Unable to select photo',
        'Something went wrong while selecting the photo. Please try again.'
      );
    }
  };

  // Take a photo using the camera.
  const handleTakePhoto = async () => {
    if (submitting) return;

    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Camera permission required',
          'Please allow camera access to take a photo of the issue.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        saveSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);

      Alert.alert(
        'Unable to take photo',
        'Something went wrong while opening the camera. Please try again.'
      );
    }
  };

  // Show photo options.
  const handleAddPhoto = () => {
    if (submitting) return;

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo.',
      [
        { text: 'Cancel', style: 'cancel' },
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

  const handleRemoveImage = () => {
    if (!submitting) {
      setSelectedImage(null);
    }
  };

  // Handle duplicate complaints.
  const showDuplicateComplaint = (existingIssue) => {
    if (!existingIssue) {
      Alert.alert(
        'Similar complaint exists',
        'A similar active complaint already exists for this location.'
      );
      return;
    }

    const complaintId =
      existingIssue.complaintId || 'Not available';

    const statusLabels = {
      pending: 'Pending',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      resolved: 'Resolved',
      rejected: 'Rejected',
    };

    const formattedStatus =
      statusLabels[existingIssue.status] ||
      existingIssue.status ||
      'Pending';

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

            navigation.navigate('IssueDetails', {
              issueId: existingIssue._id,
            });
          },
        },
      ]
    );
  };

  // Submit the complaint.
  const handleSubmit = async () => {
    if (submitting) return;

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

    const cleanBuilding = building.trim();
    const cleanFloor = floor.trim();
    const cleanRoomNumber = roomNumber.trim();
    const cleanLocation = location.trim();

    if (
      !cleanBuilding &&
      !cleanFloor &&
      !cleanRoomNumber &&
      !cleanLocation
    ) {
      Alert.alert(
        'Missing location',
        'Please enter at least a building, floor, room number, or additional location detail.'
      );
      return;
    }

    const locationParts = [
      cleanBuilding,
      cleanFloor ? `Floor ${cleanFloor}` : '',
      cleanRoomNumber ? `Room ${cleanRoomNumber}` : '',
      cleanLocation,
    ].filter(Boolean);

    const combinedLocation = locationParts.join(', ');

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());

      // Preserve the existing location field.
      formData.append('location', combinedLocation);

      // Send the structured location separately as well.
      formData.append('building', cleanBuilding);
      formData.append('floor', cleanFloor);
      formData.append('roomNumber', cleanRoomNumber);

      // Send the student's selected priority.
      formData.append('priority', priority);

      // Attach a photo if selected.
      if (selectedImage?.uri) {
        const imageFile = new File(selectedImage.uri);
        formData.append('photo', imageFile);
      }

      const response = await apiRequest('/issues', {
        method: 'POST',
        body: formData,
      });

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
        error
      );

      if (
        error?.status === 409 &&
        error?.data?.duplicate === true &&
        error?.data?.existingIssue
      ) {
        showDuplicateComplaint(error.data.existingIssue);
        return;
      }

      Alert.alert(
        'Submission failed',
        error.message ||
          'Unable to submit your issue. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable text input.
  const renderInput = (
    label,
    value,
    onChangeText,
    placeholder,
    options = {}
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        editable={!submitting}
        returnKeyType="next"
        {...options}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.container,
            {
              paddingBottom: 40,
              paddingHorizontal: compact ? 16 : 22,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <View style={styles.brandRow}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkText}>C</Text>
                </View>

                <View style={styles.brandCopy}>
                  <Text style={styles.headerEyebrow}>
                    CampusSetu
                  </Text>

                  <Text style={styles.headerTagline}>
                    Bridging students and solutions
                  </Text>
                </View>
              </View>

              <Text style={styles.headerTitle}>
                Report an Issue
              </Text>

              <Text style={styles.headerSubtitle}>
                Help us make your campus better.
              </Text>
            </View>
          </View>

          {/* INTRO */}
          <View style={styles.intro}>
            <Text style={styles.introTitle}>
              What's happening?
            </Text>

            <Text style={styles.introSubtitle}>
              Give us a few details so the right campus team can
              take action.
            </Text>
          </View>

          {/* ISSUE TITLE */}
          {renderInput(
            'ISSUE TITLE',
            title,
            setTitle,
            'e.g. Water leakage in Block A'
          )}

          {/* CATEGORY */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>CATEGORY</Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((item) => {
                const selected = category === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryChip,
                      selected && styles.categoryChipSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setCategory(item)}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* PRIORITY */}
          <View style={styles.fieldContainer}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.label}>PRIORITY LEVEL</Text>
              <Text style={styles.optionalHint}>Choose urgency</Text>
            </View>

            <View style={styles.priorityGrid}>
              {PRIORITIES.map((item) => {
                const selected = priority === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.82}
                    disabled={submitting}
                    onPress={() => setPriority(item.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[
                      styles.priorityCard,
                      compact && styles.priorityCardCompact,
                      selected && {
                        backgroundColor: item.background,
                        borderColor: item.color,
                      },
                    ]}
                  >
                    <View style={styles.priorityCardTop}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: item.color },
                        ]}
                      />

                      <Text
                        style={[
                          styles.priorityTitle,
                          { color: item.color },
                        ]}
                      >
                        {item.label}
                      </Text>

                      <View
                        style={[
                          styles.priorityRadio,
                          selected && {
                            borderColor: item.color,
                          },
                        ]}
                      >
                        {selected ? (
                          <View
                            style={[
                              styles.priorityRadioInner,
                              { backgroundColor: item.color },
                            ]}
                          />
                        ) : null}
                      </View>
                    </View>

                    <Text style={styles.priorityDescription}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.priorityNote}>
              Select Critical only when the issue needs immediate attention.
            </Text>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>DESCRIPTION</Text>

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

          {/* BUILDING */}
          {renderInput(
            'BUILDING / BLOCK',
            building,
            setBuilding,
            'e.g. Main Block, Library Block'
          )}

          {/* FLOOR AND ROOM */}
          <View
            style={[
              styles.locationPairRow,
              compact && styles.locationPairRowCompact,
            ]}
          >
            <View style={styles.locationPairField}>
              <Text style={styles.label}>FLOOR</Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. 2 or Ground"
                placeholderTextColor="#94A3B8"
                value={floor}
                onChangeText={setFloor}
                editable={!submitting}
                returnKeyType="next"
              />
            </View>

            <View style={styles.locationPairField}>
              <Text style={styles.label}>ROOM NUMBER</Text>

              <TextInput
                style={styles.input}
                placeholder="e.g. 204"
                placeholderTextColor="#94A3B8"
                value={roomNumber}
                onChangeText={setRoomNumber}
                editable={!submitting}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* ADDITIONAL LOCATION */}
          {renderInput(
            'ADDITIONAL LOCATION DETAILS (OPTIONAL)',
            location,
            setLocation,
            'e.g. Near the library entrance'
          )}

          {/* PHOTO */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>PHOTO</Text>

            {selectedImage ? (
              <View style={styles.selectedPhotoCard}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.selectedPhoto}
                  resizeMode="cover"
                />

                <View style={styles.selectedPhotoFooter}>
                  <View style={styles.photoContent}>
                    <Text
                      style={styles.selectedPhotoTitle}
                      numberOfLines={1}
                    >
                      Photo selected
                    </Text>

                    <Text
                      style={styles.selectedPhotoName}
                      numberOfLines={1}
                    >
                      {selectedImage.fileName}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleRemoveImage}
                    disabled={submitting}
                    activeOpacity={0.8}
                    style={styles.removePhotoButton}
                  >
                    <Text style={styles.removePhotoText}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoCard}
                activeOpacity={0.8}
                disabled={submitting}
                onPress={handleAddPhoto}
              >
                <View style={styles.photoIcon}>
                  <Text style={styles.photoIconText}>+</Text>
                </View>

                <View style={styles.photoContent}>
                  <Text style={styles.photoTitle}>
                    Add a photo
                  </Text>

                  <Text style={styles.photoSubtitle}>
                    Take a live photo or choose one from your gallery.
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {selectedImage && (
              <TouchableOpacity
                onPress={handleAddPhoto}
                disabled={submitting}
                activeOpacity={0.8}
                style={styles.changePhotoButton}
              >
                <Text style={styles.changePhotoText}>
                  Change photo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <View style={styles.submitContent}>
              <Text style={styles.submitEyebrow}>
                {submitting ? 'SUBMITTING...' : 'READY TO REPORT?'}
              </Text>

              <Text style={styles.submitText}>
                {submitting ? 'Submitting Issue' : 'Submit Issue'}
              </Text>
            </View>

            <View style={styles.submitArrow}>
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.submitArrowText}>→</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* FOOTER */}
          <Text style={styles.footerText}>
            CampusSetu • Bridging Students and Solutions.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}