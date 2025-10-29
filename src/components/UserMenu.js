import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export default function UserMenu({ navigation }) {
  const { user, logout } = useAuth();
  const { userProfile, updateUserProfile } = useApp();
  const { theme, isDark, toggleTheme, themeMode, setTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setMenuVisible(false);
            await logout();
          }
        }
      ]
    );
  };

  const handleChangeLanguage = () => {
    setMenuVisible(false);
    // Show language picker
    Alert.alert(
      'Change Target Language',
      'Select your target language',
      [
        { text: 'Spanish', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'Spanish' }) },
        { text: 'French', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'French' }) },
        { text: 'German', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'German' }) },
        { text: 'Italian', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'Italian' }) },
        { text: 'Portuguese', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'Portuguese' }) },
        { text: 'Japanese', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'Japanese' }) },
        { text: 'Korean', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'Korean' }) },
        { text: 'Mandarin', onPress: () => updateUserProfile({ ...userProfile, targetLanguage: 'Mandarin' }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleChangeLearningLevel = () => {
    setMenuVisible(false);
    Alert.alert(
      'Change Learning Level',
      'Select your proficiency level',
      [
        { text: 'A1 - Beginner', onPress: () => updateUserProfile({ ...userProfile, level: 'A1' }) },
        { text: 'A2 - Elementary', onPress: () => updateUserProfile({ ...userProfile, level: 'A2' }) },
        { text: 'B1 - Intermediate', onPress: () => updateUserProfile({ ...userProfile, level: 'B1' }) },
        { text: 'B2 - Upper Intermediate', onPress: () => updateUserProfile({ ...userProfile, level: 'B2' }) },
        { text: 'C1 - Advanced', onPress: () => updateUserProfile({ ...userProfile, level: 'C1' }) },
        { text: 'C2 - Proficient', onPress: () => updateUserProfile({ ...userProfile, level: 'C2' }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleThemeChange = () => {
    Alert.alert(
      'Theme Settings',
      'Choose your preferred theme',
      [
        {
          text: 'Light Mode',
          onPress: () => setTheme('light')
        },
        {
          text: 'Dark Mode',
          onPress: () => setTheme('dark')
        },
        {
          text: 'System Default',
          onPress: () => setTheme('system')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleNotifications = () => {
    setMenuVisible(false);
    Alert.alert(
      'Notifications',
      'Notification preferences',
      [
        { text: 'Enable Daily Reminders', onPress: () => console.log('Enable reminders') },
        { text: 'Disable All Notifications', onPress: () => console.log('Disable notifications') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePrivacy = () => {
    setMenuVisible(false);
    Alert.alert('Privacy Settings', 'Your data is stored locally on this device. No data is shared with third parties.');
  };

  const handleHelp = () => {
    setMenuVisible(false);
    Alert.alert(
      'Help & Support',
      'Need help with SpeakEasy?',
      [
        { text: 'View Tutorial', onPress: () => console.log('Show tutorial') },
        { text: 'FAQ', onPress: () => console.log('Show FAQ') },
        { text: 'Contact Support', onPress: () => console.log('Contact support') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAbout = () => {
    setMenuVisible(false);
    Alert.alert(
      'About SpeakEasy',
      'Version 1.0.0\n\nYour AI-powered language learning companion.\n\n© 2025 SpeakEasy. All rights reserved.'
    );
  };

  const handleViewStorage = () => {
    setMenuVisible(false);
    if (navigation) {
      navigation.navigate('DebugStorage');
    }
  };

  const menuItems = [
    {
      icon: 'language',
      title: 'Change Language',
      subtitle: userProfile?.targetLanguage || 'Select target language',
      onPress: handleChangeLanguage,
      color: '#3B82F6'
    },
    {
      icon: isDark ? 'moon' : 'sunny',
      title: 'Theme',
      subtitle: themeMode === 'system' ? 'System Default' : themeMode === 'dark' ? 'Dark Mode' : 'Light Mode',
      onPress: handleThemeChange,
      color: '#F59E0B'
    },
    {
      icon: 'school',
      title: 'Learning Level',
      subtitle: `Level ${userProfile?.level || 'A1'}`,
      onPress: handleChangeLearningLevel,
      color: '#10B981'
    },
    {
      icon: 'target',
      title: 'Daily Goal',
      subtitle: 'Set your daily target',
      onPress: () => {
        setMenuVisible(false);
        Alert.alert('Daily Goal', 'Feature coming soon!');
      },
      color: '#8B5CF6'
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage reminders',
      onPress: handleNotifications,
      color: '#EF4444'
    },
    {
      icon: 'person',
      title: 'Account Settings',
      subtitle: 'Edit profile & preferences',
      onPress: () => {
        setMenuVisible(false);
        if (navigation) {
          navigation.navigate('Settings');
        }
      },
      color: '#06B6D4'
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy',
      subtitle: 'Data & security settings',
      onPress: handlePrivacy,
      color: '#64748B'
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get assistance',
      onPress: handleHelp,
      color: '#6366F1'
    },
    {
      icon: 'information-circle',
      title: 'About',
      subtitle: 'App info & version',
      onPress: handleAbout,
      color: '#94A3B8'
    },
    {
      icon: 'code-slash',
      title: 'Developer Tools',
      subtitle: 'View AsyncStorage database',
      onPress: handleViewStorage,
      color: '#8B5CF6'
    },
    {
      icon: 'log-out',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: handleLogout,
      color: '#DC2626',
      danger: true
    }
  ];

  const username = user?.name || userProfile?.name || 'User';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.usernameButton}
        activeOpacity={0.7}
      >
        <Text style={[styles.username, { color: theme.primary }]}>
          {username}
        </Text>
        <View style={[styles.underline, { backgroundColor: theme.primary }]} />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <View style={[styles.menuHeader, { borderBottomColor: theme.border }]}>
                <View>
                  <Text style={[styles.menuHeaderTitle, { color: theme.text }]}>
                    {username}
                  </Text>
                  <Text style={[styles.menuHeaderSubtitle, { color: theme.textSecondary }]}>
                    {user?.email || 'user@speakeasy.com'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(false)}
                  style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <Ionicons name="close" size={20} color={theme.text} />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <ScrollView style={styles.menuScroll}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      { borderBottomColor: theme.border },
                      item.danger && styles.menuItemDanger
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={[styles.menuItemIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={item.danger ? '#DC2626' : item.color}
                      />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text
                        style={[
                          styles.menuItemTitle,
                          { color: item.danger ? '#DC2626' : theme.text }
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.menuItemSubtitle, { color: theme.textSecondary }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  usernameButton: {
    alignItems: 'flex-end',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
  underline: {
    height: 1,
    width: '100%',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    width: 340,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  menuHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuHeaderSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScroll: {
    maxHeight: 500,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemDanger: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
});
