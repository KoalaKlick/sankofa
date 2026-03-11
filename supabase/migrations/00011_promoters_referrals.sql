-- Migration: Promoter & Referral System
-- Description: Tables for promoter referrals and commission tracking

-- ===========================================
-- ENUMS
-- ===========================================

-- Promoter status
CREATE TYPE promoter_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- Referral status
CREATE TYPE referral_status AS ENUM ('pending', 'verified', 'converted', 'expired', 'invalid');

-- Commission status
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'rejected', 'cancelled');

-- Commission type
CREATE TYPE commission_type AS ENUM (
  'signup',           -- Bonus for referred user signup
  'ticket_purchase',  -- Commission on ticket sales
  'vote_purchase',    -- Commission on vote purchases
  'subscription',     -- Recurring subscription commissions
  'bonus'             -- Special bonuses
);

-- ===========================================
-- PROMOTERS TABLE
-- ===========================================

CREATE TABLE public.promoters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Promoter identification
  referral_code   TEXT UNIQUE NOT NULL,           -- Unique code for sharing (e.g., "JOHN2026")
  
  -- Status
  status          promoter_status DEFAULT 'pending',
  
  -- Commission settings (can be customized per promoter)
  commission_rate DECIMAL(5,2) DEFAULT 5.00,      -- Default 5% commission rate
  
  -- Tier system
  tier            INTEGER DEFAULT 1,              -- Promoter tier level (1-5)
  
  -- Statistics (denormalized for performance)
  total_referrals      INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  total_earnings       DECIMAL(15,2) DEFAULT 0,
  pending_earnings     DECIMAL(15,2) DEFAULT 0,
  
  -- Contact & verification
  phone_number    TEXT,
  bank_name       TEXT,
  bank_account_number TEXT,
  bank_account_name   TEXT,
  
  -- Timestamps
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_promoters_user ON public.promoters(user_id);
CREATE INDEX idx_promoters_code ON public.promoters(referral_code);
CREATE INDEX idx_promoters_status ON public.promoters(status);

-- Unique constraint: one promoter profile per user
CREATE UNIQUE INDEX idx_promoters_user_unique ON public.promoters(user_id);

-- Enable RLS
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_promoters_updated_at
  BEFORE UPDATE ON public.promoters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- REFERRALS TABLE (tracks who referred whom)
-- ===========================================

CREATE TABLE public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The promoter who referred
  promoter_id     UUID NOT NULL REFERENCES public.promoters(id) ON DELETE CASCADE,
  
  -- The user who was referred (NULL if not yet signed up)
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Tracking info (for anonymous tracking before signup)
  referred_email  TEXT,                           -- Email if known before signup
  referral_code_used TEXT NOT NULL,               -- The code they used
  
  -- Status
  status          referral_status DEFAULT 'pending',
  
  -- Attribution tracking
  source          TEXT,                           -- Where they came from (e.g., 'instagram', 'twitter', 'direct')
  campaign        TEXT,                           -- Campaign identifier if any
  landing_page    TEXT,                           -- Which page they landed on
  
  -- IP tracking (for fraud prevention)
  ip_address      INET,
  user_agent      TEXT,
  
  -- Conversion tracking
  converted_at    TIMESTAMPTZ,                    -- When they completed signup
  first_purchase_at TIMESTAMPTZ,                  -- When they made first purchase
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referrals_promoter ON public.referrals(promoter_id);
CREATE INDEX idx_referrals_user ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code_used);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- COMMISSIONS TABLE (tracks earnings)
-- ===========================================

