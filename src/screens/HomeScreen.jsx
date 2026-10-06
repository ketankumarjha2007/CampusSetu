import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.badge}>CampusSetu</Text>

        <Text style={styles.title}>
          Welcome to CampusSetu 👋
        </Text>

        <Text style={styles.subtitle}>
          Bridging Students and Solutions.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Login Successful
          </Text>

          <Text style={styles.cardText}>
            You are now authenticated with Firebase.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  badge: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  title: {
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },

  subtitle: {
    color: '#64748B',
    fontSize: 15,
    marginTop: 10,
  },

  card: {
    marginTop: 30,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardTitle: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '800',
  },

  cardText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 7,
    lineHeight: 19,
  },
});