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
  Platform
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { userProfile, llmConfig, setLLMConfig, testLLMConnection, llmConnected } = useApp();
  const { user, logout } = useAuth();
  const { theme, themeMode, setTheme, isDark } = useTheme();
  const [baseURL, setBaseURL] = useState('http://localhost:11434');
  const [model, setModel] = useState('llama2');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (llmConfig) {
      setBaseURL(llmConfig.baseURL || 'http://localhost:11434');
      setModel(llmConfig.model || 'llama2');
    }
  }, [llmConfig]);

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
  }
});
