
import React, { useState, useEffect, useMemo } from 'react';
import { Event, EventTicket, EventAttendee, User, Subscription } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Plus,
  Search,
  Crown,
  List,
  Grid,
  Inbox,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

import EventCard from '../components/events/EventCard';
import EventDetailsModal from '../components/events/EventDetailsModal';
import TicketPurchaseModal from '../components/events/TicketPurchaseModal';
import CreateEventModal from '../components/events/CreateEventModal';
import FeaturedEventsSection from '../components/events/FeaturedEventsSection';
import EventCalendarView from '../components/events/EventCalendarView';
import { useEventAutomation } from '../components/events/EventAutomation';

// Sample events for guest mode or when API fails
const sampleEvents = [
  {
    id: 'sample-1',
    title: 'Intro to Stock Trading',
    description: 'Learn the basics of stock trading, market analysis, and risk management from industry experts.',
    event_date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    event_time: '10:00 AM',
    location: 'Online Webinar',
    organizer_name: 'Trading Academy',
    image_url: 'https://images.unsplash.com/photo-1621379761921-2321528430b3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    is_premium: false,
    ticket_price: 0,
    status: 'scheduled',
    is_featured: true,
  },
  {
    id: 'sample-2',
    title: 'Advanced Options Strategies',
    description: 'Master complex options strategies for income generation and hedging in volatile markets.',
    event_date: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
    event_time: '02:00 PM',
    location: 'Virtual Classroom',
    organizer_name: 'Elite Traders',
    image_url: 'https://images.unsplash.com/photo-1579621970795-87facc2f939d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    is_premium: true,
    ticket_price: 99.99,
    status: 'scheduled',
    is_featured: true,
  },
  {
    id: 'sample-3',
    title: 'Crypto Market Outlook 2024',
    description: 'An in-depth analysis of cryptocurrency trends and predictions for the year ahead.',
    event_date: new Date(Date.now() + 86400000 * 21).toISOString(), // 21 days from now
    event_time: '06:00 PM',
    location: 'Zoom Webinar',
    organizer_name: 'Blockchain Insights',
    image_url: 'https://images.unsplash.com/photo-1640340434855-6b6012720ba7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    is_premium: false,
    ticket_price: 0,
    status: 'scheduled',
    is_featured: false,
  },
  {
    id: 'sample-4',
    title: 'Forex Trading for Beginners',
    description: 'Get started in the foreign exchange market with essential concepts and strategies for success.',
    event_date: new Date(Date.now() + 86400000 * 28).toISOString(), // 28 days from now
    event_time: '09:00 AM',
    location: 'Online Course',
    organizer_name: 'Forex Gurus',
    image_url: 'https://images.unsplash.com/photo-1621379761921-2321528430b3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    is_premium: true,
    ticket_price: 49.99,
    status: 'scheduled',
    is_featured: false,
  },
  {
    id: 'sample-5',
    title: 'Financial Planning Workshop',
    description: 'Plan your financial future with expert advice on investments, savings, and retirement.',
    event_date: new Date(Date.now() + 86400000 * 35).toISOString(), // 35 days from now
    event_time: '01:00 PM',
    location: 'Community Center',
    organizer_name: 'Wealth Builders',
    image_url: 'https://images.unsplash.com/photo-1579621970795-87facc2f939d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    is_premium: false,
    ticket_price: 0,
    status: 'scheduled',
    is_featured: false,
  },
  {
    id: 'sample-6',
    title: 'Real Estate Investment Summit',
    description: 'Discover lucrative opportunities and strategies in the real estate market with top investors.',
    event_date: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago (past event)
    event_time: '09:00 AM',
    location: 'Convention Hall',
    organizer_name: 'Property Pros',
    image_url: 'https://images.unsplash.com/photo-1640340434855-6b6012720ba7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    is_premium: false,
    ticket_price: 0,
    status: 'completed',
    is_featured: false,
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [userTickets, setUserTickets] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [user, setUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false); // New state to track premium subscription access
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showTicketPurchase, setShowTicketPurchase] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('upcoming');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');

  // Enable event automation (auto-status updates, reminders, payouts)
  useEventAutomation();

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const loadData = async () => {
      try {
        // Try to get user, but allow null for guests
        const currentUser = await User.me().catch(() => null);
        
        if (!isMounted || abortController.signal.aborted) return;
        
        setUser(currentUser);

        // Load events with error handling
        const loadedEvents = await Event.filter({ 
          status: { $in: ['approved', 'scheduled'] } 
        }, '-event_date', 50).catch(() => []);
        
        if (!isMounted || abortController.signal.aborted) return;

        if (loadedEvents.length > 0) {
          setEvents(loadedEvents);
        } else {
          // Use sample data if no events loaded
          setEvents(sampleEvents);
        }

        // Only load user-specific data if user is logged in
        if (currentUser?.id) {
          const [ticketsData, attendanceData, subscriptionData] = await Promise.all([
            EventTicket.filter({ user_id: currentUser.id }).catch(() => []),
            EventAttendee.filter({ user_id: currentUser.id }).catch(() => []),
            Subscription.filter({ user_id: currentUser.id, status: 'active' }).catch(() => [])
          ]);

          if (!isMounted || abortController.signal.aborted) return;

          setUserTickets(ticketsData);
          setUserAttendance(attendanceData);
          const activeSub = subscriptionData[0] || null;
          setUserSubscription(activeSub);

          // Determine if user has a premium-level subscription
          const userHasPremiumSub = activeSub && ['premium', 'vip'].includes(activeSub.plan_type);
          setHasSubscription(userHasPremiumSub); 
        } else {
          // Reset user-specific states if no user
          setUserTickets([]);
          setUserAttendance([]);
          setUserSubscription(null);
          setHasSubscription(false);
        }

        // Admins and Super Admins always have access to premium features
        if (currentUser && ['admin', 'super_admin'].includes(currentUser.app_role)) {
          setHasSubscription(true);
        }

      } catch (error) {
        if (!isMounted || abortController.signal.aborted) return;
        console.error("Error loading all data:", error); 
        console.log("Attempting to load events in guest mode with sample data due to error.");
        
        // Ensure state is clean and falls back to sample data in case of error
        setEvents(sampleEvents);
        setUser(null);
        setUserTickets([]);
        setUserAttendance([]);
        setUserSubscription(null);
        setHasSubscription(false);
        toast.error('Failed to load events data. Displaying sample data.');
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const isPremiumUser = useMemo(() => hasSubscription, [hasSubscription]);

  const isAdminUser = useMemo(() => {
    return user && ['admin', 'super_admin', 'events_manager'].includes(user.app_role);
  }, [user]);

  // Featured events (approved events marked as featured)
  const featuredEvents = useMemo(() => {
    return events.filter(event => 
      event.is_featured && 
      ['approved', 'scheduled'].includes(event.status) &&
      new Date(event.event_date) > new Date()
    ).slice(0, 6); // Show top 6 featured events
  }, [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => ['approved', 'scheduled'].includes(event.status));

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by event type (Free/Premium)
    if (eventTypeFilter !== 'all') {
      if (eventTypeFilter === 'free') {
        filtered = filtered.filter(event => !event.is_premium || (event.ticket_price || 0) === 0);
      } else if (eventTypeFilter === 'premium') {
        filtered = filtered.filter(event => event.is_premium && (event.ticket_price || 0) > 0);
      }
    }

    // Filter by status
    const now = new Date();
    switch (statusFilter) {
      case 'upcoming':
        filtered = filtered.filter(event => 
          new Date(event.event_date) > now && 
          ['approved', 'scheduled'].includes(event.status)
        );
        break;
      case 'past':
        filtered = filtered.filter(event => 
          new Date(event.event_date) < now ||
          event.status === 'completed'
        );
        break;
      case 'my-events':
        if (user?.id) {
          const myTicketEventIds = userTickets.map(ticket => ticket.event_id);
          const myAttendanceEventIds = userAttendance.map(attendance => attendance.event_id);
          const myEventIds = [...new Set([...myTicketEventIds, ...myAttendanceEventIds])];
          filtered = filtered.filter(event => myEventIds.includes(event.id));
        } else {
          filtered = []; // No user, no 'my events'
        }
        break;
      default:
        filtered = filtered.filter(event => ['approved', 'scheduled'].includes(event.status));
    }

    return filtered;
  }, [events, searchTerm, statusFilter, eventTypeFilter, userTickets, userAttendance, user]);

  const getEventAccess = (event) => {
    // Free events - everyone can access
    if (!event.is_premium || (event.ticket_price || 0) === 0) {
      return { canAccess: true, reason: 'free' };
    }

    // Premium events
    if (isPremiumUser) {
      return { canAccess: true, reason: 'premium_subscription' };
    }

    // Check if user has purchased ticket for this specific event
    const userTicket = userTickets.find(ticket => 
      ticket.event_id === event.id && ticket.status === 'active'
    );
    if (userTicket) {
      return { canAccess: true, reason: 'ticket_purchased' };
    }

    // Premium event - user needs upgrade or ticket
    if ((event.ticket_price || 0) > 0) {
      return { canAccess: false, reason: 'needs_ticket' };
    } else {
      return { canAccess: false, reason: 'needs_premium' };
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleTicketPurchase = (event) => {
    // Require login to purchase tickets
    if (!user) {
      toast.error("Please log in to purchase tickets.");
      return;
    }
    setSelectedEvent(event);
    setShowTicketPurchase(true);
  };

  const handleUpgradePremium = () => {
    window.location.href = createPageUrl('Subscription');
  };

  const handleCreateEvent = () => {
    // Require login for creating events
    if (!user) {
      toast.error('Please login to create an event');
      setShowCreateEvent(false); // Close modal if attempt to create without login
      return;
    }
    setShowCreateEvent(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Trading Events</h1>
              <p className="text-blue-100 text-lg">
                Join exclusive workshops, webinars, and trading sessions from market experts
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Button 
                onClick={handleCreateEvent}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Events Section - FIXED: Pass userTickets prop */}
        <FeaturedEventsSection 
          featuredEvents={featuredEvents}
          user={user}
          userAttendance={userAttendance}
          userTickets={userTickets}
          onViewDetails={handleViewDetails}
          onTicketPurchase={handleTicketPurchase}
          onUpgradePremium={handleUpgradePremium}
        />

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search events by title, organizer, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          {/* Event Type Filter */}
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-[180px] h-12">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="free">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Free Events
                </div>
              </SelectItem>
              <SelectItem value="premium">
                <div className="flex items-center gap-2">
                  <Crown className="w-3 h-3 text-purple-600" />
                  Premium Events
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle - UPDATED WITH GRADIENT DESIGN */}
          <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`
                flex items-center gap-2 rounded-lg px-4 h-10 font-semibold transition-all duration-300
                ${viewMode === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:from-blue-600 hover:to-purple-700 hover:shadow-lg' 
                  : 'bg-transparent text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                }
              `}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </Button>
            
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={`
                flex items-center gap-2 rounded-lg px-4 h-10 font-semibold transition-all duration-300
                ${viewMode === 'calendar' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:from-blue-600 hover:to-purple-700 hover:shadow-lg' 
                  : 'bg-transparent text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700'
                }
              `}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'calendar' ? (
          <EventCalendarView 
            events={filteredEvents}
            user={user}
            onViewDetails={handleViewDetails}
            onTicketPurchase={handleTicketPurchase}
            onUpgradePremium={handleUpgradePremium}
          />
        ) : (
          <>
            {/* Tabs for List View */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-8 events-nav-tabs">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
                <TabsTrigger value="my-events">My Events</TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter} className="mt-6">
                {filteredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                      <EventCard
                        key={`${event.id}-${userTickets.length}`}
                        event={event}
                        user={user}
                        userAccess={getEventAccess(event)}
                        userTickets={userTickets}
                        onViewDetails={handleViewDetails}
                        onTicketPurchase={handleTicketPurchase}
                        onUpgradePremium={handleUpgradePremium}
                        onUpdate={loadData}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {statusFilter === 'my-events' ? 'No events in your calendar' : 
                         statusFilter === 'past' ? 'No past events' : 'No upcoming events'}
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {statusFilter === 'my-events' 
                          ? 'RSVP to events to see them here'
                          : 'New events will appear here when they are created'
                        }
                      </p>
                      {statusFilter === 'upcoming' && (
                        <Button onClick={handleCreateEvent}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Event
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Premium Upgrade Banner - UPDATED: Hide for premium users and admins */}
        {!isPremiumUser && (
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Unlock Premium Events</h3>
                  <p className="text-purple-100">
                    Upgrade to <strong>Premium Plan</strong> to get access to exclusive trading workshops, masterclasses, and premium content from top advisors.
                  </p>
                </div>
                <Button 
                  onClick={handleUpgradePremium}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      {showEventDetails && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          user={user}
          userAccess={getEventAccess(selectedEvent)}
          onClose={() => setShowEventDetails(false)}
          onTicketPurchase={handleTicketPurchase}
          onUpgradePremium={handleUpgradePremium}
          onUpdate={loadData}
        />
      )}

      {showTicketPurchase && selectedEvent && (
        <TicketPurchaseModal
          event={selectedEvent}
          user={user}
          onClose={() => setShowTicketPurchase(false)}
          onSuccess={loadData}
        />
      )}

      {showCreateEvent && (
        <CreateEventModal
          user={user}
          onClose={() => setShowCreateEvent(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
