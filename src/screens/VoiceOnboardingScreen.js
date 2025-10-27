import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useApp } from '../contexts/AppContext';
import IntelligentLLMService from '../services/intelligentLLM';
import StorageService from '../utils/storage';
import VoiceButton from '../components/VoiceButton';
import WaveformVisualizer from '../components/WaveformVisualizer';
import Card from '../components/Card';
import { colors, typography, spacing, borderRadius } from '../theme';

/**
 * Voice-First Onboarding Screen
 * Beautiful, production-ready onboarding with AI conversation
 */
export default function VoiceOnboardingScreen({ navigation }) {
  const { setUserProfile } = useApp();

  // Onboarding stages
  const [stage, setStage] = useState('welcome'); // 'welcome' | 'basic_info' | 'voice_conversation' | 'processing'

  // Basic info (text input)
  const [name, setName] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  // Voice conversation state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [autoMode, setAutoMode] = useState(true); // Auto-listen after AI speaks

  // Collected data from conversation
  const [collectedData, setCollectedData] = useState({
    interests: [],
    goals: [],
    level: null,
  });

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [stage]);

  /**
   * Start voice conversation
   */
  const startVoiceConversation = async () => {
    setStage('voice_conversation');

    const greeting = `Hi ${name}! I'm excited to help you learn ${targetLanguage}. Let's have a quick chat so I can understand what you're interested in and create the perfect learning plan for you. What do you enjoy doing in your free time?`;

    addMessage('assistant', greeting);
    await speakText(greeting);

    // Auto-start listening after greeting
    if (autoMode) {
      setTimeout(() => {
        handleVoiceInput();
      }, 500);
    }
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = async () => {
    setIsListening(true);

    // TODO: Integrate Expo Speech Recognition
    // For now, using a mock implementation
    // In production, replace with actual speech recognition

    // Mock speech recognition - replace with actual implementation
    setTimeout(() => {
      const mockResponse = "I enjoy reading books and watching movies";
      setCurrentTranscript(mockResponse);
      setIsListening(false);
      processUserResponse(mockResponse);
    }, 3000);
  };

  /**
   * Process user's voice response
   */
  const processUserResponse = async (transcript) => {
    addMessage('user', transcript);
    setIsProcessing(true);

    try {
      // Get AI response based on current conversation stage
      const response = await IntelligentLLMService.onboardingConversation(
        transcript,
        determineConversationStage()
      );

      setIsProcessing(false);
      addMessage('assistant', response);
      await speakText(response);

      // Check if we should finalize
      if (conversationMessages.length >= 6) {
        await finalizeProfile();
      } else if (autoMode) {
        // Auto-continue conversation
        setTimeout(() => {
          handleVoiceInput();
        }, 500);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process response. Please try again.');
    }
  };

  /**
   * Determine current conversation stage
   */
  const determineConversationStage = () => {
    if (conversationMessages.length < 2) return 'discover_interests';
    if (conversationMessages.length < 4) return 'assess_level';
    return 'finalize_profile';
  };

  /**
   * Finalize user profile
   */
  const finalizeProfile = async () => {
    setStage('processing');

    try {
      // Use AI to analyze conversation and create profile
      const conversationText = conversationMessages
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n');

      const profileJSON = await IntelligentLLMService.onboardingConversation(
        conversationText,
        'finalize_profile'
      );

      const parsedProfile = JSON.parse(profileJSON);

      const profile = {
        name,
        nativeLanguage,
        targetLanguage,
        ...parsedProfile,
        createdAt: new Date().toISOString(),
      };

      await setUserProfile(profile);
      await StorageService.setOnboardingComplete(true);

      // Navigate to main app
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
      setStage('voice_conversation');
    }
  };

  /**
   * Text-to-speech
   */
  const speakText = async (text) => {
    setIsSpeaking(true);

    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'en-US',
        voice: getPreferredVoice('English'),
        pitch: 1.05,
        rate: 0.92,
        onDone: () => {
          setIsSpeaking(false);
          resolve();
        },
        onError: () => {
          setIsSpeaking(false);
          resolve();
        },
      });
    });
  };

  const getPreferredVoice = () => {
    try {
      const preferredNames = [
        'Google US English',
        'Google UK English Female',
        'com.apple.ttsbundle.Samantha-compact',
      ];
      if (Speech.getAvailableVoicesAsync) {
        Speech.getAvailableVoicesAsync().then((voices) => {
          const named = voices?.find((v) => preferredNames.includes(v.name));
          return named?.identifier;
        }).catch(() => undefined);
      }
    } catch (_) {}
    return undefined;
  };

  /**
   * Add message to conversation
   */
  const addMessage = (role, content) => {
    setConversationMessages((prev) => [
      ...prev,
      { role, content, timestamp: new Date().toISOString() },
    ]);
  };

  /**
   * Render welcome screen
   */
  const renderWelcome = () => (
    <Animated.View
      style={[
        styles.stageContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.emoji}>🎤</Text>
      <Text style={styles.title}>Welcome to SpeakEasy</Text>
      <Text style={styles.subtitle}>
        Your AI-powered language tutor that learns with you
      </Text>

      <Card style={styles.featureCard}>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>✨</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Voice-First Learning</Text>
            <Text style={styles.featureDescription}>
              Practice speaking naturally, just like a real conversation
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.featureCard}>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>🎯</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Personalized Lessons</Text>
            <Text style={styles.featureDescription}>
              Content tailored to your interests and level
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.featureCard}>
        <View style={styles.featureRow}>
          <Text style={styles.featureEmoji}>🧠</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Adaptive AI Tutor</Text>
            <Text style={styles.featureDescription}>
              Learns your strengths and adjusts automatically
            </Text>
          </View>
        </View>
      </Card>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStage('basic_info')}
      >
        <Text style={styles.primaryButtonText}>Let's Get Started 🚀</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render basic info collection
   */
  const renderBasicInfo = () => (
    <Animated.View
      style={[
        styles.stageContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.title}>Let's start with the basics</Text>
      <Text style={styles.subtitle}>We'll keep it quick!</Text>

      <Card padding="lg" style={styles.formCard}>
        <Text style={styles.inputLabel}>What's your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Text style={styles.inputLabel}>What's your native language?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., English, 中文, Español"
          value={nativeLanguage}
          onChangeText={setNativeLanguage}
        />

        <Text style={styles.inputLabel}>Which language do you want to learn?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageScroll}>
          {['Spanish', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Mandarin'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageChip,
                targetLanguage === lang && styles.languageChipSelected,
              ]}
              onPress={() => setTargetLanguage(lang)}
            >
              <Text
                style={[
                  styles.languageChipText,
                  targetLanguage === lang && styles.languageChipTextSelected,
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!name || !nativeLanguage || !targetLanguage) && styles.primaryButtonDisabled,
        ]}
        onPress={startVoiceConversation}
        disabled={!name || !nativeLanguage || !targetLanguage}
      >
        <Text style={styles.primaryButtonText}>Continue 🎙️</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render voice conversation
   */
  const renderVoiceConversation = () => (
    <Animated.View
      style={[
        styles.stageContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Let's chat!</Text>
          <Text style={styles.subtitle}>
            {autoMode ? '🎤 Auto mode - Just speak naturally' : 'Tap the mic when ready'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.autoModeToggle}
          onPress={() => setAutoMode(!autoMode)}
        >
          <Text style={styles.autoModeText}>
            {autoMode ? '🔁 Auto' : '👆 Manual'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Waveform Visualizer */}
      <WaveformVisualizer
        isActive={isListening || isSpeaking}
        color={isListening ? colors.voice.listening : colors.voice.speaking}
      />

      {/* Conversation Messages */}
      <ScrollView style={styles.messagesContainer}>
        {conversationMessages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageCard,
              msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.content}</Text>
          </View>
        ))}

        {isProcessing && (
          <View style={[styles.messageCard, styles.assistantMessage]}>
            <Text style={styles.messageText}>🤔 Thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Voice Button - Only show in manual mode or when not auto-listening */}
      {!autoMode && (
        <View style={styles.voiceButtonContainer}>
          <VoiceButton
            isListening={isListening}
            isSpeaking={isSpeaking}
            isProcessing={isProcessing}
            onPress={handleVoiceInput}
            size="large"
          />
        </View>
      )}

      {autoMode && (
        <View style={styles.autoModeIndicator}>
          <Text style={styles.autoModeIndicatorText}>
            {isListening && '🎤 Listening...'}
            {isSpeaking && '🔊 Speaking...'}
            {isProcessing && '🤔 Thinking...'}
            {!isListening && !isSpeaking && !isProcessing && '⏸️ Waiting...'}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  /**
   * Render processing screen
   */
  const renderProcessing = () => (
    <View style={styles.stageContainer}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.title}>Creating your personalized learning plan...</Text>
      <WaveformVisualizer isActive={true} color={colors.primary.main} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {stage === 'welcome' && renderWelcome()}
      {stage === 'basic_info' && renderBasicInfo()}
      {stage === 'voice_conversation' && renderVoiceConversation()}
      {stage === 'processing' && renderProcessing()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  stageContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  autoModeToggle: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  autoModeText: {
    color: colors.primary.contrast,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  autoModeIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  autoModeIndicatorText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  featureCard: {
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    color: colors.text.primary,
  },
  languageScroll: {
    marginTop: spacing.sm,
  },
  languageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  languageChipSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  languageChipText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  languageChipTextSelected: {
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.semibold,
  },
  messagesContainer: {
    flex: 1,
    marginVertical: spacing.lg,
  },
  messageCard: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.main,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral[100],
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: 'auto',
  },
  primaryButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.contrast,
  },
});
