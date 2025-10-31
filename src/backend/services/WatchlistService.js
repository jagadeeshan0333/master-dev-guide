/**
 * ============================================
 * WATCHLIST SERVICE
 * Business logic for watchlist management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class WatchlistService {
  /**
   * Get user watchlist
   */
  async getUserWatchlist(userId) {
    try {
      return await enhancedEntities.Watchlist.findAll({
        where: { user_id: userId }
      });
    } catch (error) {
      console.error('WatchlistService.getUserWatchlist error:', error);
      throw error;
    }
  }

  /**
   * Add to watchlist
   */
  async addToWatchlist(data) {
    try {
      // Check if already exists
      const existing = await enhancedEntities.Watchlist.findOne({
        where: {
          user_id: data.userId,
          stock_symbol: data.stockSymbol
        }
      });

      if (existing) {
        throw new Error('Stock already in watchlist');
      }

      return await enhancedEntities.Watchlist.create({
        user_id: data.userId,
        stock_symbol: data.stockSymbol,
        notes: data.notes
      });
    } catch (error) {
      console.error('WatchlistService.addToWatchlist error:', error);
      throw error;
    }
  }

  /**
   * Remove from watchlist
   */
  async removeFromWatchlist(userId, stockSymbol) {
    try {
      const item = await enhancedEntities.Watchlist.findOne({
        where: {
          user_id: userId,
          stock_symbol: stockSymbol
        }
      });

      if (!item) {
        throw new Error('Stock not found in watchlist');
      }

      return await enhancedEntities.Watchlist.destroy({
        where: { id: item.id }
      });
    } catch (error) {
      console.error('WatchlistService.removeFromWatchlist error:', error);
      throw error;
    }
  }

  /**
   * Update watchlist notes
   */
  async updateNotes(userId, stockSymbol, notes) {
    try {
      return await enhancedEntities.Watchlist.update({
        notes
      }, {
        where: {
          user_id: userId,
          stock_symbol: stockSymbol
        }
      });
    } catch (error) {
      console.error('WatchlistService.updateNotes error:', error);
      throw error;
    }
  }

  /**
   * Check if in watchlist
   */
  async isInWatchlist(userId, stockSymbol) {
    try {
      const item = await enhancedEntities.Watchlist.findOne({
        where: {
          user_id: userId,
          stock_symbol: stockSymbol
        }
      });
      return !!item;
    } catch (error) {
      console.error('WatchlistService.isInWatchlist error:', error);
      return false;
    }
  }
}

export default new WatchlistService();
