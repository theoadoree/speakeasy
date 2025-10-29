import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSubscription, SUBSCRIPTION_PLANS } from '../contexts/SubscriptionContext';

const { width } = Dimensions.get('window');

const TokenLimitModal = ({ visible, onClose, onUpgrade }) => {
  const { subscriptionStatus, tokenUsage, getUsagePercentage } = useSubscription();

  const currentPlan = SUBSCRIPTION_PLANS[subscriptionStatus.currentPlan];
  const usagePercent = getUsagePercentage();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>⏱️</Text>
            <Text style={styles.title}>Daily Limit Reached</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>
              You've reached your daily study limit for the Essential plan.
            </Text>

            {/* Usage Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Today's Usage:</Text>
                <Text style={styles.statValue}>
                  {Math.floor(usagePercent)}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${Math.min(100, usagePercent)}%` }]}
                />
              </View>
              <Text style={styles.resetText}>
                Resets tomorrow at midnight
              </Text>
            </View>

            {/* Upgrade CTA */}
            <View style={styles.upgradeContainer}>
              <Text style={styles.upgradeTitle}>Upgrade to Power Plan</Text>
              <View style={styles.benefitsList}>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Unlimited daily usage</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Fluency in 30 days</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Priority support</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>Advanced features</Text>
                </View>
              </View>

              <View style={styles.pricingRow}>
                <View style={styles.pricingOption}>
                  <Text style={styles.pricingLabel}>Annual</Text>
                  <Text style={styles.pricingPrice}>$200/year</Text>
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>SAVE 50%</Text>
                  </View>
                </View>
                <View style={styles.pricingDivider} />
                <View style={styles.pricingOption}>
                  <Text style={styles.pricingLabel}>Monthly</Text>
                  <Text style={styles.pricingPrice}>$33/mo</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Power</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    backgroundColor: '#FF9500',
    padding: 24,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  resetText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  upgradeContainer: {
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#5856D6',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5856D6',
    textAlign: 'center',
    marginBottom: 12,
  },
  benefitsList: {
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 8,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 15,
    color: '#333',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  pricingOption: {
    alignItems: 'center',
    flex: 1,
  },
  pricingDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  pricingLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  savingsBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  savingsText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actions: {
    padding: 24,
    paddingTop: 0,
  },
  upgradeButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default TokenLimitModal;
