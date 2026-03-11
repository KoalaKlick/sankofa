-- Migration: Create Organizations (Tenants) Schema
-- Description: Multi-tenant organization structure for the platform

-- Enum for organization member roles
CREATE TYPE organization_role AS ENUM ('owner', 'admin', 'member');

-- Main organizations table (tenants)
CREATE TABLE public.organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,              -- Friendly URL: org-slug.afrotix.app
  description  TEXT,
  
  -- Branding
  logo_url     TEXT,
  brand_color  TEXT DEFAULT '#6366f1',            -- Primary brand color (hex)
  
  -- Settings
  website_url  TEXT,
  contact_email TEXT,
  
  -- Metadata
  created_by   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for organizations
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_created_by ON public.organizations(created_by);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
