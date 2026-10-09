import React, { useState } from 'react';

import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  useWindowDimensions,
} from 'react-native';

import { sendPasswordResetEmail } from 'firebase/auth';

import { auth } from '../config/firebase';
import styles from './ForgotPasswordScreen.styles';

const getErrorMessage = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while before trying again.';

    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';

    case 'auth/operation-not-allowed':
      return 'Password recovery is not enabled for this Firebase project.';

    default:
      return 'We could not send the reset email. Please try again.';
  }
};

export default function ForgotPasswordScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isShortScreen = height < 700;

  const [email, setEmail] = useState(route?.params?.email || '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSendResetEmail = async () => {
    if (loading) return;

    Keyboard.dismiss();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError('Please enter the email address linked to your account.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);

      setEmail(trimmedEmail);
      setSent(true);
    } catch (requestError) {
      console.error(
        'CampusSetu password reset error:',
        requestError.code
      );

      // Avoid revealing whether a Firebase account exists.
      if (requestError.code === 'auth/user-not-found') {
        setEmail(trimmedEmail);
        setSent(true);
      } else {
        setError(getErrorMessage(requestError.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTryAnotherEmail = () => {
    setSent(false);
    setError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor="#F5F7F2"
        barStyle="dark-content"
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.container,
            isSmallPhone && styles.smallContainer,
            isShortScreen && styles.shortContainer,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          {/* Back navigation */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Keyboard.dismiss();
              navigation.goBack();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Back to login"
          >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backText}>Back to login</Text>
          </TouchableOpacity>

          {/* CampusSetu brand */}
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>

            <View>
              <Text style={styles.brandName}>CampusSetu</Text>
              <Text style={styles.brandTagline}>
                BRIDGING STUDENTS AND SOLUTIONS
              </Text>
            </View>
          </View>

          {!sent ? (
            <>
              {/* Recovery hero */}
              <View style={styles.hero}>
                <View style={styles.illustration}>
                  <View style={styles.illustrationCircle}>
                    <Text style={styles.illustrationEmoji}>✉</Text>
                  </View>

                  <View style={styles.illustrationLock}>
                    <Text style={styles.illustrationLockText}>✓</Text>
                  </View>

                  <View style={styles.illustrationSparkOne} />
                  <View style={styles.illustrationSparkTwo} />
                </View>

                <Text style={styles.eyebrow}>ACCOUNT RECOVERY</Text>

                <Text style={styles.title}>
                  Forgot your{'\n'}
                  <Text style={styles.titleAccent}>password?</Text>
                </Text>

                <Text style={styles.subtitle}>
                  It happens! Enter the email address linked to your
                  CampusSetu account and we’ll send you a secure link
                  to reset your password.
                </Text>
              </View>

              {/* Email form */}
              <View style={styles.formCard}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>

                <View
                  style={[
                    styles.inputContainer,
                    focused && styles.inputFocused,
                    error && styles.inputError,
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Text style={styles.inputIcon}>✉</Text>
                  </View>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (error) setError('');
                    }}
                    placeholder="you@college.edu"
                    placeholderTextColor="#9AA69C"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    keyboardAppearance="light"
                    editable={!loading}
                    returnKeyType="send"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={handleSendResetEmail}
                    accessibilityLabel="Email address"
                  />
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorIcon}>!</Text>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSendResetEmail}
                  disabled={loading}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                      <Text style={styles.submitButtonText}>
                        Sending reset link...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>
                        Send reset link
                      </Text>
                      <Text style={styles.submitButtonArrow}>→</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.securityNote}>
                  <Text style={styles.securityIcon}>✓</Text>
                  <Text style={styles.securityText}>
                    Your account stays secure. You’ll reset your
                    password through Firebase’s email link.
                  </Text>
                </View>
              </View>
            </>
          ) : (
            /* Email request confirmation */
            <View style={styles.successHero}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Text style={styles.successCheck}>✓</Text>
                </View>
              </View>

              <View style={styles.successBadge}>
                <View style={styles.successBadgeDot} />
                <Text style={styles.successBadgeText}>
                  REQUEST SUBMITTED
                </Text>
              </View>

              <Text style={styles.successTitle}>
                Check your{'\n'}
                <Text style={styles.titleAccent}>inbox.</Text>
              </Text>

              <Text style={styles.successSubtitle}>
                If an account is associated with this email address,
                you’ll receive instructions to reset your password.
              </Text>

              <View style={styles.emailPreview}>
                <View style={styles.emailPreviewIcon}>
                  <Text style={styles.emailPreviewIconText}>✉</Text>
                </View>

                <View style={styles.emailPreviewContent}>
                  <Text style={styles.emailPreviewLabel}>
                    RESET EMAIL REQUESTED FOR
                  </Text>
                  <Text style={styles.emailPreviewValue}>
                    {email}
                  </Text>
                </View>
              </View>

              <View style={styles.nextStepsCard}>
                <Text style={styles.nextStepsTitle}>
                  What to do next
                </Text>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Open your email inbox.
                  </Text>
                </View>

                <View style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Look for the password reset email from Firebase.
                  </Text>
                </View>

                <View style={[styles.stepRow, styles.stepRowLast]}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Follow the link and choose a new password.
                  </Text>
                </View>
              </View>

              <Text style={styles.spamNote}>
                No email yet? Check your spam or junk folder.
              </Text>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                <Text style={styles.submitButtonText}>
                  Back to login
                </Text>
                <Text style={styles.submitButtonArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tryAnotherButton}
                onPress={handleTryAnotherEmail}
                activeOpacity={0.75}
              >
                <Text style={styles.tryAnotherText}>
                  Try another email address
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              CampusSetu · YOUR VOICE MATTERS
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}