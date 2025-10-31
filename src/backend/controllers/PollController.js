/**
 * ============================================
 * POLL CONTROLLER
 * Handles poll-related operations
 * ============================================
 */

import PollService from '../services/PollService';

class PollController {
  /**
   * Create poll
   */
  async createPoll(data) {
    try {
      const poll = await PollService.createPoll(data);
      return {
        success: true,
        data: poll,
        message: 'Poll created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get active polls
   */
  async getActivePolls(filters = {}) {
    try {
      const polls = await PollService.getActivePolls(filters);
      return {
        success: true,
        data: polls,
        count: polls.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get poll by ID
   */
  async getPollById(pollId) {
    try {
      const poll = await PollService.getPollById(pollId);
      if (!poll) {
        return {
          success: false,
          error: 'Poll not found'
        };
      }
      return {
        success: true,
        data: poll
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Vote on poll
   */
  async vote(pollId, userId, optionIndex) {
    try {
      const vote = await PollService.vote(pollId, userId, optionIndex);
      return {
        success: true,
        data: vote,
        message: 'Vote submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get poll results
   */
  async getPollResults(pollId) {
    try {
      const results = await PollService.getPollResults(pollId);
      return {
        success: true,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close poll
   */
  async closePoll(pollId) {
    try {
      await PollService.closePoll(pollId);
      return {
        success: true,
        message: 'Poll closed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user voted
   */
  async hasUserVoted(pollId, userId) {
    try {
      const hasVoted = await PollService.hasUserVoted(pollId, userId);
      return {
        success: true,
        data: { hasVoted }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PollController();
