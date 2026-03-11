-- Migration: Create Events Table
-- Description: Organization-scoped events (voting, ticketed, ads, hybrid)

-- Enum for event types
CREATE TYPE event_type AS ENUM ('voting', 'ticketed', 'advertisement', 'hybrid');

-- Enum for event status
CREATE TYPE event_status AS ENUM ('draft', 'published', 'ongoing', 'ended', 'cancelled');

CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Organization scope (multi-tenant)
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Creator tracking (for audit)
  creator_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Basic info
  title           TEXT NOT NULL,
  description     TEXT,
  slug            TEXT NOT NULL,                    -- URL-friendly identifier
  
  -- Event classification
  type            event_type NOT NULL,
  status          event_status DEFAULT 'draft',
  
  -- Schedule
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  timezone        TEXT DEFAULT 'Africa/Lagos',
  
  -- Visibility
  is_public       BOOLEAN DEFAULT TRUE,             -- Public landing page vs org-only
  
  -- Media
  cover_image     TEXT,
  banner_image    TEXT,
  
  -- Location (for physical events)
  venue_name      TEXT,
  venue_address   TEXT,
  venue_city      TEXT,
  venue_country   TEXT DEFAULT 'Nigeria',
  is_virtual      BOOLEAN DEFAULT FALSE,
  virtual_link    TEXT,
  
  -- Settings
  max_attendees   INTEGER,
  registration_deadline TIMESTAMPTZ,
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  
  -- Slugs must be unique per organization
  UNIQUE(organization_id, slug)
);

-- Indexes for events
CREATE INDEX idx_events_organization ON public.events(organization_id);
CREATE INDEX idx_events_creator ON public.events(creator_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_is_public ON public.events(is_public);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to set published_at when status changes to 'published'
CREATE OR REPLACE FUNCTION public.set_event_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_published_at_trigger
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_event_published_at();
