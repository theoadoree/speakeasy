const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscription-service');
const logger = require('../utils/logger');

/**
 * POST /webhooks/revenuecat
 * Handle RevenueCat webhook events
 *
 * RevenueCat sends webhooks for:
 * - INITIAL_PURCHASE
 * - RENEWAL
 * - CANCELLATION
 * - BILLING_ISSUE
 * - PRODUCT_CHANGE
 * - etc.
 */
router.post('/revenuecat', async (req, res) => {
  try {
    const event = req.body;

    logger.info('Received RevenueCat webhook', {
      type: event.type,
      userId: event.app_user_id,
    });

    // Verify webhook authenticity (optional but recommended)
    // RevenueCat sends an authorization header that you can verify

    switch (event.type) {
      case 'INITIAL_PURCHASE':
        await subscriptionService.handleInitialPurchase(event);
        break;

      case 'RENEWAL':
        await subscriptionService.handleRenewal(event);
        break;

      case 'CANCELLATION':
        await subscriptionService.handleCancellation(event);
        break;

      case 'UNCANCELLATION':
        await subscriptionService.handleUncancellation(event);
        break;

      case 'BILLING_ISSUE':
        await subscriptionService.handleBillingIssue(event);
        break;

      case 'PRODUCT_CHANGE':
        await subscriptionService.handleProductChange(event);
        break;

      case 'EXPIRATION':
        await subscriptionService.handleExpiration(event);
        break;

      case 'TRIAL_STARTED':
        await subscriptionService.handleTrialStarted(event);
        break;

      case 'TRIAL_CONVERTED':
        await subscriptionService.handleTrialConverted(event);
        break;

      case 'TRIAL_CANCELLED':
        await subscriptionService.handleTrialCancelled(event);
        break;

      default:
        logger.warn(`Unhandled webhook event type: ${event.type}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error processing RevenueCat webhook', error);
    // Still return 200 to prevent webhook retries
    res.status(200).json({ received: true, error: error.message });
  }
});

module.exports = router;
