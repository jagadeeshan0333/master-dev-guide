import { supabase } from '@/integrations/supabase/client';

/**
 * ============================================
 * COMPLETE BACKEND ENTITIES (Models Layer)
 * PostgreSQL Implementation via Supabase
 * ============================================
 * 
 * This provides a Sequelize-like ORM interface
 * for all database tables using Supabase
 */

// ============================================
// HELPER FUNCTION TO CREATE ENTITY INTERFACE
// ============================================

const createEntity = (tableName) => ({
  // List all records
  list: async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data || [];
  },

  // Filter records
  filter: async (conditions) => {
    let query = supabase.from(tableName).select('*');
    
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Get single record by ID
  get: async (id) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Create new record
  create: async (record) => {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update record
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete record
  delete: async (id) => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
});

// ============================================
// DATABASE ENTITIES
// ============================================

export const UserRole = createEntity('user_roles');
export const Profile = createEntity('profiles');
export const UserSubscription = createEntity('user_subscriptions');
export const Payment = createEntity('payments');
export const Finfluencer = createEntity('finfluencers');
export const EventRegistration = createEntity('event_registrations');
export const ChatMessage = createEntity('chat_messages');
export const Portfolio = createEntity('portfolios');
export const Watchlist = createEntity('watchlist');
export const Advisor = createEntity('advisors');
export const AdvisorReview = createEntity('advisor_reviews');
export const Event = createEntity('events');
export const PledgeSession = createEntity('pledge_sessions');
export const Pledge = createEntity('pledges');
export const PledgeExecutionRecord = createEntity('pledge_execution_records');
export const PledgeAuditLog = createEntity('pledge_audit_logs');
export const Poll = createEntity('polls');
export const PollVote = createEntity('poll_votes');
export const ChatRoom = createEntity('chat_rooms');
export const Notification = createEntity('notifications');
export const SubscriptionPlan = createEntity('subscription_plans');
export const PlatformSetting = createEntity('platform_settings');
export const Course = createEntity('courses');
export const CourseEnrollment = createEntity('course_enrollments');
export const RevenueTransaction = createEntity('revenue_transactions');
export const EventAttendee = createEntity('event_attendees');
export const EventTicket = createEntity('event_tickets');

// ============================================
// USER ENTITY (Auth System)
// ============================================

export const User = {
  // Get current authenticated user
  me: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  // Get user by ID
  getById: async (userId) => {
    try {
      const profile = await Profile.filter({ id: userId }).then(res => res[0]);
      return profile;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  },

  // Update user profile
  update: async (userId, data) => {
    try {
      const updated = await Profile.update(userId, data);
      return updated;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// ============================================
// SEQUELIZE-LIKE QUERY HELPERS
// ============================================

/**
 * Create a Sequelize-like query interface
 * Maps Sequelize methods to Base44 operations
 */
export const createQueryHelper = (entity) => ({
  // findAll equivalent
  findAll: async (options = {}) => {
    try {
      let query = entity;
      
      if (options.where) {
        query = entity.filter(options.where);
      } else {
        query = entity.list();
      }
      
      const results = await query;
      
      // Apply limit/offset if provided
      if (options.limit || options.offset) {
        const start = options.offset || 0;
        const end = start + (options.limit || results.length);
        return results.slice(start, end);
      }
      
      return results;
    } catch (error) {
      console.error('findAll error:', error);
      throw error;
    }
  },

  // findOne equivalent
  findOne: async (options = {}) => {
    try {
      const results = await entity.filter(options.where || {});
      return results[0] || null;
    } catch (error) {
      console.error('findOne error:', error);
      return null;
    }
  },

  // findByPk equivalent
  findByPk: async (id) => {
    try {
      return await entity.get(id);
    } catch (error) {
      console.error('findByPk error:', error);
      return null;
    }
  },

  // create equivalent
  create: async (data) => {
    try {
      return await entity.create(data);
    } catch (error) {
      console.error('create error:', error);
      throw error;
    }
  },

  // update equivalent
  update: async (data, options = {}) => {
    try {
      if (options.where && options.where.id) {
        return await entity.update(options.where.id, data);
      }
      throw new Error('Update requires where.id clause');
    } catch (error) {
      console.error('update error:', error);
      throw error;
    }
  },

  // destroy equivalent
  destroy: async (options = {}) => {
    try {
      if (options.where && options.where.id) {
        return await entity.delete(options.where.id);
      }
      throw new Error('Destroy requires where.id clause');
    } catch (error) {
      console.error('destroy error:', error);
      throw error;
    }
  },

  // count equivalent
  count: async (options = {}) => {
    try {
      const results = options.where 
        ? await entity.filter(options.where)
        : await entity.list();
      return results.length;
    } catch (error) {
      console.error('count error:', error);
      return 0;
    }
  }
});

// ============================================
// ENHANCED ENTITIES (Sequelize-like Interface)
// ============================================

export const enhancedEntities = {
  UserRole: createQueryHelper(UserRole),
  Profile: createQueryHelper(Profile),
  PlatformSetting: createQueryHelper(PlatformSetting),
  SubscriptionPlan: createQueryHelper(SubscriptionPlan),
  UserSubscription: createQueryHelper(UserSubscription),
  Payment: createQueryHelper(Payment),
  Advisor: createQueryHelper(Advisor),
  AdvisorReview: createQueryHelper(AdvisorReview),
  Finfluencer: createQueryHelper(Finfluencer),
  Event: createQueryHelper(Event),
  EventRegistration: createQueryHelper(EventRegistration),
  PledgeSession: createQueryHelper(PledgeSession),
  Pledge: createQueryHelper(Pledge),
  PledgeExecutionRecord: createQueryHelper(PledgeExecutionRecord),
  PledgeAuditLog: createQueryHelper(PledgeAuditLog),
  Poll: createQueryHelper(Poll),
  PollVote: createQueryHelper(PollVote),
  ChatRoom: createQueryHelper(ChatRoom),
  ChatMessage: createQueryHelper(ChatMessage),
  Notification: createQueryHelper(Notification),
  Watchlist: createQueryHelper(Watchlist),
  Portfolio: createQueryHelper(Portfolio),
};