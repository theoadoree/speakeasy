import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';

const SubscriptionContext = createContext();

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  ESSENTIAL_MONTHLY: {
    id: 'essential_monthly',
    name: 'Essential',
    price: 16.67, // $200/year = $16.67/month
    displayPrice: '$17/month',
    annualPrice: 100,
    features: ['20-30 mins daily study', 'Core features', 'All languages'],
    tokenLimit: 50000, // Approx 20-30 mins of study
  },
  ESSENTIAL_ANNUAL: {
    id: 'essential_annual',
    name: 'Essential',
    price: 100,
    displayPrice: '$100/year',
    monthlyEquivalent: 8.33,
    savings: '50%',
    features: ['20-30 mins daily study', 'Core features', 'All languages', '50% savings vs monthly'],
    tokenLimit: 50000,
    isAnnual: true,
  },
  POWER_MONTHLY: {
    id: 'power_monthly',
    name: 'Power',
    price: 33.33, // $400/year = $33.33/month
    displayPrice: '$33/month',
    annualPrice: 200,
    features: ['Unlimited usage', 'Fluency in 30 days', 'Priority support', 'Advanced features'],
    tokenLimit: null, // Unlimited
    isPower: true,
  },
  POWER_ANNUAL: {
    id: 'power_annual',
    name: 'Power',
    price: 200,
    displayPrice: '$200/year',
    monthlyEquivalent: 16.67,
    savings: '50%',
    features: ['Unlimited usage', 'Fluency in 30 days', 'Priority support', 'Advanced features', '50% savings vs monthly'],
    tokenLimit: null, // Unlimited
    isPower: true,
    isAnnual: true,
  },
};

