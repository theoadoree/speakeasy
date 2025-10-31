import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function MoreScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const menuItems = [
    {
      id: 'progress',
      title: 'Progress Dashboard',
      subtitle: 'Track your fluency journey',
      icon: 'stats-chart',
      screen: 'ProgressDashboard',
      color: '#007AFF'
    },
    {
      id: 'immersion',
      title: 'Immersion Hub',
      subtitle: 'Real content in your target language',
      icon: 'globe',
      screen: 'Immersion',
      color: '#34C759'
    },
    {
      id: 'fluency',
      title: 'Fluency Analyzer',
      subtitle: 'Measure your speaking skills',
      icon: 'mic',
      screen: 'FluencyAnalyzer',
      color: '#FF3B30'
    },
    {
      id: 'cultural',
      title: 'Cultural Context',
      subtitle: 'Learn idioms, customs & etiquette',
      icon: 'people',
      screen: 'CulturalContext',
      color: '#FF9500'
    },
    {
      id: 'writing',
      title: 'Writing Workshop',
      subtitle: 'Improve your writing with AI feedback',
      icon: 'create',
      screen: 'WritingWorkshop',
      color: '#5856D6'
    },
    {
      id: 'review',
      title: 'Vocabulary Review',
      subtitle: 'Spaced repetition practice',
      icon: 'refresh-circle',
      screen: 'Review',
      color: '#FF2D55'
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and configuration',
      icon: 'settings',
      screen: 'Settings',
      color: '#8E8E93'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>More</Text>
        </View>

        {/* User Info */}
        {user && (
          <View style={styles.userSection}>
            <View style={[styles.userCard, { backgroundColor: theme.card }]}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { backgroundColor: theme.card },
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={[styles.appName, { color: theme.text }]}>SpeakEasy</Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
            Your AI Language Learning Companion
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  scrollView: {
    flex: 1
  },
  content: {
    paddingBottom: 40
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000'
  },
  userSection: {
    padding: 20,
    paddingTop: 24
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  avatarContainer: {
    marginRight: 16
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4
  },
  userEmail: {
    fontSize: 14,
    color: '#666'
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 8
  },
  menuItem: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  lastMenuItem: {
    marginBottom: 0
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  menuTextContainer: {
    flex: 1
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18
  },
  appInfoSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4
  },
  appVersion: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8
  },
  appTagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  }
});
