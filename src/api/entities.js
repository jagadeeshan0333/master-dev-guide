import { base44 } from './base44Client';

/**
 * ============================================
 * COMPLETE BACKEND ENTITIES (Models Layer)
 * PostgreSQL Implementation via Base44 SDK
 * ============================================
 * 
 * This provides a Sequelize-like ORM interface
 * for all database tables using Base44
 */

// ============================================
// EXISTING ENTITIES (Base44 Managed)
// ============================================

export const Stock = base44.entities.Stock;
export const ChatRoom = base44.entities.ChatRoom;
export const Message = base44.entities.Message;
export const Poll = base44.entities.Poll;
export const PollVote = base44.entities.PollVote;
export const Subscription = base44.entities.Subscription;
export const Pledge = base44.entities.Pledge;
export const FinInfluencer = base44.entities.FinInfluencer;
export const InfluencerPost = base44.entities.InfluencerPost;
export const News = base44.entities.News;
export const Meeting = base44.entities.Meeting;
export const StockPrice = base44.entities.StockPrice;
export const ChatPoll = base44.entities.ChatPoll;
export const ChatPollVote = base44.entities.ChatPollVote;
export const Event = base44.entities.Event;
export const EventAttendee = base44.entities.EventAttendee;
export const TrustScoreLog = base44.entities.TrustScoreLog;
export const ModerationLog = base44.entities.ModerationLog;
export const Referral = base44.entities.Referral;
export const ReferralBadge = base44.entities.ReferralBadge;
export const ContactInquiry = base44.entities.ContactInquiry;
export const Notification = base44.entities.Notification;
export const NotificationSetting = base44.entities.NotificationSetting;
export const Course = base44.entities.Course;
export const CourseEnrollment = base44.entities.CourseEnrollment;
export const RevenueTransaction = base44.entities.RevenueTransaction;
export const Advisor = base44.entities.Advisor;
export const AdvisorPlan = base44.entities.AdvisorPlan;
export const AdvisorSubscription = base44.entities.AdvisorSubscription;
export const AdvisorPost = base44.entities.AdvisorPost;
export const CommissionTracking = base44.entities.CommissionTracking;
export const PlatformSetting = base44.entities.PlatformSetting;
export const AdvisorReview = base44.entities.AdvisorReview;
export const Watchlist = base44.entities.Watchlist;
export const UserInvestment = base44.entities.UserInvestment;
export const AlertSetting = base44.entities.AlertSetting;
export const StockTransaction = base44.entities.StockTransaction;
export const Feedback = base44.entities.Feedback;
export const Expense = base44.entities.Expense;
export const FinancialAuditLog = base44.entities.FinancialAuditLog;
export const Role = base44.entities.Role;
export const AlertConfiguration = base44.entities.AlertConfiguration;
export const AlertLog = base44.entities.AlertLog;
export const SubscriptionPlan = base44.entities.SubscriptionPlan;
export const PromoCode = base44.entities.PromoCode;
export const SubscriptionTransaction = base44.entities.SubscriptionTransaction;
export const EntityConfig = base44.entities.EntityConfig;
export const Educator = base44.entities.Educator;
export const Permission = base44.entities.Permission;
export const RolePermission = base44.entities.RolePermission;
export const AuditLog = base44.entities.AuditLog;
export const RoleTemplate = base44.entities.RoleTemplate;
export const RoleTemplatePermission = base44.entities.RoleTemplatePermission;
export const PayoutRequest = base44.entities.PayoutRequest;
export const AdvisorRecommendation = base44.entities.AdvisorRecommendation;
export const UserInvite = base44.entities.UserInvite;
export const EventTicket = base44.entities.EventTicket;
export const EventCommissionTracking = base44.entities.EventCommissionTracking;
export const CommissionSettings = base44.entities.CommissionSettings;
export const PledgeSession = base44.entities.PledgeSession;
export const UserDematAccount = base44.entities.UserDematAccount;
export const PledgePayment = base44.entities.PledgePayment;
export const PledgeExecutionRecord = base44.entities.PledgeExecutionRecord;
export const PledgeAuditLog = base44.entities.PledgeAuditLog;
export const PledgeAccessRequest = base44.entities.PledgeAccessRequest;
export const Vendor = base44.entities.Vendor;
export const AdCampaign = base44.entities.AdCampaign;
export const AdImpression = base44.entities.AdImpression;
export const AdClick = base44.entities.AdClick;
export const AdTransaction = base44.entities.AdTransaction;
export const CampaignBilling = base44.entities.CampaignBilling;
export const FundPlan = base44.entities.FundPlan;
export const InvestorRequest = base44.entities.InvestorRequest;
export const Investor = base44.entities.Investor;
export const FundWallet = base44.entities.FundWallet;
export const FundAllocation = base44.entities.FundAllocation;
export const FundTransaction = base44.entities.FundTransaction;
export const FundInvoice = base44.entities.FundInvoice;
export const FundPayoutRequest = base44.entities.FundPayoutRequest;
export const FundAdmin = base44.entities.FundAdmin;
export const FundNotification = base44.entities.FundNotification;
export const FundWithdrawalRequest = base44.entities.FundWithdrawalRequest;
export const InvestmentRequest = base44.entities.InvestmentRequest;
export const InvestmentAllocation = base44.entities.InvestmentAllocation;
export const ProfitPayoutSchedule = base44.entities.ProfitPayoutSchedule;
export const InvestorProfitPayout = base44.entities.InvestorProfitPayout;
export const FeatureConfig = base44.entities.FeatureConfig;
export const ModuleApprovalRequest = base44.entities.ModuleApprovalRequest;
export const Review = base44.entities.Review;
export const EventOrganizer = base44.entities.EventOrganizer;
export const RefundRequest = base44.entities.RefundRequest;
export const PledgeOrder = base44.entities.PledgeOrder;
export const MessageReaction = base44.entities.MessageReaction;
export const TypingIndicator = base44.entities.TypingIndicator;
export const Ticket = base44.entities.Ticket;

// ============================================
// NEW SUPABASE ENTITIES (From Migration)
// ============================================

export const UserRole = base44.entity('user_roles');
export const Profile = base44.entity('profiles');
export const UserSubscription = base44.entity('user_subscriptions');
export const Payment = base44.entity('payments');
export const Finfluencer = base44.entity('finfluencers');
export const EventRegistration = base44.entity('event_registrations');
export const ChatMessage = base44.entity('chat_messages');
export const Portfolio = base44.entity('portfolios');

// ============================================
// USER ENTITY (Auth System)
// ============================================

export const User = {
  // Get current authenticated user
  me: async () => {
    try {
      const response = await base44.auth.me();
      return response;
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