-- Migration: Create Organization Invitations Table
-- Description: Handle inviting users to organizations via email

-- Enum for invitation status
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE public.organization_invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  inviter_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Invitation details
  email           TEXT NOT NULL,
  role            organization_role NOT NULL DEFAULT 'member',
  status          invitation_status NOT NULL DEFAULT 'pending',
  
  -- Security
  token           TEXT UNIQUE,                     -- Secure token for email accept link
  
  -- Expiration
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,                     -- When user accepted/declined
  
  -- Prevent duplicate pending invites to same email for same org
  UNIQUE(organization_id, email, status)
);

-- Indexes
CREATE INDEX idx_org_invitations_organization ON public.organization_invitations(organization_id);
CREATE INDEX idx_org_invitations_email ON public.organization_invitations(email);
CREATE INDEX idx_org_invitations_token ON public.organization_invitations(token);
CREATE INDEX idx_org_invitations_status ON public.organization_invitations(status);

-- Enable RLS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token IS NULL THEN
    NEW.token = encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate token on insert
CREATE TRIGGER generate_invitation_token_trigger
  BEFORE INSERT ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.generate_invitation_token();
