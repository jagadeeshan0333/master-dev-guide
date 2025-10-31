/**
 * ============================================
 * CHAT CONTROLLER
 * Handles chat-related operations
 * ============================================
 */

import ChatService from '../services/ChatService';

class ChatController {
  /**
   * Get active rooms
   */
  async getActiveRooms(filters = {}) {
    try {
      const rooms = await ChatService.getActiveRooms(filters);
      return {
        success: true,
        data: rooms,
        count: rooms.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get room by ID
   */
  async getRoomById(roomId) {
    try {
      const room = await ChatService.getRoomById(roomId);
      if (!room) {
        return {
          success: false,
          error: 'Room not found'
        };
      }
      return {
        success: true,
        data: room
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create room
   */
  async createRoom(data) {
    try {
      const room = await ChatService.createRoom(data);
      return {
        success: true,
        data: room,
        message: 'Chat room created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get room messages
   */
  async getRoomMessages(roomId, filters = {}) {
    try {
      const messages = await ChatService.getRoomMessages(roomId, filters);
      return {
        success: true,
        data: messages,
        count: messages.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send message
   */
  async sendMessage(data) {
    try {
      const message = await ChatService.sendMessage(data);
      return {
        success: true,
        data: message,
        message: 'Message sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update message
   */
  async updateMessage(messageId, content) {
    try {
      await ChatService.updateMessage(messageId, content);
      return {
        success: true,
        message: 'Message updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId) {
    try {
      await ChatService.deleteMessage(messageId);
      return {
        success: true,
        message: 'Message deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pin message
   */
  async pinMessage(messageId) {
    try {
      await ChatService.pinMessage(messageId);
      return {
        success: true,
        message: 'Message pinned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unpin message
   */
  async unpinMessage(messageId) {
    try {
      await ChatService.unpinMessage(messageId);
      return {
        success: true,
        message: 'Message unpinned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ChatController();