export const TRIAL_DURATION_DAYS = 3;

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isActive: false,
    isTrialActive: false,
    trialEndsAt: null,
    currentPlan: null,
    planType: null, // 'essential' or 'power'
    isAnnual: false,
  });
  const [tokenUsage, setTokenUsage] = useState({
    dailyTokens: 0,
    totalTokens: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  // Initialize RevenueCat
  useEffect(() => {
    initializePurchases();
    loadSubscriptionData();
  }, []);

  const initializePurchases = async () => {
    try {
      // Using the provided RevenueCat API key
      const revenueCatKey = 'AQ.Ab8RN6I14KkuQj4KEkJD249PaWSjIZYTvFuNSXqO8gDwq-PI0A';

      if (Platform.OS === 'ios') {
        await Purchases.configure({
          apiKey: revenueCatKey,
        });
      } else if (Platform.OS === 'android') {
        await Purchases.configure({
          apiKey: revenueCatKey,
        });
      }
      // For web, we'll use Stripe directly
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing purchases:', error);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const [subData, tokenData] = await Promise.all([
        AsyncStorage.getItem('@fluentai:subscriptionStatus'),
        AsyncStorage.getItem('@fluentai:tokenUsage'),
      ]);

      if (subData) {
        const parsedSubData = JSON.parse(subData);
        setSubscriptionStatus(parsedSubData);

        // Check if trial has expired
        if (parsedSubData.isTrialActive && parsedSubData.trialEndsAt) {
          const trialEndDate = new Date(parsedSubData.trialEndsAt);
          const now = new Date();
          if (now > trialEndDate) {
            // Trial expired
            await updateSubscriptionStatus({
              ...parsedSubData,
              isTrialActive: false,
              isActive: false,
            });
          }
        }
      }

      if (tokenData) {
        const parsedTokenData = JSON.parse(tokenData);
        const today = new Date().toISOString().split('T')[0];

        // Reset daily tokens if it's a new day
        if (parsedTokenData.lastResetDate !== today) {
          setTokenUsage({
            dailyTokens: 0,
            totalTokens: parsedTokenData.totalTokens,
            lastResetDate: today,
          });
          await AsyncStorage.setItem('@fluentai:tokenUsage', JSON.stringify({
            dailyTokens: 0,
            totalTokens: parsedTokenData.totalTokens,
            lastResetDate: today,
          }));
        } else {
          setTokenUsage(parsedTokenData);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (newStatus) => {
    setSubscriptionStatus(newStatus);
    await AsyncStorage.setItem('@fluentai:subscriptionStatus', JSON.stringify(newStatus));
  };

  const startFreeTrial = async (planId) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);

    const newStatus = {
      isActive: true,
      isTrialActive: true,
      trialEndsAt: trialEndDate.toISOString(),
      currentPlan: planId,
      planType: plan.isPower ? 'power' : 'essential',
      isAnnual: plan.isAnnual || false,
    };

    await updateSubscriptionStatus(newStatus);
    return { success: true, trialEndsAt: trialEndDate };
  };

  const purchaseSubscription = async (planId) => {
    try {
      if (Platform.OS === 'web') {
        // Handle Stripe payment for web
        return await handleStripePayment(planId);
      } else {
        // Handle in-app purchase for iOS/Android
        return await handleInAppPurchase(planId);
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      return { success: false, error: error.message };
    }
  };

  const handleInAppPurchase = async (planId) => {
    try {
      const purchaseResult = await Purchases.purchasePackage(planId);

      if (purchaseResult.customerInfo.entitlements.active) {
        const plan = SUBSCRIPTION_PLANS[planId];
        const newStatus = {
          isActive: true,
          isTrialActive: false,
          trialEndsAt: null,
          currentPlan: planId,
          planType: plan.isPower ? 'power' : 'essential',
          isAnnual: plan.isAnnual || false,
        };

        await updateSubscriptionStatus(newStatus);
        return { success: true };
      }

      return { success: false, error: 'Purchase failed' };
    } catch (error) {
      if (error.userCancelled) {
        return { success: false, error: 'User cancelled' };
      }
      throw error;
    }
  };

  const handleStripePayment = async (planId) => {
    // TODO: Implement Stripe payment flow
    // This will need to call your backend to create a payment intent
    // and handle the Stripe checkout process
    console.log('Stripe payment not yet implemented for web');
    return { success: false, error: 'Web payments not yet implemented' };
  };

  const restorePurchases = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, check with backend
        return { success: false, error: 'Restore not available on web' };
      }

      const customerInfo = await Purchases.restorePurchases();

      if (customerInfo.entitlements.active) {
        // Find the active entitlement and update subscription status
        const activeEntitlements = Object.keys(customerInfo.entitlements.active);
        if (activeEntitlements.length > 0) {
          const entitlementId = activeEntitlements[0];
          // Map entitlement to plan
          const newStatus = {
            isActive: true,
            isTrialActive: false,
            trialEndsAt: null,
            currentPlan: entitlementId,
            planType: entitlementId.includes('power') ? 'power' : 'essential',
            isAnnual: entitlementId.includes('annual'),
          };
          await updateSubscriptionStatus(newStatus);
          return { success: true, restored: true };
        }
      }

      return { success: true, restored: false };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { success: false, error: error.message };
    }
  };

  const addTokenUsage = async (tokens) => {
    const today = new Date().toISOString().split('T')[0];

    // Reset if new day
    let currentUsage = { ...tokenUsage };
    if (currentUsage.lastResetDate !== today) {
      currentUsage = {
        dailyTokens: 0,
        totalTokens: currentUsage.totalTokens,
        lastResetDate: today,
      };
    }

    const newUsage = {
      dailyTokens: currentUsage.dailyTokens + tokens,
      totalTokens: currentUsage.totalTokens + tokens,
      lastResetDate: today,
    };

    setTokenUsage(newUsage);
    await AsyncStorage.setItem('@fluentai:tokenUsage', JSON.stringify(newUsage));

    // Check if limit exceeded
    const currentPlan = SUBSCRIPTION_PLANS[subscriptionStatus.currentPlan];
    if (currentPlan && currentPlan.tokenLimit && newUsage.dailyTokens >= currentPlan.tokenLimit) {
      return { limitExceeded: true, usage: newUsage };
    }

    return { limitExceeded: false, usage: newUsage };
  };

  const hasActiveSubscription = () => {
    return subscriptionStatus.isActive;
  };

  const isPowerUser = () => {
    return subscriptionStatus.isActive && subscriptionStatus.planType === 'power';
  };

  const canUseService = () => {
    if (!subscriptionStatus.isActive) {
      return false;
    }

    if (isPowerUser()) {
      return true; // Unlimited for power users
    }

    // Check daily token limit for essential users
    const currentPlan = SUBSCRIPTION_PLANS[subscriptionStatus.currentPlan];
    if (currentPlan && currentPlan.tokenLimit) {
      return tokenUsage.dailyTokens < currentPlan.tokenLimit;
    }

    return true;
  };

  const getRemainingTokens = () => {
    if (isPowerUser()) {
      return null; // Unlimited
    }

    const currentPlan = SUBSCRIPTION_PLANS[subscriptionStatus.currentPlan];
    if (currentPlan && currentPlan.tokenLimit) {
      return Math.max(0, currentPlan.tokenLimit - tokenUsage.dailyTokens);
    }

    return null;
  };

  const getUsagePercentage = () => {
    if (isPowerUser()) {
      return 0; // No limit
    }

    const currentPlan = SUBSCRIPTION_PLANS[subscriptionStatus.currentPlan];
    if (currentPlan && currentPlan.tokenLimit) {
      return Math.min(100, (tokenUsage.dailyTokens / currentPlan.tokenLimit) * 100);
    }

    return 0;
  };

  const value = {
    subscriptionStatus,
    tokenUsage,
    loading,
    startFreeTrial,
    purchaseSubscription,
    restorePurchases,
    addTokenUsage,
    hasActiveSubscription,
    isPowerUser,
    canUseService,
    getRemainingTokens,
    getUsagePercentage,
    SUBSCRIPTION_PLANS,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
