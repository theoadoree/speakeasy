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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import IntelligentLLMService from '../services/intelligentLLM';
import AssessmentService from '../services/assessment';
import StorageService from '../utils/storage';
import TeacherAnimation from '../components/TeacherAnimation';
import ImmersiveVoiceMode from '../components/ImmersiveVoiceMode';
import WaveformVisualizer from '../components/WaveformVisualizer';
import Card from '../components/Card';
import UserMenu from '../components/UserMenu';
import { useSpeechRecognition, getLanguageCode } from '../services/speechRecognition';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const teacherAvatar = require('../../assets/teacher/smiling.png');

/**
 * Animated Chat Bubble Component
 */
function ChatBubble({ message, index }) {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isUser = message.role === 'user';

  return (
    <Animated.View
      style={[
        styles.messageWrapper,
        isUser ? styles.userMessageWrapper : styles.assistantMessageWrapper,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: isUser ? slideAnim : Animated.multiply(slideAnim, -1),
            },
          ],
        },
      ]}
    >
      {!isUser && (
        <Image
          source={teacherAvatar}
          style={styles.teacherAvatarSmall}
          resizeMode="contain"
        />
      )}
      <View
        style={[
          styles.messageCard,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.assistantMessageText,
          ]}
        >
          {message.content}
        </Text>

        {message.inputType && (
          <Text style={styles.inputTypeIndicator}>
            {message.inputType === 'voice' ? '🎤' : '⌨️'}
          </Text>
        )}
      </View>
      {isUser && <View style={styles.userAvatarPlaceholder} />}
    </Animated.View>
  );
}

/**
 * Voice-First Conversation Practice Screen
 * Professional production-ready practice interface with AI tutor
 * Now with immersive ChatGPT-style voice mode!
 */
