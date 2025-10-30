/**
 * ============================================
 * ADVISOR SERVICE
 * Business logic for advisor management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class AdvisorService {
  /**
   * Create advisor profile
   */
  async createAdvisor(data) {
    try {
      return await enhancedEntities.Advisor.create({
        user_id: data.userId,
        profile_id: data.profileId,
        specialization: data.specialization || [],
        experience_years: data.experienceYears,
        consultation_fee: data.consultationFee || 0,
        bio: data.bio,
        certifications: data.certifications || [],
        is_verified: false,
        is_active: true
      });
    } catch (error) {
      console.error('AdvisorService.createAdvisor error:', error);
      throw error;
    }
  }

  /**
   * Get active advisors
   */
  async getActiveAdvisors(filters = {}) {
    try {
      return await enhancedEntities.Advisor.findAll({
        where: {
          is_active: true,
          ...filters
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('AdvisorService.getActiveAdvisors error:', error);
      throw error;
    }
  }

  /**
   * Get advisor by ID
   */
  async getAdvisorById(advisorId) {
    try {
      return await enhancedEntities.Advisor.findByPk(advisorId);
    } catch (error) {
      console.error('AdvisorService.getAdvisorById error:', error);
      throw error;
    }
  }

  /**
   * Get advisor by user ID
   */
  async getAdvisorByUserId(userId) {
    try {
      return await enhancedEntities.Advisor.findOne({
        where: { user_id: userId }
      });
    } catch (error) {
      console.error('AdvisorService.getAdvisorByUserId error:', error);
      throw error;
    }
  }

  /**
   * Update advisor profile
   */
  async updateAdvisor(advisorId, data) {
    try {
      return await enhancedEntities.Advisor.update(data, {
        where: { id: advisorId }
      });
    } catch (error) {
      console.error('AdvisorService.updateAdvisor error:', error);
      throw error;
    }
  }

  /**
   * Add review
   */
  async addReview(advisorId, userId, rating, comment) {
    try {
      // Check if user already reviewed
      const existing = await enhancedEntities.AdvisorReview.findOne({
        where: { advisor_id: advisorId, user_id: userId }
      });

      if (existing) {
        throw new Error('You have already reviewed this advisor');
      }

      // Create review
      const review = await enhancedEntities.AdvisorReview.create({
        advisor_id: advisorId,
        user_id: userId,
        rating,
        comment
      });

      // Update advisor rating
      await this.updateAdvisorRating(advisorId);

      return review;
    } catch (error) {
      console.error('AdvisorService.addReview error:', error);
      throw error;
    }
  }

  /**
   * Get advisor reviews
   */
  async getAdvisorReviews(advisorId) {
    try {
      return await enhancedEntities.AdvisorReview.findAll({
        where: { advisor_id: advisorId }
      });
    } catch (error) {
      console.error('AdvisorService.getAdvisorReviews error:', error);
      throw error;
    }
  }

  /**
   * Update advisor rating
   */
  async updateAdvisorRating(advisorId) {
    try {
      const reviews = await this.getAdvisorReviews(advisorId);
      
      if (reviews.length === 0) return;

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = (totalRating / reviews.length).toFixed(2);

      await enhancedEntities.Advisor.update({
        rating: avgRating,
        total_reviews: reviews.length
      }, {
        where: { id: advisorId }
      });
    } catch (error) {
      console.error('AdvisorService.updateAdvisorRating error:', error);
      throw error;
    }
  }

  /**
   * Verify advisor
   */
  async verifyAdvisor(advisorId, verified = true) {
    try {
      return await enhancedEntities.Advisor.update({
        is_verified: verified
      }, {
        where: { id: advisorId }
      });
    } catch (error) {
      console.error('AdvisorService.verifyAdvisor error:', error);
      throw error;
    }
  }
}

export default new AdvisorService();
