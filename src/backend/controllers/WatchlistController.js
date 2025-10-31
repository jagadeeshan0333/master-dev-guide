/**
 * ============================================
 * WATCHLIST CONTROLLER
 * Handles watchlist-related operations
 * ============================================
 */

import WatchlistService from '../services/WatchlistService';

class WatchlistController {
  /**
   * Get user watchlist
   */
  async getUserWatchlist(userId) {
    try {
      const watchlist = await WatchlistService.getUserWatchlist(userId);
      return {
        success: true,
        data: watchlist,
        count: watchlist.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add to watchlist
   */
  async addToWatchlist(data) {
    try {
      const item = await WatchlistService.addToWatchlist(data);
      return {
        success: true,
        data: item,
        message: 'Added to watchlist'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(userId, stockSymbol) {
    try {
      await WatchlistService.removeFromWatchlist(userId, stockSymbol);
      return {
        success: true,
        message: 'Removed from watchlist'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update notes
   */
  async updateNotes(userId, stockSymbol, notes) {
    try {
      await WatchlistService.updateNotes(userId, stockSymbol, notes);
      return {
        success: true,
        message: 'Notes updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if in watchlist
   */
  async isInWatchlist(userId, stockSymbol) {
    try {
      const inWatchlist = await WatchlistService.isInWatchlist(userId, stockSymbol);
      return {
        success: true,
        data: { inWatchlist }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new WatchlistController();
