import React, { useEffect, useRef, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { apiRequest } from '../services/api';

import styles from './RegisterScreen.styles';

export default function RegisterScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 360;

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const studentIdRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageAnim = useRef(
    new Animated.Value(0),
  ).current;

  const formAnim = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const animation = Animated.stagger(120, [
      Animated.timing(pageAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(formAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pageAnim, formAnim]);

  const pageTranslate = pageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const formTranslate = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const validateForm = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedStudentId = studentId.trim();

    if (!trimmedName) {
      Alert.alert(
        'Missing name',
        'Please enter your full name.',
      );
      return false;
    }

    if (trimmedName.length < 3) {
      Alert.alert(
        'Invalid name',
        'Please enter your complete name.',
      );
      return false;
    }

    if (!trimmedEmail) {
      Alert.alert(
        'Missing email',
        'Please enter your college email.',
      );
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        'Invalid email',
        'Please enter a valid email address.',
      );
      return false;
    }

    if (!trimmedStudentId) {
      Alert.alert(
        'Missing USN',
        'Please enter your USN.',
      );
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Your password must contain at least 6 characters.',
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Passwords do not match',
        'Please make sure both passwords are identical.',
      );
      return false;
    }

    return true;
  };

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Try signing in instead.';

      case 'auth/invalid-email':
        return 'Please enter a valid email address.';

      case 'auth/weak-password':
        return 'Your password is too weak. Please choose a stronger password.';

      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';

      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';

      case 'auth/operation-not-allowed':
        return 'Email/password authentication is not enabled in Firebase.';

      default:
        return 'Something went wrong while creating your account. Please try again.';
    }
  };

  const handleRegister = async () => {
    if (loading) {
      return;
    }

    Keyboard.dismiss();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedStudentId = studentId.trim().toUpperCase();

      // Create Firebase account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          password,
        );

      const user = userCredential.user;

      // Save display name in Firebase
      await updateProfile(user, {
        displayName: trimmedName,
      });

      // Save student profile in CampusSetu MongoDB
      await apiRequest('/users/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          usn: trimmedStudentId,
        }),
      });

      // Send verification email
      await sendEmailVerification(user);

      console.log(
        'CampusSetu student account created:',
        {
          uid: user.uid,
          fullName: trimmedName,
          email: trimmedEmail,
          usn: trimmedStudentId,
        },
      );

      Alert.alert(
        'Account created 🎉',
        'Your CampusSetu account has been created. Please verify your email before signing in.',
        [
          {
            text: 'Continue to Login',
            onPress: () =>
              navigation.replace('Login'),
          },
        ],
      );
    } catch (error) {
      console.log(
        'Firebase registration error:',
        error,
      );

      // Handle duplicate USN / backend errors
      if (
        error.message &&
        error.message.toLowerCase().includes('usn')
      ) {
        Alert.alert(
          'Registration failed',
          error.message,
        );
      } else {
        Alert.alert(
          'Registration failed',
          getFirebaseErrorMessage(error.code),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFocus = (field) => {
    setFocusedField(field);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    field,
    inputRef,
    nextRef,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    returnKeyType = 'next',
    onSubmitEditing,
  }) => {
    const focused = focusedField === field;

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {label}
        </Text>

        <View
          style={[
            styles.inputContainer,
            focused &&
              styles.inputContainerFocused,
          ]}
        >
          <View style={styles.inputIcon}>
            <Text style={styles.inputIconText}>
              {field === 'name'
                ? 'N'
                : field === 'email'
                ? '@'
                : 'ID'}
            </Text>
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A8B2C1"
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            editable={!loading}
            returnKeyType={returnKeyType}
            blurOnSubmit={false}
            onFocus={() =>
              handleFieldFocus(field)
            }
            onBlur={handleFieldBlur}
            onSubmitEditing={() => {
              if (onSubmitEditing) {
                onSubmitEditing();
                return;
              }

              if (nextRef?.current) {
                nextRef.current.focus();
              }
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          isSmallPhone && styles.smallPhoneContainer,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === 'ios'
            ? 'interactive'
            : 'on-drag'
        }
        automaticallyAdjustKeyboardInsets={true}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View
          pointerEvents="none"
          style={styles.backgroundCircle}
        />

        <View
          pointerEvents="none"
          style={styles.backgroundCircleSmall}
        />

        {/* HEADER */}

        <Animated.View
          style={[
            styles.header,
            {
              opacity: pageAnim,
              transform: [
                {
                  translateY: pageTranslate,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            disabled={loading}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerBrand}>
            <View style={styles.headerLogo}>
              <Text style={styles.headerLogoText}>
                C
              </Text>
            </View>

            <Text style={styles.headerBrandText}>
              CampusSetu
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* HERO */}

        <Animated.View
          style={[
            styles.hero,
            {
              opacity: pageAnim,
              transform: [
                {
                  translateY: pageTranslate,
                },
              ],
            },
          ]}
        >
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />

            <Text style={styles.eyebrow}>
              STUDENT REGISTRATION
            </Text>
          </View>

          <Text style={styles.title}>
            Create your{'\n'}
            <Text style={styles.titleAccent}>
              campus account.
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Join CampusSetu to report campus
            issues, follow resolutions and stay
            connected with your college.
          </Text>

          <View style={styles.studentBadge}>
            <View style={styles.studentBadgeIcon}>
              <Text
                style={
                  styles.studentBadgeIconText
                }
              >
                S
              </Text>
            </View>

            <View
              style={styles.studentBadgeContent}
            >
              <Text
                style={styles.studentBadgeTitle}
              >
                Student account
              </Text>

              <Text
                style={
                  styles.studentBadgeSubtitle
                }
              >
                New accounts are registered as
                Students
              </Text>
            </View>

            <View style={styles.badgeCheck}>
              <Text
                style={styles.badgeCheckText}
              >
                ✓
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* FORM */}

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY: formTranslate,
                },
              ],
            },
          ]}
        >
          {renderInput({
            label: 'FULL NAME',
            value: fullName,
            onChangeText: setFullName,
            placeholder: 'Enter your full name',
            field: 'name',
            inputRef: nameRef,
            nextRef: emailRef,
            autoCapitalize: 'words',
          })}

          {renderInput({
            label: 'COLLEGE EMAIL',
            value: email,
            onChangeText: setEmail,
            placeholder: 'yourname@college.edu',
            field: 'email',
            inputRef: emailRef,
            nextRef: studentIdRef,
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}

          {renderInput({
            label: 'USN',
            value: studentId,
            onChangeText: setStudentId,
            placeholder: 'Enter your USN',
            field: 'studentId',
            inputRef: studentIdRef,
            nextRef: passwordRef,
            autoCapitalize: 'characters',
          })}

          {/* PASSWORD */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              PASSWORD
            </Text>

            <View
              style={[
                styles.inputContainer,
                focusedField === 'password' &&
                  styles.inputContainerFocused,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.lockIcon}>
                  •••
                </Text>
              </View>

              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#A8B2C1"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() =>
                  handleFieldFocus(
                    'password',
                  )
                }
                onBlur={handleFieldBlur}
                onSubmitEditing={() =>
                  confirmPasswordRef.current?.focus()
                }
              />

              <TouchableOpacity
                style={styles.passwordToggle}
                activeOpacity={0.7}
                disabled={loading}
                onPress={() =>
                  setShowPassword(
                    !showPassword,
                  )
                }
              >
                <Text
                  style={
                    styles.passwordToggleText
                  }
                >
                  {showPassword
                    ? 'HIDE'
                    : 'SHOW'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRM PASSWORD */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              CONFIRM PASSWORD
            </Text>

            <View
              style={[
                styles.inputContainer,
                focusedField ===
                  'confirmPassword' &&
                  styles.inputContainerFocused,
              ]}
            >
              <View style={styles.inputIcon}>
                <Text style={styles.lockIcon}>
                  •••
                </Text>
              </View>

              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                placeholder="Repeat your password"
                placeholderTextColor="#A8B2C1"
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() =>
                  handleFieldFocus(
                    'confirmPassword',
                  )
                }
                onBlur={handleFieldBlur}
                onSubmitEditing={
                  handleRegister
                }
              />

              <TouchableOpacity
                style={styles.passwordToggle}
                activeOpacity={0.7}
                disabled={loading}
                onPress={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword,
                  )
                }
              >
                <Text
                  style={
                    styles.passwordToggleText
                  }
                >
                  {showConfirmPassword
                    ? 'HIDE'
                    : 'SHOW'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CREATE ACCOUNT */}

          <TouchableOpacity
            style={[
              styles.createButton,
              loading &&
                styles.createButtonLoading,
            ]}
            activeOpacity={0.86}
            disabled={loading}
            onPress={handleRegister}
          >
            {loading ? (
              <>
                <View>
                  <Text
                    style={styles.createEyebrow}
                  >
                    SECURE REGISTRATION
                  </Text>

                  <Text
                    style={styles.createText}
                  >
                    Creating account...
                  </Text>
                </View>

                <View style={styles.createArrow}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                </View>
              </>
            ) : (
              <>
                <View>
                  <Text
                    style={styles.createEyebrow}
                  >
                    JOIN YOUR CAMPUS
                  </Text>

                  <Text
                    style={styles.createText}
                  >
                    Create student account
                  </Text>
                </View>

                <View style={styles.createArrow}>
                  <Text
                    style={
                      styles.createArrowText
                    }
                  >
                    →
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* SECURITY */}

          <View style={styles.securityRow}>
            <View style={styles.securityIcon}>
              <Text
                style={styles.securityIconText}
              >
                ✓
              </Text>
            </View>

            <View
              style={
                styles.securityTextContainer
              }
            >
              <Text style={styles.securityTitle}>
                Secure registration
              </Text>

              <Text
                style={
                  styles.securitySubtitle
                }
              >
                Your account will be securely
                authenticated by Firebase.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* LOGIN */}

        <Animated.View
          style={[
            styles.loginSection,
            {
              opacity: formAnim,
            },
          ]}
        >
          <Text style={styles.loginText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={loading}
            onPress={() =>
              navigation.navigate('Login')
            }
          >
            <Text style={styles.loginLink}>
              Sign in
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>
          BRIDGING STUDENTS AND SOLUTIONS
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}