/**
 * ============================================
 * PLEDGE CONTROLLER
 * Handles pledge-related operations
 * ============================================
 */

import PledgeService from '../services/PledgeService';

class PledgeController {
  /**
   * Create pledge session
   */
  async createSession(data) {
    try {
      const session = await PledgeService.createSession(data);
      return {
        success: true,
        data: session,
        message: 'Pledge session created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions() {
    try {
      const sessions = await PledgeService.getActiveSessions();
      return {
        success: true,
        data: sessions,
        count: sessions.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create pledge
   */
  async createPledge(data) {
    try {
      const pledge = await PledgeService.createPledge(data);
      return {
        success: true,
        data: pledge,
        message: 'Pledge created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user pledges
   */
  async getUserPledges(userId, filters = {}) {
    try {
      const pledges = await PledgeService.getUserPledges(userId, filters);
      return {
        success: true,
        data: pledges,
        count: pledges.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update pledge status
   */
  async updateStatus(pledgeId, status, paymentId = null) {
    try {
      const pledge = await PledgeService.updatePledgeStatus(pledgeId, status, paymentId);
      return {
        success: true,
        data: pledge,
        message: 'Pledge status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute pledge
   */
  async executePledge(pledgeId, executionData) {
    try {
      const execution = await PledgeService.executePledge(pledgeId, executionData);
      return {
        success: true,
        data: execution,
        message: 'Pledge executed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get session pledges
   */
  async getSessionPledges(sessionId, filters = {}) {
    try {
      const pledges = await PledgeService.getSessionPledges(sessionId, filters);
      return {
        success: true,
        data: pledges,
        count: pledges.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get execution records
   */
  async getExecutionRecords(filters = {}) {
    try {
      const records = await PledgeService.getExecutionRecords(filters);
      return {
        success: true,
        data: records,
        count: records.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PledgeController();
