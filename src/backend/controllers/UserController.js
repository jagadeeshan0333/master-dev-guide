/**
 * ============================================
 * USER CONTROLLER
 * Handles HTTP-like requests for user operations
 * ============================================
 */

import UserService from '../services/UserService';

class UserController {
  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const user = await UserService.getCurrentUser();
      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    try {
      const updated = await UserService.updateProfile(userId, data);
      return {
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, role, assignedBy = null) {
    try {
      const roleAssignment = await UserService.assignRole(userId, role, assignedBy);
      return {
        success: true,
        data: roleAssignment,
        message: 'Role assigned successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId, role) {
    try {
      await UserService.removeRole(userId, role);
      return {
        success: true,
        message: 'Role removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if user has role
   */
  async checkRole(userId, role) {
    try {
      const hasRole = await UserService.hasRole(userId, role);
      return {
        success: true,
        data: { hasRole }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(filters = {}) {
    try {
      const users = await UserService.getAllUsers(filters);
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new UserController();