export default function PracticeScreen({ navigation }) {
  const { userProfile, setUserProfile } = useApp();
  const { theme, isDark } = useTheme();
  const scrollViewRef = useRef(null);

  // Voice interaction state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState('');

  // Conversation state
  const [messages, setMessages] = useState([]);

  // Assessment state
  const [assessmentTriggered, setAssessmentTriggered] = useState(false);

  // UI preferences
  const [voiceMode, setVoiceMode] = useState(true);
  const [immersiveMode, setImmersiveMode] = useState(true); // ChatGPT-style fullscreen mode
  const [autoMode, setAutoMode] = useState(true); // Auto-listen after AI speaks
  const [showTextInput, setShowTextInput] = useState(false);
  const [inputText, setInputText] = useState('');

  // Lesson context
  const [currentLesson, setCurrentLesson] = useState(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Speech recognition integration
  const speechRecognition = useSpeechRecognition({
    language: getLanguageCode(userProfile?.targetLanguage || 'English'),
    onResult: (transcript) => {
      processUserInput(transcript, 'voice');
    },
    onPartialResult: (transcript) => {
      // Update interim transcript for display
    },
    onError: (error) => {
      Alert.alert('Speech Recognition Error', error);
      setIsProcessing(false);
    },
  });

  const { isListening, transcript: currentTranscript, start: startListening, stop: stopListening } = speechRecognition;

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

    // Different message if assessment is pending
    if (userProfile?.assessmentPending) {
      return `Hi ${name}! Welcome to SpeakEasy! 🎉 Let's have a quick conversation in ${targetLang} so I can understand your current level. Don't worry - just relax and chat with me naturally. We can talk about ${interests} or anything else you'd like. Ready? Just tap the button and start speaking!`;
    }

    return `Hi ${name}! Ready to practice ${targetLang}? I'm here to help you improve naturally. We can talk about ${interests} or anything else you'd like. Just tap the button and start speaking!`;
  };

  /**
   * Handle voice input
   */
  const handleVoiceInput = async () => {
    if (isListening) {
      // Stop listening
      await stopListening();
    } else {
      // Start listening
      const success = await startListening();
      if (!success) {
        Alert.alert('Error', 'Failed to start speech recognition. Please check permissions.');
      }
    }
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
      setLastResponse(response);
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

      // Check if we should trigger level assessment
      await checkAndTriggerAssessment(finalMessages);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to get response. Please try again.');
      console.error('Practice error:', error);
    }
  };

  /**
   * Check if user needs assessment and trigger it after sufficient conversation
   */
  const checkAndTriggerAssessment = async (conversationMessages) => {
    // Don't trigger if already triggered or if user already has a level
    if (assessmentTriggered || !userProfile || !userProfile.assessmentPending) {
      return;
    }

    // Count user messages (excluding system messages)
    const userMessageCount = conversationMessages.filter(msg => msg.role === 'user').length;
    const minExchanges = AssessmentService.getMinimumExchanges();

    // Trigger assessment after minimum exchanges
    if (userMessageCount >= minExchanges) {
      setAssessmentTriggered(true);
      await performAssessment(conversationMessages);
    }
  };

  /**
   * Perform level assessment based on conversation
   */
  const performAssessment = async (conversationMessages) => {
    try {
      console.log('🎯 Triggering level assessment...');

      // Show processing message
      const processingMessage = {
        role: 'assistant',
        content: "Let me evaluate your language level based on our conversation... 🤔",
        timestamp: new Date().toISOString(),
      };
      setMessages([...conversationMessages, processingMessage]);

      // Perform assessment
      const assessmentResult = await AssessmentService.evaluateLevel(
        conversationMessages,
        userProfile.targetLanguage
      );

      if (assessmentResult.success) {
        // Update user profile with assessed level
        const updatedProfile = {
          ...userProfile,
          level: assessmentResult.level,
          assessmentPending: false,
          assessmentDate: new Date().toISOString(),
          assessmentFeedback: assessmentResult.feedback
        };

        await setUserProfile(updatedProfile);

        // Get level description
        const levelDescription = AssessmentService.getLevelDescription(assessmentResult.level);

        // Show assessment results
        const resultMessage = {
          role: 'assistant',
          content: `Great job! 🎉 Based on our conversation, I've assessed your ${userProfile.targetLanguage} level as:\n\n📊 ${assessmentResult.level}: ${levelDescription}\n\n${assessmentResult.feedback}\n\nYour lessons will now be tailored to this level. Keep practicing to improve! 💪`,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...conversationMessages, resultMessage];
        setMessages(finalMessages);
        await saveConversationHistory(finalMessages);

        // Speak the result if in voice mode
        if (voiceMode) {
          await speakText(resultMessage.content);
        }

        // Show alert with results
        setTimeout(() => {
          Alert.alert(
            '🎯 Level Assessment Complete!',
            `You've been assessed at ${assessmentResult.level}: ${levelDescription}\n\n${assessmentResult.feedback}`,
            [{ text: 'Great!', style: 'default' }]
          );
        }, 1000);

      } else {
        // Assessment failed - default to A1
        console.error('Assessment failed:', assessmentResult.error);
        const updatedProfile = {
          ...userProfile,
          level: 'A1',
          assessmentPending: false
        };
        await setUserProfile(updatedProfile);

        const fallbackMessage = {
          role: 'assistant',
          content: "Let's start with beginner level (A1) for now. We can adjust as we continue practicing together! 😊",
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...conversationMessages, fallbackMessage];
        setMessages(finalMessages);
        await saveConversationHistory(finalMessages);
      }
    } catch (error) {
      console.error('Assessment error:', error);
      // Silently fail and continue - user can be assessed later
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
        voice: getPreferredVoice(userProfile?.targetLanguage),
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
   * Choose a more natural built-in voice when available
   * Note: On iOS/Android the available voices vary by device
   */
  const getPreferredVoice = (language) => {
    try {
      const langCode = getLanguageCode(language);
      // Prefer enhanced voices if available
      const preferredNames = [
        'Google US English',
        'Google UK English Female',
        'com.apple.ttsbundle.Samantha-compact',
        'com.apple.ttsbundle.Karen-compact',
      ];
      // expo-speech exposes getAvailableVoicesAsync in newer SDKs
      if (Speech.getAvailableVoicesAsync) {
        Speech.getAvailableVoicesAsync().then((voices) => {
          const byLang = voices?.filter((v) => v.language?.startsWith(langCode.slice(0, 2)));
          const named = byLang?.find((v) => preferredNames.includes(v.name));
          return named?.identifier || byLang?.[0]?.identifier;
        }).catch(() => undefined);
      }
    } catch (_) {
      // ignore and fallback to default
    }
    return undefined;
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

  // Render immersive voice mode (ChatGPT iOS style)
  if (immersiveMode && voiceMode) {
    return (
      <SafeAreaView style={styles.immersiveContainer}>
        <ImmersiveVoiceMode
          isListening={isListening}
          isSpeaking={isSpeaking}
          isProcessing={isProcessing}
          onToggleListening={handleVoiceInput}
          currentTranscript={currentTranscript}
          lastResponse={lastResponse}
          showTranscript={true}
        />
        {/* Toggle button to exit immersive mode */}
        <TouchableOpacity
          style={styles.exitImmersiveButton}
          onPress={() => setImmersiveMode(false)}
        >
          <Text style={styles.exitImmersiveButtonText}>💬</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render traditional chat mode
  return (
    <SafeAreaView style={styles.container}>
      <UserMenu navigation={navigation} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
            {/* Immersive Mode Toggle */}
            {voiceMode && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setImmersiveMode(true)}
              >
                <Text style={styles.iconButtonText}>✨</Text>
              </TouchableOpacity>
            )}

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

        {/* Assessment Pending Card */}
        {userProfile?.assessmentPending && !assessmentTriggered && (
          <Card variant="filled" padding="md" style={styles.assessmentCard}>
            <View style={styles.lessonHeader}>
              <Text style={styles.lessonEmoji}>🎯</Text>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTopic}>Level Assessment</Text>
                <Text style={styles.lessonLevel}>
                  Chat with me to determine your {userProfile.targetLanguage} level
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Current Lesson Card */}
        {currentLesson && !userProfile?.assessmentPending && (
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
            <ChatBubble key={index} message={message} index={index} />
          ))}

          {isProcessing && (
            <Animated.View style={[styles.messageWrapper, styles.assistantMessageWrapper]}>
              <Image
                source={teacherAvatar}
                style={styles.teacherAvatarSmall}
                resizeMode="contain"
              />
              <View style={[styles.messageCard, styles.assistantMessage]}>
                <Text style={styles.messageText}>🤔 Thinking...</Text>
              </View>
            </Animated.View>
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
                  <TeacherAnimation
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  immersiveContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  exitImmersiveButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  exitImmersiveButtonText: {
    fontSize: 22,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  assessmentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: '#FFF9E6', // Warm yellow background
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
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    width: '100%',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  teacherAvatarSmall: {
    width: 32,
    height: 32,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  userAvatarPlaceholder: {
    width: 32,
    marginLeft: spacing.xs,
  },
  messageCard: {
    maxWidth: '75%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    position: 'relative',
    ...shadows.sm,
  },
  userMessage: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
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
