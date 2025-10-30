/**
 * ============================================
 * POLL SERVICE
 * Business logic for poll management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class PollService {
  /**
   * Create poll
   */
  async createPoll(data) {
    try {
      return await enhancedEntities.Poll.create({
        created_by: data.createdBy,
        title: data.title,
        description: data.description,
        poll_type: data.pollType || 'stock_prediction',
        stock_symbol: data.stockSymbol,
        options: data.options,
        status: data.status || 'draft',
        start_time: data.startTime || new Date().toISOString(),
        end_time: data.endTime,
        is_featured: data.isFeatured || false
      });
    } catch (error) {
      console.error('PollService.createPoll error:', error);
      throw error;
    }
  }

  /**
   * Get active polls
   */
  async getActivePolls(filters = {}) {
    try {
      return await enhancedEntities.Poll.findAll({
        where: {
          status: 'active',
          ...filters
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('PollService.getActivePolls error:', error);
      throw error;
    }
  }

  /**
   * Get poll by ID
   */
  async getPollById(pollId) {
    try {
      return await enhancedEntities.Poll.findByPk(pollId);
    } catch (error) {
      console.error('PollService.getPollById error:', error);
      throw error;
    }
  }

  /**
   * Vote on poll
   */
  async vote(pollId, userId, optionIndex) {
    try {
      // Check if already voted
      const existing = await enhancedEntities.PollVote.findOne({
        where: { poll_id: pollId, user_id: userId }
      });

      if (existing) {
        throw new Error('Already voted on this poll');
      }

      // Create vote
      const vote = await enhancedEntities.PollVote.create({
        poll_id: pollId,
        user_id: userId,
        option_index: optionIndex
      });

      // Update poll vote count
      await this.updatePollVoteCount(pollId);

      return vote;
    } catch (error) {
      console.error('PollService.vote error:', error);
      throw error;
    }
  }

  /**
   * Get poll votes
   */
  async getPollVotes(pollId) {
    try {
      return await enhancedEntities.PollVote.findAll({
        where: { poll_id: pollId }
      });
    } catch (error) {
      console.error('PollService.getPollVotes error:', error);
      throw error;
    }
  }

  /**
   * Get poll results
   */
  async getPollResults(pollId) {
    try {
      const poll = await this.getPollById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      const votes = await this.getPollVotes(pollId);
      const options = JSON.parse(poll.options);

      const results = options.map((option, index) => ({
        ...option,
        index,
        votes: votes.filter(v => v.option_index === index).length,
        percentage: poll.total_votes > 0 
          ? ((votes.filter(v => v.option_index === index).length / poll.total_votes) * 100).toFixed(2)
          : 0
      }));

      return {
        poll,
        results,
        totalVotes: poll.total_votes
      };
    } catch (error) {
      console.error('PollService.getPollResults error:', error);
      throw error;
    }
  }

  /**
   * Update poll vote count
   */
  async updatePollVoteCount(pollId) {
    try {
      const voteCount = await enhancedEntities.PollVote.count({
        where: { poll_id: pollId }
      });

      await enhancedEntities.Poll.update({
        total_votes: voteCount
      }, {
        where: { id: pollId }
      });
    } catch (error) {
      console.error('PollService.updatePollVoteCount error:', error);
      throw error;
    }
  }

  /**
   * Close poll
   */
  async closePoll(pollId) {
    try {
      return await enhancedEntities.Poll.update({
        status: 'closed'
      }, {
        where: { id: pollId }
      });
    } catch (error) {
      console.error('PollService.closePoll error:', error);
      throw error;
    }
  }

  /**
   * Check if user voted
   */
  async hasUserVoted(pollId, userId) {
    try {
      const vote = await enhancedEntities.PollVote.findOne({
        where: { poll_id: pollId, user_id: userId }
      });
      return !!vote;
    } catch (error) {
      console.error('PollService.hasUserVoted error:', error);
      return false;
    }
  }
}

export default new PollService();
