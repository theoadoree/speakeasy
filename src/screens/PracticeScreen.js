import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Alert,
  Switch,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useApp } from '../contexts/AppContext';
import IntelligentLLMService from '../services/intelligentLLM';
import StorageService from '../utils/storage';
import VoiceButton from '../components/VoiceButton';
import WaveformVisualizer from '../components/WaveformVisualizer';
import Card from '../components/Card';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

/**
 * Voice-First Conversation Practice Screen
 * Professional production-ready practice interface with AI tutor
 */
export default function PracticeScreen() {
  const { userProfile } = useApp();
  const scrollViewRef = useRef(null);

  // Voice interaction state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');

  // UI preferences
  const [voiceMode, setVoiceMode] = useState(true);
  const [autoMode, setAutoMode] = useState(true); // Auto-listen after AI speaks
  const [showTextInput, setShowTextInput] = useState(false);
  const [inputText, setInputText] = useState('');

  // Lesson context
  const [currentLesson, setCurrentLesson] = useState(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializePractice();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * Initialize practice session
   */
  const initializePractice = async () => {
    // Load conversation history
    const history = await StorageService.getConversationHistory();
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      // Generate personalized welcome message
      const welcomeMessage = getWelcomeMessage();
      const initialMessages = [{ role: 'assistant', content: welcomeMessage, timestamp: new Date().toISOString() }];
      setMessages(initialMessages);

      if (voiceMode) {
        await speakText(welcomeMessage);

        // Auto-start listening in auto mode
        if (autoMode) {
          setTimeout(() => {
            handleVoiceInput();
          }, 500);
        }
      }
    }

    // Generate lesson if profile exists
    if (userProfile && !currentLesson) {
      try {
        const lesson = await IntelligentLLMService.generateLesson(
          userProfile,
          userProfile.targetLanguage
        );
        setCurrentLesson(lesson);
      } catch (error) {
        console.error('Failed to generate lesson:', error);
      }
    }
  };

  /**
   * Get personalized welcome message
   */
  const getWelcomeMessage = () => {
    const targetLang = userProfile?.targetLanguage || 'your target language';
    const name = userProfile?.name || 'there';
    const interests = userProfile?.interests?.[0] || 'topics you enjoy';

    return `Hi ${name}! Ready to practice ${targetLang}? I'm here to help you improve naturally. We can talk about ${interests} or anything else you'd like. Just tap the button and start speaking!`;
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
      const mockTranscript = "I want to practice ordering food at a restaurant";
      setCurrentTranscript(mockTranscript);
      setIsListening(false);
      processUserInput(mockTranscript, 'voice');
    }, 3000);
  };

  /**
   * Handle text input
   */
  const handleTextInput = () => {
    if (!inputText.trim()) return;

    const transcript = inputText.trim();
    setInputText('');
    setShowTextInput(false);
    processUserInput(transcript, 'text');
  };

  /**
   * Process user input (voice or text)
   */
  const processUserInput = async (transcript, inputType = 'voice') => {
    const userMessage = {
      role: 'user',
      content: transcript,
      timestamp: new Date().toISOString(),
      inputType,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveConversationHistory(updatedMessages);

    setIsProcessing(true);

    try {
      // Use intelligent LLM service for voice practice
      const lessonContext = currentLesson ? JSON.stringify(currentLesson) : '';
      const response = await IntelligentLLMService.voicePractice(
        transcript,
        lessonContext
      );

      setIsProcessing(false);

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await saveConversationHistory(finalMessages);

      // Speak response if in voice mode
      if (voiceMode) {
        await speakText(response);

        // Auto-continue conversation in auto mode
        if (autoMode && !showTextInput) {
          setTimeout(() => {
            handleVoiceInput();
          }, 500);
        }
      }

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to get response. Please try again.');
      console.error('Practice error:', error);
    }
  };

  /**
   * Text-to-speech
   */
  const speakText = async (text) => {
    setIsSpeaking(true);

    return new Promise((resolve) => {
      Speech.speak(text, {
        language: getLanguageCode(userProfile?.targetLanguage),
        pitch: 1.0,
        rate: 0.85,
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

  /**
   * Get language code for speech
   */
  const getLanguageCode = (language) => {
    const languageCodes = {
      Spanish: 'es-ES',
      French: 'fr-FR',
      German: 'de-DE',
      Italian: 'it-IT',
      Japanese: 'ja-JP',
      Korean: 'ko-KR',
      Mandarin: 'zh-CN',
      Portuguese: 'pt-PT',
      Russian: 'ru-RU',
      Arabic: 'ar-SA',
    };
    return languageCodes[language] || 'en-US';
  };

  /**
   * Save conversation history
   */
  const saveConversationHistory = async (newMessages) => {
    try {
      await StorageService.saveConversationHistory(newMessages);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  /**
   * Clear conversation history
   */
  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages and start fresh?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearConversationHistory();
            const welcomeMessage = getWelcomeMessage();
            const newMessages = [{
              role: 'assistant',
              content: welcomeMessage,
              timestamp: new Date().toISOString()
            }];
            setMessages(newMessages);

            if (voiceMode) {
              await speakText(welcomeMessage);
            }
          },
        },
      ]
    );
  };

  /**
   * Generate new lesson
   */
  const handleNewLesson = async () => {
    if (!userProfile) return;

    try {
      const lesson = await IntelligentLLMService.generateLesson(
        userProfile,
        userProfile.targetLanguage
      );
      setCurrentLesson(lesson);

      const lessonIntro = `Great! I've prepared a new lesson for you about ${lesson.topic}. ${lesson.description}`;
      const assistantMessage = {
        role: 'assistant',
        content: lessonIntro,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, assistantMessage];
      setMessages(updatedMessages);
      await saveConversationHistory(updatedMessages);

      if (voiceMode) {
        await speakText(lessonIntro);

        // Auto-start listening in auto mode
        if (autoMode) {
          setTimeout(() => {
            handleVoiceInput();
          }, 500);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate new lesson. Please try again.');
      console.error('Lesson generation error:', error);
    }
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Practice 🎯</Text>
            <Text style={styles.headerSubtitle}>
              {userProfile.targetLanguage} Conversation
            </Text>
          </View>

          <View style={styles.headerRight}>
            {/* Auto Mode Toggle */}
            {voiceMode && (
              <TouchableOpacity
                style={[styles.autoModeButton, autoMode && styles.autoModeButtonActive]}
                onPress={() => setAutoMode(!autoMode)}
              >
                <Text style={[styles.autoModeButtonText, autoMode && styles.autoModeButtonTextActive]}>
                  {autoMode ? '🔁 Auto' : '👆 Tap'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Voice Mode Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>🎤</Text>
              <Switch
                value={voiceMode}
                onValueChange={setVoiceMode}
                trackColor={{ false: colors.neutral[300], true: colors.primary.light }}
                thumbColor={voiceMode ? colors.primary.main : colors.neutral[100]}
              />
            </View>

            {/* Clear Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleClearHistory}
            >
              <Text style={styles.iconButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Lesson Card */}
        {currentLesson && (
          <Card variant="filled" padding="md" style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <Text style={styles.lessonEmoji}>📚</Text>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTopic}>{currentLesson.topic}</Text>
                <Text style={styles.lessonLevel}>{currentLesson.level}</Text>
              </View>
              <TouchableOpacity
                style={styles.newLessonButton}
                onPress={handleNewLesson}
              >
                <Text style={styles.newLessonButtonText}>New Lesson</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Waveform Visualizer */}
        {voiceMode && (
          <WaveformVisualizer
            isActive={isListening || isSpeaking}
            color={isListening ? colors.voice.listening : colors.voice.speaking}
          />
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageCard,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                ]}
              >
                {message.content}
              </Text>

              {/* Input type indicator */}
              {message.inputType && (
                <Text style={styles.inputTypeIndicator}>
                  {message.inputType === 'voice' ? '🎤' : '⌨️'}
                </Text>
              )}
            </View>
          ))}

          {isProcessing && (
            <View style={[styles.messageCard, styles.assistantMessage]}>
              <Text style={styles.messageText}>🤔 Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Voice/Text Input Area */}
        <View style={styles.inputArea}>
          {voiceMode && !showTextInput ? (
            <>
              {/* Auto Mode Indicator or Voice Button */}
              {autoMode ? (
                <View style={styles.autoModeIndicator}>
                  <Text style={styles.autoModeIndicatorText}>
                    {isListening && '🎤 Listening...'}
                    {isSpeaking && '🔊 Speaking...'}
                    {isProcessing && '🤔 Thinking...'}
                    {!isListening && !isSpeaking && !isProcessing && '⏸️ Ready - Just speak!'}
                  </Text>
                </View>
              ) : (
                <View style={styles.voiceButtonContainer}>
                  <VoiceButton
                    isListening={isListening}
                    isSpeaking={isSpeaking}
                    isProcessing={isProcessing}
                    onPress={handleVoiceInput}
                    size="large"
                    disabled={isListening || isSpeaking || isProcessing}
                  />
                </View>
              )}

              {/* Text Input Toggle */}
              <TouchableOpacity
                style={styles.textToggle}
                onPress={() => setShowTextInput(true)}
              >
                <Text style={styles.textToggleText}>Or type instead ⌨️</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Text Input */}
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={`Type in ${userProfile.targetLanguage}...`}
                  placeholderTextColor={colors.text.disabled}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  autoFocus={showTextInput}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !inputText.trim() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleTextInput}
                  disabled={!inputText.trim()}
                >
                  <Text style={styles.sendButtonText}>↑</Text>
                </TouchableOpacity>
              </View>

              {/* Voice Toggle */}
              {voiceMode && (
                <TouchableOpacity
                  style={styles.textToggle}
                  onPress={() => setShowTextInput(false)}
                >
                  <Text style={styles.textToggleText}>Switch to voice 🎤</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    ...shadows.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
  },
  toggleLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  autoModeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  autoModeButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  autoModeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  autoModeButtonTextActive: {
    color: colors.primary.contrast,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  lessonCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTopic: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  lessonLevel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  newLessonButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.md,
  },
  newLessonButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.contrast,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  messagesContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  messageCard: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral[100],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  userMessageText: {
    color: colors.primary.contrast,
  },
  assistantMessageText: {
    color: colors.text.primary,
  },
  inputTypeIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 10,
    opacity: 0.5,
  },
  inputArea: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  voiceButtonContainer: {
    alignItems: 'center',
  },
  autoModeIndicator: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  autoModeIndicatorText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  textToggle: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  textToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  sendButtonText: {
    fontSize: 24,
    color: colors.primary.contrast,
    fontWeight: typography.fontWeight.bold,
  },
});
