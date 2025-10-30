import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import CurriculumScreen from './CurriculumScreen';
import LessonsScreen from './LessonsScreen';

export default function LearnNavigatorScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Stories', icon: 'book' },
    { id: 'curriculum', label: 'Curriculum', icon: 'school' },
    { id: 'custom', label: 'Custom', icon: 'create' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'curriculum':
        return <CurriculumScreen />;
      case 'custom':
        return <LessonsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Tab Bar */}
      <SafeAreaView style={[styles.tabBarContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? '#007AFF' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? '#007AFF' : theme.textSecondary }
                ]}
              >
                {tab.label}
              </Text>
              {activeTab === tab.id && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  tabBarContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: 50
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
    gap: 6
  },
  activeTab: {
    // Active state handled by color changes
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#007AFF',
    borderRadius: 1
  },
  content: {
    flex: 1
  }
});
