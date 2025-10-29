import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Switch
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationService from '../services/notifications';
import AnalyticsService from '../services/analytics';
import StorageService from '../utils/storage';

export default function SettingsScreen() {
  const { userProfile, llmConfig, setLLMConfig, testLLMConnection, llmConnected } = useApp();
  const { user, logout } = useAuth();
  const { theme, themeMode, setTheme, isDark } = useTheme();
  const [baseURL, setBaseURL] = useState('http://localhost:11434');
  const [model, setModel] = useState('llama2');
  const [isTesting, setIsTesting] = useState(false);

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (llmConfig) {
      setBaseURL(llmConfig.baseURL || 'http://localhost:11434');
      setModel(llmConfig.model || 'llama2');
    }
  }, [llmConfig]);

  // Load notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const prefs = await StorageService.getReminderPreferences();
        setNotificationsEnabled(prefs.enabled || false);
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    };
    loadNotificationPreferences();
  }, []);

  // Load analytics when showing analytics section
  useEffect(() => {
    const loadAnalytics = async () => {
      if (showAnalytics) {
        try {
          const summary = await AnalyticsService.getAnalyticsSummary();
          const best = await AnalyticsService.getBestMessages(3);
          setAnalyticsData({ summary, bestMessages: best });
        } catch (error) {
          console.error('Error loading analytics:', error);
        }
      }
    };
    loadAnalytics();
  }, [showAnalytics]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await testLLMConnection();
      if (result.success) {
        Alert.alert(
          'Connection Successful! ✅',
          `Connected to Ollama. Available models:\n${result.models.map(m => '• ' + m.name).join('\n') || '• ' + model}`
        );
      } else {
        Alert.alert(
          'Connection Failed ❌',
          result.error || 'Make sure Ollama is running:\n\n1. Open Terminal\n2. Run: ollama serve\n3. Try again'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!baseURL.trim() || !model.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    await setLLMConfig({ baseURL, model });
    Alert.alert('Success! ✅', 'Configuration saved');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleToggleNotifications = async (value) => {
    try {
      setNotificationsEnabled(value);

      if (value) {
        // Enable notifications
        const hasPermissions = await NotificationService.requestPermissions();
        if (!hasPermissions) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive daily reminders.'
          );
          setNotificationsEnabled(false);
          return;
        }

        await NotificationService.scheduleDailyReminders();
        Alert.alert(
          'Notifications Enabled ✅',
          'You will receive daily reminders at noon (12:00 PM) and 6:00 PM to practice your language skills!'
        );
      } else {
        // Disable notifications
        await NotificationService.cancelReminders();
        Alert.alert(
          'Notifications Disabled',
          'Daily reminders have been turned off.'
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
      setNotificationsEnabled(!value);
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const hasPermissions = await NotificationService.requestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings first.'
        );
        setIsSendingTest(false);
        return;
      }

      await NotificationService.sendTestNotification();
      Alert.alert(
        'Test Sent! 🔔',
        'Check your notifications - you should receive a test reminder shortly.'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleViewAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Settings ⚙️</Text>
      </View>

      {/* Account Section */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Name:</Text>
              <Text style={styles.profileValue}>{user.name}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Email:</Text>
              <Text style={styles.profileValue}>{user.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* User Profile Section */}
      {userProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Learning:</Text>
              <Text style={styles.profileValue}>{userProfile.targetLanguage}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Level:</Text>
              <Text style={styles.profileValue}>{userProfile.level}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Interests:</Text>
              <Text style={styles.profileValue}>
                {userProfile.interests.slice(0, 3).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* LLM Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LLM Configuration</Text>
        
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Connection Status:</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: llmConnected ? '#34C759' : '#FF3B30' }
              ]}
            />
            <Text style={styles.statusText}>
              {llmConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>

        {/* API URL Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>API URL</Text>
          <TextInput
            style={styles.input}
            placeholder="http://localhost:11434"
            value={baseURL}
            onChangeText={setBaseURL}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHint}>
            Default Ollama endpoint (make sure Ollama is running)
          </Text>
        </View>

        {/* Model Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Model Name</Text>
          <TextInput
            style={styles.input}
            placeholder="llama2"
            value={model}
            onChangeText={setModel}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHint}>
            Model to use (e.g., llama2, mistral, llama3)
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.testButtonText}>Test Connection</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveConfig}
          >
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Setup Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Setup Instructions</Text>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionTitle}>1. Install Ollama</Text>
          <Text style={styles.instructionText}>
            Download from: https://ollama.ai
          </Text>

          <Text style={styles.instructionTitle}>2. Start Ollama Server</Text>
          <Text style={styles.instructionText}>
            Open Terminal and run:{'\n'}
            <Text style={styles.codeText}>ollama serve</Text>
          </Text>

          <Text style={styles.instructionTitle}>3. Download a Model</Text>
          <Text style={styles.instructionText}>
            In another Terminal window:{'\n'}
            <Text style={styles.codeText}>ollama pull llama2</Text>{'\n'}
            or{'\n'}
            <Text style={styles.codeText}>ollama pull mistral</Text>
          </Text>

          <Text style={styles.instructionTitle}>4. Test & Save</Text>
          <Text style={styles.instructionText}>
            Click "Test Connection" above, then "Save Configuration"
          </Text>
        </View>
      </View>

      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => setTheme('light')}
          >
            <View style={styles.themeRow}>
              <Text style={[styles.themeLabel, { color: theme.text }]}>☀️ Light Mode</Text>
              {themeMode === 'light' && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => setTheme('dark')}
          >
            <View style={styles.themeRow}>
              <Text style={[styles.themeLabel, { color: theme.text }]}>🌙 Dark Mode</Text>
              {themeMode === 'dark' && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => setTheme('system')}
          >
            <View style={styles.themeRow}>
              <Text style={[styles.themeLabel, { color: theme.text }]}>⚙️ System Default</Text>
              {themeMode === 'system' && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications 🔔</Text>

        {/* Enable/Disable Toggle */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.notificationRow}>
            <View style={styles.notificationTextContainer}>
              <Text style={[styles.notificationTitle, { color: theme.text }]}>
                Daily Reminders
              </Text>
              <Text style={[styles.notificationSubtitle, { color: theme.textSecondary }]}>
                Receive reminders at 12:00 PM and 6:00 PM
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor={Platform.OS === 'ios' ? '#FFF' : notificationsEnabled ? '#34C759' : '#F4F3F4'}
            />
          </View>
        </View>

        {/* Test Notification Button */}
        {notificationsEnabled && (
          <TouchableOpacity
            style={styles.testNotificationButton}
            onPress={handleSendTestNotification}
            disabled={isSendingTest}
          >
            {isSendingTest ? (
              <ActivityIndicator color="#007AFF" />
            ) : (
              <Text style={styles.testNotificationButtonText}>
                Send Test Notification
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Analytics Toggle */}
        {notificationsEnabled && (
          <TouchableOpacity
            style={styles.analyticsToggle}
            onPress={handleViewAnalytics}
          >
            <Text style={styles.analyticsToggleText}>
              {showAnalytics ? '📊 Hide Analytics' : '📊 View Analytics'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Analytics Display */}
        {showAnalytics && analyticsData && (
          <View style={[styles.analyticsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.analyticsTitle, { color: theme.text }]}>
              Engagement Statistics
            </Text>

            {/* Summary Stats */}
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {analyticsData.summary.totalSent}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Sent
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {analyticsData.summary.totalOpened}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Opened
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#34C759' }]}>
                  {analyticsData.summary.engagementRate}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Engagement
                </Text>
              </View>
            </View>

            {/* Best Performing Messages */}
            {analyticsData.bestMessages.length > 0 && (
              <View style={styles.bestMessagesContainer}>
                <Text style={[styles.bestMessagesTitle, { color: theme.text }]}>
                  Top Performing Messages
                </Text>
                {analyticsData.bestMessages.map((msg, index) => (
                  <View key={index} style={styles.messageItem}>
                    <Text style={[styles.messageTitle, { color: theme.text }]}>
                      {index + 1}. {msg.title}
                    </Text>
                    <Text style={[styles.messageStats, { color: theme.textSecondary }]}>
                      {msg.engagementRate.toFixed(1)}% engagement ({msg.sent} sent, {msg.opened} opened)
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Best Time */}
            <View style={styles.bestTimeContainer}>
              <Text style={[styles.bestTimeLabel, { color: theme.textSecondary }]}>
                Best Time:
              </Text>
              <Text style={[styles.bestTimeValue, { color: theme.text }]}>
                {analyticsData.summary.bestTime === 'noon' ? ' 12:00 PM' : ' 6:00 PM'}
              </Text>
            </View>
          </View>
        )}

        {showAnalytics && !analyticsData && (
          <View style={[styles.analyticsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
              No analytics data available yet. Keep notifications enabled to gather engagement insights!
            </Text>
          </View>
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About FluentAI</Text>
        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
          FluentAI is your adaptive language learning companion. Learn naturally through immersive content, intelligent scaffolding, and AI-powered conversations.
        </Text>
        <Text style={[styles.versionText, { color: theme.textSecondary }]}>Version 1.0.0</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  content: {
    paddingBottom: 20
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000'
  },
  section: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15
  },
  profileCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  profileRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
    width: 80
  },
  profileValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#000'
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  statusLabel: {
    fontSize: 16,
    color: '#666'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000'
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#000'
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6
  },
  buttonGroup: {
    gap: 10
  },
  testButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center'
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center'
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF'
  },
  instructionsCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 15,
    marginBottom: 8
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#F0F0F0',
    padding: 4,
    borderRadius: 4,
    fontSize: 13
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10
  },
  versionText: {
    fontSize: 12,
    color: '#999'
  },
  logoutButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF3B30',
    alignItems: 'center'
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30'
  },
  themeOption: {
    paddingVertical: 12
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500'
  },
  checkmark: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  divider: {
    height: 1,
    marginVertical: 4
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  notificationTextContainer: {
    flex: 1,
    marginRight: 12
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  notificationSubtitle: {
    fontSize: 13,
    color: '#999'
  },
  testNotificationButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center'
  },
  testNotificationButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF'
  },
  analyticsToggle: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#34C759',
    alignItems: 'center'
  },
  analyticsToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#34C759'
  },
  analyticsCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase'
  },
  bestMessagesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  bestMessagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12
  },
  messageItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  messageStats: {
    fontSize: 12,
    color: '#999'
  },
  bestTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  bestTimeLabel: {
    fontSize: 14,
    color: '#999'
  },
  bestTimeValue: {
    fontSize: 16,
    fontWeight: '600'
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20
  }
});
