/**
 * ============================================
 * EVENT CONTROLLER
 * Handles event-related operations
 * ============================================
 */

import EventService from '../services/EventService';

class EventController {
  /**
   * Create event
   */
  async createEvent(data) {
    try {
      const event = await EventService.createEvent(data);
      return {
        success: true,
        data: event,
        message: 'Event created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get published events
   */
  async getPublishedEvents(filters = {}) {
    try {
      const events = await EventService.getPublishedEvents(filters);
      return {
        success: true,
        data: events,
        count: events.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId) {
    try {
      const event = await EventService.getEventById(eventId);
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }
      return {
        success: true,
        data: event
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId, data) {
    try {
      const event = await EventService.updateEvent(eventId, data);
      return {
        success: true,
        data: event,
        message: 'Event updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register for event
   */
  async registerForEvent(eventId, userId, paymentId = null) {
    try {
      const registration = await EventService.registerForEvent(eventId, userId, paymentId);
      return {
        success: true,
        data: registration,
        message: 'Registered successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user registrations
   */
  async getUserRegistrations(userId) {
    try {
      const registrations = await EventService.getUserRegistrations(userId);
      return {
        success: true,
        data: registrations,
        count: registrations.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get event registrations
   */
  async getEventRegistrations(eventId) {
    try {
      const registrations = await EventService.getEventRegistrations(eventId);
      return {
        success: true,
        data: registrations,
        count: registrations.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check-in attendee
   */
  async checkInAttendee(registrationId) {
    try {
      await EventService.checkInAttendee(registrationId);
      return {
        success: true,
        message: 'Attendee checked in successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel event
   */
  async cancelEvent(eventId) {
    try {
      await EventService.cancelEvent(eventId);
      return {
        success: true,
        message: 'Event cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new EventController();
