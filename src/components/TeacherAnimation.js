import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

export default function TeacherAnimation({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onPress,
  disabled = false,
  size = 'large', // 'small' | 'medium' | 'large'
}) {
  const floatAnim = useRef(new Animated.Value(0)).current; // -1..1 for up/down
  const pulseAnim = useRef(new Animated.Value(1)).current; // scale
  const rotateAnim = useRef(new Animated.Value(0)).current; // processing spinner

  useEffect(() => {
    // Gentle floating animation for the teacher
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: -1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    return () => {
      floatAnim.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      // Pulsing ring while listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else if (isProcessing) {
      // Subtle rotation while processing
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 1600, useNativeDriver: true })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }

    return () => {
      pulseAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [isListening, isProcessing]);

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 56;
      case 'medium':
        return 72;
      case 'large':
      default:
        return 96;
    }
  };

  const baseSize = getButtonSize();
  const teacherFontSize = Math.round(baseSize * 0.75); // emoji size
  const floatTranslate = floatAnim.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const getAccentColor = () => {
    if (disabled) return colors.neutral[300];
    if (isListening) return colors.voice.listening;
    if (isSpeaking) return colors.voice.speaking;
    if (isProcessing) return colors.voice.processing;
    return colors.primary.main;
  };

  const getStateText = () => {
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    if (isProcessing) return 'Thinking...';
    return 'Tap the teacher';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isListening || isProcessing}
        activeOpacity={0.85}
      >
        <View style={styles.stack}>
          {/* Teacher avatar above */}
          <Animated.View
            style={{
              transform: [{ translateY: floatTranslate }, { rotate: isProcessing ? rotate : '0deg' }],
              alignItems: 'center',
            }}
          >
            <Text style={[styles.teacherEmoji, { fontSize: teacherFontSize }]}>🧑‍🏫</Text>
          </Animated.View>

          {/* Base circle and pulse rings below the avatar */}
          <Animated.View
            style={[
              styles.base,
              {
                width: baseSize,
                height: baseSize,
                backgroundColor: getAccentColor(),
                transform: [{ scale: pulseAnim }],
              },
              shadows.lg,
            ]}
          />

          {isListening && (
            <>
              <View style={[styles.ring, styles.ring1, { borderColor: getAccentColor(), width: baseSize * 1.25, height: baseSize * 1.25 }]} />
              <View style={[styles.ring, styles.ring2, { borderColor: getAccentColor(), width: baseSize * 1.5, height: baseSize * 1.5 }]} />
            </>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.stateText}>{getStateText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherEmoji: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  base: {
    borderRadius: borderRadius.full,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: borderRadius.full,
    opacity: 0.25,
  },
  ring1: {
    // sizes computed inline
  },
  ring2: {
    // sizes computed inline
  },
  stateText: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
