import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './WelcomeScreen.styles';

export default function WelcomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isLargePhone = width >= 430;
  const isShortScreen = height < 700;

  const logoAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const visualAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const entrance = Animated.stagger(120, [
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 8,
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
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(ctaAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    entrance.start();
    floating.start();
    pulse.start();

    return () => {
      entrance.stop();
      floating.stop();
      pulse.stop();
    };
  }, [
    logoAnim,
    heroAnim,
    visualAnim,
    ctaAnim,
    floatAnim,
    pulseAnim,
  ]);

  const logoTranslate = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 0],
  });

  const heroTranslate = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const visualTranslate = visualAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0],
  });

  const ctaTranslate = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const floatingUp = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, -5],
  });

  const floatingDown = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  const openLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F8F2"
        translucent={false}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          isSmallPhone && styles.smallContainer,
          isLargePhone && styles.largeContainer,
          isShortScreen && styles.shortContainer,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ATMOSPHERIC BACKGROUND */}
        <View pointerEvents="none" style={styles.backgroundOrb} />
        <View pointerEvents="none" style={styles.backgroundOrbSmall} />

        {/* BRAND HEADER */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: logoAnim,
              transform: [{ translateY: logoTranslate }],
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
              <View style={styles.brandMarkDot} />
            </View>

            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>CampusSetu</Text>
              <Text style={styles.brandTagline}>
                BRIDGING STUDENTS AND SOLUTIONS
              </Text>
            </View>
          </View>

          <View style={styles.headerBadge}>
            <View style={styles.headerBadgeDot} />
            <Text style={styles.headerBadgeText}>MADE FOR CAMPUS</Text>
          </View>
        </Animated.View>

        {/* HERO */}
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: heroAnim,
              transform: [{ translateY: heroTranslate }],
            },
          ]}
        >
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowStar}>
              <Text style={styles.eyebrowStarText}>✳</Text>
            </View>
            <Text style={styles.eyebrowText}>
              A BETTER CAMPUS STARTS HERE
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              isSmallPhone && styles.heroTitleSmall,
              isLargePhone && styles.heroTitleLarge,
            ]}
          >
            Your campus.
            {'\n'}
            Your voice.
            {'\n'}
            <Text style={styles.heroAccent}>Real change.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            One simple place to raise concerns, track complaints,
            and help make campus life better.
          </Text>

          <View style={styles.trustRow}>
            <View style={styles.trustCheck}>
              <Text style={styles.trustCheckText}>✓</Text>
            </View>
            <Text style={styles.trustText}>Simple to use</Text>

            <View style={styles.trustSeparator} />

            <View style={styles.trustCheck}>
              <Text style={styles.trustCheckText}>✓</Text>
            </View>
            <Text style={styles.trustText}>Easy to track</Text>
          </View>
        </Animated.View>

        {/* PRODUCT SHOWCASE */}
        <Animated.View
          style={[
            styles.showcase,
            isShortScreen && styles.showcaseShort,
            {
              opacity: visualAnim,
              transform: [{ translateY: visualTranslate }],
            },
          ]}
        >
          {/* Decorative halo */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />

          {/* Dashboard */}
          <Animated.View
            style={[
              styles.dashboard,
              {
                transform: [{ translateY: floatingUp }],
              },
            ]}
          >
            <View style={styles.dashboardTop}>
              <View style={styles.dashboardBrand}>
                <View style={styles.dashboardMiniMark}>
                  <Text style={styles.dashboardMiniMarkText}>C</Text>
                </View>

                <View>
                  <Text style={styles.dashboardOverline}>
                    YOUR CAMPUS SPACE
                  </Text>
                  <Text style={styles.dashboardHeading}>
                    Let's make things better.
                  </Text>
                </View>
              </View>

              <View style={styles.dashboardMenu}>
                <View style={styles.menuDot} />
                <View style={styles.menuDot} />
                <View style={styles.menuDot} />
              </View>
            </View>

            {/* Featured action */}
            <View style={styles.featuredPanel}>
              <View style={styles.featuredGlow} />

              <View style={styles.featuredTextBlock}>
                <Text style={styles.featuredEyebrow}>
                  YOUR CAMPUS, YOUR SAY
                </Text>
                <Text style={styles.featuredTitle}>
                  Something needs
                  {'\n'}
                  attention?
                </Text>
                <Text style={styles.featuredDescription}>
                  Speak up. We'll help you get it moving.
                </Text>
              </View>

              <View style={styles.featuredIcon}>
                <Text style={styles.featuredIconText}>↗</Text>
              </View>

              <View style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>
                  Report an issue
                </Text>
                <Text style={styles.featuredButtonArrow}>→</Text>
              </View>
            </View>

            {/* Workflow */}
            <View style={styles.workflowHeader}>
              <Text style={styles.workflowTitle}>A clearer way forward</Text>
              <Text style={styles.workflowCaption}>3 simple steps</Text>
            </View>

            <View style={styles.workflowRow}>
              <View style={[styles.workflowIcon, styles.workflowIconGreen]}>
                <Text style={styles.workflowIconText}>01</Text>
              </View>

              <View style={styles.workflowCopy}>
                <Text style={styles.workflowStepTitle}>Raise your concern</Text>
                <Text style={styles.workflowStepDescription}>
                  Share the issue and its location.
                </Text>
              </View>

              <Text style={styles.workflowArrow}>↗</Text>
            </View>

            <View style={styles.workflowLine} />

            <View style={styles.workflowRow}>
              <View style={[styles.workflowIcon, styles.workflowIconBlue]}>
                <Text style={styles.workflowIconText}>02</Text>
              </View>

              <View style={styles.workflowCopy}>
                <Text style={styles.workflowStepTitle}>Follow its progress</Text>
                <Text style={styles.workflowStepDescription}>
                  See status updates in one place.
                </Text>
              </View>

              <Text style={styles.workflowArrow}>↗</Text>
            </View>

            <View style={styles.workflowLine} />

            <View style={styles.workflowRow}>
              <View style={[styles.workflowIcon, styles.workflowIconGold]}>
                <Text style={styles.workflowIconText}>03</Text>
              </View>

              <View style={styles.workflowCopy}>
                <Text style={styles.workflowStepTitle}>Stay in the loop</Text>
                <Text style={styles.workflowStepDescription}>
                  Keep up with complaint updates.
                </Text>
              </View>

              <Text style={styles.workflowArrow}>↗</Text>
            </View>

            <View style={styles.dashboardFooter}>
              <View style={styles.footerSpark}>
                <Text style={styles.footerSparkText}>✳</Text>
              </View>
              <Text style={styles.dashboardFooterText}>
                Small actions. Better campus.
              </Text>
              <View style={styles.footerLine} />
            </View>
          </Animated.View>

          {/* Floating feature cards */}
          <Animated.View
            style={[
              styles.floatCard,
              styles.floatCardTop,
              {
                transform: [{ translateY: floatingDown }],
              },
            ]}
          >
            <View style={styles.floatIconGreen}>
              <Text style={styles.floatIconText}>✓</Text>
            </View>

            <View style={styles.floatCopy}>
              <Text style={styles.floatTitle}>Your voice matters</Text>
              <Text style={styles.floatSubtitle}>Every concern counts</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.floatCard,
              styles.floatCardBottom,
              {
                transform: [{ translateY: floatingUp }],
              },
            ]}
          >
            <View style={styles.floatIconBlue}>
              <Text style={styles.floatIconTextBlue}>↗</Text>
            </View>

            <View style={styles.floatCopy}>
              <Text style={styles.floatTitle}>Progress, made clear</Text>
              <Text style={styles.floatSubtitle}>Follow your reports</Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* CTA */}
        <Animated.View
          style={[
            styles.ctaSection,
            {
              opacity: ctaAnim,
              transform: [{ translateY: ctaTranslate }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={openLogin}
            accessibilityRole="button"
            accessibilityLabel="Get started with CampusSetu"
          >
            <View style={styles.buttonCopy}>
              <Text style={styles.buttonEyebrow}>YOUR CAMPUS JOURNEY</Text>
              <Text style={styles.buttonTitle}>Let's get started</Text>
            </View>

            <View style={styles.buttonArrowCircle}>
              <Text style={styles.buttonArrowText}>→</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.bottomMeta}>
            <View style={styles.bottomMetaLine} />
            <Text style={styles.bottomMetaText}>
              BUILT AROUND YOUR CAMPUS
            </Text>
            <View style={styles.bottomMetaLine} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}