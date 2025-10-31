/**
 * ============================================
 * NOTIFICATION CONTROLLER
 * Handles notification-related operations
 * ============================================
 */

import NotificationService from '../services/NotificationService';

class NotificationController {
  /**
   * Create notification
   */
  async createNotification(data) {
    try {
      const notification = await NotificationService.createNotification(data);
      return {
        success: true,
        data: notification,
        message: 'Notification created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const notifications = await NotificationService.getUserNotifications(userId, filters);
      return {
        success: true,
        data: notifications,
        count: notifications.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark as read
   */
  async markAsRead(notificationId) {
    try {
      await NotificationService.markAsRead(notificationId);
      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    try {
      await NotificationService.markAllAsRead(userId);
      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const count = await NotificationService.getUnreadCount(userId);
      return {
        success: true,
        data: { count }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new NotificationController();
