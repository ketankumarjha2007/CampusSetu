import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';

import styles from './WelcomeScreen.styles';

export default function WelcomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isMediumPhone = width >= 360 && width < 430;
  const isLargePhone = width >= 430;
  const isShortScreen = height < 700;
  const isVeryShortScreen = height < 630;

  // ---------------------------------------------------------
  // ANIMATION VALUES
  // ---------------------------------------------------------

  const logoAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const visualAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ---------------------------------------------------------
  // ENTRANCE + CONTINUOUS ANIMATIONS
  // ---------------------------------------------------------

  useEffect(() => {
    const entranceAnimation = Animated.stagger(140, [
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),

      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(visualAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start();

    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),

        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    floatingAnimation.start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      entranceAnimation.stop();
      floatingAnimation.stop();
      pulseAnimation.stop();
    };
  }, [
    logoAnim,
    heroAnim,
    visualAnim,
    ctaAnim,
    floatAnim,
    pulseAnim,
  ]);

  // ---------------------------------------------------------
  // ENTRANCE TRANSFORMS
  // ---------------------------------------------------------

  const logoTranslate = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 0],
  });

  const heroTranslate = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const visualTranslate = visualAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const ctaTranslate = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  // ---------------------------------------------------------
  // FLOATING ANIMATIONS
  // ---------------------------------------------------------

  const floatingTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  const floatingTranslateReverse = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, -6],
  });

  // ---------------------------------------------------------
  // RESPONSIVE VALUES
  // ---------------------------------------------------------

  const visualWidth = isSmallPhone
    ? '96%'
    : isMediumPhone
      ? '94%'
      : isLargePhone
        ? '88%'
        : '94%';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,

          isSmallPhone && styles.smallPhoneContainer,
          isMediumPhone && styles.mediumPhoneContainer,
          isLargePhone && styles.largePhoneContainer,

          isShortScreen && styles.shortScreenContainer,
          isVeryShortScreen && styles.veryShortScreenContainer,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
      >
        {/* =================================================
            BACKGROUND
        ================================================= */}

        <View
          pointerEvents="none"
          style={styles.backgroundGlowTop}
        />

        <View
          pointerEvents="none"
          style={styles.backgroundGlowBottom}
        />

        {/* =================================================
            HEADER
        ================================================= */}

        <Animated.View
          style={[
            styles.header,
            {
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoTranslate,
                },
              ],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>
                C
              </Text>
            </View>

            <View style={styles.brandTextContainer}>
              <Text style={styles.brandName}>
                CampusSetu
              </Text>

              <Text style={styles.brandCaption}>
                CAMPUS OPERATING SYSTEM
              </Text>
            </View>
          </View>

          <View style={styles.liveBadge}>
            <Animated.View
              style={[
                styles.liveIndicator,
                {
                  transform: [
                    {
                      scale: pulseAnim,
                    },
                  ],
                },
              ]}
            />

            <Text style={styles.liveText}>
              LIVE
            </Text>
          </View>
        </Animated.View>

        {/* =================================================
            HERO
        ================================================= */}

        <Animated.View
          style={[
            styles.hero,
            isVeryShortScreen && styles.shortHero,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroTranslate,
                },
              ],
            },
          ]}
        >
          <View style={styles.heroEyebrowRow}>
            <View style={styles.heroEyebrowLine} />

            <Text style={styles.heroEyebrow}>
              THE CAMPUS STARTS WITH YOU
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,

              isSmallPhone && styles.smallHeroTitle,
              isMediumPhone && styles.mediumHeroTitle,
              isLargePhone && styles.largeHeroTitle,
            ]}
          >
            Make your campus
            {'\n'}
            <Text style={styles.heroAccent}>
              better.
            </Text>
          </Text>

          <Text
            style={[
              styles.heroDescription,
              isSmallPhone && styles.smallHeroDescription,
            ]}
          >
            Report issues. Follow progress. Create change.
            Everything your campus needs, connected in one place.
          </Text>
        </Animated.View>

        {/* =================================================
            PRODUCT VISUAL
        ================================================= */}

        <Animated.View
          style={[
            styles.visualSection,

            isShortScreen &&
              styles.shortVisualSection,

            isVeryShortScreen &&
              styles.veryShortVisualSection,

            {
              opacity: visualAnim,
              transform: [
                {
                  translateY: visualTranslate,
                },
              ],
            },
          ]}
        >
          {/* Ambient glow */}

          <Animated.View
            style={[
              styles.visualGlow,
              {
                transform: [
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.3],
                      outputRange: [1, 1.08],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Main dashboard */}

          <Animated.View
            style={[
              styles.mainVisual,
              {
                width: visualWidth,

                transform: [
                  {
                    translateY: floatingTranslate,
                  },
                ],
              },
            ]}
          >
            {/* Dashboard header */}

            <View style={styles.visualHeader}>
              <View>
                <Text style={styles.visualLabel}>
                  CAMPUS PULSE
                </Text>

                <Text style={styles.visualTitle}>
                  Everything connected.
                </Text>
              </View>

              <View style={styles.pulseIcon}>
                <View style={styles.pulseRing} />
                <View style={styles.pulseDot} />
              </View>
            </View>

            {/* Main metric */}

            <View style={styles.metricSection}>
              <View>
                <Text style={styles.metricNumber}>
                  1,284
                </Text>

                <Text style={styles.metricLabel}>
                  STUDENTS CONNECTED
                </Text>
              </View>

              <View style={styles.metricChange}>
                <View style={styles.changePill}>
                  <Text style={styles.metricChangeText}>
                    +18.4%
                  </Text>
                </View>

                <Text style={styles.metricChangeLabel}>
                  THIS MONTH
                </Text>
              </View>
            </View>

            {/* Activity graph */}

            <View style={styles.activityGraph}>
              <View
                style={[
                  styles.graphBar,
                  styles.graphBarOne,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarTwo,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarThree,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarFour,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarFive,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarSix,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarSeven,
                ]}
              />

              <View
                style={[
                  styles.graphBar,
                  styles.graphBarEight,
                ]}
              />
            </View>

            {/* Bottom statistics */}

            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <View style={styles.miniIconBlue}>
                  <Text style={styles.miniIconText}>
                    ✓
                  </Text>
                </View>

                <View style={styles.miniStatText}>
                  <Text style={styles.miniNumber}>
                    96%
                  </Text>

                  <Text style={styles.miniLabel}>
                    RESOLVED
                  </Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.miniStat}>
                <View style={styles.miniIconGreen}>
                  <Text style={styles.miniIconText}>
                    +
                  </Text>
                </View>

                <View style={styles.miniStatText}>
                  <Text style={styles.miniNumber}>
                    24
                  </Text>

                  <Text style={styles.miniLabel}>
                    ACTIVE ISSUES
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* =================================================
              FLOATING CARD - TOP
          ================================================= */}

          <Animated.View
            style={[
              styles.floatingStatus,
              styles.floatingStatusTop,
              {
                transform: [
                  {
                    translateY: floatingTranslate,
                  },
                ],
              },
            ]}
          >
            <View style={styles.statusIconBlue}>
              <Text style={styles.statusIconText}>
                ✓
              </Text>
            </View>

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                Issue resolved
              </Text>

              <Text style={styles.statusSubtitle}>
                Block A • 2m ago
              </Text>
            </View>
          </Animated.View>

          {/* =================================================
              FLOATING CARD - BOTTOM
          ================================================= */}

          <Animated.View
            style={[
              styles.floatingStatus,
              styles.floatingStatusBottom,
              {
                transform: [
                  {
                    translateY:
                      floatingTranslateReverse,
                  },
                ],
              },
            ]}
          >
            <View style={styles.statusIconGreen}>
              <Text style={styles.statusIconText}>
                ●
              </Text>
            </View>

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                Campus active
              </Text>

              <Text style={styles.statusSubtitle}>
                247 students online
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* =================================================
            CTA
        ================================================= */}

        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: ctaAnim,
              transform: [
                {
                  translateY: ctaTranslate,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('Login')}
          >
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonEyebrow}>
                GET STARTED
              </Text>

              <Text style={styles.buttonTitle}>
                Enter CampusSetu
              </Text>
            </View>

            <View style={styles.buttonArrow}>
              <Text style={styles.buttonArrowText}>
                →
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.bottomCaption}>
            BRIDGING STUDENTS AND SOLUTIONS
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}