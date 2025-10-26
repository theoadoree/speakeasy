import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react';
import { colors, spacing } from '../theme';

/**
 * Beautiful Waveform Visualizer for Voice Feedback
 * Animated bars that respond to speech
 */
export default function WaveformVisualizer({ isActive = false, color = colors.primary.main }) {
  const bars = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive) {
      // Animate bars up and down randomly
      const animations = bars.map((bar, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 0.7 + 0.3,
              duration: 200 + index * 50,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: 200 + index * 50,
              useNativeDriver: false,
            }),
          ])
        )
      );

      animations.forEach((anim) => anim.start());

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    } else {
      // Reset to idle state
      bars.forEach((bar) => {
        Animated.timing(bar, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: bar.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '100%'],
              }),
              backgroundColor: color,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: spacing.sm,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    minHeight: 8,
  },
});
