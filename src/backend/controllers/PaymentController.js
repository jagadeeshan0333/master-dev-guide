/**
 * ============================================
 * PAYMENT CONTROLLER
 * Handles payment-related operations
 * ============================================
 */

import PaymentService from '../services/PaymentService';

class PaymentController {
  /**
   * Create payment order
   */
  async createOrder(data) {
    try {
      const result = await PaymentService.createPaymentOrder(data);
      return {
        success: true,
        data: result,
        message: 'Payment order created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update payment status
   */
  async updateStatus(paymentId, status, gatewayPaymentId = null) {
    try {
      const payment = await PaymentService.updatePaymentStatus(paymentId, status, gatewayPaymentId);
      return {
        success: true,
        data: payment,
        message: 'Payment status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(userId, filters = {}) {
    try {
      const payments = await PaymentService.getUserPayments(userId, filters);
      return {
        success: true,
        data: payments,
        count: payments.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId) {
    try {
      const payment = await PaymentService.getPaymentById(paymentId);
      
      if (!payment) {
        return {
          success: false,
          error: 'Payment not found'
        };
      }

      return {
        success: true,
        data: payment
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId, amount = null) {
    try {
      const result = await PaymentService.processRefund(paymentId, amount);
      return {
        success: true,
        data: result,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getStats(filters = {}) {
    try {
      const stats = await PaymentService.getPaymentStats(filters);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PaymentController();
