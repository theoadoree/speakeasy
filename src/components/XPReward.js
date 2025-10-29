import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * XPReward Component
 *
 * Displays an animated XP reward notification
 * Usage: <XPReward amount={50} reason="Completed lesson" onComplete={() => {}} />
 */
const XPReward = ({ amount, reason, onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate out after delay
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="star" size={32} color="#FFD700" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.amountText}>+{amount} XP</Text>
          {reason && <Text style={styles.reasonText}>{reason}</Text>}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default XPReward;
