/**
 * ============================================
 * BACKEND API INDEX
 * Central export for all backend services
 * ============================================
 * 
 * Usage Examples:
 * 
 * // Import controllers
 * import { UserController, PaymentController } from '@/backend';
 * 
 * // Use in components
 * const result = await UserController.getCurrentUser();
 * const payment = await PaymentController.createOrder(data);
 * 
 * // Import services for complex logic
 * import { UserService, PledgeService } from '@/backend';
 */

// ============================================
// CONTROLLERS (MVC Pattern)
// ============================================

export { default as UserController } from './controllers/UserController';
export { default as PaymentController } from './controllers/PaymentController';
export { default as PledgeController } from './controllers/PledgeController';
export { default as EventController } from './controllers/EventController';
export { default as AdvisorController } from './controllers/AdvisorController';
export { default as PollController } from './controllers/PollController';
export { default as NotificationController } from './controllers/NotificationController';
export { default as SubscriptionController } from './controllers/SubscriptionController';
export { default as ChatController } from './controllers/ChatController';
export { default as PortfolioController } from './controllers/PortfolioController';
export { default as WatchlistController } from './controllers/WatchlistController';

// ============================================
// SERVICES (Business Logic Layer)
// ============================================

export { default as UserService } from './services/UserService';
export { default as PaymentService } from './services/PaymentService';
export { default as PledgeService } from './services/PledgeService';
export { default as EventService } from './services/EventService';
export { default as AdvisorService } from './services/AdvisorService';
export { default as PollService } from './services/PollService';
export { default as NotificationService } from './services/NotificationService';
export { default as SubscriptionService } from './services/SubscriptionService';
export { default as ChatService } from './services/ChatService';
export { default as PortfolioService } from './services/PortfolioService';
export { default as WatchlistService } from './services/WatchlistService';

// ============================================
// ENTITIES (Data Models)
// ============================================

export * from '@/api/entities';

// ============================================
// USAGE GUIDE
// ============================================

/**
 * CONTROLLERS - Use in React components for API-like operations
 * 
 * @example
 * import { UserController } from '@/backend';
 * 
 * const handleLogin = async () => {
 *   const result = await UserController.getCurrentUser();
 *   if (result.success) {
 *     console.log('User:', result.data);
 *   }
 * };
 */

/**
 * SERVICES - Use for complex business logic
 * 
 * @example
 * import { PledgeService } from '@/backend';
 * 
 * const executePledges = async (sessionId) => {
 *   const pledges = await PledgeService.getSessionPledges(sessionId);
 *   for (const pledge of pledges) {
 *     await PledgeService.executePledge(pledge.id);
 *   }
 * };
 */

/**
 * ENTITIES - Direct database access (Sequelize-like)
 * 
 * @example
 * import { enhancedEntities } from '@/backend';
 * 
 * // Find all users
 * const users = await enhancedEntities.Profile.findAll({
 *   where: { email: 'user@example.com' }
 * });
 * 
 * // Create new record
 * const newUser = await enhancedEntities.Profile.create({
 *   email: 'new@example.com',
 *   full_name: 'New User'
 * });
 * 
 * // Update record
 * await enhancedEntities.Profile.update(
 *   { full_name: 'Updated Name' },
 *   { where: { id: userId } }
 * );
 */
