/**
 * ============================================
 * SUBSCRIPTION CONTROLLER
 * Handles subscription-related operations
 * ============================================
 */

import SubscriptionService from '../services/SubscriptionService';

class SubscriptionController {
  /**
   * Get active plans
   */
  async getActivePlans() {
    try {
      const plans = await SubscriptionService.getActivePlans();
      return {
        success: true,
        data: plans,
        count: plans.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId) {
    try {
      const plan = await SubscriptionService.getPlanById(planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }
      return {
        success: true,
        data: plan
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(data) {
    try {
      const subscription = await SubscriptionService.createSubscription(data);
      return {
        success: true,
        data: subscription,
        message: 'Subscription created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user subscription
   */
  async getUserSubscription(userId) {
    try {
      const subscription = await SubscriptionService.getUserSubscription(userId);
      return {
        success: true,
        data: subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      await SubscriptionService.cancelSubscription(subscriptionId);
      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, data) {
    try {
      const subscription = await SubscriptionService.updateSubscription(subscriptionId, data);
      return {
        success: true,
        data: subscription,
        message: 'Subscription updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check subscription status
   */
  async isSubscriptionActive(userId) {
    try {
      const isActive = await SubscriptionService.isSubscriptionActive(userId);
      return {
        success: true,
        data: { isActive }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new SubscriptionController();