CREATE TABLE public.commissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who earns this commission
  promoter_id     UUID NOT NULL REFERENCES public.promoters(id) ON DELETE CASCADE,
  
  -- Related referral (optional, not all commissions are from referrals)
  referral_id     UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  
  -- Commission details
  type            commission_type NOT NULL,
  status          commission_status DEFAULT 'pending',
  
  -- Money
  amount          DECIMAL(15,2) NOT NULL,
  currency        TEXT DEFAULT 'NGN',
  
  -- What triggered this commission
  source_type     TEXT,                           -- 'ticket_order', 'vote', 'subscription'
  source_id       UUID,                           -- ID of the triggering entity
  
  -- Calculation details
  base_amount     DECIMAL(15,2),                  -- The amount the commission was calculated from
  commission_rate DECIMAL(5,2),                   -- Rate used (stored for historical accuracy)
  
  -- Description
  description     TEXT,
  
  -- Processing
  processed_at    TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  payment_reference TEXT,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_commissions_promoter ON public.commissions(promoter_id);
CREATE INDEX idx_commissions_referral ON public.commissions(referral_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);
CREATE INDEX idx_commissions_type ON public.commissions(type);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- PROMOTER TIERS TABLE (optional: tier configuration)
-- ===========================================

CREATE TABLE public.promoter_tiers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tier info
  tier_level      INTEGER UNIQUE NOT NULL,        -- 1, 2, 3, 4, 5
  name            TEXT NOT NULL,                  -- 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'
  
  -- Requirements to reach this tier
  min_referrals   INTEGER DEFAULT 0,              -- Minimum successful referrals
  min_earnings    DECIMAL(15,2) DEFAULT 0,        -- Minimum total earnings
  
  -- Benefits
  commission_rate DECIMAL(5,2) NOT NULL,          -- Commission rate for this tier
  bonus_rate      DECIMAL(5,2) DEFAULT 0,         -- Additional bonus rate
  
  -- Description
  description     TEXT,
  perks           JSONB,                          -- Additional perks as JSON
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO public.promoter_tiers (tier_level, name, min_referrals, min_earnings, commission_rate, bonus_rate, description) VALUES
  (1, 'Bronze', 0, 0, 5.00, 0, 'Starting tier for all promoters'),
  (2, 'Silver', 10, 50000, 7.00, 1.00, 'Reached after 10 successful referrals'),
  (3, 'Gold', 50, 250000, 10.00, 2.00, 'Experienced promoter tier'),
  (4, 'Platinum', 100, 1000000, 12.00, 3.00, 'Top performer tier'),
  (5, 'Diamond', 500, 5000000, 15.00, 5.00, 'Elite promoter status');

-- ===========================================
-- UPDATE PROFILES TABLE
-- ===========================================

-- Add referral tracking to profiles
ALTER TABLE public.profiles
ADD COLUMN referred_by UUID REFERENCES public.promoters(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
ADD COLUMN referral_code_used TEXT;

-- Index for referral lookups
CREATE INDEX idx_profiles_referred_by ON public.profiles(referred_by);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(username TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from username (uppercase, first 6 chars + random)
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(username, '[^a-zA-Z0-9]', '', 'g') FROM 1 FOR 6));
  
  -- If username too short, pad with random chars
  IF LENGTH(base_code) < 4 THEN
    base_code := base_code || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR (4 - LENGTH(base_code))));
  END IF;
  
  -- Add year suffix
  final_code := base_code || TO_CHAR(NOW(), 'YY');
  
  -- Check uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.promoters WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate referral code on promoter insert
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  IF NEW.referral_code IS NULL THEN
    -- Get username from profile
    SELECT COALESCE(username, SPLIT_PART(email, '@', 1)) INTO user_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    NEW.referral_code := public.generate_referral_code(COALESCE(user_name, 'USER'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_referral_code_trigger
  BEFORE INSERT ON public.promoters
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_referral_code();

-- Update promoter stats after referral conversion
CREATE OR REPLACE FUNCTION public.update_promoter_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
    UPDATE public.promoters
    SET 
      successful_referrals = successful_referrals + 1,
      updated_at = NOW()
    WHERE id = NEW.promoter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promoter_stats_trigger
  AFTER UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_promoter_stats();

-- Increment total referrals on new referral
CREATE OR REPLACE FUNCTION public.increment_total_referrals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.promoters
  SET 
    total_referrals = total_referrals + 1,
    updated_at = NOW()
  WHERE id = NEW.promoter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_total_referrals_trigger
  AFTER INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.increment_total_referrals();
