import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

/**
 * Professional Voice Button Component
 * Beautiful animated button for voice interaction
 */
export default function VoiceButton({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onPress,
  disabled = false,
  size = 'large', // 'small' | 'medium' | 'large'
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      // Pulsing animation while listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (isProcessing) {
      // Rotation animation while processing
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
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

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 32;
      case 'large':
      default:
        return 40;
    }
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  const getButtonColor = () => {
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
    return 'Tap to speak';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isListening || isProcessing}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              backgroundColor: getButtonColor(),
              transform: [
                { scale: pulseAnim },
                { rotate: isProcessing ? rotate : '0deg' },
              ],
            },
            shadows.lg,
          ]}
        >
          {/* Microphone Icon */}
          <View style={[styles.icon, { width: iconSize, height: iconSize }]}>
            <Text style={styles.iconText}>🎤</Text>
          </View>

          {/* Animated rings for listening state */}
          {isListening && (
            <>
              <View style={[styles.ring, styles.ring1, { borderColor: getButtonColor() }]} />
              <View style={[styles.ring, styles.ring2, { borderColor: getButtonColor() }]} />
            </>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* State text */}
      <Text style={styles.stateText}>{getStateText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 32,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: borderRadius.full,
    opacity: 0.3,
  },
  ring1: {
    width: '120%',
    height: '120%',
  },
  ring2: {
    width: '140%',
    height: '140%',
  },
  stateText: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
