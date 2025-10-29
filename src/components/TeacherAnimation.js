import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Image, Easing } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

const teacherImages = {
  neutral: require('../../assets/teacher/neutral.png'),
  surprised: require('../../assets/teacher/surprised.png'),
  smiling: require('../../assets/teacher/smiling.png'),
  closedSmile: require('../../assets/teacher/closed_smile.png'),
};

export default function TeacherAnimation({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onPress,
  disabled = false,
  size = 'large', // 'small' | 'medium' | 'large' | 'xlarge' | 'fullscreen'
  showLabel = true,
  customLabel = null,
}) {
  const floatAnim = useRef(new Animated.Value(0)).current; // -1..1 for up/down
  const pulseAnim = useRef(new Animated.Value(1)).current; // scale
  const glowAnim = useRef(new Animated.Value(0)).current; // glow intensity
  const rotateAnim = useRef(new Animated.Value(0)).current; // processing spinner
  const mouthAnim = useRef(new Animated.Value(0)).current; // 0-3 for mouth frames
  const scaleAnim = useRef(new Animated.Value(1)).current; // entrance animation
  const [currentImage, setCurrentImage] = useState(teacherImages.smiling);

  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // Gentle floating animation for the teacher - slower and more fluid
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: -1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
      ])
    ).start();

    return () => {
      floatAnim.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      // Pulsing ring while listening with glow effect
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false
            }),
          ])
        ),
      ]).start();
    } else if (isProcessing) {
      // Subtle rotation while processing
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      rotateAnim.setValue(0);
    }

    return () => {
      pulseAnim.stopAnimation();
      glowAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [isListening, isProcessing]);

  useEffect(() => {
    if (isSpeaking) {
      // Cycle through mouth frames while speaking - more natural timing
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 1, duration: 140, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 2, duration: 160, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 1, duration: 140, useNativeDriver: false }),
        ])
      ).start();
    } else {
      mouthAnim.setValue(0);
    }

    return () => {
      mouthAnim.stopAnimation();
    };
  }, [isSpeaking]);

  // Update current image with smooth transitions
  useEffect(() => {
    const newImage = getCurrentTeacherImage();
    if (newImage !== currentImage) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentImage(newImage);
    }
  }, [isListening, isSpeaking, isProcessing, mouthAnim]);

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 80;
      case 'medium':
        return 100;
      case 'large':
        return 120;
      case 'xlarge':
        return 180;
      case 'fullscreen':
        return 240;
      default:
        return 120;
    }
  };

  const baseSize = getButtonSize();
  const teacherSize = Math.round(baseSize * 1.2); // Larger teacher relative to base
  const floatTranslate = floatAnim.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const getAccentColor = () => {
    if (disabled) return colors.neutral[300];
    if (isListening) return colors.voice.listening;
    if (isSpeaking) return colors.voice.speaking;
    if (isProcessing) return colors.voice.processing;
    return colors.primary.main;
  };

  const getStateText = () => {
    if (customLabel) return customLabel;
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    if (isProcessing) return 'Thinking...';
    return 'Tap to speak';
  };

  const getCurrentTeacherImage = () => {
    if (isListening) return teacherImages.surprised;
    if (isSpeaking) {
      // Alternate between smiling and closed smile for talking animation
      const frame = Math.round(mouthAnim._value);
      return frame === 0 ? teacherImages.neutral : frame === 1 ? teacherImages.smiling : teacherImages.closedSmile;
    }
    if (isProcessing) return teacherImages.neutral;
    return teacherImages.smiling;
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
              transform: [
                { translateY: floatTranslate },
                { rotate: isProcessing ? rotate : '0deg' },
                { scale: scaleAnim }
              ],
              alignItems: 'center',
            }}
          >
            <Image
              source={currentImage}
              style={[styles.teacherImage, { width: teacherSize, height: teacherSize }]}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Base circle with glow effect */}
          <Animated.View
            style={[
              styles.base,
              {
                width: baseSize,
                height: baseSize,
                backgroundColor: getAccentColor(),
                transform: [{ scale: pulseAnim }],
                shadowColor: getAccentColor(),
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7]
                }),
                shadowRadius: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 20]
                }),
                elevation: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, 15]
                }),
              },
              shadows.lg,
            ]}
          />

          {/* Animated pulse rings */}
          {isListening && (
            <>
              <Animated.View
                style={[
                  styles.ring,
                  styles.ring1,
                  {
                    borderColor: getAccentColor(),
                    width: baseSize * 1.3,
                    height: baseSize * 1.3,
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [0.4, 0.1]
                    })
                  }
                ]}
              />
              <Animated.View
                style={[
                  styles.ring,
                  styles.ring2,
                  {
                    borderColor: getAccentColor(),
                    width: baseSize * 1.6,
                    height: baseSize * 1.6,
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.15],
                      outputRange: [0.3, 0.05]
                    })
                  }
                ]}
              />
            </>
          )}
        </View>
      </TouchableOpacity>

      {showLabel && <Text style={styles.stateText}>{getStateText()}</Text>}
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
  teacherImage: {
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
