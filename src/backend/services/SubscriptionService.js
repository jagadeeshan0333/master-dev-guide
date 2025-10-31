/**
 * ============================================
 * SUBSCRIPTION SERVICE
 * Business logic for subscription management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  async getActivePlans() {
    try {
      return await enhancedEntities.SubscriptionPlan.findAll({
        where: { is_active: true }
      });
    } catch (error) {
      console.error('SubscriptionService.getActivePlans error:', error);
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId) {
    try {
      return await enhancedEntities.SubscriptionPlan.findByPk(planId);
    } catch (error) {
      console.error('SubscriptionService.getPlanById error:', error);
      throw error;
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(data) {
    try {
      return await enhancedEntities.UserSubscription.create({
        user_id: data.userId,
        plan_id: data.planId,
        started_at: new Date().toISOString(),
        expires_at: data.expiresAt,
        status: 'active',
        auto_renew: data.autoRenew !== false
      });
    } catch (error) {
      console.error('SubscriptionService.createSubscription error:', error);
      throw error;
    }
  }

  /**
   * Get user subscription
   */
  async getUserSubscription(userId) {
    try {
      return await enhancedEntities.UserSubscription.findOne({
        where: { 
          user_id: userId,
          status: 'active'
        }
      });
    } catch (error) {
      console.error('SubscriptionService.getUserSubscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      return await enhancedEntities.UserSubscription.update({
        status: 'cancelled',
        auto_renew: false
      }, {
        where: { id: subscriptionId }
      });
    } catch (error) {
      console.error('SubscriptionService.cancelSubscription error:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, data) {
    try {
      return await enhancedEntities.UserSubscription.update(data, {
        where: { id: subscriptionId }
      });
    } catch (error) {
      console.error('SubscriptionService.updateSubscription error:', error);
      throw error;
    }
  }

  /**
   * Check if subscription is active
   */
  async isSubscriptionActive(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      const now = new Date();
      const expiresAt = new Date(subscription.expires_at);
      
      return subscription.status === 'active' && expiresAt > now;
    } catch (error) {
      console.error('SubscriptionService.isSubscriptionActive error:', error);
      return false;
    }
  }
}

export default new SubscriptionService();
