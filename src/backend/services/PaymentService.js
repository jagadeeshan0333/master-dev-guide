/**
 * ============================================
 * PAYMENT SERVICE
 * Business logic for payment processing
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';
import paymentGateway from '@/components/payment/PaymentService';

class PaymentService {
  /**
   * Create payment order
   */
  async createPaymentOrder(data) {
    try {
      const { userId, amount, currency, paymentType, referenceId, gateway } = data;

      // Create order with payment gateway
      const orderDetails = await paymentGateway.createOrder({
        amount,
        currency: currency || 'INR',
        description: `Payment for ${paymentType}`,
        gateway: gateway || 'razorpay'
      });

      // Save payment record to database
      const payment = await enhancedEntities.Payment.create({
        user_id: userId,
        amount,
        currency: currency || 'INR',
        gateway: orderDetails.gateway,
        gateway_order_id: orderDetails.orderId || orderDetails.clientSecret,
        status: 'pending',
        payment_type: paymentType,
        reference_id: referenceId,
        metadata: orderDetails
      });

      return {
        payment,
        orderDetails
      };
    } catch (error) {
      console.error('PaymentService.createPaymentOrder error:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId, status, gatewayPaymentId = null) {
    try {
      const updateData = {
        status,
        gateway_payment_id: gatewayPaymentId
      };

      return await enhancedEntities.Payment.update(updateData, {
        where: { id: paymentId }
      });
    } catch (error) {
      console.error('PaymentService.updatePaymentStatus error:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId, filters = {}) {
    try {
      return await enhancedEntities.Payment.findAll({
        where: { 
          user_id: userId,
          ...filters 
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('PaymentService.getUserPayments error:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    try {
      return await enhancedEntities.Payment.findByPk(paymentId);
    } catch (error) {
      console.error('PaymentService.getPaymentById error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId, amount = null) {
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const refundAmount = amount || payment.amount;

      // Update payment status
      await this.updatePaymentStatus(paymentId, 'refunded');

      return {
        success: true,
        refundAmount,
        originalAmount: payment.amount
      };
    } catch (error) {
      console.error('PaymentService.processRefund error:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(filters = {}) {
    try {
      const payments = await enhancedEntities.Payment.findAll({
        where: filters
      });

      const stats = {
        total: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
        completed: payments.filter(p => p.status === 'completed').length,
        pending: payments.filter(p => p.status === 'pending').length,
        failed: payments.filter(p => p.status === 'failed').length,
        refunded: payments.filter(p => p.status === 'refunded').length
      };

      return stats;
    } catch (error) {
      console.error('PaymentService.getPaymentStats error:', error);
      throw error;
    }
  }
}

export default new PaymentService();
