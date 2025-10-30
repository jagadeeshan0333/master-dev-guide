/**
 * ============================================
 * PLEDGE SERVICE
 * Business logic for pledge management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class PledgeService {
  /**
   * Create pledge session
   */
  async createSession(data) {
    try {
      return await enhancedEntities.PledgeSession.create({
        created_by: data.createdBy,
        title: data.title,
        description: data.description,
        stock_symbol: data.stockSymbol,
        target_price: data.targetPrice,
        session_start: data.sessionStart,
        session_end: data.sessionEnd,
        execution_rule: data.executionRule || 'manual',
        status: data.status || 'draft'
      });
    } catch (error) {
      console.error('PledgeService.createSession error:', error);
      throw error;
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions() {
    try {
      return await enhancedEntities.PledgeSession.findAll({
        where: { status: 'active' }
      });
    } catch (error) {
      console.error('PledgeService.getActiveSessions error:', error);
      throw error;
    }
  }

  /**
   * Create pledge
   */
  async createPledge(data) {
    try {
      const totalAmount = data.qty * data.priceTarget;
      const platformFee = totalAmount * 0.02; // 2% platform fee

      return await enhancedEntities.Pledge.create({
        session_id: data.sessionId,
        user_id: data.userId,
        demat_account_id: data.dematAccountId,
        stock_symbol: data.stockSymbol,
        side: data.side,
        qty: data.qty,
        price_target: data.priceTarget,
        total_amount: totalAmount,
        platform_fee: platformFee,
        status: 'pending',
        consent_signed: data.consentSigned || false,
        risk_acknowledged: data.riskAcknowledged || false
      });
    } catch (error) {
      console.error('PledgeService.createPledge error:', error);
      throw error;
    }
  }

  /**
   * Get user pledges
   */
  async getUserPledges(userId, filters = {}) {
    try {
      return await enhancedEntities.Pledge.findAll({
        where: {
          user_id: userId,
          ...filters
        }
      });
    } catch (error) {
      console.error('PledgeService.getUserPledges error:', error);
      throw error;
    }
  }

  /**
   * Update pledge status
   */
  async updatePledgeStatus(pledgeId, status, paymentId = null) {
    try {
      const updateData = { status };
      if (paymentId) {
        updateData.payment_id = paymentId;
      }

      return await enhancedEntities.Pledge.update(updateData, {
        where: { id: pledgeId }
      });
    } catch (error) {
      console.error('PledgeService.updatePledgeStatus error:', error);
      throw error;
    }
  }

  /**
   * Execute pledge
   */
  async executePledge(pledgeId, executionData) {
    try {
      const pledge = await enhancedEntities.Pledge.findByPk(pledgeId);
      if (!pledge) {
        throw new Error('Pledge not found');
      }

      // Create execution record
      const executionRecord = await enhancedEntities.PledgeExecutionRecord.create({
        pledge_id: pledgeId,
        session_id: pledge.session_id,
        user_id: pledge.user_id,
        demat_account_id: pledge.demat_account_id,
        stock_symbol: pledge.stock_symbol,
        side: pledge.side,
        pledged_qty: pledge.qty,
        executed_qty: executionData.executedQty || pledge.qty,
        executed_price: executionData.executedPrice || pledge.price_target,
        total_execution_value: (executionData.executedQty || pledge.qty) * (executionData.executedPrice || pledge.price_target),
        platform_commission: executionData.commission || pledge.platform_fee,
        commission_rate: executionData.commissionRate || 2.0,
        status: 'completed'
      });

      // Update pledge status
      await this.updatePledgeStatus(pledgeId, 'executed');

      return executionRecord;
    } catch (error) {
      console.error('PledgeService.executePledge error:', error);
      throw error;
    }
  }

  /**
   * Get session pledges
   */
  async getSessionPledges(sessionId, filters = {}) {
    try {
      return await enhancedEntities.Pledge.findAll({
        where: {
          session_id: sessionId,
          ...filters
        }
      });
    } catch (error) {
      console.error('PledgeService.getSessionPledges error:', error);
      throw error;
    }
  }

  /**
   * Get execution records
   */
  async getExecutionRecords(filters = {}) {
    try {
      return await enhancedEntities.PledgeExecutionRecord.findAll({
        where: filters,
        limit: filters.limit || 100,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('PledgeService.getExecutionRecords error:', error);
      throw error;
    }
  }
}

export default new PledgeService();
