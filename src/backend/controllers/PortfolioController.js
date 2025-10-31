/**
 * ============================================
 * PORTFOLIO CONTROLLER
 * Handles portfolio-related operations
 * ============================================
 */

import PortfolioService from '../services/PortfolioService';

class PortfolioController {
  /**
   * Get user portfolio
   */
  async getUserPortfolio(userId) {
    try {
      const portfolio = await PortfolioService.getUserPortfolio(userId);
      return {
        success: true,
        data: portfolio,
        count: portfolio.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add stock
   */
  async addStock(data) {
    try {
      const result = await PortfolioService.addStock(data);
      return {
        success: true,
        data: result,
        message: 'Stock added to portfolio'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sell stock
   */
  async sellStock(userId, stockSymbol, qty, price) {
    try {
      await PortfolioService.sellStock(userId, stockSymbol, qty, price);
      return {
        success: true,
        message: 'Stock sold successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update current price
   */
  async updateCurrentPrice(userId, stockSymbol, currentPrice) {
    try {
      await PortfolioService.updateCurrentPrice(userId, stockSymbol, currentPrice);
      return {
        success: true,
        message: 'Price updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get portfolio value
   */
  async getPortfolioValue(userId) {
    try {
      const value = await PortfolioService.getPortfolioValue(userId);
      return {
        success: true,
        data: value
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PortfolioController();
