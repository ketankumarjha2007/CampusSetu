import React, { useEffect, useRef, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { getCurrentUser } from '../services/api';

import {
  registerForPushNotificationsAsync,
} from '../services/notificationService';

import styles from './LoginScreen.styles';

const ROLES = [
  {
    id: 'student',
    title: 'Student',
    subtitle: 'Report & track',
    icon: 'S',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    subtitle: 'Manage issues',
    icon: 'T',
  },
  {
    id: 'cluster_head',
    title: 'Cluster Head',
    subtitle: 'Coordinate teams',
    icon: 'C',
  },
  {
    id: 'principal',
    title: 'Principal',
    subtitle: 'Campus oversight',
    icon: 'P',
  },
];

export default function LoginScreen({ navigation }) {
  const { width } =
    useWindowDimensions();

  const isSmallPhone =
    width < 360;

  const [
    selectedRole,
    setSelectedRole,
  ] = useState('student');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    focusedField,
    setFocusedField,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const emailRef =
    useRef(null);

  const passwordRef =
    useRef(null);

  const pageAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  const roleAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  const formAnim =
    useRef(
      new Animated.Value(0)
    ).current;

  /*
   * SCREEN ANIMATIONS
   */

  useEffect(() => {
    const animation =
      Animated.stagger(110, [
        Animated.timing(
          pageAnim,
          {
            toValue: 1,
            duration: 600,
            easing:
              Easing.out(
                Easing.cubic
              ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          roleAnim,
          {
            toValue: 1,
            duration: 650,
            easing:
              Easing.out(
                Easing.cubic
              ),
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          formAnim,
          {
            toValue: 1,
            duration: 700,
            easing:
              Easing.out(
                Easing.cubic
              ),
            useNativeDriver: true,
          }
        ),
      ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    pageAnim,
    roleAnim,
    formAnim,
  ]);

  const pageTranslate =
    pageAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    });

  const roleTranslate =
    roleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [25, 0],
    });

  const formTranslate =
    formAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
    });

  /*
   * FIREBASE ERROR HANDLER
   */

  const getFirebaseErrorMessage =
    (errorCode) => {
      switch (errorCode) {
        case 'auth/invalid-email':
          return 'Please enter a valid college email address.';

        case 'auth/user-not-found':
          return 'No CampusSetu account exists with this email.';

        case 'auth/wrong-password':
          return 'The password you entered is incorrect.';

        case 'auth/invalid-credential':
          return 'The email or password is incorrect.';

        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact your college administrator.';

        case 'auth/too-many-requests':
          return 'Too many login attempts. Please wait a moment and try again.';

        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';

        case 'auth/operation-not-allowed':
          return 'Email/password authentication is not enabled in Firebase.';

        default:
          return 'Unable to sign in. Please try again.';
      }
    };

  /*
   * EMAIL / PASSWORD LOGIN
   */

  const handleLogin =
    async () => {
      if (loading) {
        return;
      }

      Keyboard.dismiss();

      const trimmedEmail =
        email
          .trim()
          .toLowerCase();

      if (!trimmedEmail) {
        Alert.alert(
          'Missing email',
          'Please enter your college email address.'
        );

        return;
      }

      if (!password) {
        Alert.alert(
          'Missing password',
          'Please enter your password.'
        );

        return;
      }

      setLoading(true);

      try {
        // ----------------------------------------
        // 1. Firebase authentication
        // ----------------------------------------

        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            trimmedEmail,
            password
          );

        const user =
          userCredential.user;

        // ----------------------------------------
        // 2. CampusSetu requires verified email
        // ----------------------------------------

        if (!user.emailVerified) {
          Alert.alert(
            'Email not verified',
            'Please verify your email before signing in to CampusSetu.',
            [
              {
                text: 'OK',
                style: 'default',
              },
            ]
          );

          await auth.signOut();

          return;
        }

        console.log(
          'CampusSetu Firebase login successful:',
          {
            uid: user.uid,
            email: user.email,
            selectedRole,
          }
        );

        // ----------------------------------------
        // 3. Connect to CampusSetu backend
        // ----------------------------------------

        let backendResponse;

        try {
          backendResponse =
            await getCurrentUser();

          console.log(
            'CampusSetu backend user:',
            backendResponse.user
          );

          // The backend/database role is authoritative.
          const backendRole =
            backendResponse.user?.role;

          console.log(
            'CampusSetu authenticated role:',
            backendRole
          );
        } catch (
        backendError
        ) {
          console.error(
            'CampusSetu backend connection failed:',
            backendError.message
          );

          Alert.alert(
            'Backend connection failed',
            'Your Firebase login was successful, but CampusSetu could not connect to the server. Please make sure the backend is running and your phone is connected to the same Wi-Fi as your computer.'
          );

          return;
        }

        // ----------------------------------------
        // 4. Register push notifications
        // ----------------------------------------
        //
        // IMPORTANT:
        // This happens only AFTER Firebase login
        // and the backend user request succeed.
        //
        // At this point:
        // auth.currentUser exists
        // and apiRequest() can obtain the
        // Firebase ID token.
        // ----------------------------------------

        console.log(
          'CampusSetu: Registering for push notifications after login...'
        );

        try {
          const pushToken =
            await registerForPushNotificationsAsync();

          if (pushToken) {
            console.log(
              'CampusSetu: Push notification registration successful:',
              pushToken
            );
          } else {
            console.log(
              'CampusSetu: Push notification registration was not completed.'
            );
          }
        } catch (
        notificationError
        ) {
          // Notification failure must NOT prevent
          // the student from entering CampusSetu.
          console.error(
            'CampusSetu: Push notification registration failed:',
            notificationError.message
          );
        }

        // ----------------------------------------
        // 5. Continue to Student Home
        // ----------------------------------------

        navigation.replace(
          'StudentHome'
        );
      } catch (error) {
        console.log(
          'Firebase login error:',
          error
        );

        Alert.alert(
          'Login failed',
          getFirebaseErrorMessage(
            error.code
          )
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * ROLE SELECTOR
   */

  const handleRoleChange =
    (roleId) => {
      if (loading) {
        return;
      }

      setSelectedRole(
        roleId
      );
    };

  /*
   * RENDER
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.container,
          isSmallPhone &&
          styles.smallPhoneContainer,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={
          false
        }
      >
        {/* BACKGROUND */}

        <View
          pointerEvents="none"
          style={
            styles.backgroundCircle
          }
        />

        <View
          pointerEvents="none"
          style={
            styles.backgroundCircleSmall
          }
        />

        {/* HEADER */}

        <Animated.View
          style={[
            styles.header,
            {
              opacity: pageAnim,
              transform: [
                {
                  translateY:
                    pageTranslate,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            activeOpacity={0.75}
            disabled={loading}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.backArrow
              }
            >
              ‹
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.headerBrand
            }
          >
            <View
              style={
                styles.headerLogo
              }
            >
              <Text
                style={
                  styles.headerLogoText
                }
              >
                C
              </Text>
            </View>

            <Text
              style={
                styles.headerBrandText
              }
            >
              CampusSetu
            </Text>
          </View>

          <View
            style={
              styles.headerSpacer
            }
          />
        </Animated.View>

        {/* HERO */}

        <Animated.View
          style={[
            styles.hero,
            {
              opacity: pageAnim,
              transform: [
                {
                  translateY:
                    pageTranslate,
                },
              ],
            },
          ]}
        >
          <View
            style={
              styles.eyebrowRow
            }
          >
            <View
              style={
                styles.eyebrowDot
              }
            />

            <Text
              style={
                styles.eyebrow
              }
            >
              CAMPUS ACCESS
            </Text>
          </View>

          <Text
            style={
              styles.title
            }
          >
            Welcome{'\n'}
            <Text
              style={
                styles.titleAccent
              }
            >
              back.
            </Text>
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Choose your campus role and
            sign in to continue to
            CampusSetu.
          </Text>
        </Animated.View>

        {/* ROLE SELECTOR */}

        <Animated.View
          style={[
            styles.roleSection,
            {
              opacity: roleAnim,
              transform: [
                {
                  translateY:
                    roleTranslate,
                },
              ],
            },
          ]}
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionLabel
              }
            >
              CONTINUE AS
            </Text>

            <Text
              style={
                styles.selectedRoleText
              }
            >
              {
                ROLES.find(
                  (role) =>
                    role.id ===
                    selectedRole
                )?.title
              }
            </Text>
          </View>

          <View
            style={
              styles.roleGrid
            }
          >
            {ROLES.map(
              (role) => {
                const isSelected =
                  selectedRole ===
                  role.id;

                return (
                  <TouchableOpacity
                    key={
                      role.id
                    }
                    activeOpacity={
                      0.85
                    }
                    disabled={
                      loading
                    }
                    style={[
                      styles.roleCard,
                      isSelected &&
                      styles.roleCardSelected,
                    ]}
                    onPress={() =>
                      handleRoleChange(
                        role.id
                      )
                    }
                  >
                    <View
                      style={[
                        styles.roleIcon,
                        isSelected &&
                        styles.roleIconSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleIconText,
                          isSelected &&
                          styles.roleIconTextSelected,
                        ]}
                      >
                        {
                          role.icon
                        }
                      </Text>
                    </View>

                    <View
                      style={
                        styles.roleContent
                      }
                    >
                      <Text
                        style={[
                          styles.roleTitle,
                          isSelected &&
                          styles.roleTitleSelected,
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {
                          role.title
                        }
                      </Text>

                      <Text
                        style={[
                          styles.roleSubtitle,
                          isSelected &&
                          styles.roleSubtitleSelected,
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {
                          role.subtitle
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.selectionIndicator,
                        isSelected &&
                        styles.selectionIndicatorSelected,
                      ]}
                    >
                      {isSelected && (
                        <Text
                          style={
                            styles.selectionCheck
                          }
                        >
                          ✓
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </Animated.View>

        {/* LOGIN FORM */}

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formAnim,
              transform: [
                {
                  translateY:
                    formTranslate,
                },
              ],
            },
          ]}
        >
          {/* EMAIL */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={
                styles.fieldLabel
              }
            >
              COLLEGE EMAIL
            </Text>

            <View
              style={[
                styles.inputContainer,
                focusedField ===
                'email' &&
                styles.inputContainerFocused,
              ]}
            >
              <View
                style={
                  styles.inputIcon
                }
              >
                <Text
                  style={
                    styles.inputIconText
                  }
                >
                  @
                </Text>
              </View>

              <TextInput
                ref={emailRef}
                style={
                  styles.input
                }
                value={email}
                onChangeText={
                  setEmail
                }
                placeholder="yourname@college.edu"
                placeholderTextColor="#A8B2C1"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={
                  !loading
                }
                returnKeyType="next"
                blurOnSubmit={false}
                onFocus={() =>
                  setFocusedField(
                    'email'
                  )
                }
                onBlur={() =>
                  setFocusedField(
                    null
                  )
                }
                onSubmitEditing={() =>
                  passwordRef.current?.focus()
                }
              />
            </View>
          </View>

          {/* PASSWORD */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <View
              style={
                styles.passwordLabelRow
              }
            >
              <Text
                style={
                  styles.fieldLabel
                }
              >
                PASSWORD
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                disabled={
                  loading
                }
                onPress={() => {
                  navigation.navigate('ForgotPassword', {
                    email: email.trim().toLowerCase(),
                  });
                }}
              >
                <Text
                  style={
                    styles.forgotPassword
                  }
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.inputContainer,
                focusedField ===
                'password' &&
                styles.inputContainerFocused,
              ]}
            >
              <View
                style={
                  styles.inputIcon
                }
              >
                <Text
                  style={
                    styles.lockIcon
                  }
                >
                  •••
                </Text>
              </View>

              <TextInput
                ref={
                  passwordRef
                }
                style={
                  styles.input
                }
                value={
                  password
                }
                onChangeText={
                  setPassword
                }
                placeholder="Enter your password"
                placeholderTextColor="#A8B2C1"
                secureTextEntry={
                  !showPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                editable={
                  !loading
                }
                returnKeyType="done"
                blurOnSubmit={true}
                onFocus={() =>
                  setFocusedField(
                    'password'
                  )
                }
                onBlur={() =>
                  setFocusedField(
                    null
                  )
                }
                onSubmitEditing={
                  handleLogin
                }
              />

              <TouchableOpacity
                style={
                  styles.passwordToggle
                }
                activeOpacity={0.7}
                disabled={
                  loading
                }
                onPress={() =>
                  setShowPassword(
                    !showPassword
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

          {/* SIGN IN */}

          <TouchableOpacity
            style={[
              styles.signInButton,
              loading &&
              styles.signInButtonLoading,
            ]}
            activeOpacity={0.86}
            disabled={
              loading
            }
            onPress={
              handleLogin
            }
          >
            <View>
              <Text
                style={
                  styles.signInEyebrow
                }
              >
                SECURE ACCESS
              </Text>

              <Text
                style={
                  styles.signInText
                }
              >
                {loading
                  ? 'Signing in...'
                  : `Sign in as ${ROLES.find(
                    (role) =>
                      role.id ===
                      selectedRole
                  )?.title
                  }`}
              </Text>
            </View>

            <View
              style={
                styles.signInArrow
              }
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.signInArrowText
                  }
                >
                  →
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* SECURITY */}

          <View
            style={
              styles.securityRow
            }
          >
            <View
              style={
                styles.securityIcon
              }
            >
              <Text
                style={
                  styles.securityIconText
                }
              >
                ✓
              </Text>
            </View>

            <View
              style={
                styles.securityTextContainer
              }
            >
              <Text
                style={
                  styles.securityTitle
                }
              >
                Secure campus access
              </Text>

              <Text
                style={
                  styles.securitySubtitle
                }
              >
                Your role and permissions
                are verified securely.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* REGISTER */}

        <Animated.View
          style={[
            styles.registerSection,
            {
              opacity: formAnim,
            },
          ]}
        >
          <Text
            style={
              styles.registerText
            }
          >
            New to CampusSetu?
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={
              loading
            }
            onPress={() =>
              navigation.navigate(
                'Register'
              )
            }
          >
            <Text
              style={
                styles.registerLink
              }
            >
              Create an account
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* FOOTER */}

        <Text
          style={
            styles.footer
          }
        >
          BRIDGING STUDENTS AND
          SOLUTIONS
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}