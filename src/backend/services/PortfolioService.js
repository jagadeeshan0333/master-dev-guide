/**
 * ============================================
 * PORTFOLIO SERVICE
 * Business logic for portfolio management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class PortfolioService {
  /**
   * Get user portfolio
   */
  async getUserPortfolio(userId) {
    try {
      return await enhancedEntities.Portfolio.findAll({
        where: { user_id: userId }
      });
    } catch (error) {
      console.error('PortfolioService.getUserPortfolio error:', error);
      throw error;
    }
  }

  /**
   * Add stock to portfolio
   */
  async addStock(data) {
    try {
      // Check if stock already exists
      const existing = await enhancedEntities.Portfolio.findOne({
        where: {
          user_id: data.userId,
          stock_symbol: data.stockSymbol
        }
      });

      if (existing) {
        // Update existing position
        const newQty = existing.qty + data.qty;
        const newAvgPrice = ((existing.avg_price * existing.qty) + (data.price * data.qty)) / newQty;

        return await enhancedEntities.Portfolio.update({
          qty: newQty,
          avg_price: newAvgPrice,
          last_updated: new Date().toISOString()
        }, {
          where: { id: existing.id }
        });
      }

      // Create new position
      return await enhancedEntities.Portfolio.create({
        user_id: data.userId,
        stock_symbol: data.stockSymbol,
        qty: data.qty,
        avg_price: data.price,
        current_price: data.price
      });
    } catch (error) {
      console.error('PortfolioService.addStock error:', error);
      throw error;
    }
  }

  /**
   * Sell stock from portfolio
   */
  async sellStock(userId, stockSymbol, qty, price) {
    try {
      const position = await enhancedEntities.Portfolio.findOne({
        where: {
          user_id: userId,
          stock_symbol: stockSymbol
        }
      });

      if (!position) {
        throw new Error('Stock not found in portfolio');
      }

      if (position.qty < qty) {
        throw new Error('Insufficient quantity');
      }

      const newQty = position.qty - qty;

      if (newQty === 0) {
        // Remove position
        return await enhancedEntities.Portfolio.destroy({
          where: { id: position.id }
        });
      }

      // Update position
      return await enhancedEntities.Portfolio.update({
        qty: newQty,
        last_updated: new Date().toISOString()
      }, {
        where: { id: position.id }
      });
    } catch (error) {
      console.error('PortfolioService.sellStock error:', error);
      throw error;
    }
  }

  /**
   * Update current prices
   */
  async updateCurrentPrice(userId, stockSymbol, currentPrice) {
    try {
      return await enhancedEntities.Portfolio.update({
        current_price: currentPrice,
        last_updated: new Date().toISOString()
      }, {
        where: {
          user_id: userId,
          stock_symbol: stockSymbol
        }
      });
    } catch (error) {
      console.error('PortfolioService.updateCurrentPrice error:', error);
      throw error;
    }
  }

  /**
   * Get portfolio value
   */
  async getPortfolioValue(userId) {
    try {
      const portfolio = await this.getUserPortfolio(userId);
      
      const totalValue = portfolio.reduce((sum, position) => {
        return sum + (position.current_price * position.qty);
      }, 0);

      const totalInvested = portfolio.reduce((sum, position) => {
        return sum + (position.avg_price * position.qty);
      }, 0);

      const totalPnL = totalValue - totalInvested;
      const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

      return {
        totalValue,
        totalInvested,
        totalPnL,
        totalPnLPercentage,
        positions: portfolio.length
      };
    } catch (error) {
      console.error('PortfolioService.getPortfolioValue error:', error);
      throw error;
    }
  }
}

export default new PortfolioService();
