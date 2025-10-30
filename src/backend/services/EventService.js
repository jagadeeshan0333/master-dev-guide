/**
 * ============================================
 * EVENT SERVICE
 * Business logic for event management
 * ============================================
 */

import { enhancedEntities } from '@/api/entities';

class EventService {
  /**
   * Create event
   */
  async createEvent(data) {
    try {
      return await enhancedEntities.Event.create({
        organizer_id: data.organizerId,
        title: data.title,
        description: data.description,
        event_type: data.eventType,
        start_time: data.startTime,
        end_time: data.endTime,
        location: data.location,
        is_online: data.isOnline || false,
        meeting_link: data.meetingLink,
        max_attendees: data.maxAttendees,
        ticket_price: data.ticketPrice || 0,
        currency: data.currency || 'INR',
        status: data.status || 'draft',
        featured: data.featured || false,
        tags: data.tags || [],
        image_url: data.imageUrl
      });
    } catch (error) {
      console.error('EventService.createEvent error:', error);
      throw error;
    }
  }

  /**
   * Get published events
   */
  async getPublishedEvents(filters = {}) {
    try {
      return await enhancedEntities.Event.findAll({
        where: {
          status: 'published',
          ...filters
        },
        limit: filters.limit || 50,
        offset: filters.offset || 0
      });
    } catch (error) {
      console.error('EventService.getPublishedEvents error:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId) {
    try {
      return await enhancedEntities.Event.findByPk(eventId);
    } catch (error) {
      console.error('EventService.getEventById error:', error);
      throw error;
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId, data) {
    try {
      return await enhancedEntities.Event.update(data, {
        where: { id: eventId }
      });
    } catch (error) {
      console.error('EventService.updateEvent error:', error);
      throw error;
    }
  }

  /**
   * Register for event
   */
  async registerForEvent(eventId, userId, paymentId = null) {
    try {
      // Check if already registered
      const existing = await enhancedEntities.EventRegistration.findOne({
        where: { event_id: eventId, user_id: userId }
      });

      if (existing) {
        throw new Error('Already registered for this event');
      }

      // Check capacity
      const event = await this.getEventById(eventId);
      if (event.max_attendees) {
        const registrations = await enhancedEntities.EventRegistration.count({
          where: { event_id: eventId, status: 'registered' }
        });

        if (registrations >= event.max_attendees) {
          throw new Error('Event is full');
        }
      }

      return await enhancedEntities.EventRegistration.create({
        event_id: eventId,
        user_id: userId,
        payment_id: paymentId,
        status: 'registered'
      });
    } catch (error) {
      console.error('EventService.registerForEvent error:', error);
      throw error;
    }
  }

  /**
   * Get user registrations
   */
  async getUserRegistrations(userId) {
    try {
      return await enhancedEntities.EventRegistration.findAll({
        where: { user_id: userId }
      });
    } catch (error) {
      console.error('EventService.getUserRegistrations error:', error);
      throw error;
    }
  }

  /**
   * Get event registrations
   */
  async getEventRegistrations(eventId) {
    try {
      return await enhancedEntities.EventRegistration.findAll({
        where: { event_id: eventId }
      });
    } catch (error) {
      console.error('EventService.getEventRegistrations error:', error);
      throw error;
    }
  }

  /**
   * Check-in attendee
   */
  async checkInAttendee(registrationId) {
    try {
      return await enhancedEntities.EventRegistration.update({
        checked_in: true,
        checked_in_at: new Date().toISOString()
      }, {
        where: { id: registrationId }
      });
    } catch (error) {
      console.error('EventService.checkInAttendee error:', error);
      throw error;
    }
  }

  /**
   * Cancel event
   */
  async cancelEvent(eventId) {
    try {
      return await enhancedEntities.Event.update({
        status: 'cancelled'
      }, {
        where: { id: eventId }
      });
    } catch (error) {
      console.error('EventService.cancelEvent error:', error);
      throw error;
    }
  }
}

export default new EventService();
