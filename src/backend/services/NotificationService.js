/**
 * ============================================
 * NOTIFICATION SERVICE
 * Business logic for notification management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class NotificationService {
  /**
   * Create notification
   */
  async createNotification(data) {
    try {
      return await enhancedEntities.Notification.create({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'system',
        reference_id: data.referenceId,
        reference_type: data.referenceType,
        action_url: data.actionUrl
      });
    } catch (error) {
      console.error('NotificationService.createNotification error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      return await enhancedEntities.Notification.findAll({
        where: {
          user_id: userId,
          ...filters
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('NotificationService.getUserNotifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      return await enhancedEntities.Notification.update({
        is_read: true
      }, {
        where: { id: notificationId }
      });
    } catch (error) {
      console.error('NotificationService.markAsRead error:', error);
      throw error;
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    try {
      const notifications = await this.getUserNotifications(userId, {
        is_read: false
      });

      for (const notification of notifications) {
        await this.markAsRead(notification.id);
      }

      return true;
    } catch (error) {
      console.error('NotificationService.markAllAsRead error:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      return await enhancedEntities.Notification.count({
        where: { user_id: userId, is_read: false }
      });
    } catch (error) {
      console.error('NotificationService.getUnreadCount error:', error);
      return 0;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(userIds, data) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await this.createNotification({
          userId,
          ...data
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('NotificationService.sendBulkNotifications error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      return await enhancedEntities.Notification.destroy({
        where: { id: notificationId }
      });
    } catch (error) {
      console.error('NotificationService.deleteNotification error:', error);
      throw error;
    }
  }
}

export default new NotificationService();
