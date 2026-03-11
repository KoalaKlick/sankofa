-- Migration: Create Organization Members Junction Table
-- Description: Links users to organizations with role-based access

CREATE TABLE public.organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Role & permissions
  role            organization_role NOT NULL DEFAULT 'member',
  
  -- Timestamps
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can only be member of an org once
  UNIQUE(organization_id, user_id)
);

-- Indexes for efficient queries
CREATE INDEX idx_org_members_organization ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_role ON public.organization_members(role);

-- Enable RLS
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
