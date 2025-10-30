-- ============================================
-- COMPLETE PROTOCOL BACKEND DATABASE SCHEMA
-- PostgreSQL Implementation
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'admin', 
  'fund_manager',
  'investor',
  'advisor',
  'finfluencer',
  'organizer',
  'vendor',
  'user'
);

CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.pledge_status AS ENUM ('pending', 'paid', 'executed', 'cancelled');
CREATE TYPE public.poll_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'profit', 'fee', 'refund');
CREATE TYPE public.notification_type AS ENUM ('system', 'payment', 'event', 'pledge', 'poll', 'message');

-- ============================================
-- CORE USER TABLES
-- ============================================

-- User Roles Table (Security Critical)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer Function for Role Checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PLATFORM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify platform settings"
  ON public.platform_settings FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- SUBSCRIPTION SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier subscription_tier NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  billing_cycle TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- PAYMENT SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  gateway TEXT DEFAULT 'razorpay',
  gateway_payment_id TEXT,
  gateway_order_id TEXT,
  status payment_status DEFAULT 'pending',
  payment_type TEXT,
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- ADVISOR SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  specialization TEXT[],
  experience_years INTEGER,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  certifications JSONB DEFAULT '[]',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active advisors"
  ON public.advisors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Advisors can update their own profile"
  ON public.advisors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.advisor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.advisor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON public.advisor_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.advisor_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FINFLUENCER SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.finfluencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id),
  channel_name TEXT NOT NULL,
  platform TEXT,
  followers_count INTEGER DEFAULT 0,
  content_categories TEXT[],
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  commission_rate DECIMAL(5,2) DEFAULT 2.0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.finfluencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active finfluencers"
  ON public.finfluencers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Finfluencers can update their own profile"
  ON public.finfluencers FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- EVENTS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT false,
  meeting_link TEXT,
  max_attendees INTEGER,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status event_status DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status = 'published' OR auth.uid() = organizer_id);

CREATE POLICY "Organizers can manage their events"
  ON public.events FOR ALL
  USING (auth.uid() = organizer_id);

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES public.payments(id),
  status TEXT DEFAULT 'registered',
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view their event registrations"
  ON public.event_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_registrations.event_id 
    AND events.organizer_id = auth.uid()
  ));

-- ============================================
-- PLEDGE SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.pledge_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stock_symbol TEXT NOT NULL,
  target_price DECIMAL(10,2),
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE NOT NULL,
  execution_rule TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'draft',
  total_pledged DECIMAL(15,2) DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pledge_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sessions"
  ON public.pledge_sessions FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Admins can manage sessions"
  ON public.pledge_sessions FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.pledge_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  demat_account_id UUID,
  stock_symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')),
  qty INTEGER NOT NULL CHECK (qty > 0),
  price_target DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  status pledge_status DEFAULT 'pending',
  payment_id UUID REFERENCES public.payments(id),
  consent_signed BOOLEAN DEFAULT false,
  risk_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pledges"
  ON public.pledges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create pledges"
  ON public.pledges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all pledges"
  ON public.pledges FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pledge_execution_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pledge_id UUID REFERENCES public.pledges(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.pledge_sessions(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  demat_account_id UUID,
  stock_symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')),
  pledged_qty INTEGER NOT NULL,
  executed_qty INTEGER NOT NULL,
  executed_price DECIMAL(10,2) NOT NULL,
  total_execution_value DECIMAL(15,2) NOT NULL,
  platform_commission DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 2.0,
  status TEXT DEFAULT 'completed',
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pledge_execution_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own execution records"
  ON public.pledge_execution_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all execution records"
  ON public.pledge_execution_records FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.pledge_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_pledge_id UUID REFERENCES public.pledges(id),
  target_session_id UUID REFERENCES public.pledge_sessions(id),
  payload_json JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pledge_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON public.pledge_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- POLLS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  poll_type TEXT DEFAULT 'stock_prediction',
  stock_symbol TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  status poll_status DEFAULT 'draft',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active polls"
  ON public.polls FOR SELECT
  USING (status = 'active' OR auth.uid() = created_by);

CREATE POLICY "Users can create polls"
  ON public.polls FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage all polls"
  ON public.polls FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view poll votes"
  ON public.poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on polls"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CHAT SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id),
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage chat rooms"
  ON public.chat_rooms FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.chat_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read messages in active rooms"
  ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE chat_rooms.id = chat_messages.room_id 
    AND chat_rooms.is_active = true
  ) AND is_deleted = false);

CREATE POLICY "Users can create messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'system',
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- WATCHLIST & PORTFOLIO
-- ============================================

CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_symbol TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, stock_symbol)
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist"
  ON public.watchlists FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_symbol TEXT NOT NULL,
  qty INTEGER NOT NULL,
  avg_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_symbol)
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own portfolio"
  ON public.portfolios FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_advisors_updated_at
  BEFORE UPDATE ON public.advisors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_finfluencers_updated_at
  BEFORE UPDATE ON public.finfluencers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pledge_sessions_updated_at
  BEFORE UPDATE ON public.pledge_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pledges_updated_at
  BEFORE UPDATE ON public.pledges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_pledges_user_id ON public.pledges(user_id);
CREATE INDEX idx_pledges_session_id ON public.pledges(session_id);
CREATE INDEX idx_pledges_status ON public.pledges(status);
CREATE INDEX idx_polls_status ON public.polls(status);
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);