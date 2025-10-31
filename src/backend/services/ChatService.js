/**
 * ============================================
 * CHAT SERVICE
 * Business logic for chat management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class ChatService {
  /**
   * Get active chat rooms
   */
  async getActiveRooms(filters = {}) {
    try {
      return await enhancedEntities.ChatRoom.findAll({
        where: {
          is_active: true,
          ...filters
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('ChatService.getActiveRooms error:', error);
      throw error;
    }
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId) {
    try {
      return await enhancedEntities.ChatRoom.findByPk(roomId);
    } catch (error) {
      console.error('ChatService.getRoomById error:', error);
      throw error;
    }
  }

  /**
   * Create chat room
   */
  async createRoom(data) {
    try {
      return await enhancedEntities.ChatRoom.create({
        name: data.name,
        description: data.description,
        room_type: data.roomType || 'public',
        created_by: data.createdBy,
        max_members: data.maxMembers,
        image_url: data.imageUrl,
        tags: data.tags || [],
        is_active: true
      });
    } catch (error) {
      console.error('ChatService.createRoom error:', error);
      throw error;
    }
  }

  /**
   * Get room messages
   */
  async getRoomMessages(roomId, filters = {}) {
    try {
      return await enhancedEntities.ChatMessage.findAll({
        where: {
          room_id: roomId,
          is_deleted: false,
          ...filters
        },
        limit: filters.limit || 100,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('ChatService.getRoomMessages error:', error);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(data) {
    try {
      return await enhancedEntities.ChatMessage.create({
        room_id: data.roomId,
        user_id: data.userId,
        content: data.content,
        message_type: data.messageType || 'text',
        reply_to_id: data.replyToId,
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('ChatService.sendMessage error:', error);
      throw error;
    }
  }

  /**
   * Update message
   */
  async updateMessage(messageId, content) {
    try {
      return await enhancedEntities.ChatMessage.update({
        content,
        updated_at: new Date().toISOString()
      }, {
        where: { id: messageId }
      });
    } catch (error) {
      console.error('ChatService.updateMessage error:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    try {
      return await enhancedEntities.ChatMessage.update({
        is_deleted: true
      }, {
        where: { id: messageId }
      });
    } catch (error) {
      console.error('ChatService.deleteMessage error:', error);
      throw error;
    }
  }

  /**
   * Pin message
   */
  async pinMessage(messageId) {
    try {
      return await enhancedEntities.ChatMessage.update({
        is_pinned: true
      }, {
        where: { id: messageId }
      });
    } catch (error) {
      console.error('ChatService.pinMessage error:', error);
      throw error;
    }
  }

  /**
   * Unpin message
   */
  async unpinMessage(messageId) {
    try {
      return await enhancedEntities.ChatMessage.update({
        is_pinned: false
      }, {
        where: { id: messageId }
      });
    } catch (error) {
      console.error('ChatService.unpinMessage error:', error);
      throw error;
    }
  }
}

export default new ChatService();
