-- ==============================================================================
-- NexaAI Seed Data - Default Subscription Plans
-- ==============================================================================

INSERT INTO public.plans (
  id,
  name,
  description,
  price_monthly,
  price_annual,
  currency,
  monthly_usage_limit,
  enabled_tools,
  active,
  stripe_monthly_price_id,
  stripe_annual_price_id
) VALUES
(
  'free',
  'Free Starter',
  'Essential AI tools to explore generative content and boost daily productivity.',
  0.00,
  0.00,
  'usd',
  25,
  '["writer", "summarizer", "ideas"]'::jsonb,
  true,
  NULL,
  NULL
),
(
  'pro',
  'Pro Creator',
  'Higher usage limits, full tool suite, advanced tone adjustments, and priority speeds.',
  19.00,
  180.00,
  'usd',
  500,
  '["writer", "chat", "summarizer", "ideas", "rewriter"]'::jsonb,
  true,
  'price_pro_monthly_id',
  'price_pro_annual_id'
),
(
  'business',
  'Business Suite',
  'High-volume generations, team workspaces, custom prompt presets, and dedicated support.',
  49.00,
  468.00,
  'usd',
  2500,
  '["writer", "chat", "summarizer", "ideas", "rewriter"]'::jsonb,
  true,
  'price_biz_monthly_id',
  'price_biz_annual_id'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  monthly_usage_limit = EXCLUDED.monthly_usage_limit,
  enabled_tools = EXCLUDED.enabled_tools;
