import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import TeacherAnimation from './TeacherAnimation';
import { colors, typography, spacing } from '../theme';

const { height, width } = Dimensions.get('window');

/**
 * Immersive Voice Mode - ChatGPT iOS Style
 * Fullscreen voice conversation interface with animated teacher
 */
export default function ImmersiveVoiceMode({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onToggleListening,
  currentTranscript = '',
  lastResponse = '',
  showTranscript = true,
}) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const transcriptAnim = useRef(new Animated.Value(0)).current;
  const [displayText, setDisplayText] = useState('');

  // Update display text based on state
  useEffect(() => {
    if (isListening && currentTranscript) {
      setDisplayText(currentTranscript);
      Animated.timing(transcriptAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isSpeaking && lastResponse) {
      setDisplayText(lastResponse);
      Animated.timing(transcriptAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isProcessing) {
      setDisplayText('Thinking...');
      Animated.timing(transcriptAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(transcriptAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setTimeout(() => setDisplayText(''), 300);
    }
  }, [isListening, isSpeaking, isProcessing, currentTranscript, lastResponse]);

  // Subtle background animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.95,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getBackgroundGradient = () => {
    if (isListening) return styles.backgroundListening;
    if (isSpeaking) return styles.backgroundSpeaking;
    if (isProcessing) return styles.backgroundProcessing;
    return styles.backgroundIdle;
  };

  const getStatusMessage = () => {
    if (isListening) return 'I\'m listening...';
    if (isSpeaking) return 'Let me explain...';
    if (isProcessing) return 'Just a moment...';
    return 'Tap to start speaking';
  };

  return (
    <Animated.View style={[styles.container, getBackgroundGradient(), { opacity: fadeAnim }]}>
      {/* Status indicator at top */}
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, getStatusDotStyle()]}>
          <Animated.View
            style={[
              styles.statusDotInner,
              {
                opacity: isListening || isSpeaking
                  ? fadeAnim.interpolate({
                      inputRange: [0.95, 1],
                      outputRange: [0.5, 1],
                    })
                  : 1,
              },
            ]}
          />
        </View>
        <Text style={styles.statusText}>{getStatusMessage()}</Text>
      </View>

      {/* Teacher animation in center */}
      <View style={styles.teacherContainer}>
        <TeacherAnimation
          isListening={isListening}
          isSpeaking={isSpeaking}
          isProcessing={isProcessing}
          onPress={onToggleListening}
          size="fullscreen"
          showLabel={false}
          disabled={isProcessing}
        />
      </View>

      {/* Transcript/Response display */}
      {showTranscript && displayText ? (
        <Animated.View
          style={[
            styles.transcriptContainer,
            {
              opacity: transcriptAnim,
              transform: [
                {
                  translateY: transcriptAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptText} numberOfLines={4}>
              {displayText}
            </Text>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            {isListening
              ? '🎤 Speak naturally'
              : isSpeaking
              ? '🔊 Listening to response'
              : isProcessing
              ? '🤔 Preparing response'
              : '👆 Tap the teacher to begin'}
          </Text>
        </View>
      )}

      {/* Control hint at bottom */}
      <View style={styles.controlHint}>
        <Text style={styles.controlHintText}>
          {isListening ? 'Tap again to stop' : 'Continuous conversation mode'}
        </Text>
      </View>
    </Animated.View>
  );

  function getStatusDotStyle() {
    if (isListening) return { backgroundColor: colors.voice.listening };
    if (isSpeaking) return { backgroundColor: colors.voice.speaking };
    if (isProcessing) return { backgroundColor: colors.voice.processing };
    return { backgroundColor: colors.neutral[400] };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: spacing.xl,
  },
  backgroundIdle: {
    backgroundColor: colors.background.primary,
  },
  backgroundListening: {
    backgroundColor: '#F0F8FF', // Light blue tint
  },
  backgroundSpeaking: {
    backgroundColor: '#FFF8F0', // Warm tint
  },
  backgroundProcessing: {
    backgroundColor: '#F5F5F5', // Neutral tint
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  statusText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  teacherContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  transcriptContainer: {
    width: '100%',
    minHeight: 120,
    justifyContent: 'center',
  },
  transcriptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  transcriptText: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.fontSize.lg * 1.5,
    color: colors.text.primary,
    textAlign: 'center',
  },
  instructionContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: typography.fontSize.xl,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  controlHint: {
    paddingVertical: spacing.md,
  },
  controlHintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});
