-- Migration: Create Voting Options & Related Tables
-- Description: Tables for voting events functionality

-- ===========================================
-- VOTING CATEGORIES (group voting options)
-- ===========================================
CREATE TABLE public.voting_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  
  -- Category info
  name        TEXT NOT NULL,
  description TEXT,
  order_idx   INTEGER DEFAULT 0,
  
  -- Settings
  max_votes_per_user INTEGER DEFAULT 1,           -- How many options user can vote for
  allow_multiple     BOOLEAN DEFAULT FALSE,        -- Can vote for multiple options?
  
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voting_categories_event ON public.voting_categories(event_id);

ALTER TABLE public.voting_categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_voting_categories_updated_at
  BEFORE UPDATE ON public.voting_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- VOTING OPTIONS (candidates/nominees)
-- ===========================================
CREATE TABLE public.voting_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.voting_categories(id) ON DELETE CASCADE,
  
  -- Option details
  option_text TEXT NOT NULL,                       -- Name/title of the option
  description TEXT,
  image_url   TEXT,
  
  -- Display order
  order_idx   INTEGER DEFAULT 0,
  
  -- Vote tracking (denormalized for performance)
  votes_count BIGINT DEFAULT 0,
  
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voting_options_event ON public.voting_options(event_id);
CREATE INDEX idx_voting_options_category ON public.voting_options(category_id);

ALTER TABLE public.voting_options ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_voting_options_updated_at
  BEFORE UPDATE ON public.voting_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- VOTES (actual vote records)
-- ===========================================
CREATE TABLE public.votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  option_id   UUID NOT NULL REFERENCES public.voting_options(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.voting_categories(id) ON DELETE CASCADE,
  voter_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Vote metadata
  voter_email TEXT,                                -- For anonymous/guest voting
  voter_ip    INET,                                -- Fraud prevention
  
  -- Payment (if voting requires payment)
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_reference TEXT,
  
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate votes (user can only vote once per option)
  UNIQUE(event_id, option_id, voter_id)
);

CREATE INDEX idx_votes_event ON public.votes(event_id);
CREATE INDEX idx_votes_option ON public.votes(option_id);
CREATE INDEX idx_votes_voter ON public.votes(voter_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- TRIGGER: Auto-increment votes_count
-- ===========================================
CREATE OR REPLACE FUNCTION public.increment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.voting_options
  SET votes_count = votes_count + 1
  WHERE id = NEW.option_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_vote_count_trigger
  AFTER INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.increment_vote_count();

-- Decrement on delete (if votes can be removed)
CREATE OR REPLACE FUNCTION public.decrement_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.voting_options
  SET votes_count = votes_count - 1
  WHERE id = OLD.option_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER decrement_vote_count_trigger
  AFTER DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_vote_count();
