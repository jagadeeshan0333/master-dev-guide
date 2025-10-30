/**
 * ============================================
 * USER SERVICE
 * Business logic for user management
 * ============================================
 */

import { User, Profile, UserRole, enhancedEntities } from '@/api/entities';

class UserService {
  /**
   * Get current authenticated user with roles
   */
  async getCurrentUser() {
    try {
      const user = await User.me();
      if (!user) return null;

      // Fetch user roles
      const roles = await enhancedEntities.UserRole.findAll({
        where: { user_id: user.id }
      });

      return {
        ...user,
        roles: roles.map(r => r.role)
      };
    } catch (error) {
      console.error('UserService.getCurrentUser error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with profile
   */
  async getUserById(userId) {
    try {
      const profile = await enhancedEntities.Profile.findByPk(userId);
      if (!profile) return null;

      const roles = await enhancedEntities.UserRole.findAll({
        where: { user_id: userId }
      });

      return {
        ...profile,
        roles: roles.map(r => r.role)
      };
    } catch (error) {
      console.error('UserService.getUserById error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    try {
      const updated = await enhancedEntities.Profile.update(data, {
        where: { id: userId }
      });
      return updated;
    } catch (error) {
      console.error('UserService.updateProfile error:', error);
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, role, assignedBy = null) {
    try {
      return await enhancedEntities.UserRole.create({
        user_id: userId,
        role: role,
        assigned_by: assignedBy
      });
    } catch (error) {
      console.error('UserService.assignRole error:', error);
      throw error;
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId, role) {
    try {
      const userRole = await enhancedEntities.UserRole.findOne({
        where: { user_id: userId, role: role }
      });
      
      if (userRole) {
        await enhancedEntities.UserRole.destroy({
          where: { id: userRole.id }
        });
      }
      
      return true;
    } catch (error) {
      console.error('UserService.removeRole error:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId, role) {
    try {
      const userRole = await enhancedEntities.UserRole.findOne({
        where: { user_id: userId, role: role }
      });
      return !!userRole;
    } catch (error) {
      console.error('UserService.hasRole error:', error);
      return false;
    }
  }

  /**
   * Get all users with filters
   */
  async getAllUsers(filters = {}) {
    try {
      const users = await enhancedEntities.Profile.findAll({
        where: filters,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
      return users;
    } catch (error) {
      console.error('UserService.getAllUsers error:', error);
      throw error;
    }
  }
}

export default new UserService();
