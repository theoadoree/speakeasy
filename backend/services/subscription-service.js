const userService = require('./user-service');
const logger = require('../utils/logger');

class SubscriptionService {
  /**
   * Handle initial purchase event from RevenueCat
   */
  async handleInitialPurchase(event) {
    try {
      const userId = event.app_user_id;
      const productId = event.product_id;
      const purchaseDate = new Date(event.purchased_at_ms);
      const expiresDate = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;

      logger.info('Processing initial purchase', { userId, productId });

      const subscriptionData = {
        status: 'active',
        plan: this.mapProductIdToPlan(productId),
        productId,
        purchaseDate,
        expiresDate,
        isTrialPeriod: event.is_trial_period || false,
        revenueCatId: event.id,
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Initial purchase processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing initial purchase', error);
      throw error;
    }
  }

  /**
   * Handle renewal event from RevenueCat
   */
  async handleRenewal(event) {
    try {
      const userId = event.app_user_id;
      const productId = event.product_id;
      const expiresDate = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;

      logger.info('Processing renewal', { userId, productId });

      const subscriptionData = {
        status: 'active',
        plan: this.mapProductIdToPlan(productId),
        productId,
        expiresDate,
        isTrialPeriod: false,
        lastRenewalDate: new Date(event.purchased_at_ms),
        revenueCatId: event.id,
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Renewal processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing renewal', error);
      throw error;
    }
  }

  /**
   * Handle cancellation event from RevenueCat
   */
  async handleCancellation(event) {
    try {
      const userId = event.app_user_id;
      const expiresDate = event.expiration_at_ms ? new Date(event.expiration_at_ms) : null;

      logger.info('Processing cancellation', { userId });

      const subscriptionData = {
        status: 'cancelled',
        cancelledAt: new Date(event.cancelled_at_ms || Date.now()),
        expiresDate, // User still has access until expiry
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Cancellation processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing cancellation', error);
      throw error;
    }
  }

  /**
   * Handle uncancellation event from RevenueCat
   */
  async handleUncancellation(event) {
    try {
      const userId = event.app_user_id;

      logger.info('Processing uncancellation', { userId });

      const subscriptionData = {
        status: 'active',
        cancelledAt: null,
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Uncancellation processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing uncancellation', error);
      throw error;
    }
  }

  /**
   * Handle billing issue event from RevenueCat
   */
  async handleBillingIssue(event) {
    try {
      const userId = event.app_user_id;

      logger.info('Processing billing issue', { userId });

      const subscriptionData = {
        status: 'billing_issue',
        billingIssueDetectedAt: new Date(),
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      // TODO: Send notification to user about billing issue

      logger.info('Billing issue processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing billing issue', error);
      throw error;
    }
  }

  /**
   * Handle product change event from RevenueCat
   */
  async handleProductChange(event) {
    try {
      const userId = event.app_user_id;
      const newProductId = event.new_product_id;

      logger.info('Processing product change', { userId, newProductId });

      const subscriptionData = {
        status: 'active',
        plan: this.mapProductIdToPlan(newProductId),
        productId: newProductId,
        productChangedAt: new Date(),
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Product change processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing product change', error);
      throw error;
    }
  }

  /**
   * Handle expiration event from RevenueCat
   */
  async handleExpiration(event) {
    try {
      const userId = event.app_user_id;

      logger.info('Processing expiration', { userId });

      const subscriptionData = {
        status: 'expired',
        expiredAt: new Date(event.expiration_at_ms),
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Expiration processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing expiration', error);
      throw error;
    }
  }

  /**
   * Handle trial started event from RevenueCat
   */
  async handleTrialStarted(event) {
    try {
      const userId = event.app_user_id;
      const productId = event.product_id;
      const trialEndDate = new Date(event.expiration_at_ms);

      logger.info('Processing trial started', { userId, productId });

      const subscriptionData = {
        status: 'active',
        plan: this.mapProductIdToPlan(productId),
        productId,
        isTrialPeriod: true,
        trialEndsAt: trialEndDate,
        trialStartedAt: new Date(event.purchased_at_ms),
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Trial started processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing trial started', error);
      throw error;
    }
  }

  /**
   * Handle trial converted event from RevenueCat
   */
  async handleTrialConverted(event) {
    try {
      const userId = event.app_user_id;

      logger.info('Processing trial converted', { userId });

      const subscriptionData = {
        status: 'active',
        isTrialPeriod: false,
        trialConvertedAt: new Date(),
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Trial converted processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing trial converted', error);
      throw error;
    }
  }

  /**
   * Handle trial cancelled event from RevenueCat
   */
  async handleTrialCancelled(event) {
    try {
      const userId = event.app_user_id;

      logger.info('Processing trial cancelled', { userId });

      const subscriptionData = {
        status: 'cancelled',
        isTrialPeriod: false,
        trialCancelledAt: new Date(),
        updatedAt: new Date(),
      };

      await userService.updateUserSubscription(userId, subscriptionData);

      logger.info('Trial cancelled processed successfully', { userId });
    } catch (error) {
      logger.error('Error processing trial cancelled', error);
      throw error;
    }
  }

  /**
   * Map RevenueCat product ID to internal plan name
   * @param {string} productId - RevenueCat product ID
   * @returns {string} Plan name
   */
  mapProductIdToPlan(productId) {
    const planMapping = {
      'essential_monthly': 'essential',
      'essential_annual': 'essential',
      'power_monthly': 'power',
      'power_annual': 'power',
    };

    return planMapping[productId] || 'unknown';
  }
}

module.exports = new SubscriptionService();
