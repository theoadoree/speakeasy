import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSubscription, SUBSCRIPTION_PLANS, TRIAL_DURATION_DAYS } from '../contexts/SubscriptionContext';

const SubscriptionScreen = ({ navigation, route }) => {
  const { startFreeTrial, purchaseSubscription, loading } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'annual' or 'monthly'
  const [selectedPlan, setSelectedPlan] = useState('ESSENTIAL_ANNUAL');
  const [isProcessing, setIsProcessing] = useState(false);

  const isFromOnboarding = route?.params?.fromOnboarding || false;

  const handleSelectPlan = (planKey) => {
    setSelectedPlan(planKey);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      Alert.alert('Please select a plan', 'Choose a subscription plan to continue');
      return;
    }

    setIsProcessing(true);

    try {
      // Start free trial
      const result = await startFreeTrial(selectedPlan);

      if (result.success) {
        Alert.alert(
          'Free Trial Started!',
          `Your ${TRIAL_DURATION_DAYS}-day free trial has begun. You can cancel anytime before ${new Date(result.trialEndsAt).toLocaleDateString()}.`,
          [
            {
              text: 'Start Learning',
              onPress: () => {
                if (isFromOnboarding) {
                  // Navigate to main app
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainApp' }],
                  });
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to start trial. Please try again.');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPlanCard = (planKey, isRecommended = false) => {
    const plan = SUBSCRIPTION_PLANS[planKey];
    const isSelected = selectedPlan === planKey;

    return (
      <TouchableOpacity
        key={planKey}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          isRecommended && styles.planCardRecommended,
        ]}
        onPress={() => handleSelectPlan(planKey)}
        activeOpacity={0.7}
      >
        {isRecommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>MOST POPULAR</Text>
          </View>
        )}

        {plan.savings && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>SAVE {plan.savings}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={styles.radioButton}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
          <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
            {plan.name}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            {plan.displayPrice}
          </Text>
          {plan.monthlyEquivalent && (
            <Text style={styles.priceSubtext}>
              ${plan.monthlyEquivalent.toFixed(2)}/month
            </Text>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {plan.isPower && (
          <View style={styles.powerBadge}>
            <Text style={styles.powerBadgeText}>🚀 FLUENCY IN 30 DAYS</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Start your {TRIAL_DURATION_DAYS}-day free trial
          </Text>
        </View>

        {/* Billing Period Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonLeft,
              billingPeriod === 'annual' && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setBillingPeriod('annual');
              if (selectedPlan.includes('MONTHLY')) {
                setSelectedPlan(
                  selectedPlan.includes('POWER') ? 'POWER_ANNUAL' : 'ESSENTIAL_ANNUAL'
                );
              }
            }}
          >
            <Text
              style={[
                styles.toggleText,
                billingPeriod === 'annual' && styles.toggleTextActive,
              ]}
            >
              Annual
            </Text>
            <View style={styles.savingsBadgeSmall}>
              <Text style={styles.savingsBadgeSmallText}>50% OFF</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.toggleButtonRight,
              billingPeriod === 'monthly' && styles.toggleButtonActive,
            ]}
            onPress={() => {
              setBillingPeriod('monthly');
              if (selectedPlan.includes('ANNUAL')) {
                setSelectedPlan(
                  selectedPlan.includes('POWER') ? 'POWER_MONTHLY' : 'ESSENTIAL_MONTHLY'
                );
              }
            }}
          >
            <Text
              style={[
                styles.toggleText,
                billingPeriod === 'monthly' && styles.toggleTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {billingPeriod === 'annual' ? (
            <>
              {renderPlanCard('POWER_ANNUAL', true)}
              {renderPlanCard('ESSENTIAL_ANNUAL')}
            </>
          ) : (
            <>
              {renderPlanCard('POWER_MONTHLY', true)}
              {renderPlanCard('ESSENTIAL_MONTHLY')}
            </>
          )}
        </View>

        {/* Trial Info */}
        <View style={styles.trialInfo}>
          <Text style={styles.trialInfoText}>
            ✓ {TRIAL_DURATION_DAYS} days free, then{' '}
            {billingPeriod === 'annual' ? 'billed annually' : 'billed monthly'}
          </Text>
          <Text style={styles.trialInfoText}>✓ Cancel anytime</Text>
          <Text style={styles.trialInfoText}>✓ No commitment required</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, isProcessing && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              Start {TRIAL_DURATION_DAYS}-Day Free Trial
            </Text>
          )}
        </TouchableOpacity>

        {/* Fine Print */}
        <Text style={styles.finePrint}>
          By continuing, you agree to our Terms of Service and Privacy Policy. Your
          subscription will automatically renew unless cancelled at least 24 hours before
          the end of the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  toggleButtonLeft: {
    marginRight: 2,
  },
  toggleButtonRight: {
    marginLeft: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#000',
  },
  savingsBadgeSmall: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  savingsBadgeSmallText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  planCardRecommended: {
    borderColor: '#FF9500',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingsBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  savingsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  planNameSelected: {
    color: '#007AFF',
  },
  priceContainer: {
    marginBottom: 16,
    marginLeft: 36,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  priceSelected: {
    color: '#007AFF',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  featuresContainer: {
    marginLeft: 36,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  powerBadge: {
    backgroundColor: '#5856D6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    marginLeft: 36,
    alignSelf: 'flex-start',
  },
  powerBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  trialInfo: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  trialInfoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  finePrint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
