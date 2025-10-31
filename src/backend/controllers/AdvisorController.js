/**
 * ============================================
 * ADVISOR CONTROLLER
 * Handles advisor-related operations
 * ============================================
 */

import AdvisorService from '../services/AdvisorService';

class AdvisorController {
  /**
   * Get all active advisors
   */
  async getActiveAdvisors(filters = {}) {
    try {
      const advisors = await AdvisorService.getActiveAdvisors(filters);
      return {
        success: true,
        data: advisors,
        count: advisors.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get advisor by ID
   */
  async getAdvisorById(advisorId) {
    try {
      const advisor = await AdvisorService.getAdvisorById(advisorId);
      if (!advisor) {
        return {
          success: false,
          error: 'Advisor not found'
        };
      }
      return {
        success: true,
        data: advisor
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update advisor profile
   */
  async updateAdvisorProfile(advisorId, data) {
    try {
      const advisor = await AdvisorService.updateAdvisorProfile(advisorId, data);
      return {
        success: true,
        data: advisor,
        message: 'Advisor profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Submit review
   */
  async submitReview(data) {
    try {
      const review = await AdvisorService.submitReview(data);
      return {
        success: true,
        data: review,
        message: 'Review submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get advisor reviews
   */
  async getAdvisorReviews(advisorId) {
    try {
      const reviews = await AdvisorService.getAdvisorReviews(advisorId);
      return {
        success: true,
        data: reviews,
        count: reviews.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new AdvisorController();
