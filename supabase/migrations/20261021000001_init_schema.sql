-- ==============================================================================
-- NexaAI PostgreSQL Schema Migration
-- Complete schema with Row Level Security (RLS), Triggers, Functions & Indexes
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: profiles (Users public profile linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Table: plans (Subscription tiers and limits)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_annual NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'usd',
    monthly_usage_limit INTEGER NOT NULL DEFAULT 20,
    enabled_tools JSONB NOT NULL DEFAULT '["writer", "summarizer", "ideas"]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT true,
    stripe_monthly_price_id TEXT,
    stripe_annual_price_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Table: subscriptions (User billing status synchronized via Stripe webhooks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_customer_id TEXT,
    provider_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL REFERENCES public.plans(id) DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- ------------------------------------------------------------------------------
-- 4. Table: generations (Saved outputs for AI Writer, Chat, Summarizer, etc.)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL CHECK (tool_type IN ('writer', 'chat', 'summarizer', 'ideas', 'rewriter')),
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    output TEXT NOT NULL,
    token_usage INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'in_progress')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Table: usage_events (Fine-grained usage logging and monthly quota metrics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL,
    usage_quantity INTEGER NOT NULL DEFAULT 1,
    generation_id UUID REFERENCES public.generations(id) ON DELETE SET NULL,
    billing_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Table: contact_submissions (Inquiries sent via contact form)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. Table: webhook_events (Idempotency storage for Stripe/provider webhooks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL DEFAULT 'stripe',
    provider_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processed', 'failed', 'ignored')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 8. Table: admin_audit_logs (Security log of sensitive admin operations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_tool_type ON public.generations(tool_type);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON public.usage_events(user_id, billing_period_start);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub ON public.subscriptions(provider_subscription_id);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_webhook_provider_event ON public.webhook_events(provider_event_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is current authenticated user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self-privilege escalation

-- Plans Policies: Everyone can read active plans
CREATE POLICY "Plans are viewable by everyone"
    ON public.plans FOR SELECT
    USING (active = true OR public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Generations Policies: Strictly private to user
CREATE POLICY "Users can view own generations"
    ON public.generations FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own generations"
    ON public.generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
    ON public.generations FOR DELETE
    USING (auth.uid() = user_id);

-- Usage Events Policies
CREATE POLICY "Users can view own usage"
    ON public.usage_events FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- Admin-Only Tables Policies
CREATE POLICY "Only admins can view contact submissions"
    ON public.contact_submissions FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Anyone can submit contact form"
    ON public.contact_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Only admins can update contact submissions"
    ON public.contact_submissions FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Only admins can view webhook events"
    ON public.webhook_events FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Only admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- Trigger: Auto-create Profile & Free Subscription on user signup
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || split_part(NEW.email, '@', 1)),
    'user'
  );

  -- Initialize Free Subscription
  INSERT INTO public.subscriptions (user_id, plan_id, status, billing_interval, current_period_start, current_period_end)
  VALUES (
    NEW.id,
    'free',
    'active',
    'month',
    NOW(),
    NOW() + INTERVAL '1 month'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger hook on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- Atomic Quota Verification Function
-- Returns allowed (boolean), current_used (integer), monthly_limit (integer)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_reserve_quota(p_user_id UUID, p_tool_type TEXT)
RETURNS TABLE (
  allowed BOOLEAN,
  current_usage INTEGER,
  max_limit INTEGER,
  plan_tier TEXT
) AS $$
DECLARE
  v_plan_id TEXT;
  v_limit INTEGER;
  v_period_start TIMESTAMPTZ;
  v_count INTEGER;
  v_enabled_tools JSONB;
BEGIN
  -- 1. Fetch user's subscription and current period
  SELECT s.plan_id, s.current_period_start, p.monthly_usage_limit, p.enabled_tools
  INTO v_plan_id, v_period_start, v_limit, v_enabled_tools
  FROM public.subscriptions s
  JOIN public.plans p ON s.plan_id = p.id
  WHERE s.user_id = p_user_id AND s.status IN ('active', 'trialing');

  -- Default to free plan if none found
  IF NOT FOUND THEN
    SELECT id, monthly_usage_limit, enabled_tools
    INTO v_plan_id, v_limit, v_enabled_tools
    FROM public.plans WHERE id = 'free';
    v_period_start := DATE_TRUNC('month', NOW());
  END IF;

  -- 2. Verify tool permission in plan
  IF NOT (v_enabled_tools ? p_tool_type) THEN
    RETURN QUERY SELECT false, 0, v_limit, v_plan_id;
    RETURN;
  END IF;

  -- 3. Calculate current usage in period
  SELECT COALESCE(SUM(usage_quantity), 0)
  INTO v_count
  FROM public.usage_events
  WHERE user_id = p_user_id AND created_at >= v_period_start;

  -- 4. Check limit
  IF v_count >= v_limit THEN
    RETURN QUERY SELECT false, v_count, v_limit, v_plan_id;
  ELSE
    RETURN QUERY SELECT true, v_count, v_limit, v_plan_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
